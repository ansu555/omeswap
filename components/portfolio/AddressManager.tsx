"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, Check, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SavedAddress {
  id: string;
  address: string;
  label: string;
  chains: string[];
  addedAt: Date;
}

interface AddressManagerProps {
  currentAddress: string | null;
  onSelectAddress: (address: string, chains: string[]) => void;
}

const AVAILABLE_CHAINS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "optimism", label: "Optimism" },
  { value: "base", label: "Base" },
  { value: "bsc", label: "BSC" },
];

export function AddressManager({ currentAddress, onSelectAddress }: AddressManagerProps) {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("saved_addresses");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [selectedChains, setSelectedChains] = useState<string[]>(["ethereum", "polygon"]);
  const [error, setError] = useState("");

  const saveToLocalStorage = (addresses: SavedAddress[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("saved_addresses", JSON.stringify(addresses));
    }
  };

  const validateAddress = (address: string): boolean => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddAddress = () => {
    setError("");

    if (!newAddress.trim()) {
      setError("Please enter an address");
      return;
    }

    if (!validateAddress(newAddress)) {
      setError("Invalid Ethereum address format");
      return;
    }

    if (savedAddresses.some((a) => a.address.toLowerCase() === newAddress.toLowerCase())) {
      setError("This address is already saved");
      return;
    }

    if (selectedChains.length === 0) {
      setError("Please select at least one chain");
      return;
    }

    const newSavedAddress: SavedAddress = {
      id: Date.now().toString(),
      address: newAddress,
      label: newLabel.trim() || `Wallet ${savedAddresses.length + 1}`,
      chains: selectedChains,
      addedAt: new Date(),
    };

    const updated = [...savedAddresses, newSavedAddress];
    setSavedAddresses(updated);
    saveToLocalStorage(updated);

    // Auto-select the newly added address
    onSelectAddress(newSavedAddress.address, newSavedAddress.chains);

    // Reset form
    setNewAddress("");
    setNewLabel("");
    setSelectedChains(["ethereum", "polygon"]);
    setIsDialogOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    saveToLocalStorage(updated);
  };

  const handleSelectAddress = (address: SavedAddress) => {
    onSelectAddress(address.address, address.chains);
  };

  const toggleChain = (chain: string) => {
    setSelectedChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain]
    );
  };

  return (
    <div className="flex items-center gap-2">
      {/* Address Selector */}
      {savedAddresses.length > 0 && (
        <Select
          value={currentAddress || ""}
          onValueChange={(value) => {
            const address = savedAddresses.find((a) => a.address === value);
            if (address) {
              handleSelectAddress(address);
            }
          }}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select an address">
              {currentAddress && (
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono text-sm">
                    {savedAddresses.find((a) => a.address === currentAddress)?.label ||
                      `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {savedAddresses.map((address) => (
              <SelectItem key={address.id} value={address.address}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <div className="font-medium">{address.label}</div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {address.address.slice(0, 10)}...{address.address.slice(-8)}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {address.chains.map((chain) => (
                        <Badge key={chain} variant="outline" className="text-xs">
                          {chain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {currentAddress === address.address && (
                    <Check className="h-4 w-4 text-primary ml-2" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Add Address Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Wallet Address</DialogTitle>
            <DialogDescription>
              Add an Ethereum address to analyze across multiple chains.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label (Optional)</Label>
              <Input
                id="label"
                placeholder="My Wallet"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address *</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Chains to Analyze *</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CHAINS.map((chain) => (
                  <Badge
                    key={chain.value}
                    variant={selectedChains.includes(chain.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleChain(chain.value)}
                  >
                    {selectedChains.includes(chain.value) && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {chain.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select the chains you want to analyze for this address
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAddress}>Add Address</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Addresses Dialog */}
      {savedAddresses.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              Manage ({savedAddresses.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Manage Addresses</DialogTitle>
              <DialogDescription>
                View and manage your saved wallet addresses.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-[400px] overflow-y-auto py-4">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span className="font-medium">{address.label}</span>
                      {currentAddress === address.address && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {address.address}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {address.chains.map((chain) => (
                        <Badge key={chain} variant="outline" className="text-xs">
                          {chain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentAddress !== address.address && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAddress(address)}
                      >
                        Select
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
