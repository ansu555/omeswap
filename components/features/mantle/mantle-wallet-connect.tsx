'use client';

import { useConnect, useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Copy, ExternalLink, Network } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MantleWalletConnectProps {
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function MantleWalletConnect({ variant = 'default', className = '' }: MantleWalletConnectProps) {
  const { connectors, connect, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const injectedConnector = connectors.find((c) => c.id === 'injected');

  const getNetworkName = (id: number) => {
    switch (id) {
      case 5000:
        return 'Mantle';
      case 5003:
        return 'Mantle Sepolia';
      default:
        return `Chain ${id}`;
    }
  };

  const isCorrectNetwork = chainId === 5000 || chainId === 5003;

  if (!isConnected) {
    return (
      <Button
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        disabled={isPending}
        variant={variant}
        className={className}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {!isCorrectNetwork && (
        <Button
          onClick={() => switchChain?.({ chainId: 5000 })}
          variant="destructive"
          size="sm"
        >
          <Network className="mr-2 h-4 w-4" />
          Switch to Mantle
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} className={className}>
            <Wallet className="mr-2 h-4 w-4" />
            {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold">My Account</div>
          <div className="border-t my-1" />
          <div className="px-2 py-1.5 text-sm">
            <p className="text-muted-foreground">Network</p>
            <p className="font-medium">{getNetworkName(chainId)}</p>
          </div>
          <div className="border-t my-1" />
          <DropdownMenuItem
            onClick={() => {
              if (address) {
                navigator.clipboard.writeText(address);
              }
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const explorerUrl = chainId === 5000 
                ? 'https://explorer.mantle.xyz'
                : 'https://explorer.sepolia.mantle.xyz';
              if (address) {
                window.open(`${explorerUrl}/address/${address}`, '_blank');
              }
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>
          {!isCorrectNetwork && (
            <>
              <div className="border-t my-1" />
              <DropdownMenuItem onClick={() => switchChain?.({ chainId: 5000 })}>
                <Network className="mr-2 h-4 w-4" />
                Switch to Mantle
              </DropdownMenuItem>
            </>
          )}
          <div className="border-t my-1" />
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
