/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

/* =============================================================================
   CITADELLE OPTIONS — landing page rewritten in black and white, 
   borrowing the isometric structure from StablePerp.
============================================================================= */

// Grayscale / B&W Palette
const ACCENT = "#FFFFFF";
const INK_LIGHT = "#FFFFFF"; // Text on dark background
const BG_BASE = "#000000";
const BG_ELEVATED = "#0A0A0A";
const BG_FOOTER = "#050505";
const MUTED = "rgba(255,255,255,0.62)";
const BORDER = "rgba(255,255,255,0.15)";

const SERIF = "var(--font-sans)"; // Citadelle uses Space Grotesk / Inter
const SANS = "var(--font-sans)";
const MONO = "var(--font-mono)";

const Wordmark = ({ color = INK_LIGHT, size = 22 }: any) => (
  <span style={{ fontFamily: SERIF, fontSize: size, color, letterSpacing: "0.05em", fontWeight: 700, textTransform: "uppercase" }}>
    CITADELLE
  </span>
);

function Logo({ size = 26 }: any) {
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

/* ---------- high-quality animated topographic background (canvas) ---------- */
function AnimatedContours({ color = "#FFFFFF", lines = 9, baseAlpha = 0.15 }: any) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0, W = 0, H = 0;
    const ctx = (canvas as any).getContext("2d");
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = (canvas as any).clientWidth; H = (canvas as any).clientHeight;
      (canvas as any).width = Math.max(1, W * dpr); (canvas as any).height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.46;
      const R = Math.max(W, H);
      const step = R / (lines * 1.5);
      for (let i = 0; i < lines; i++) {
        const rBase = step * 0.4 + i * step;
        const amp = step * 0.32;
        const drift = t * 0.00022 * (1 + i * 0.05) + i * 0.55;
        ctx.beginPath();
        for (let a = 0; a <= 360; a += 3) {
          const th = (a * Math.PI) / 180;
          const r = rBase + amp * Math.sin(3 * th + drift) + amp * 0.35 * Math.cos(2 * th - drift * 0.7);
          const x = cx + r * Math.cos(th);
          const y = cy + r * 0.6 * Math.sin(th);
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.max(0.015, baseAlpha - i * 0.01);
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    if (reduce) draw(0);
    else raf = requestAnimationFrame(draw);

    const vis = () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
      else if (!reduce && !raf) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [color, lines, baseAlpha]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ---------- concentric-circle feature icon ---------- */
const Concentric = ({ variant = 0 }: any) => (
  <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
    {variant === 1 ? (
      <>
        <ellipse cx="26" cy="26" rx="24" ry="14" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.3" />
        <ellipse cx="26" cy="26" rx="14" ry="9" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.5" />
        <circle cx="26" cy="26" r="4" fill={ACCENT} opacity="0.8" />
      </>
    ) : variant === 2 ? (
      <>
        <path d="M26 6 C10 6 4 20 4 26 C4 32 10 46 26 46 C42 46 48 32 48 26 C48 20 42 6 26 6Z" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.3" />
        <circle cx="26" cy="26" r="10" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.5" />
        <circle cx="26" cy="26" r="3.5" fill={ACCENT} opacity="0.8" />
      </>
    ) : (
      <>
        <circle cx="26" cy="26" r="22" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.3" />
        <circle cx="26" cy="26" r="14" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.5" />
        <circle cx="26" cy="26" r="6" fill="none" stroke={ACCENT} strokeWidth="1.4" opacity="0.85" />
      </>
    )}
  </svg>
);

/* ================= interactive isometric stack ================= */
const TILE = 54, TILEH = 27;
const iso = (gx: number, gy: number, gz: number) => ({ x: (gx - gy) * TILE, y: (gx + gy) * TILEH - gz });

const STACK = [
  // Left Platform (Core)
  { id: "calls", label: "Calls", gx: 0, gy: 3.5, h: 110, flag: true },
  { id: "puts", label: "Puts", gx: 1.5, gy: 3.5, h: 140, flag: true },
  { id: "oracles", label: "Oracles", gx: 0, gy: 5, h: 90 },
  { id: "settlement", label: "Settlement", gx: 1.5, gy: 5, h: 70 },
  { id: "factory", label: "Factory", gx: 0.75, gy: 6.5, h: 80 },
  
  // Right Platform (Ecosystem)
  { id: "vault", label: "Vaults", gx: 3.5, gy: 0, h: 120 },
  { id: "collateral", label: "Collateral", gx: 5, gy: 0, h: 90 },
  { id: "agent", label: "AI Agent", gx: 6.5, gy: 0, h: 130 },
  { id: "positions", label: "Positions", gx: 4.25, gy: 1.5, h: 100 },
  { id: "corp", label: "P2P Market", gx: 5.75, gy: 1.5, h: 80 },
  { id: "more", label: "And More", gx: 5, gy: 3, h: 110 },
];

function Box({ item }: any) {
  const { gx, gy, h, flag } = item;
  const topH = h, base = 0;
  const w = 1.0;
  const A = iso(gx, gy, topH), B = iso(gx + w, gy, topH), C = iso(gx + w, gy + w, topH), D = iso(gx, gy + w, topH);
  const B2 = iso(gx + w, gy, base), C2 = iso(gx + w, gy + w, base), D2 = iso(gx, gy + w, base);
  const topC = flag ? "#FFFFFF" : "#333333";
  const rightC = flag ? "#CCCCCC" : "#222222";
  const leftC = flag ? "#EEEEEE" : "#111111";
  const poly = (pts: any, fill: any) => <polygon points={pts.map((p: any) => `${p.x},${p.y}`).join(" ")} fill={fill} stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />;
  const rf = [B, C, C2, B2], lf = [D, C, C2, D2];
  return (
    <g>
      {poly(lf, leftC)}{poly(rf, rightC)}{poly([A, B, C, D], topC)}
    </g>
  );
}

function Platform({ x0, y0, x1, y1, z, color, label, align }: any) {
  const A = iso(x0, y0, z), B = iso(x1, y0, z), C = iso(x1, y1, z), D = iso(x0, y1, z);
  const thick = label === 'ROBINHOOD CHAIN' ? 40 : 20;
  const B2 = iso(x1, y0, z - thick), C2 = iso(x1, y1, z - thick), D2 = iso(x0, y1, z - thick);
  const top = [A, B, C, D], right = [B, C, C2, B2], left = [D, C, C2, D2];
  
  let tx = 0, ty = 0, rot = 0;
  if (align === 'left') {
    tx = (D.x + C.x)/2 - 35; ty = (D.y + C.y)/2 + 25; rot = 26.5;
  } else if (align === 'right') {
    tx = (B.x + C.x)/2 + 35; ty = (B.y + C.y)/2 + 25; rot = -26.5;
  } else {
    tx = (D.x + C.x)/2; ty = (D.y + C.y)/2 + 45; rot = 26.5;
  }

  return (
    <g>
      <polygon points={right.map(p => `${p.x},${p.y}`).join(" ")} fill="#111111" stroke="rgba(255,255,255,0.15)" />
      <polygon points={left.map(p => `${p.x},${p.y}`).join(" ")} fill="#0A0A0A" stroke="rgba(255,255,255,0.15)" />
      <polygon points={top.map(p => `${p.x},${p.y}`).join(" ")} fill={color} stroke="rgba(255,255,255,0.2)" />
      {label && <text x={tx} y={ty} transform={`rotate(${rot} ${tx} ${ty})`} textAnchor="middle" fill="rgba(255,255,255,0.50)" fontSize="13" fontFamily={MONO} letterSpacing="0.2em" fontWeight="600">{label}</text>}
    </g>
  );
}

function CitadelleStack() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 1100, margin: "0 auto", padding: "20px 0" }}>
      <svg viewBox="0 0 1100 760" width="100%" style={{ display: "block", overflow: "visible" }}>
        {/* Connecting Lines (drawn behind) */}
        <g stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none">
          {/* Top Left -> Options */}
          <polyline points="290,110 360,110 420,170" />
          {/* Bottom Left -> Core Platform Base */}
          <polyline points="290,320 330,320 380,370" />
          {/* Right -> Ecosystem Blocks */}
          <polyline points="850,150 780,150 710,220" />
        </g>
        
        {/* Base Layer & Blocks */}
        <g transform="translate(550, 200)">
          <Platform x0={-1} y0={-1} x1={8.5} y1={8.5} z={-40} color="#000000" label="ROBINHOOD CHAIN" align="center" />
          
          <Platform x0={-0.5} y0={3} x1={3} y1={8} z={0} color="#050505" label="CITADELLE CORE" align="left" />
          <Platform x0={3} y0={-0.5} x1={8} y1={4.5} z={0} color="#050505" label="ECOSYSTEM" align="right" />

          {[...STACK].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)).map((it) => (
            <Box key={it.id} item={it} />
          ))}
        </g>
        
        {/* HTML Text overlays via foreignObject */}
        <foreignObject x="40" y="30" width="240" height="150">
          <div style={{ color: "rgba(255,255,255,0.7)", fontFamily: SANS, fontSize: 14, lineHeight: 1.5 }}>
            Options are the flagship application built natively on Citadelle Core. But they are just the tip of the iceberg.
          </div>
        </foreignObject>

        <foreignObject x="860" y="90" width="240" height="200">
          <div style={{ color: "rgba(255,255,255,0.7)", fontFamily: SANS, fontSize: 14, lineHeight: 1.5 }}>
            High performance applications are built natively. The core exists as one unified state on Robinhood Chain, unlocking speed and deep liquidity.
          </div>
        </foreignObject>

      </svg>
    </div>
  );
}

/* ---------- animated fade-in row ---------- */
function FadeInRow({ children, delay }: any) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  );
}

/* ---------- phone mockup (mini terminal) ---------- */
function Phone({ symbol = "NVDA", price = "223.96", rows = [["17.13", "225", "17.45"], ["13.86", "230", "21.16"], ["11.06", "235", "25.34"], ["8.70", "240", "29.95"]] }: any) {
  return (
    <div style={{ width: 280, margin: "0 auto", borderRadius: 40, border: `10px solid #111111`, background: "#000000", padding: "14px 12px 18px", boxShadow: "0 30px 60px rgba(0,0,0,0.8)", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED, letterSpacing: "0.15em" }}>CITADELLE</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: MUTED, border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 4, padding: "2px 5px" }}>MAINNET</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 18, color: "#fff", fontWeight: 700 }}>{symbol}</span>
        <span style={{ fontFamily: MONO, fontSize: 15, color: "#fff" }}>${price}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ color: MUTED }}>CALLS</span><span style={{ textAlign: "center" }}>STRIKE</span><span style={{ textAlign: "right" }}>PUTS</span>
      </div>
      {rows.map((r: any, i: number) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontFamily: MONO, fontSize: 12, padding: "8px 0", background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent" }}>
          <span style={{ color: "#fff" }}>{r[0]}</span>
          <span style={{ textAlign: "center", color: i === 0 ? "#fff" : MUTED, fontWeight: 700 }}>{r[1]}</span>
          <span style={{ textAlign: "right", color: "rgba(255,255,255,0.8)" }}>{r[2]}</span>
        </div>
      ))}
      <div style={{ marginTop: 12, textAlign: "center", background: "#ffffff", color: "#000000", borderRadius: 999, padding: "10px 0", fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>
        Buy 1 {symbol} {rows[0][1]} Call
      </div>
    </div>
  );
}

const Pill = ({ children, filled, to = "#" }: any) => (
  <Link to={to} style={{
    fontFamily: SANS, fontSize: 16, textDecoration: "none", padding: "15px 34px", borderRadius: 999,
    background: filled ? "#ffffff" : "transparent", color: filled ? "#000000" : "#ffffff",
    border: `1.5px solid ${filled ? "#ffffff" : "rgba(255,255,255,0.25)"}`, display: "inline-block", fontWeight: 500,
  }}>{children}</Link>
);

function LiquidLogo() {
  return (
    <div style={{
      position: 'relative', width: 90, height: 200,
      margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="liquid-goo" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div style={{
        filter: 'url(#liquid-goo)',
        width: '100%', height: '100%',
        position: 'absolute',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Main blob A */}
        <div className="ll-a" style={{
          position: 'absolute', width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(145deg, #ffffff 0%, #bbbbbb 100%)',
        }} />
        {/* Bridge blob */}
        <div style={{
          position: 'absolute', width: 18, height: 18, borderRadius: '50%',
          background: '#dddddd',
          animation: 'll-bridge 9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
        }} />
        {/* Main blob B */}
        <div className="ll-b" style={{
          position: 'absolute', width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(145deg, #eeeeee 0%, #888888 100%)',
        }} />
      </div>

      <style>{`
        .ll-a { animation: ll-move 8s ease-in-out infinite alternate; }
        .ll-b { animation: ll-move 8s ease-in-out infinite alternate-reverse; }

        @keyframes ll-move {
          from { transform: translateY(-50px); }
          to   { transform: translateY(50px);  }
        }

        @keyframes ll-bridge {
          0%, 100% { transform: scale(1.0); }
          50%       { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default function Landing() {
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const ctdlCA = import.meta.env.VITE_CTDL_CA;

  const handleCopyCA = () => {
    if (ctdlCA) {
      navigator.clipboard.writeText(ctdlCA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div style={{ background: BG_BASE, color: INK_LIGHT, fontFamily: SANS }}>
      <style>{`
        @keyframes sp-enter {
          0%   { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
        .sp-enter   { display:inline-block; transform-origin:center; animation: sp-enter 1s cubic-bezier(.2,.8,.3,1.2) both; }
        @media (prefers-reduced-motion: reduce) { .sp-enter, .sp-elastic { animation: none; } }
      `}</style>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", background: BG_BASE, padding: "0 20px 90px" }}>
        <AnimatedContours />
        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <span className="sp-enter">
            <LiquidLogo />
          </span>
        </div>
        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: '2rem' }}>
              <div style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                border: `1px solid ${BORDER}`,
                background: 'transparent',
                backdropFilter: 'blur(8px)',
                borderRadius: '999px',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: MUTED
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
                    border: `1px solid ${BORDER}`,
                    background: 'transparent',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    color: MUTED,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FFFFFF';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.color = MUTED;
                  }}
                >
                  <span style={{ textTransform: 'uppercase' }}>CA: {ctdlCA}</span>
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
              fontFamily: SERIF,
              fontSize: "clamp(3rem, 5vw, 4.5rem)", 
              fontWeight: 700, 
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
              color: INK_LIGHT,
              lineHeight: 1.1,
              textTransform: "uppercase"
            }}>
              Trade Options<br/>
              On Tokenized<br/>
              Equities.
            </h1>
            
            <p style={{ 
              fontFamily: SANS,
              fontSize: "clamp(1rem, 1.5vw, 1.125rem)", 
              color: MUTED, 
              marginBottom: "2.5rem",
              maxWidth: "500px",
              lineHeight: 1.6
            }}>
              The first decentralized options protocol for US equities. Write calls & puts, earn premium, or hedge your portfolio, all settled in USDG on the Robinhood Chain.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              <Link to="/terminal" style={{ textDecoration: "none", padding: "1rem 2rem", fontSize: "1rem", backgroundColor: "#ffffff", color: "#000000", border: '1.5px solid #ffffff', fontWeight: 600, borderRadius: "999px" }}>
                Launch Terminal
              </Link>
              <a href="/docs" style={{ textDecoration: "none", padding: "1rem 2rem", fontSize: "1rem", borderRadius: "999px", border: `1px solid ${BORDER}`, background: 'transparent', backdropFilter: 'blur(8px)', color: INK_LIGHT }}>
                Read Docs
              </a>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: MUTED }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFFFFF" }}></div>
                Fully collateralized
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFFFFF" }}></div>
                Oracle settlement
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFFFFF" }}></div>
                Non-custodial
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CARD */}
          <div style={{
            padding: '1.5rem',
            border: `1px solid ${BORDER}`,
            borderRadius: '16px',
            background: 'transparent',
            backdropFilter: 'blur(12px)',
            fontFamily: MONO
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: `1px solid ${BORDER}`, marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: INK_LIGHT, fontFamily: SANS }}>NVDA</span>
                <span style={{ fontSize: '0.75rem', color: MUTED, letterSpacing: '0.05em' }}>NVIDIA &middot; Oct 10</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: INK_LIGHT }}>$230.36</span>
                <span style={{ fontSize: '0.85rem', color: '#5EEAD4' }}>+0.84%</span>
              </div>
            </div>

            {/* Table Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.7rem', color: MUTED, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
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
                background: row.highlight ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: '6px',
                margin: '0 -0.5rem'
              }}>
                <div style={{ color: '#FFFFFF' }}>{row.call}</div>
                <div style={{ textAlign: 'center', color: row.highlight ? '#FFFFFF' : MUTED }}>{row.strike}</div>
                <div style={{ textAlign: 'right', color: INK_LIGHT }}>{row.put}</div>
              </div>
            ))}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: `1px solid ${BORDER}`, marginTop: '0.75rem', fontSize: '0.75rem', color: MUTED }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFFFFF' }}></div>
                Live oracle feed
              </div>
              <Link to="/terminal" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
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
        background: "rgba(255,255,255,0.02)",
        padding: "1.25rem 0",
        overflow: "hidden",
        whiteSpace: "nowrap"
      }}>
        <div className="marquee-container">
          {MARKET_DATA.map((market, i) => (
            <div key={i} style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "1.1rem", textTransform: "uppercase", color: INK_LIGHT }}>{market.symbol}</span>
              <span className="font-mono" style={{ fontSize: "1.1rem", color: INK_LIGHT }}>{market.price}</span>
              <span className={`font-mono`} style={{ fontSize: "1.1rem", color: market.change === "--%" ? MUTED : market.positive ? "#5EEAD4" : "#F87171" }}>
                {market.change}
              </span>
            </div>
          ))}
          {MARKET_DATA.map((market, i) => (
            <div key={i + 'clone'} style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "1.1rem", textTransform: "uppercase", color: INK_LIGHT }}>{market.symbol}</span>
              <span className="font-mono" style={{ fontSize: "1.1rem", color: INK_LIGHT }}>{market.price}</span>
              <span className={`font-mono`} style={{ fontSize: "1.1rem", color: market.change === "--%" ? MUTED : market.positive ? "#5EEAD4" : "#F87171" }}>
                {market.change}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* OWNERSHIP */}
      <section id="ownership" style={{ background: BG_ELEVATED, padding: "110px 20px", textAlign: "center", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.28, maxWidth: 900, margin: "0 auto", color: MUTED, letterSpacing: "-0.01em" }}>
          Anyone can own and govern <Wordmark /> through{" "}
          <span style={{ color: INK_LIGHT }}>$CTDL</span>, the protocol's native token.
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 17, color: INK_LIGHT, marginTop: 30 }}>Own a piece of Citadelle today.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <Pill filled to="/terminal">Start Trading</Pill>
          <Pill to="/docs">Start Building</Pill>
        </div>
      </section>

      {/* FLAGSHIP */}
      <section id="flagship" style={{ background: BG_BASE, padding: "110px 20px", overflowX: "hidden" }}>
        <div style={{ maxWidth: 1250, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: 17, color: MUTED, margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>The Flagship Application:</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 6vw, 62px)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.02em", margin: "14px 0 54px" }}>
            The Premier Onchain <span style={{ opacity: 0.5 }}>Options</span> Venue
          </h2>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "nowrap", alignItems: "flex-start" }}>
            <FadeInRow delay={0}><Phone symbol="NVDA" price="223.96" rows={[["17.13", "225", "17.45"], ["13.86", "230", "21.16"], ["11.06", "235", "25.34"], ["8.70", "240", "29.95"]]} /></FadeInRow>
            <FadeInRow delay={0.2}><Phone symbol="TSLA" price="173.44" rows={[["8.12", "175", "10.45"], ["6.34", "180", "14.20"], ["4.90", "185", "19.34"], ["3.70", "190", "24.95"]]} /></FadeInRow>
            <FadeInRow delay={0.4}><Phone symbol="AAPL" price="165.23" rows={[["5.10", "165", "4.85"], ["3.45", "170", "7.10"], ["2.10", "175", "10.30"], ["1.15", "180", "14.95"]]} /></FadeInRow>
            <FadeInRow delay={0.6}><Phone symbol="COIN" price="254.10" rows={[["10.20", "250", "8.90"], ["8.15", "255", "12.30"], ["6.40", "260", "15.45"], ["4.80", "265", "19.20"]]} /></FadeInRow>
          </div>
        </div>

        <div style={{ maxWidth: 780, margin: "70px auto 0" }}>
          {[
            [0, "Low fees", "Zero gas and cheap fills on every trade, priced onchain."],
            [1, "Transparent", "Fully onchain. Pricing, collateral and settlement are all verifiable on Robinhood Chain."],
            [2, "Real US equities", "Calls and puts on NVDA, TSLA, AAPL and more, priced live by Pyth."],
          ].map(([v, t, d], i) => (
            <div key={t} style={{ display: "flex", gap: 26, alignItems: "flex-start", padding: "30px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
              <div style={{ flexShrink: 0 }}><Concentric variant={v} /></div>
              <div>
                <h3 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 700, textTransform: "uppercase", margin: "2px 0 8px" }}>{t}</h3>
                <p style={{ fontFamily: SANS, fontSize: 16.5, lineHeight: 1.55, color: MUTED, margin: 0 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STACK (dark) */}
      <section id="stack" style={{ background: BG_ELEVATED, color: INK_LIGHT, padding: "100px 20px 110px", borderTop: "1px solid var(--border-color)" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(34px, 6vw, 62px)", fontWeight: 700, textTransform: "uppercase", textAlign: "center", letterSpacing: "-0.01em", margin: "0 0 20px" }}>
          The <Wordmark size="clamp(34px, 6vw, 62px)" /> Stack
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 17, color: MUTED, textAlign: "center", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Options are the flagship markets. But they are just the tip of the iceberg.
        </p>

        <CitadelleStack />

        {/* stats */}
        <div style={{ maxWidth: 860, margin: "70px auto 0", border: `1px solid ${BORDER}`, borderRadius: 22, padding: "34px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 30, background: "rgba(255,255,255,0.02)" }}>
          {[["Block time", "0.4s"], ["Underlyings", "20+ US stocks"], ["Oracle", "Pyth"], ["Settlement", "USDG"]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: INK_LIGHT, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: BG_FOOTER, color: MUTED, padding: "44px 22px", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <Logo size={24} glow={false} />
          <Wordmark color={INK_LIGHT} size={20} />
          <a 
            href="https://x.com/CitadelleOpt" 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'rgba(255,255,255,0.7)',
              marginLeft: '16px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em" }}>
          $CTDL · {ctdlCA ? (
            <a 
              href={`https://pump.fun/${ctdlCA}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: "#FFFFFF", textDecoration: "none" }}
            >
              CA: {ctdlCA}
            </a>
          ) : "CA SOON"}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 12, maxWidth: 360, textAlign: "right", lineHeight: 1.5 }}>
          Derivatives involve risk. Access is restricted by jurisdiction. Nothing here is financial advice.
        </span>
      </footer>
    </div>
  );
}
