import { useState } from 'react';
import type { FC } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Link } from 'react-router-dom';
import './Navbar.css';

export const LogoText: FC = () => (
  <span>Citadelle</span>
);

export const Navbar: FC<{ variant?: string }> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const targetChainId = Number(import.meta.env.VITE_NETWORK_ID);
  const networkName = import.meta.env.VITE_NETWORK_NAME || 'the correct network';
  
  const isWrongNetwork = isConnected && chainId !== targetChainId;

  const handleConnect = () => {
    if (isConnected) {
      if (isWrongNetwork && switchChain) {
        switchChain({ chainId: targetChainId });
      } else {
        setShowDisconnectConfirm(true);
      }
    } else {
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      } else {
        alert('No EVM wallet found!');
      }
    }
  };

  return (
    <>
      <nav className="navbar-container">
        <Link to="/" style={{ textDecoration: 'none', marginRight: 'auto' }}>
          <div className="navbar-logo">
            <img src="/logo.png" alt="Citadelle Logo" style={{ height: '24px', filter: 'grayscale(100%) brightness(200%)' }} />
            <LogoText />
          </div>
        </Link>
        
        <div className="navbar-links">
          <Link to="/#flagship">Flagship</Link>
          <Link to="/#stack">Ecosystem</Link>
          <Link to="/#ownership">Ownership</Link>
          <Link to="/terminal">Trade</Link>
        </div>
        
        <div className="navbar-actions">
          <a 
            href="https://x.com/CitadelleOpt" 
            target="_blank" 
            rel="noreferrer" 
            style={{ color: '#ffffff', opacity: 0.7, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', marginRight: '1rem' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <button 
            onClick={handleConnect}
            className="wallet-btn"
            style={isWrongNetwork ? { backgroundColor: '#F87171', color: '#000', border: 'none' } : {}}
          >
            {!isConnected 
              ? '[ Connect Wallet ]' 
              : isWrongNetwork 
                ? `⚠️ Switch to ${networkName}` 
                : `[ ${address?.slice(0, 6)}...${address?.slice(-4)} ]`}
          </button>
          
          <button 
            className="hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>
      
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <Link to="/#flagship" onClick={() => setIsMobileMenuOpen(false)}>Flagship</Link>
            <Link to="/#stack" onClick={() => setIsMobileMenuOpen(false)}>Ecosystem</Link>
            <Link to="/#ownership" onClick={() => setIsMobileMenuOpen(false)}>Ownership</Link>
            <Link to="/terminal" onClick={() => setIsMobileMenuOpen(false)}>Trade</Link>
          </div>
        </div>
      )}

      {showDisconnectConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'var(--bg-color-secondary)',
            border: '1px solid var(--border-color)',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Disconnect Wallet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
              Are you sure you want to disconnect?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowDisconnectConfirm(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  disconnect();
                  setShowDisconnectConfirm(false);
                }}
                className="btn-primary"
                style={{ flex: 1, backgroundColor: 'var(--accent-red)', color: '#000', fontWeight: 600, border: 'none' }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
