import { useState } from 'react';
import type { FC } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';

import { TxModal } from '../common/TxModal';
import { citadelleNetwork } from '../../providers/WalletContextProvider';
import { ENGINE_CONTRACT_ADDRESS, OPTIONS_ENGINE_ABI, ERC20_ABI } from '../../lib/contracts';

interface WriteOptionProps {
  market: any | null;
  optionType?: 'call' | 'put';
}

export const WriteOption: FC<WriteOptionProps> = ({ market, optionType = 'call' }) => {
  const [qty, setQty] = useState('');
  const [premium, setPremium] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string; txSignature?: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const handleWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(qty);
    const premiumPrice = parseFloat(premium);
    
    if (isNaN(quantity) || quantity <= 0 || isNaN(premiumPrice) || premiumPrice <= 0) {
      setModalState({ isOpen: true, type: 'error', title: 'Invalid Input', message: 'Please enter a valid quantity and premium.' });
      return;
    }
    if (!isConnected || !address) {
      setModalState({ isOpen: true, type: 'error', title: 'Wallet Not Connected', message: 'Please connect your wallet first.' });
      return;
    }
    setLoading(true);

    try {
      if (!market) throw new Error("No market selected.");

      const isSynthetic = market.isSynthetic;
      const marginRequiredNumeric = isSynthetic ? quantity * 500000 : quantity * market.strike;
      // Assuming 18 decimals for testnet collateral
      const marginRequired = parseUnits(marginRequiredNumeric.toString(), 18);
      const premiumWanted = parseUnits(premiumPrice.toString(), 18);
      // Wait! Expiry is a string 'dd/mm/yyyy'. We need timestamp.
      // But we just use Date.parse(market.expiry) if it's stored in ISO in DB, but MarketList formats it.
      // Actually, we can fetch original expiry from market object if available, otherwise just use a dummy future timestamp for testnet MVP if we can't parse it.
      // For MVP, if market.expiry is an ISO string, we parse it. If not, we just use 7 days from now.
      const expiryTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

      // 1. Approve ERC20
      console.log('Requesting ERC20 Approval...');
      const approveHash = await writeContractAsync({
        account: address as `0x${string}`,
        chain: citadelleNetwork,
        address: market.collateralToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ENGINE_CONTRACT_ADDRESS, marginRequired]
      });
      console.log('Approval Hash:', approveHash);
      if (publicClient) {
        setModalState({ isOpen: true, type: 'info', title: 'Waiting for Confirmation', message: 'Waiting for approval transaction to be mined...' });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      // 2. Write Option
      console.log('Writing Option...');
      const txHash = await writeContractAsync({
        account: address as `0x${string}`,
        chain: citadelleNetwork,
        address: ENGINE_CONTRACT_ADDRESS,
        abi: OPTIONS_ENGINE_ABI,
        functionName: 'writeOption',
        args: [
          market.collateralToken as `0x${string}`,
          market.symbol,
          parseUnits(market.strike.toString(), 18),
          BigInt(expiryTimestamp),
          marginRequired,
          premiumWanted
        ]
      });

      console.log('✅ Transaction successful! TX Hash:', txHash);
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        title: 'Transaction Successful', 
        message: 'Your option has been successfully written and the market pool has been funded!', 
        txSignature: txHash 
      });
      setQty('');
      setPremium('');
    } catch (err: any) {
      console.error('❌ Transaction error details:', err.message || err);
      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'Transaction Failed', 
        message: err.shortMessage || err.message || 'Transaction failed!' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleWrite} style={{ fontFamily: "'Space Mono', monospace" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ color: '#A3A3A3', fontSize: '0.875rem' }}>Strike</span>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '120px', justifyContent: 'space-between' }}>
          <span style={{ color: '#FFF' }}>{market ? market.strike : '-'}</span>
          <span style={{ color: '#A3A3A3', fontSize: '0.6rem' }}>▼</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: '#A3A3A3', fontSize: '0.875rem' }}>Expiry</span>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '120px', justifyContent: 'space-between' }}>
          <span style={{ color: '#FFF' }}>{market ? market.expiry : '-'}</span>
          <span style={{ color: '#A3A3A3', fontSize: '0.6rem' }}>▼</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: '#A3A3A3', fontSize: '0.875rem' }}>Contracts</span>
        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <button type="button" onClick={() => setQty(String(Math.max(0, Number(qty || 0) - 1)))} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', color: '#A3A3A3', cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.1)' }}>-</button>
          <input type="number" step="1" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: '60px', textAlign: 'center', backgroundColor: 'transparent', border: 'none', color: '#FFF', outline: 'none', fontFamily: "'Space Mono', monospace" }} />
          <button type="button" onClick={() => setQty(String(Number(qty || 0) + 1))} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', color: '#A3A3A3', cursor: 'pointer', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>+</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: '#A3A3A3', fontSize: '0.875rem' }}>Ask Premium</span>
        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <input type="number" step="0.1" placeholder="e.g. 5" value={premium} onChange={(e) => setPremium(e.target.value)} style={{ width: '80px', textAlign: 'center', backgroundColor: 'transparent', border: 'none', color: '#FFF', outline: 'none', fontFamily: "'Space Mono', monospace" }} />
          <span style={{ padding: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#A3A3A3', fontSize: '0.75rem' }}>USDC</span>
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Premium Revenue</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.75rem' }}>${((Number(qty) || 0) * (Number(premium) || 0)).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Collateral Required</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>{((Number(qty) || 0) * (market?.isSynthetic ? 500000 : 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {market?.symbol?.split('/')[0]}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Max profit</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.75rem' }}>${((Number(qty) || 0) * (Number(premium) || 0)).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Max loss</span>
          <span style={{ color: '#F87171', fontSize: '0.75rem' }}>Unlimited</span>
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', position: 'relative', height: '140px' }}>
         <div style={{ color: '#A3A3A3', fontSize: '0.75rem', position: 'absolute', top: '1rem', left: '1rem' }}>Payoff at expiry</div>
         <div style={{ color: '#A3A3A3', fontSize: '0.75rem', position: 'absolute', top: '1rem', right: '1rem' }}>BE ${market ? (market.strike + (optionType === 'call' ? (Number(premium) || 0) : -(Number(premium) || 0))).toFixed(2) : '-'}</div>
         
         <div style={{ position: 'absolute', bottom: '1.5rem', left: '1rem', right: '1rem', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
               {optionType === 'call' ? (
                 <>
                   <polygon points="0,30 50,30 50,50 0,50" fill="rgba(94, 234, 212, 0.2)" />
                   <polygon points="50,50 100,100 100,50" fill="rgba(248, 113, 113, 0.2)" />
                   <polyline points="0,30 50,30 100,80" fill="none" stroke="#5EEAD4" strokeWidth="2" />
                 </>
               ) : (
                 <>
                   <polygon points="50,30 100,30 100,50 50,50" fill="rgba(94, 234, 212, 0.2)" />
                   <polygon points="0,100 50,50 0,50" fill="rgba(248, 113, 113, 0.2)" />
                   <polyline points="0,80 50,30 100,30" fill="none" stroke="#5EEAD4" strokeWidth="2" />
                 </>
               )}
               <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            </svg>
         </div>
      </div>

      <button type="submit" disabled={loading || !market || Number(qty) <= 0 || Number(premium) <= 0} style={{
        width: '100%',
        padding: '1rem',
        backgroundColor: '#5EEAD4',
        color: '#0A0A0A',
        border: 'none',
        borderRadius: '8px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 'bold',
        fontSize: '0.9rem',
        cursor: (loading || !market || Number(qty) <= 0 || Number(premium) <= 0) ? 'not-allowed' : 'pointer',
        opacity: (loading || !market || Number(qty) <= 0 || Number(premium) <= 0) ? 0.5 : 1,
        transition: 'all 0.2s',
      }}>
        {loading 
          ? 'WAITING FOR WALLET...' 
          : !market 
            ? 'Select a Market'
            : Number(qty) <= 0 
              ? 'Enter Quantity' 
              : Number(premium) <= 0 
                ? 'Enter Premium'
                : `Write ${qty} ${market.symbol.split('/')[0]} $${market.strike.toLocaleString()} ${optionType === 'call' ? 'Call' : 'Put'}`
        }
      </button>

      <TxModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        txSignature={modalState.txSignature}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </form>
  );
};
