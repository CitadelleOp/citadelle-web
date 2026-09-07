import { Link } from "react-router-dom";
import { useState } from "react";
import { SilkBackground } from "../components/SilkBackground";

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
  const [copied, setCopied] = useState(false);
  const ctdlCA = import.meta.env.VITE_CTDL_CA;

  const handleCopyCA = () => {
    if (ctdlCA) {
      navigator.clipboard.writeText(ctdlCA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent", position: "relative" }}>
      {/* GLOBAL BACKGROUND */}
      <SilkBackground 
        color="#333333" 
        bgColor="#000000" 
        speed={1.2} 
        intensity={1.5} 
        scale={2.5} 
      />
      
      {/* SECTION 1: HERO */}
      <section style={{ 
        position: "relative",
        zIndex: 1,
        padding: "120px 20px 80px",
        overflow: "hidden"
      }}>
        
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: '2rem' }}>
              <div style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                backdropFilter: 'blur(8px)',
                borderRadius: '999px',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)'
              }}>
                Live on Robinhood Chain
              </div>
              
              {ctdlCA && (
                <button 
                  onClick={handleCopyCA}
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '4px 12px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <span style={{ textTransform: 'uppercase' }}>CA: {ctdlCA.slice(0, 6)}...{ctdlCA.slice(-4)}</span>
                  <span>
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </span>
                </button>
              )}
            </div>

            <h1 style={{ 
              fontSize: "clamp(3rem, 5vw, 4.5rem)", 
              fontWeight: 700, 
              letterSpacing: "0.02em",
              marginBottom: "1.5rem",
              color: "var(--text-primary)",
              lineHeight: 1.1,
              textTransform: "uppercase"
            }}>
              Trade Options<br/>
              On Tokenized<br/>
              Equities.
            </h1>
            
            <p style={{ 
              fontSize: "clamp(1rem, 1.5vw, 1.125rem)", 
              color: "var(--text-secondary)", 
              marginBottom: "2.5rem",
              maxWidth: "500px",
              lineHeight: 1.6
            }}>
              The first decentralized options protocol for US equities. Write calls & puts, earn premium, or hedge your portfolio, all settled in USDG on the Robinhood Chain.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              <Link to="/terminal" className="btn-primary" style={{ textDecoration: "none", padding: "1rem 2rem", fontSize: "1rem", backgroundColor: "#ffffff", color: "#000000", border: '1.5px solid #ffffff', fontWeight: 600, borderRadius: "999px" }}>
                Launch Terminal
              </Link>
              <a href="/docs" className="btn-secondary" style={{ textDecoration: "none", padding: "1rem 2rem", fontSize: "1rem", borderRadius: "999px", border: '1px solid var(--border-color)', background: 'transparent', backdropFilter: 'blur(8px)', color: 'var(--text-primary)' }}>
                Read Docs
              </a>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent-green)" }}></div>
                Fully collateralized
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent-green)" }}></div>
                Oracle settlement
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent-green)" }}></div>
                Non-custodial
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CARD */}
          <div style={{
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            background: 'transparent',
            backdropFilter: 'blur(12px)',
            fontFamily: 'var(--font-mono)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>NVDA</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>NVIDIA &middot; Oct 10</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>$230.36</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>+0.84%</span>
              </div>
            </div>

            {/* Table Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              <div>CALLS</div>
              <div style={{ textAlign: 'center' }}>STRIKE</div>
              <div style={{ textAlign: 'right' }}>PUTS</div>
            </div>

            {/* Table Rows */}
            {[
              { call: '9.10', strike: '240', put: '17.83' },
              { call: '11.21', strike: '235', put: '14.97' },
              { call: '13.65', strike: '230', put: '12.42', highlight: true },
              { call: '16.40', strike: '225', put: '10.20' },
              { call: '19.46', strike: '220', put: '8.28' },
            ].map((row, i) => (
              <div key={i} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                fontSize: '0.85rem',
                padding: '0.75rem 0.5rem',
                background: row.highlight ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
                borderRadius: '6px',
                margin: '0 -0.5rem'
              }}>
                <div style={{ color: 'var(--accent-green)' }}>{row.call}</div>
                <div style={{ textAlign: 'center', color: row.highlight ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{row.strike}</div>
                <div style={{ textAlign: 'right', color: 'var(--text-primary)' }}>{row.put}</div>
              </div>
            ))}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
                Live oracle feed
              </div>
              <Link to="/terminal" style={{ color: 'var(--accent-green)', textDecoration: 'none' }}>
                Open terminal &rarr;
              </Link>
            </div>
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
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <div className="font-mono" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>01</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Write an Option</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Deposit USDG collateral into the Citadelle Vault. Choose your asset, set the strike price, expiry date, and the premium you want to earn. Your collateral is locked until settlement.</p>
            </div>
            
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <div className="font-mono" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>02</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match a Buyer</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Buyers browse available options on the marketplace. They pay your asking premium in USDG to take the other side of the trade. No order book — direct peer-to-peer matching.</p>
            </div>
            
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <div className="font-mono" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>03</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settle at Expiry</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>At expiration, the Pyth Oracle provides the final price. If the option is in-the-money, the buyer profits. If not, the writer keeps the full premium and collateral. Fully automated, no manual exercise.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COMPARISON */}
      <section style={{ padding: "0 20px 120px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "4rem 2rem", border: "1px solid var(--border-color)", borderRadius: "12px", background: "transparent", backdropFilter: 'blur(8px)', display: "flex", flexDirection: "column", alignItems: "center" }}>
          
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


      {/* SECTION 2: COMPARISON */}
      <section style={{ 
        position: "relative",
        zIndex: 1,
        padding: "100px 20px", 
        background: "transparent",
        borderTop: "1px solid var(--border-color)",
        borderBottom: "1px solid var(--border-color)"
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: 'center' }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "4rem", letterSpacing: "0.02em", textTransform: 'uppercase' }}>
            The Citadelle Stack.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'transparent', backdropFilter: 'blur(8px)', borderRadius: '12px' }}>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '12px' }}>EXECUTION</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.02em' }}>Citadelle Smart Contracts</div>
            </div>
            
            <div style={{ height: '40px', width: '1px', background: 'var(--border-color)' }}></div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', maxWidth: '600px' }}>
              <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'transparent', backdropFilter: 'blur(8px)', borderRadius: '12px' }}>
                <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '12px' }}>ORACLE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.02em' }}>Pyth Network</div>
              </div>
              <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'transparent', backdropFilter: 'blur(8px)', borderRadius: '12px' }}>
                <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '12px' }}>SETTLEMENT</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.02em' }}>USDG</div>
              </div>
            </div>

            <div style={{ height: '40px', width: '1px', background: 'var(--border-color)' }}></div>
            
            <div style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', border: '1px solid var(--accent-green)', background: 'rgba(94,234,212,0.05)', backdropFilter: 'blur(8px)', borderRadius: '12px' }}>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-green)', letterSpacing: '0.1em', marginBottom: '12px' }}>INFRASTRUCTURE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>Robinhood Chain</div>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px' }}>Block Time: 0.4s</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PROTOCOL FEATURES */}
      <section style={{ position: "relative", zIndex: 1, padding: "120px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <div className="font-mono" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>01</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Self-Custodial</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>No brokers, no intermediaries. Your wallet is your account. Full control over collateral at all times.</p>
            </div>
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <div className="font-mono" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>02</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pyth Oracle Pricing</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Real-time price feeds from the Pyth Network ensure accurate, manipulation-resistant settlement prices.</p>
            </div>
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <div className="font-mono" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>03</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>USDG Cash Settlement</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>All options are cash-settled in USDG. No physical delivery of underlying assets required.</p>
            </div>
            <div style={{ padding: '2.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <div className="font-mono" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>04</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Robinhood Chain</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Sub-second block times and negligible gas fees make derivatives trading fast and affordable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section style={{ position: "relative", zIndex: 1, background: "transparent", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ borderBottom: "1px solid var(--border-color)", background: 'transparent', backdropFilter: 'blur(8px)' }}>
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
          <Link to="/terminal" className="btn-primary" style={{ textDecoration: "none", padding: "1.25rem 3rem", fontSize: "1.125rem", backgroundColor: "#ffffff", color: "#000000", border: '1.5px solid #ffffff', fontWeight: 600, borderRadius: "999px" }}>
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
