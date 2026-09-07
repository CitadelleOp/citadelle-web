import { Link } from "react-router-dom";

function Logo({ size = 26 }: { size?: number }) {
  return (
    <img 
      src="/logo.png" 
      alt="Citadelle Logo" 
      style={{ 
        height: size, 
        width: 'auto', 
        display: "block",
        filter: "grayscale(100%) brightness(200%)" 
      }} 
    />
  );
}

const MARKET_DATA = [
  { symbol: "NVDA", price: "$184.42", change: "+2.18%", positive: true },
  { symbol: "TSLA", price: "$347.12", change: "-0.84%", positive: false },
  { symbol: "AAPL", price: "$231.82", change: "+1.02%", positive: true },
  { symbol: "META", price: "$612.40", change: "+0.62%", positive: true },
  { symbol: "HOOD", price: "$23.41", change: "+4.11%", positive: true },
  { symbol: "SPY", price: "$512.12", change: "-0.21%", positive: false },
  { symbol: "MSTR", price: "$1,342.11", change: "+5.12%", positive: true },
];


export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-color)" }}>
      {/* HERO SECTION */}
      <section style={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center",
        padding: "100px 20px 60px",
        textAlign: "center",
        background: "radial-gradient(circle at 50% -20%, rgba(255,255,255,0.05) 0%, transparent 60%)"
      }}>
        <div style={{ 
          display: 'inline-block',
          padding: '4px 12px',
          border: '1px solid var(--border-color)',
          borderRadius: '999px',
          fontSize: '0.8rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          color: 'var(--text-secondary)'
        }}>
          Live on Robinhood Chain
        </div>

        <h1 style={{ 
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)", 
          fontWeight: 600, 
          letterSpacing: "-0.03em",
          marginBottom: "1.5rem",
          color: "var(--text-primary)",
          lineHeight: 1.1,
          maxWidth: "900px"
        }}>
          Trade options and perpetuals<br/>on tokenized equities.
        </h1>
        
        <p style={{ 
          fontSize: "clamp(1.125rem, 2vw, 1.35rem)", 
          color: "var(--text-secondary)", 
          marginBottom: "3rem",
          maxWidth: "700px",
          lineHeight: 1.6
        }}>
          Institutional derivatives infrastructure built natively on the Robinhood Chain. High leverage, deep liquidity, and zero counterparty risk.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/terminal" className="btn-primary" style={{ textDecoration: "none", padding: "1rem 2rem", fontSize: "1rem" }}>
            Launch App
          </Link>
          <a href="/docs" className="btn-secondary" style={{ textDecoration: "none", padding: "1rem 2rem", fontSize: "1rem" }}>
            Read Docs
          </a>
        </div>


      </section>

      {/* LIVE MARKET STRIP */}
      <section style={{ 
        borderTop: "1px solid var(--border-color)", 
        borderBottom: "1px solid var(--border-color)",
        background: "var(--bg-color-secondary)",
        padding: "1.25rem 0",
        overflow: "hidden",
        whiteSpace: "nowrap"
      }}>
        <div className="marquee-container">
          {MARKET_DATA.map((market, i) => (
            <div key={i} style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{market.symbol}</span>
              <span className="font-mono" style={{ fontSize: "1.1rem" }}>{market.price}</span>
              <span className={`font-mono ${market.change === "--%" ? 'text-secondary' : market.positive ? 'text-positive' : 'text-negative'}`} style={{ fontSize: "1.1rem" }}>
                {market.change}
              </span>
            </div>
          ))}
          {MARKET_DATA.map((market, i) => (
            <div key={i + 'clone'} style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{market.symbol}</span>
              <span className="font-mono" style={{ fontSize: "1.1rem" }}>{market.price}</span>
              <span className={`font-mono ${market.change === "--%" ? 'text-secondary' : market.positive ? 'text-positive' : 'text-negative'}`} style={{ fontSize: "1.1rem" }}>
                {market.change}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CORE ENGINES */}
      <section style={{ padding: "120px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          {/* OPTIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '120px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '1rem' }}>Engine 01</div>
              <h2 style={{ fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Options.</h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Trade European Calls and Puts on tokenized US equities. Cash-settled in USDC with live pricing fed directly from the Pyth Network. Construct complex payoffs without holding the underlying asset.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> USDC Cash Settlement</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> Live Pyth Oracles</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> No Exercise Risk</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg-color-secondary)', border: '1px solid var(--border-color)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span>NVDA 25 SEP 190 CALL</span>
                <span className="font-mono text-positive">PREMIUM: $4.82</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DELTA</div><div className="font-mono">0.58</div></div>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GAMMA</div><div className="font-mono">0.031</div></div>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>THETA</div><div className="font-mono">-0.14</div></div>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>VEGA</div><div className="font-mono">0.22</div></div>
              </div>
            </div>
          </div>

          {/* PERPETUALS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div style={{ order: 2 }}>
              <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '1rem' }}>Engine 02</div>
              <h2 style={{ fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>Perpetuals.</h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Trade Long and Short with up to 10x leverage. Benefit from isolated margin, precise liquidation engines, and predictable funding rates to maintain index parity.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> Up to 10x Leverage</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> Isolated Margin</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-green)' }}>✓</span> Deterministic Liquidation</li>
              </ul>
            </div>
            <div style={{ order: 1, background: 'var(--bg-color-secondary)', border: '1px solid var(--border-color)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span>TSLA-PERP (SHORT)</span>
                <span className="font-mono text-negative">PNL: -$124.50</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ENTRY PRICE</div><div className="font-mono">$350.21</div></div>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MARK PRICE</div><div className="font-mono">$352.12</div></div>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LIQUIDATION</div><div className="font-mono text-negative">$385.00</div></div>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MARGIN RATIO</div><div className="font-mono">15.4%</div></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* THE STACK */}
      <section style={{ padding: "100px 20px", background: "var(--bg-color-secondary)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: 'center' }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 600, marginBottom: "4rem", letterSpacing: "-0.02em" }}>
            The Citadelle Stack
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', position: 'relative' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>EXECUTION</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Citadelle Smart Contracts</div>
            </div>
            
            <div style={{ height: '40px', width: '1px', background: 'var(--border-color)' }}></div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', maxWidth: '600px' }}>
              <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>ORACLE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pyth Network</div>
              </div>
              <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>SETTLEMENT</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>USDC</div>
              </div>
            </div>

            <div style={{ height: '40px', width: '1px', background: 'var(--border-color)' }}></div>
            
            <div style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>INFRASTRUCTURE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Robinhood Chain</div>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Block Time: 0.4s</div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL FEATURES */}
      <section style={{ padding: "120px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 600, marginBottom: "4rem", letterSpacing: "-0.02em", textAlign: "center" }}>
            Institutional Grade
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Low Latency</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Settling on the Robinhood Chain ensures trades execute instantly with negligible transaction costs.</p>
            </div>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Self-Custodial</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>No brokers, no intermediaries. Your keys, your trades. Full control over your collateral at all times.</p>
            </div>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Deterministic Risk</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Fully onchain liquidation engines and transparent margin rules mean you always know your risk limits.</p>
            </div>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>24/7 Markets</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Equities never sleep onchain. Trade US stocks outside of standard market hours seamlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ 
        marginTop: "auto",
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-color-secondary)",
        padding: "3rem 2rem", 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "2rem", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <Logo size={24} />
            <span style={{ fontWeight: 600, fontSize: '1.2rem', letterSpacing: "-0.02em" }}>Citadelle</span>
          </span>
          <span className="font-mono" style={{ fontSize: "0.85rem", letterSpacing: "0.05em", color: 'var(--text-secondary)' }}>
            $CTDL · {import.meta.env.VITE_CA ? (
              <a 
                href={`https://pump.fun/${import.meta.env.VITE_CA}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: "var(--accent-green)", textDecoration: "none" }}
              >
                CA: {import.meta.env.VITE_CA.slice(0, 4)}...{import.meta.env.VITE_CA.slice(-4)}
              </a>
            ) : "CA SOON"}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a 
            href="https://x.com/CitadelleOpt" 
            target="_blank" 
            rel="noreferrer" 
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: 400, textAlign: "right", lineHeight: 1.6 }}>
            Derivatives involve risk. Access is restricted by jurisdiction.<br/>Nothing here is financial advice.
          </span>
        </div>
      </footer>
    </div>
  );
}
