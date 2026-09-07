import { useState } from 'react';
import type { FC } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

import { TxModal } from '../common/TxModal';
import { useNetwork } from '../../contexts/NetworkContext';
import { citadelleNetwork } from '../../providers/WalletContextProvider';
import { ENGINE_CONTRACT_ADDRESS, OPTIONS_ENGINE_ABI, ERC20_ABI } from '../../lib/contracts';

interface BuyOptionProps {
  market: any | null;
  optionType?: 'call' | 'put';
}

export const BuyOption: FC<BuyOptionProps> = ({ market, optionType = 'call' }) => {
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string; txSignature?: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });
  
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { apiUrl, network } = useNetwork();

  const premiumPerOption = market && market.premiumAsk ? market.premiumAsk : 0;
  const quantity = parseFloat(qty) || 0;
  const totalCost = quantity * premiumPerOption;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setModalState({ isOpen: true, type: 'error', title: 'Invalid Input', message: 'Please enter a valid quantity.' });
      return;
    }
    if (!isConnected || !address) {
      setModalState({ isOpen: true, type: 'error', title: 'Wallet Not Connected', message: 'Please connect your wallet first.' });
      return;
    }
    setLoading(true);

    try {
      if (!market) throw new Error("No market selected.");

      // Fetch writer address
      console.log('Fetching available writer for market:', market.id);
      const res = await fetch(`${apiUrl}/markets/${market.id}/writers?network=${network}`);
      const data = await res.json();
      if (!data.success || !data.data || !data.data.writer) {
        throw new Error("No available writers for this market right now.");
      }
      const writerAddress = data.data.writer;
      console.log('Found writer:', writerAddress);

      const premiumWanted = parseUnits(premiumPerOption.toString(), 18);
      // Wait! Expiry is a string 'dd/mm/yyyy'. We need timestamp.
      const expiryTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

      // 1. Approve ERC20 (Premium)
      console.log('Requesting ERC20 Approval...');
      const approveHash = await writeContractAsync({
        account: address as `0x${string}`,
        chain: citadelleNetwork,
        address: market.collateralToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ENGINE_CONTRACT_ADDRESS, premiumWanted]
      });
      console.log('Approval Hash:', approveHash);

      // 2. Buy Option
      console.log('Buying Option...');
      const txHash = await writeContractAsync({
        account: address as `0x${string}`,
        chain: citadelleNetwork,
        address: ENGINE_CONTRACT_ADDRESS,
        abi: OPTIONS_ENGINE_ABI,
        functionName: 'buyOption',
        args: [
          writerAddress as `0x${string}`,
          market.collateralToken as `0x${string}`,
          market.symbol,
          parseUnits(market.strike.toString(), 18),
          BigInt(expiryTimestamp),
          premiumWanted
        ]
      });
      
      console.log('✅ Transaction successful! TX Hash:', txHash);
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        title: 'Transaction Successful', 
        message: 'Your option has been successfully purchased!', 
        txSignature: txHash 
      });
      setQty('');
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
    <form onSubmit={handleTrade} style={{ fontFamily: "'Space Mono', monospace" }}>
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

      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Premium / contract</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>${premiumPerOption.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Total cost</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>${totalCost.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Breakeven</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>${market ? (market.strike + premiumPerOption).toFixed(2) : '-'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Max profit</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>Unlimited</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Max loss</span>
          <span style={{ color: '#F87171', fontSize: '0.75rem' }}>${totalCost.toFixed(2)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#A3A3A3', fontSize: '0.7rem' }}>
          <span>Δ 0.5</span>
          <span>θ -0.2</span>
          <span>V 0.2</span>
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', position: 'relative', height: '140px' }}>
         <div style={{ color: '#A3A3A3', fontSize: '0.75rem', position: 'absolute', top: '1rem', left: '1rem' }}>Payoff at expiry</div>
         <div style={{ color: '#A3A3A3', fontSize: '0.75rem', position: 'absolute', top: '1rem', right: '1rem' }}>BE ${market ? (market.strike + (optionType === 'call' ? premiumPerOption : -premiumPerOption)).toFixed(2) : '-'}</div>
         
         <div style={{ position: 'absolute', bottom: '1.5rem', left: '1rem', right: '1rem', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
               {optionType === 'call' ? (
                 <>
                   <polygon points="0,70 50,70 100,20 100,70" fill="rgba(94, 234, 212, 0.2)" />
                   <polygon points="0,70 50,70 50,100 0,100" fill="rgba(248, 113, 113, 0.2)" />
                   <polyline points="0,70 50,70 100,20" fill="none" stroke="#5EEAD4" strokeWidth="2" />
                 </>
               ) : (
                 <>
                   <polygon points="0,20 50,70 100,70 100,20" fill="rgba(94, 234, 212, 0.2)" />
                   <polygon points="50,70 100,70 100,100 50,100" fill="rgba(248, 113, 113, 0.2)" />
                   <polyline points="0,20 50,70 100,70" fill="none" stroke="#5EEAD4" strokeWidth="2" />
                 </>
               )}
               <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            </svg>
         </div>
      </div>

      <button type="submit" disabled={loading || !market || Number(qty) <= 0} style={{
        width: '100%',
        padding: '1rem',
        backgroundColor: '#5EEAD4',
        color: '#0A0A0A',
        border: 'none',
        borderRadius: '8px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 'bold',
        fontSize: '0.9rem',
        cursor: (loading || !market || Number(qty) <= 0) ? 'not-allowed' : 'pointer',
        opacity: (loading || !market || Number(qty) <= 0) ? 0.5 : 1,
        transition: 'all 0.2s',
      }}>
        {loading ? 'WAITING FOR WALLET...' : `Buy ${qty || 0} ${market?.symbol?.split('/')[0] || ''} ${market?.strike || ''} ${optionType === 'call' ? 'Call' : 'Put'}`}
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
