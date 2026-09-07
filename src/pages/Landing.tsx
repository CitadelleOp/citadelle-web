import { Link } from "react-router-dom";
import { BeamsBackground } from "../components/BeamsBackground";

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
      {/* SECTION 1: HERO */}
      <section style={{ 
        position: "relative",
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center",
        padding: "120px 20px 80px",
        textAlign: "center",
        background: "radial-gradient(circle at 50% -20%, rgba(94,234,212,0.08) 0%, transparent 60%)",
        overflow: "hidden"
      }}>
        <BeamsBackground beamCount={12} color="rgba(255, 255, 255, 0.15)" />
        
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 12px',
          border: '1px solid var(--border-color)',
          borderRadius: '999px',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '2.5rem',
          color: 'var(--text-secondary)'
        }}>
          Live on Robinhood Chain
        </div>

        <h1 style={{ 
          fontSize: "clamp(3rem, 7vw, 5.5rem)", 
          fontWeight: 700, 
          letterSpacing: "0.02em",
          marginBottom: "1.5rem",
          color: "var(--text-primary)",
          lineHeight: 1.1,
          maxWidth: "1000px",
          textTransform: "uppercase"
        }}>
          Trade Options<br/>
          On Tokenized<br/>
          Equities.
        </h1>
        
        <p style={{ 
          fontSize: "clamp(1.125rem, 2vw, 1.25rem)", 
          color: "var(--text-secondary)", 
          marginBottom: "3rem",
          maxWidth: "700px",
          lineHeight: 1.6
        }}>
          The first decentralized options protocol for US equities. Write calls & puts, earn premium, or hedge your portfolio — all settled in USDG on the Robinhood Chain.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3rem" }}>
          <Link to="/terminal" className="btn-primary" style={{ textDecoration: "none", padding: "1rem 2.5rem", fontSize: "1rem", backgroundColor: "var(--accent-green)", color: "#000", fontWeight: 600, borderRadius: "999px" }}>
            Launch Terminal
          </Link>
          <a href="/docs" className="btn-secondary" style={{ textDecoration: "none", padding: "1rem 2.5rem", fontSize: "1rem", borderRadius: "999px" }}>
            Read Docs
          </a>
        </div>

        <div className="font-mono" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          7 MARKETS &nbsp;&middot;&nbsp; USDG SETTLED &nbsp;&middot;&nbsp; PYTH ORACLES &nbsp;&middot;&nbsp; 0.4s BLOCKS
        </div>
        </div>
      </section>

      {/* SECTION 2: LIVE MARKET STRIP */}
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
              <span style={{ fontWeight: 600, fontSize: "1.1rem", textTransform: "uppercase" }}>{market.symbol}</span>
              <span className="font-mono" style={{ fontSize: "1.1rem" }}>{market.price}</span>
              <span className={`font-mono ${market.change === "--%" ? 'text-secondary' : market.positive ? 'text-positive' : 'text-negative'}`} style={{ fontSize: "1.1rem" }}>
                {market.change}
              </span>
            </div>
          ))}
          {MARKET_DATA.map((market, i) => (
            <div key={i + 'clone'} style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "1.1rem", textTransform: "uppercase" }}>{market.symbol}</span>
              <span className="font-mono" style={{ fontSize: "1.1rem" }}>{market.price}</span>
              <span className={`font-mono ${market.change === "--%" ? 'text-secondary' : market.positive ? 'text-positive' : 'text-negative'}`} style={{ fontSize: "1.1rem" }}>
                {market.change}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section style={{ padding: "120px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "0.02em", textTransform: "uppercase" }}>
              How Citadelle Works.
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color-secondary)' }}>
              <div className="font-mono" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>01</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Write an Option</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Deposit USDG collateral into the Citadelle Vault. Choose your asset, set the strike price, expiry date, and the premium you want to earn. Your collateral is locked until settlement.</p>
            </div>
            
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color-secondary)' }}>
              <div className="font-mono" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>02</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match a Buyer</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Buyers browse available options on the marketplace. They pay your asking premium in USDG to take the other side of the trade. No order book — direct peer-to-peer matching.</p>
            </div>
            
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color-secondary)' }}>
              <div className="font-mono" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>03</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settle at Expiry</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>At expiration, the Pyth Oracle provides the final price. If the option is in-the-money, the buyer profits. If not, the writer keeps the full premium and collateral. Fully automated, no manual exercise.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COMPARISON */}
      <section style={{ padding: "0 20px 120px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "4rem 2rem", border: "1px solid var(--border-color)", borderRadius: "12px", background: "var(--bg-color-secondary)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '3rem', maxWidth: '800px' }}>
            <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>TRADITIONAL EXCHANGE</div>
            <div className="font-mono" style={{ color: 'var(--accent-green)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>ON CITADELLE</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px' }}>
            {[
              ['Broker Required', 'Wallet Only'],
              ['KYC / Restricted', 'Permissionless'],
              ['Market Hours Only', '24/7 Trading'],
              ['T+2 Settlement', 'Instant On-Chain'],
              ['Counterparty Risk', 'Smart Contract Secured']
            ].map(([left, right], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', textDecoration: 'line-through', opacity: 0.5, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{left}</div>
                <div style={{ color: 'var(--text-secondary)', margin: '0 1rem' }}>→</div>
                <div style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--accent-green)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'right' }}>{right}</div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* SECTION 6: THE STACK */}
      <section style={{ padding: "100px 20px", background: "var(--bg-color-secondary)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: 'center' }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "4rem", letterSpacing: "0.02em", textTransform: 'uppercase' }}>
            The Citadelle Stack.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', borderRadius: '12px' }}>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '12px' }}>EXECUTION</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.02em' }}>Citadelle Smart Contracts</div>
            </div>
            
            <div style={{ height: '40px', width: '1px', background: 'var(--border-color)' }}></div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', maxWidth: '600px' }}>
              <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', borderRadius: '12px' }}>
                <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '12px' }}>ORACLE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.02em' }}>Pyth Network</div>
              </div>
              <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', borderRadius: '12px' }}>
                <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '12px' }}>SETTLEMENT</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.02em' }}>USDG</div>
              </div>
            </div>

            <div style={{ height: '40px', width: '1px', background: 'var(--border-color)' }}></div>
            
            <div style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', border: '1px solid var(--accent-green)', background: 'rgba(94,234,212,0.05)', borderRadius: '12px' }}>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-green)', letterSpacing: '0.1em', marginBottom: '12px' }}>INFRASTRUCTURE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>Robinhood Chain</div>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px' }}>Block Time: 0.4s</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PROTOCOL FEATURES */}
      <section style={{ padding: "120px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color-secondary)' }}>
              <div className="font-mono" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>01</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Self-Custodial</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>No brokers, no intermediaries. Your wallet is your account. Full control over collateral at all times.</p>
            </div>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color-secondary)' }}>
              <div className="font-mono" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>02</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pyth Oracle Pricing</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Real-time price feeds from the Pyth Network ensure accurate, manipulation-resistant settlement prices.</p>
            </div>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color-secondary)' }}>
              <div className="font-mono" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>03</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>USDG Cash Settlement</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>All options are cash-settled in USDG. No physical delivery of underlying assets required.</p>
            </div>
            <div style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color-secondary)' }}>
              <div className="font-mono" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>04</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Robinhood Chain</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Sub-second block times and negligible gas fees make derivatives trading fast and affordable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: STATS BAR & CTA */}
      <section style={{ background: "var(--bg-color-secondary)", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "2rem" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>MARKETS</span>
              <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 600 }}>7</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>COLLATERAL</span>
              <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 600 }}>USDG</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>ORACLE</span>
              <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 600 }}>PYTH</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>CHAIN</span>
              <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 600 }}>ROBINHOOD</span>
            </div>
          </div>
        </div>
        
        <div style={{ padding: "120px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: "3rem", maxWidth: "800px" }}>
            Trade options on tokenized equities.
          </h2>
          <Link to="/terminal" className="btn-primary" style={{ textDecoration: "none", padding: "1.25rem 3rem", fontSize: "1.125rem", backgroundColor: "var(--accent-green)", color: "#000", fontWeight: 600, borderRadius: "999px" }}>
            Launch Terminal
          </Link>
        </div>
      </section>

      {/* SECTION 9: FOOTER */}
      <footer style={{ 
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-color)",
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
            <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: "0.05em", textTransform: "uppercase" }}>Citadelle</span>
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
            href="/docs" 
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.9rem' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Docs
          </a>
          <a 
            href="https://x.com/CitadelleOpt" 
            target="_blank" 
            rel="noreferrer" 
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '999px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
            <span className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
              LIVE ON ROBINHOOD CHAIN
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
