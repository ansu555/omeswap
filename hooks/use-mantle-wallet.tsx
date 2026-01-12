import { useAccount, useBalance, useDisconnect, useSwitchChain } from 'wagmi';

export function useMantleWallet() {
  const { address, isConnected, isConnecting, isDisconnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({
    address: address,
  });

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chain,
    balance,
    disconnect,
    switchChain,
  };
}
