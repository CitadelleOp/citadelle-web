import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { HermesClient } from '@pythnetwork/hermes-client';
import { useAccount, useWriteContract, usePublicClient, useChainId } from 'wagmi';
import { useNetwork } from '../../contexts/NetworkContext';
import { TxModal } from '../common/TxModal';
import { ENGINE_CONTRACT_ADDRESS, OPTIONS_ENGINE_ABI } from '../../lib/contracts';

interface Position {
  id: string;
  type: 'LONG' | 'SHORT';
  market: string;
  symbol: string; // Underlying e.g. "BTC"
  strike: number;
  size: number;
  premium: number;
  pnl: number | null;
  pythFeedId?: string | null;
  marketId?: string;
  underlyingMint?: string;
  optionMint?: string;
}

export const UserPositions: FC = () => {
  const { address, isConnected } = useAccount();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string; txSignature?: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const { network, apiUrl } = useNetwork();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const wsRef = useRef<WebSocket | null>(null);
  const hermesRef = useRef(new HermesClient("https://hermes.pyth.network"));

  // Subscribe to live prices for position symbols
  useEffect(() => {
    const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'jupusdt'];
    const streams = symbols.map((s) => `${s}@miniTicker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const d = msg.data;
        if (!d) return;
        const sym = (d.s as string).replace('USDT', '');
        setPrices((prev) => ({ ...prev, [sym]: parseFloat(d.c) }));
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => setTimeout(connect, 3000);
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    async function fetchPositions() {
      if (!isConnected || !address) return;

      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/portfolio/${address}?network=${network}`);
        const data = await res.json();
        
        if (data.success && data.data && data.data.positions) {
          const formattedPositions = data.data.positions.map((p: any) => ({
             id: p.id,
             type: p.positionType === 'BOUGHT' ? 'LONG' : 'SHORT',
             market: p.market?.symbol || 'UNKNOWN',
             symbol: p.market?.symbol || 'UNKNOWN',
             strike: Number(p.market?.strike || 0),
             size: Number(p.quantity || 0),
             premium: Number(p.market?.premiumAsk || 0),
             pythFeedId: p.market?.pythFeedId,
             marketId: p.marketId,
             pnl: null,
          }));
          setPositions(formattedPositions);
        } else {
          setPositions([]);
        }
      } catch (err) {
        console.error('Error fetching positions:', err);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
    const interval = setInterval(fetchPositions, 15000);
    return () => clearInterval(interval);
  }, [isConnected, address, network, apiUrl]);

  // Poll Pyth Prices for positions with pythFeedIds
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function updatePythPrices() {
      const feedIds = Array.from(new Set(
        positions
          .map((p: any) => p.pythFeedId)
          .filter(Boolean)
          .map(id => {
            let sId = id as string;
            if (sId.startsWith('0x')) sId = sId.slice(2);
            return sId;
          })
      ));

      if (feedIds.length === 0) return;

      try {
        const parsedData = await hermesRef.current.getLatestPriceUpdates(feedIds as string[]);
        const newPrices: Record<string, number> = {};
        
        if (parsedData && parsedData.parsed) {
          parsedData.parsed.forEach((feed: any) => {
             const price = feed.price.price * (10 ** feed.price.expo);
             // find the matching position symbol
             const position = positions.find((p: any) => {
                const pId = p.pythFeedId || '';
                return pId.includes(feed.id);
             });
             if (position) {
               newPrices[position.symbol] = price;
             }
          });
        }
        
        if (Object.keys(newPrices).length > 0) {
          setPrices(prev => ({ ...prev, ...newPrices }));
        }
      } catch (err) {
        console.error('Failed to fetch Pyth prices', err);
      }
    }

    if (positions.length > 0) {
      updatePythPrices();
      interval = setInterval(updatePythPrices, 5000); // Poll every 5s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [positions]);

  // Calculate PnL reactively from live WebSocket prices
  const positionsWithPnl = positions.map((pos) => {
    const currentPrice = prices[pos.symbol] ?? null;
    if (currentPrice === null) return { ...pos, pnl: null };

    // LONG: value = max(current - strike, 0) - premium
    // SHORT: value = premium - max(current - strike, 0)
    let pnl: number;
    if (pos.type === 'LONG') {
      pnl = (Math.max(currentPrice - pos.strike, 0) - pos.premium) * pos.size;
    } else {
      pnl = (pos.premium - Math.max(currentPrice - pos.strike, 0)) * pos.size;
    }

    return { ...pos, pnl };
  });

  const formatPnl = (pnl: number | null): string => {
    if (pnl === null) return '—';
    return `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isConnected) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        Please connect your wallet to view open positions.
      </div>
    );
  }

  const handleReclaim = async (position: Position) => {
    if (!isConnected || !address) return;
    const targetChainId = Number(import.meta.env.VITE_NETWORK_ID);
    if (chainId !== targetChainId) {
      setModalState({ isOpen: true, type: 'error', title: 'Wrong Network', message: 'Please switch your wallet to the correct network.' });
      return;
    }

    try {
      setModalState({ isOpen: true, type: 'info', title: 'Closing Position', message: 'Requesting authorization signature...' });

      // 1. Fetch Signature
      const sigRes = await fetch(`${apiUrl}/positions/${position.id}/close-signature`, {
        method: 'POST'
      });
      const sigData = await sigRes.json();
      
      if (!sigData.success) {
        throw new Error(sigData.error || 'Failed to get signature');
      }

      setModalState({ isOpen: true, type: 'info', title: 'Confirm in Wallet', message: 'Please confirm the transaction to close your position.' });

      // 2. Write Contract
      // @ts-ignore - wagmi type inference issue with dynamic args
      const txHash = await writeContractAsync({
        address: ENGINE_CONTRACT_ADDRESS as `0x${string}`,
        abi: OPTIONS_ENGINE_ABI,
        functionName: 'closeOption',
        args: [
          position.id,
          sigData.data.collateralToken as `0x${string}`,
          BigInt(sigData.data.marginToUnlock),
          sigData.data.signature as `0x${string}`
        ]
      });

      setModalState({ isOpen: true, type: 'info', title: 'Processing', message: 'Waiting for blockchain confirmation...', txSignature: txHash });

      // 3. Wait for Confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash });
      if (receipt?.status === 'success') {
        setModalState({ isOpen: true, type: 'success', title: 'Position Closed', message: 'Margin has been reclaimed successfully.', txSignature: txHash });
      } else {
        setModalState({ isOpen: true, type: 'error', title: 'Transaction Failed', message: 'The transaction reverted.' });
      }

    } catch (e: any) {
      console.error(e);
      let errorMsg = e.message || 'Failed to close position.';
      if (errorMsg.includes('User rejected')) errorMsg = 'Transaction rejected by user.';
      setModalState({ isOpen: true, type: 'error', title: 'Transaction Failed', message: errorMsg });
    }
  };

  if (loading && positions.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        Loading positions...
      </div>
    );
  }

  if (positionsWithPnl.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        No open positions. Click a strike in the chain to build a trade.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: "'Space Mono', monospace" }}>
        <thead>
          <tr style={{ color: '#A3A3A3', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Type</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Market</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Strike</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Size</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Mark Price</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal', textAlign: 'right' }}>Est. PnL</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {positionsWithPnl.map((pos, idx) => {
            const pnlColor = pos.pnl === null ? '#A3A3A3' : pos.pnl >= 0 ? '#5EEAD4' : '#F87171';
            const markPrice = prices[pos.symbol];
            return (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  color: '#E5E5E5',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '0.75rem 1rem', color: pos.type === 'LONG' ? '#5EEAD4' : '#F87171', fontWeight: 'bold' }}>
                  {pos.type}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>{pos.market}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${pos.strike.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{pos.size}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#A3A3A3' }}>
                  {markPrice ? `$${markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: pnlColor, fontWeight: 'bold' }}>
                  {formatPnl(pos.pnl)}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  {pos.type === 'SHORT' ? (
                    <button
                      onClick={() => handleReclaim(pos)}
                      style={{
                        background: 'rgba(248,113,113,0.1)',
                        color: '#F87171',
                        border: '1px solid rgba(248,113,113,0.2)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'inherit'
                      }}
                    >
                      Close
                    </button>
                  ) : (
                    <span style={{ color: '#525252' }}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <TxModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        txSignature={modalState.txSignature}
      />
    </div>
  );
};
