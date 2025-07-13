
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { VictionLogo } from '@/components/icons/viction-logo';
import { TokenIcon } from '@/components/icons/token-icon';
import { useApp } from '@/hooks/use-app';
import { Award, Wallet, WalletCards, ArrowUpRight, ArrowDownLeft, Copy, Loader2, Ticket, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { QRCodeSVG } from '@/components/qr-code';
import { cn } from '@/lib/utils';


const ECLB_TOKEN_CONTRACT_ADDRESS = '0xA432D2c5586c3Ec18d741c7B1d172b67010d603'; // Your $ECLB token
const VICTION_TESTNET_CHAIN_ID = '0x59'; // 89 in hex for Viction Testnet

const TOKEN_CONTRACTS = [
    { address: ECLB_TOKEN_CONTRACT_ADDRESS, symbol: '$ECLB', name: 'EcoLakbay Token', icon: TokenIcon }
];

const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function transfer(address to, uint amount) returns (bool)"
];

type TokenBalance = {
    symbol: string;
    name: string;
    balance: string;
    icon: React.ComponentType<any>;
};

export default function ProfilePage() {
  const { level, xp, unlockedBadges, visitedPois } = useApp();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendModalOpen, setSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setReceiveModalOpen] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  const { toast } = useToast();

  const xpForNextLevel = 100;
  const currentXp = xp % xpForNextLevel;

  const badges = [
    { id: 'Pangasinan Pioneer', name: 'Pangasinan Pioneer', unlocked: unlockedBadges.includes('Pangasinan Pioneer') },
    { id: 'Coral Caretaker', name: 'Coral Caretaker', unlocked: false },
    { id: 'Mountain Mover', name: 'Mountain Mover', unlocked: false },
    { id: 'River Guardian', name: 'River Guardian', unlocked: false },
  ];

  const fetchAllBalances = async (provider: ethers.BrowserProvider, address: string) => {
      setIsRefreshing(true);
      try {
          const tokenBalances = await Promise.all(
              TOKEN_CONTRACTS.map(async (token) => {
                  try {
                      const contract = new ethers.Contract(token.address, erc20Abi, provider);
                      const [balance, decimals] = await Promise.all([
                          contract.balanceOf(address),
                          contract.decimals()
                      ]);
                      return {
                          ...token,
                          balance: parseFloat(ethers.formatUnits(balance, decimals)).toFixed(2)
                      };
                  } catch (e) {
                      console.warn(`Could not fetch balance for ${token.name}`, e);
                      return { ...token, balance: '0.00' };
                  }
              })
          );
          
          setBalances(tokenBalances);

      } catch (e) {
          console.error("Could not fetch balances", e);
          toast({
              variant: "destructive",
              title: "Balance Error",
              description: "Could not fetch token balances. Please refresh.",
          });
      } finally {
          setIsRefreshing(false);
      }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        variant: "destructive",
        title: "MetaMask Not Found",
        description: "Please install the MetaMask extension to connect your wallet.",
      });
      return;
    }
    
    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== BigInt(VICTION_TESTNET_CHAIN_ID).toString()) {
          try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: VICTION_TESTNET_CHAIN_ID }],
            });
          } catch (switchError: any) {
             if (switchError.code === 4902) {
                 await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: VICTION_TESTNET_CHAIN_ID,
                        chainName: 'Viction Testnet',
                        nativeCurrency: { name: 'VIC', symbol: 'VIC', decimals: 18 },
                        rpcUrls: ['https://rpc-testnet.viction.xyz/'],
                        blockExplorerUrls: ['https://testnet.vicscan.xyz']
                    }]
                 });
             } else {
                throw switchError;
             }
          }
      }

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await newProvider.send("eth_requestAccounts", []);
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        const account = accounts[0];
        setWalletAddress(account);
        await fetchAllBalances(newProvider, account);
        toast({
            title: "Wallet Connected",
            description: "Your Viction wallet has been successfully connected.",
        });
      }
    } catch (error) {
      console.error("User rejected the request or an error occurred.", error);
      toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "An error occurred while connecting your wallet. Please ensure you are on the Viction Testnet.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalances([]);
    toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
    });
  };

  const handleRefresh = async () => {
      if (!walletAddress) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      await fetchAllBalances(provider, walletAddress);
      toast({ title: 'Balances refreshed' });
  };
  
  const handleCopyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address Copied!",
      description: "Your wallet address is copied to the clipboard.",
    });
  };

  const handleSend = async () => {
    if (!recipientAddress || !sendAmount || !walletAddress) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all fields.' });
        return;
    }
    if (!ethers.isAddress(recipientAddress)) {
        toast({ variant: 'destructive', title: 'Invalid Address', description: 'The recipient address is not a valid Ethereum address.' });
        return;
    }

    setIsSending(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(ECLB_TOKEN_CONTRACT_ADDRESS, erc20Abi, signer);
      
      const decimals = await tokenContract.decimals();
      const amountToSend = ethers.parseUnits(sendAmount, decimals);

      const balance = await tokenContract.balanceOf(walletAddress);

      if (balance < amountToSend) {
        toast({
            variant: 'destructive',
            title: 'Insufficient Funds',
            description: 'You do not have enough $ECLB to make this transaction.',
        });
        setIsSending(false);
        return;
      }
      
      const tx = await tokenContract.transfer(recipientAddress, amountToSend);
      
      toast({
          title: "Transaction Sent",
          description: "Your $ECLB transaction is being processed.",
      });

      // Wait a moment for the transaction to likely be mined before refreshing
      setTimeout(() => handleRefresh(), 5000); 

      setSendModalOpen(false);
      setRecipientAddress('');
      setSendAmount('');

    } catch (error: any) {
      console.error("Transaction failed", error);
      toast({
          variant: 'destructive',
          title: 'Transaction Failed',
          description: error?.reason || "An error occurred during the transaction.",
      });
    } finally {
      setIsSending(false);
    }
  };


  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  return (
    <AppShell>
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Image src="https://placehold.co/80x80.png" alt="User profile avatar" width={80} height={80} className="rounded-full border-4 border-primary" data-ai-hint="profile avatar"/>
          <h1 className="text-2xl font-bold">Eco-Explorer</h1>
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-bold">Lvl {level}</span>
              <span className="text-muted-foreground">{currentXp}/{xpForNextLevel} XP</span>
            </div>
            <Progress value={currentXp} className="h-2 w-48" />
          </div>
        </div>
        
        <Button asChild variant="outline" className="w-full">
            <Link href="/profile/vouchers">
                <Ticket className="mr-2 h-4 w-4"/> My Vouchers
            </Link>
        </Button>

        <Separator />

        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                    <WalletCards className="w-6 h-6 text-primary" />
                    My Eco-Wallet
                </CardTitle>
                {walletAddress && (
                     <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    </Button>
                )}
            </div>
          </CardHeader>
          <CardContent>
            {walletAddress ? (
                <div className='space-y-4'>
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                            <p className="text-xs text-muted-foreground">Connected Address</p>
                            <p className="font-mono text-sm font-bold">{formatAddress(walletAddress)}</p>
                        </div>
                        <VictionLogo className="h-6" />
                    </div>

                    <div className="space-y-2">
                      <Label>Token Balance</Label>
                      {isRefreshing && balances.length === 0 ? (
                           <div className="text-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto"/>
                                <p className="text-sm text-muted-foreground mt-2">Fetching balance...</p>
                           </div>
                      ) : (
                        <div className="border rounded-lg p-2 space-y-1">
                            {balances.map(({ icon: Icon, name, symbol, balance}) => (
                                <div key={symbol} className="flex items-center p-2 rounded-md hover:bg-secondary/50">
                                    <Icon className="w-8 h-8 mr-3"/>
                                    <div className="flex-1">
                                        <p className="font-bold">{symbol}</p>
                                        <p className="text-xs text-muted-foreground">{name}</p>
                                    </div>
                                    <p className="font-mono text-lg">{balance}</p>
                                </div>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setSendModalOpen(true)}>
                            <ArrowUpRight className="mr-2 h-4 w-4"/> Send
                        </Button>
                        <Button variant="outline" onClick={() => setReceiveModalOpen(true)}>
                           <ArrowDownLeft className="mr-2 h-4 w-4"/> Receive
                        </Button>
                    </div>

                    <Button variant="outline" className="w-full" onClick={disconnectWallet}>Disconnect Wallet</Button>
                </div>

            ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <Wallet className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Connect your wallet to manage your assets.</p>
                    <Button onClick={connectWallet} className="w-full" disabled={isConnecting}>
                        {isConnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Connecting...</> : 'Connect MetaMask'}
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary"/>
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              {badges.map(badge => (
                <div key={badge.id} className={`flex flex-col items-center gap-1 ${badge.unlocked ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-accent' : 'bg-muted'}`}>
                    <Award className={`w-8 h-8 ${badge.unlocked ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <span className="text-xs font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>My Journey</CardTitle>
            </CardHeader>
            <CardContent>
                {visitedPois.length > 0 ? (
                    <ul className="space-y-2">
                        {visitedPois.map(poiId => {
                            const poiName = poiId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            return <li key={poiId} className="text-sm p-2 bg-secondary rounded-md">Visited {poiName}</li>;
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">Your adventure is just beginning! Visit a location to see it here.</p>
                )}
            </CardContent>
        </Card>

      </div>

      <Dialog open={isReceiveModalOpen} onOpenChange={setReceiveModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Receive Tokens</DialogTitle>
                <DialogDescription>
                    Show this QR code or share your address to receive any token on the Viction network.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 flex flex-col items-center">
                 <div className="w-full max-w-xs bg-white p-4 rounded-lg shadow-md">
                    <QRCodeSVG value={walletAddress || ''} />
                </div>
                <div className="w-full p-3 bg-secondary rounded-md text-center break-words">
                    <p className="text-sm font-mono">{walletAddress}</p>
                </div>
                <Button onClick={handleCopyAddress} className="w-full">
                    <Copy className="mr-2 h-4 w-4"/> Copy Address
                </Button>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setReceiveModalOpen(false)}>Done</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Send $ECLB</DialogTitle>
                <DialogDescription>
                    Enter the recipient's address and the amount of $ECLB to send. This action is irreversible.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input id="recipient" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="0x..."/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($ECLB)</Label>
                    <Input id="amount" type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0.00"/>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setSendModalOpen(false)} disabled={isSending}>Cancel</Button>
                <Button onClick={handleSend} disabled={isSending}>
                    {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSending ? 'Sending...' : 'Send'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppShell>
  );
}
