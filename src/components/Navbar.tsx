import { useState } from 'react';
import type { FC } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Link } from 'react-router-dom';
import './Navbar.css';

export const LogoText: FC = () => (
  <span>Citadelle</span>
);

export const Navbar: FC<{ variant?: string }> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    if (isConnected) {
      disconnect();
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
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="navbar-logo">
            <img src="/logo.png" alt="Citadelle Logo" style={{ height: '24px', filter: 'grayscale(100%) brightness(200%)' }} />
            <LogoText />
          </div>
        </Link>
        
        <div className="navbar-links">
          {/* <Link to="/terminal">Trade</Link>
          <Link to="/terminal">Options</Link>
          <Link to="/terminal">Perpetuals</Link>
          <Link to="/terminal">Portfolio</Link> */}
        </div>
        
        <div className="navbar-actions">
          <button 
            onClick={handleConnect}
            className="wallet-btn" 
          >
            {isConnected ? `[ ${address?.slice(0, 6)}...${address?.slice(-4)} ]` : '[ Connect Wallet ]'}
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
            {/* <Link to="/terminal" onClick={() => setIsMobileMenuOpen(false)}>Trade</Link>
            <Link to="/terminal" onClick={() => setIsMobileMenuOpen(false)}>Options</Link>
            <Link to="/terminal" onClick={() => setIsMobileMenuOpen(false)}>Perpetuals</Link>
            <Link to="/terminal" onClick={() => setIsMobileMenuOpen(false)}>Portfolio</Link> */}
          </div>
        </div>
      )}
    </>
  );
};
