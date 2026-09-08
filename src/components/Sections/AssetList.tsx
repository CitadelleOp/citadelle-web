import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { HermesClient } from '@pythnetwork/hermes-client';
import { useNetwork } from '../../contexts/NetworkContext';

export interface Asset {
  id: string;
  symbol: string;
  type: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface AssetListProps {
  onSelectAsset?: (asset: Asset) => void;
  selectedAssetId?: string;
  onPricesUpdate?: (prices: Record<string, Asset>) => void;
}

export const AssetList: FC<AssetListProps> = ({ onSelectAsset, selectedAssetId, onPricesUpdate }) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'stocks'>('stocks');
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({});
  const [assets, setAssets] = useState<any[]>([]);
  const { apiUrl, network } = useNetwork();
  const hasAutoSelected = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const hermesRef = useRef<HermesClient | null>(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch(`${apiUrl}/assets?network=${network}`);
        const json = await res.json();
        if (json.success && json.data) {
          setAssets(json.data);
          const map: Record<string, Asset> = {};
          json.data.forEach((a: any) => {
            const sym = a.symbol;
            map[sym] = { id: sym, symbol: sym, type: a.type || 'crypto', price: 0, change24h: 0, volume24h: 0 };
          });
          setAssetMap(map);
        }
      } catch (e) {
        console.error('Failed to fetch dynamic assets', e);
      }
    }
    fetchAssets();
  }, [apiUrl, network]);

  useEffect(() => {
    if (assets.length === 0) return;

    hermesRef.current = new HermesClient(`${apiUrl}/pyth`);
    
    // Subscribe to Binance individual symbol miniTicker streams
    const cryptoAssets = assets.filter(a => a.type === 'crypto');
    if (cryptoAssets.length === 0) return;

    const streams = cryptoAssets.map((s) => `${s.symbol.toLowerCase()}usdt@miniTicker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const d = msg.data;
        if (!d) return;

        const base = (d.s as string).replace('USDT', '');
        const close = parseFloat(d.c);
        const open = parseFloat(d.o);
        const change24h = open > 0 ? ((close - open) / open) * 100 : 0;
        
        setAssetMap((prev) => ({
          ...prev,
          [base]: {
            ...prev[base],
            id: base,
            symbol: base,
            price: close,
            change24h,
            volume24h: parseFloat(d.q),
          },
        }));
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => {
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [assets, apiUrl]);

  // Poll Pyth for US Stocks and fetch 24h change
  useEffect(() => {
    if (assets.length === 0) return;
    
    const stockAssets = assets.filter(a => a.type === 'stock');
    if (stockAssets.length === 0) return;

    let pythInterval: ReturnType<typeof setInterval>;
    let changeInterval: ReturnType<typeof setInterval>;

    async function fetchPyth() {
      try {
        const feedIds = stockAssets.map(p => p.pythFeedId).filter(Boolean);
        if (feedIds.length === 0) return;

        const params = new URLSearchParams();
        feedIds.forEach(id => params.append('ids[]', id as string));

        const res = await fetch(`${apiUrl}/pyth/v2/updates/price/latest?${params.toString()}`);
        const parsedData = await res.json();
        
        const parsed = parsedData?.parsed;
        if (parsed) {
          setAssetMap(prev => {
            const next = { ...prev };
            parsed.forEach((feed: any) => {
              const symInfo = stockAssets.find(p => p.pythFeedId === feed.id);
              if (symInfo) {
                const price = feed.price.price * (10 ** feed.price.expo);
                next[symInfo.symbol] = {
                  ...next[symInfo.symbol],
                  price,
                };
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.error('Pyth fetch error in AssetList', e);
      }
    }

    async function fetchStockChanges() {
      try {
        const symbolsStr = stockAssets.map(p => p.symbol).join(',');
        const res = await fetch(`${apiUrl}/stocks/change?symbols=${symbolsStr}`);
        const json = await res.json();
        
        if (json.success && json.data) {
          setAssetMap(prev => {
            const next = { ...prev };
            Object.keys(json.data).forEach(sym => {
              if (next[sym]) {
                next[sym] = {
                  ...next[sym],
                  change24h: json.data[sym].change24h,
                };
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.error('Failed to fetch stock 24h changes', e);
      }
    }

    fetchPyth();
    fetchStockChanges();
    
    pythInterval = setInterval(fetchPyth, 5000);
    changeInterval = setInterval(fetchStockChanges, 60000);

    return () => {
      clearInterval(pythInterval);
      clearInterval(changeInterval);
    };
  }, [assets, apiUrl]);

  // Notify parent of price updates safely outside the reducer
  useEffect(() => {
    if (onPricesUpdate) {
      onPricesUpdate(assetMap);
    }
  }, [assetMap, onPricesUpdate]);

  useEffect(() => {
    if (hasAutoSelected.current || !onSelectAsset || selectedAssetId) return;
    const first = Object.values(assetMap).find((a) => {
      if (a.price <= 0) return false;
      const originalAsset = assets.find(dbA => dbA.symbol === a.symbol);
      const isStock = originalAsset ? originalAsset.type === 'stock' : false;
      return activeTab === 'stocks' ? isStock : !isStock;
    });
    if (first) {
      hasAutoSelected.current = true;
      onSelectAsset(first);
    }
  }, [assetMap, onSelectAsset, selectedAssetId, activeTab, assets]);

  const handleTabChange = (tab: 'crypto' | 'stocks') => {
    setActiveTab(tab);
    if (onSelectAsset) {
      const firstInTab = Object.values(assetMap).find(a => {
        const originalAsset = assets.find(dbA => dbA.symbol === a.symbol);
        const isStock = originalAsset ? originalAsset.type === 'stock' : false;
        return tab === 'stocks' ? isStock : !isStock;
      });
      if (firstInTab) {
        onSelectAsset(firstInTab);
      }
    }
  };

  const displayedAssets = Object.values(assetMap).filter(asset => {
    const originalAsset = assets.find(dbA => dbA.symbol === asset.symbol);
    const isStock = originalAsset ? originalAsset.type === 'stock' : false;
    return activeTab === 'stocks' ? isStock : !isStock;
  });

  const formatVolume = (v: number) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
        marginBottom: '0.5rem',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10,
        paddingTop: '0.5rem',
        margin: '0 -0.5rem', // Offset padding if any, to connect to edges
        padding: '0.5rem 0.5rem 0 0.5rem'
      }}>
        <button 
          onClick={() => handleTabChange('crypto')}
          style={{ flex: 1, padding: '0.5rem', backgroundColor: 'transparent', color: activeTab === 'crypto' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: activeTab === 'crypto' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          CRYPTO
        </button>
        <button 
          onClick={() => handleTabChange('stocks')}
          style={{ flex: 1, padding: '0.5rem', backgroundColor: 'transparent', color: activeTab === 'stocks' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: activeTab === 'stocks' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          US STOCKS
        </button>
      </div>
      {displayedAssets.map((asset) => {
        const isSelected = selectedAssetId === asset.id;
        const isPositive = asset.change24h >= 0;
        const originalAsset = assets.find(dbA => dbA.symbol === asset.symbol);
        const isStock = originalAsset ? originalAsset.type === 'stock' : false;

        return (
          <div
            key={asset.id}
            onClick={() => onSelectAsset && onSelectAsset(asset)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: isSelected ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
              border: isSelected ? '1px solid rgba(94, 234, 212, 0.2)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: '0.875rem' }}>
                {asset.symbol}{isStock ? '' : '/USDT'}
              </div>
              {!isStock && (
                <div style={{ color: '#A3A3A3', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                  {asset.volume24h > 0 ? formatVolume(asset.volume24h) : '—'}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: '0.875rem' }}>
                {asset.price > 0
                  ? `$${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.price < 0.01 ? 6 : 2 })}`
                  : <span className="shimmer-text"></span>}
              </div>
              <div style={{ color: isPositive ? '#5EEAD4' : '#F87171', fontSize: '0.75rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'flex-end' }}>
                {asset.price > 0 
                  ? `${isPositive ? '+' : ''}${asset.change24h.toFixed(2)}% (24H)` 
                  : <span className="shimmer-text" style={{ width: '40px', minWidth: '40px', height: '0.75rem' }}></span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

