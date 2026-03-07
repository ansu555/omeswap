'use client';

import { useState } from 'react';
import { Wallet, LogOut, Copy, ExternalLink, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';

interface MantleWalletConnectProps {
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

// Lamp-style button component
function LampButton({ 
  children, 
  onClick, 
  className,
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const showLamp = isHovered || isPressed;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={cn(
        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
        "text-foreground/80 hover:text-primary",
        showLamp && "bg-muted text-primary",
        className
      )}
    >
      <span className="flex items-center gap-2">{children}</span>
      <AnimatePresence>
        {showLamp && (
          <motion.div
            layoutId="wallet-lamp"
            className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
              <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
              <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
              <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function MantleWalletConnect({ className }: MantleWalletConnectProps) {
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
            <div className="flex items-center bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
              {(() => {
                if (!connected) {
                  return (
                    <LampButton onClick={openConnectModal} className={className}>
                      <Wallet className="h-4 w-4" />
                      <span className="hidden sm:inline">Connect Wallet</span>
                    </LampButton>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <LampButton onClick={openChainModal} className={cn("text-red-400", className)}>
                      <Network className="h-4 w-4" />
                      <span className="hidden sm:inline">Wrong Network</span>
                    </LampButton>
                  );
                }

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div>
                        <LampButton className={className}>
                          <Wallet className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </span>
                          <span className="sm:hidden">{account.displayName}</span>
                        </LampButton>
                      </div>
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
                          const explorerUrl = 'https://snowtrace.io';
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
                );
              })()}
            </div>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
