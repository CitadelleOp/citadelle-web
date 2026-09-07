import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { HermesClient } from '@pythnetwork/hermes-client';
import { useAccount } from 'wagmi';
import { useNetwork } from '../../contexts/NetworkContext';



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
  const { network, apiUrl } = useNetwork();
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
        // TODO: Replace with Wagmi useReadContract to fetch EVM positions
        // For now, setting empty array as a placeholder for EVM migration
        setPositions([]);
      } catch (err) {
        console.error('Error fetching positions:', err);
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

  const handleReclaim = async () => {
    if (!isConnected || !address) return;
    try {
      // TODO: Replace with EVM logic
      alert('Close position (reclaim collateral) not yet implemented for EVM.');
    } catch (e: any) {
      console.error(e);
      alert('Failed to close position.');
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
                      onClick={() => handleReclaim()}
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
    </div>
  );
};
