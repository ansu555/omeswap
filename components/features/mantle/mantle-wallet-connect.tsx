'use client';

import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Copy, ExternalLink, Network } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface MantleWalletConnectProps {
  variant?: 'default' | 'outline' | 'ghost';
}

export default function MantleWalletConnect({ variant = 'default' }: MantleWalletConnectProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} variant={variant}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="destructive">
                    <Network className="mr-2 h-4 w-4" />
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div className="flex gap-2 items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={variant}>
                        <Wallet className="mr-2 h-4 w-4" />
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-semibold">
                        My Account
                      </div>
                      <div className="border-t my-1" />
                      <div className="px-2 py-1.5 text-sm">
                        <p className="text-muted-foreground">Network</p>
                        <p className="font-medium">{chain.name}</p>
                      </div>
                      <div className="border-t my-1" />
                      <DropdownMenuItem
                        onClick={() => {
                          if (account.address) {
                            navigator.clipboard.writeText(account.address);
                          }
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Address
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const explorerUrl = chain.id === 5000
                            ? 'https://explorer.mantle.xyz'
                            : 'https://explorer.sepolia.mantle.xyz';
                          if (account.address) {
                            window.open(`${explorerUrl}/address/${account.address}`, '_blank');
                          }
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Explorer
                      </DropdownMenuItem>
                      <div className="border-t my-1" />
                      <DropdownMenuItem onClick={openChainModal}>
                        <Network className="mr-2 h-4 w-4" />
                        Switch Network
                      </DropdownMenuItem>
                      <div className="border-t my-1" />
                      <DropdownMenuItem onClick={openAccountModal}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
