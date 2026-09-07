import { useEffect, useState, useRef } from 'react';
import type { FC } from 'react';
import { HermesClient } from '@pythnetwork/hermes-client';
import { isUSMarketOpen } from '../../utils/marketHours';
import { useNetwork } from '../../contexts/NetworkContext';

interface Market {
  id: string;
  address: string;
  symbol: string;
  strike: number;
  expiry: string;
  totalLiquidity: number;
  premiumAsk: number;
  underlyingMint?: string;
  quoteMint?: string;
  optionMint?: string;
  type: string;
  pythFeedId?: string;
  isSynthetic: boolean;
}

interface MarketListProps {
  onSelectMarket?: (market: Market) => void;
  selectedMarketId?: string;
  filterAssetSymbol?: string;
  initialMarketId?: string | null;
}

export const MarketList: FC<MarketListProps> = ({ onSelectMarket, selectedMarketId, filterAssetSymbol, initialMarketId }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [pythPrices, setPythPrices] = useState<Record<string, number>>({});
  const { network, apiUrl } = useNetwork();
  const hermesRef = useRef<HermesClient | null>(null);

  useEffect(() => {
    hermesRef.current = new HermesClient(`${apiUrl}/pyth`);
  }, [apiUrl]);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true);
        // Fetch markets from backend API
        const res = await fetch(`${apiUrl}/markets?network=${network}`);
        const json = await res.json();
        
        if (!json.success) throw new Error('Failed to fetch markets from API');
        
        let apiMarkets: Market[] = json.data.map((m: any) => ({
          ...m,
          id: m.id || m.address || '',
          expiry: new Date(m.expiry).toLocaleDateString('en-GB'),
          totalLiquidity: 0, // Placeholder
          premiumAsk: 0 // Placeholder
        }));

        setMarkets(apiMarkets);
        
        // Auto-select market from URL if provided
        if (initialMarketId) {
          const m = apiMarkets.find((mkt) => mkt.id === initialMarketId);
          if (m && onSelectMarket) {
            onSelectMarket(m);
          }
        }
      } catch (err) {
        console.error('Error fetching markets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, [network, apiUrl]);

  // Poll Pyth Prices for the displayed markets
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function updatePythPrices() {
      const feedIds = markets
        .filter(m => m.pythFeedId)
        .map(m => {
          let id = m.pythFeedId as string;
          if (id.startsWith('0x')) id = id.slice(2);
          return id;
        });

      if (feedIds.length === 0) return;

      try {
        const params = new URLSearchParams();
        feedIds.forEach(id => params.append('ids[]', id as string));

        const res = await fetch(`${apiUrl}/pyth/v2/updates/price/latest?${params.toString()}`);
        const parsedData = await res.json();
        const newPrices: Record<string, number> = {};
        
        if (parsedData && parsedData.parsed) {
          parsedData.parsed.forEach((feed: any) => {
             const price = feed.price.price * (10 ** feed.price.expo);
             newPrices[feed.id] = price;
          });
        }
        
        setPythPrices(newPrices);
      } catch (err) {
        console.error('Failed to fetch Pyth prices', err);
      }
    }

    if (markets.length > 0) {
      updatePythPrices();
      interval = setInterval(updatePythPrices, 5000); // Poll every 5s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [markets]);

  const filteredMarkets = markets.filter(m => 
    (!filterAssetSymbol || m.symbol.startsWith(filterAssetSymbol))
  );

  const usMarketClosed = !isUSMarketOpen();


  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      
      <table className="market-table" style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        fontFamily: "'Space Mono', monospace", 
        fontSize: '0.85rem',
        textAlign: 'left'
      }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#A3A3A3' }}>
            <th style={{ padding: '1rem' }}>MKT ID</th>
            <th style={{ padding: '1rem' }}>ASSET</th>
            <th style={{ padding: '1rem' }}>STRIKE</th>
            <th style={{ padding: '1rem' }}>MARK PRICE</th>
            <th style={{ padding: '1rem' }}>EXPIRY</th>
            <th style={{ padding: '1rem' }}>TYPE</th>
            <th style={{ padding: '1rem', textAlign: 'right' }}>PREMIUM</th>
            <th style={{ padding: '1rem', textAlign: 'right' }}>LIQ.</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>Loading markets...</td></tr>
          ) : filteredMarkets.length === 0 ? (
            <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>No active markets found for this asset.</td></tr>
          ) : (
            <>

              {filteredMarkets.map((mkt) => {
                const isCall = true; // Placeholder for type since it's missing in simple schema
                const isTradeable = mkt.isSynthetic ? !usMarketClosed : true;
                return (
                  <tr 
                    key={mkt.id} 
                    onClick={() => {
                      if (isTradeable && onSelectMarket) onSelectMarket(mkt);
                    }}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      color: isTradeable ? '#E5E5E5' : '#6B7280',
                      cursor: isTradeable ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.2s',
                      backgroundColor: selectedMarketId === mkt.id && isTradeable ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
                      opacity: isTradeable ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMarketId !== mkt.id && isTradeable) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMarketId !== mkt.id && isTradeable) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                  <td data-label="MKT ID" style={{ padding: '1rem', color: '#5EEAD4' }}>{mkt.id.slice(0,4)}...{mkt.id.slice(-4)}</td>
                  <td data-label="ASSET" style={{ padding: '1rem', fontWeight: 'bold' }}>{mkt.symbol}</td>
                  <td data-label="STRIKE" style={{ padding: '1rem' }}>${mkt.strike.toLocaleString()}</td>
                  <td data-label="MARK PRICE" style={{ padding: '1rem', color: '#FCD34D' }}>
                    {(() => {
                      if (!mkt.pythFeedId) return '-';
                      const strippedId = mkt.pythFeedId.startsWith('0x') ? mkt.pythFeedId.slice(2) : mkt.pythFeedId;
                      const price = pythPrices[strippedId];
                      return price ? `$${price.toFixed(2)}` : '-';
                    })()}
                  </td>
                  <td data-label="EXPIRY" style={{ padding: '1rem' }}>{mkt.expiry}</td>
                  <td data-label="TYPE" style={{ padding: '1rem', color: isCall ? '#5EEAD4' : '#F87171' }}>{isCall ? 'CALL' : 'PUT'}</td>
                  <td data-label="PREMIUM" style={{ padding: '1rem', textAlign: 'right' }}>${typeof mkt.premiumAsk === 'number' ? mkt.premiumAsk.toFixed(2) : mkt.premiumAsk}</td>
                  <td data-label="LIQ." style={{ padding: '1rem', textAlign: 'right' }}>{mkt.totalLiquidity}</td>
                </tr>
              );
            })
            }
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};
