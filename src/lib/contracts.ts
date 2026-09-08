import { parseAbi } from 'viem';

// Ensure you set VITE_ENGINE_CONTRACT_ADDRESS in your .env
export const ENGINE_CONTRACT_ADDRESS = import.meta.env.VITE_ENGINE_CONTRACT_ADDRESS as `0x${string}`;
export const VAULT_CONTRACT_ADDRESS = import.meta.env.VITE_VAULT_CONTRACT_ADDRESS as `0x${string}`;

export const OPTIONS_ENGINE_ABI = parseAbi([
  'function writeOption(address collateralToken, string memory marketSymbol, uint256 strikePrice, uint256 expiry, uint256 marginRequired, uint256 premiumWanted) external',
  'function buyOption(address writer, address collateralToken, string memory marketSymbol, uint256 strikePrice, uint256 expiry, uint256 premium) external',
  'function closeOption(string memory positionId, address collateralToken, uint256 marginToUnlock, bytes memory signature) external'
]);

export const CITADELLE_VAULT_ABI = parseAbi([
  'function collateralBalances(address user, address token) external view returns (uint256)',
  'function lockedMargins(address user, address token) external view returns (uint256)',
  'function depositCollateral(address token, uint256 amount) external',
  'function withdrawCollateral(address token, uint256 amount) external'
]);

export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
]);
