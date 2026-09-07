import { useState } from 'react';
import type { FC } from 'react';
import { useAccount, useWriteContract, usePublicClient, useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

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
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { apiUrl, network } = useNetwork();

  const premiumPerOption = market && market.premiumAsk ? market.premiumAsk : 0;
  const quantity = parseFloat(qty) || 0;
  const totalCost = quantity * premiumPerOption;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setModalState({ isOpen: true, type: 'error', title: 'Invalid Quantity', message: 'Please enter a valid quantity.' });
      return;
    }
    if (!isConnected || !address) {
      setModalState({ isOpen: true, type: 'error', title: 'Wallet Not Connected', message: 'Please connect your wallet first.' });
      return;
    }
    const targetChainId = Number(import.meta.env.VITE_NETWORK_ID);
    const networkName = import.meta.env.VITE_NETWORK_NAME || 'the correct network';

    if (chainId !== targetChainId) {
      setModalState({ isOpen: true, type: 'error', title: 'Wrong Network', message: `Please switch your wallet to ${networkName} before trading.` });
      return;
    }
    setLoading(true);

    try {
      if (!market) throw new Error("No market selected.");

      const collateralToken = market.collateralToken as `0x${string}`;

      // Fetch writer address
      console.log('=== BUY OPTION DEBUG ===');
      console.log('Fetching available writer for market:', market.id);
      const res = await fetch(`${apiUrl}/markets/${market.id}/writers?network=${network}`);
      const data = await res.json();
      if (!data.success || !data.data || !data.data.writer) {
        throw new Error("No available writers for this market right now.");
      }
      const writerAddress = data.data.writer;
      console.log('Found writer:', writerAddress);

      // Read token decimals dynamically (USDG = 6, WETH = 18, etc.)
      console.log('Reading token decimals...');
      const tokenDecimals = await publicClient?.readContract({
        address: collateralToken,
        abi: ERC20_ABI as any,
        functionName: 'decimals',
        args: []
      } as any) as number;
      const decimals = Number(tokenDecimals) || 18;
      console.log('Token Decimals:', decimals);

      const premiumWanted = parseUnits(premiumPerOption.toString(), decimals);
      const expiryTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

      console.log('Collateral Token:', collateralToken);
      console.log('Engine Contract:', ENGINE_CONTRACT_ADDRESS);
      console.log('User Address:', address);
      console.log('Chain ID (wallet):', chainId, '| Chain ID (target):', targetChainId);
      console.log('Premium:', formatUnits(premiumWanted, decimals), 'tokens');

      // === STEP 0: Check user balance FIRST ===
      console.log('\n[Step 0] Checking user token balance...');
      const userBalance = await publicClient?.readContract({
        address: collateralToken,
        abi: ERC20_ABI as any,
        functionName: 'balanceOf',
        args: [address]
      } as any) as bigint;

      console.log('User Balance:', formatUnits(userBalance || 0n, decimals), 'tokens');
      console.log('Required (premium):', formatUnits(premiumWanted, decimals), 'tokens');

      if (!userBalance || userBalance < premiumWanted) {
        throw new Error(
          `Insufficient token balance. You have ${formatUnits(userBalance || 0n, decimals)} but need ${formatUnits(premiumWanted, decimals)} tokens to pay the premium. Please fund your wallet with the collateral token first.`
        );
      }
      console.log('✅ Balance sufficient!');

      // === STEP 1: Check & Approve ERC20 (Premium) ===
      console.log('\n[Step 1] Checking ERC20 Allowance...');
      const currentAllowance = await publicClient?.readContract({
        address: collateralToken,
        abi: ERC20_ABI as any,
        functionName: 'allowance',
        args: [address, ENGINE_CONTRACT_ADDRESS]
      } as any) as bigint;

      console.log('Current Allowance:', formatUnits(currentAllowance || 0n, decimals));
      console.log('Needed:', formatUnits(premiumWanted, decimals));

      if (!currentAllowance || currentAllowance < premiumWanted) {
        console.log('⚠️ Allowance insufficient. Requesting approval...');
        
        setModalState({ isOpen: true, type: 'info', title: 'Step 1/2: Approve Token', message: 'Please confirm the Approve transaction in your wallet...' });

        const approveHash = await writeContractAsync({
          account: address as `0x${string}`,
          chain: citadelleNetwork,
          address: collateralToken,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [ENGINE_CONTRACT_ADDRESS, premiumWanted]
        });
        console.log('Approval TX sent! Hash:', approveHash);

        // Update modal to show we're waiting for mining
        setModalState({ isOpen: true, type: 'info', title: 'Step 1/2: Confirming Approval', message: `Approval TX sent! Waiting for blockchain confirmation...\n\nTX: ${approveHash.slice(0, 10)}...${approveHash.slice(-8)}` });

        if (publicClient) {
          console.log('Waiting for approval receipt...');
          const startTime = Date.now();
          
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ 
              hash: approveHash,
              confirmations: 1,
              timeout: 120000 // 2 minutes
            });
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Approval confirmed in ${elapsed}s! Block: ${receipt.blockNumber}, Status: ${receipt.status}`);
            
            if (receipt.status === 'reverted') {
              throw new Error('Approval transaction was reverted by the blockchain. You may not have enough gas (RBH) to pay for the transaction.');
            }
          } catch (error: any) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.error(`❌ Approval wait failed after ${elapsed}s:`, error.message);
            
            if (error.message && (error.message.includes('Timed out') || error.message.includes('timeout'))) {
              throw new Error(
                `Approval is taking too long (${elapsed}s). Your transaction may be stuck due to low gas fee. ` +
                `Check your wallet to Speed Up or Cancel it.\n\nTX Hash: ${approveHash}`
              );
            }
            throw error;
          }
        }
      } else {
        console.log('✅ Allowance sufficient. Skipping approve step.');
      }

      // === STEP 2: Buy Option ===
      console.log('\n[Step 2] Buying Option on-chain...');
      setModalState({ isOpen: true, type: 'info', title: 'Step 2/2: Buy Option', message: 'Please confirm the Buy Option transaction in your wallet...' });

      const txHash = await writeContractAsync({
        account: address as `0x${string}`,
        chain: citadelleNetwork,
        address: ENGINE_CONTRACT_ADDRESS,
        abi: OPTIONS_ENGINE_ABI,
        functionName: 'buyOption',
        args: [
          writerAddress as `0x${string}`,
          collateralToken,
          market.symbol,
          parseUnits(market.strike.toString(), decimals),
          BigInt(expiryTimestamp),
          premiumWanted
        ]
      });
      
      console.log('✅ Buy Option TX successful! Hash:', txHash);
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
      console.error('Full error object:', err);
      
      // Parse user rejection
      const isUserRejection = err.message?.includes('User rejected') || err.message?.includes('user rejected') || err.message?.includes('ACTION_REJECTED');
      
      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: isUserRejection ? 'Transaction Cancelled' : 'Transaction Failed', 
        message: isUserRejection 
          ? 'You cancelled the transaction in your wallet.' 
          : (err.shortMessage || err.message || 'Transaction failed!') 
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
        {loading 
          ? 'WAITING FOR WALLET...' 
          : !market 
            ? 'Select a Market'
            : Number(qty) <= 0 
              ? 'Enter Quantity' 
              : `Buy ${qty} ${market.symbol.split('/')[0]} $${market.strike.toLocaleString()} ${optionType === 'call' ? 'Call' : 'Put'}`
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
