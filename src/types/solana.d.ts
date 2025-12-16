// types/solana.d.ts
interface SolanaProvider {
    isPhantom?: boolean;
    isSolflare?: boolean;
    isBackpack?: boolean;
    isGlow?: boolean;
    isConnected: boolean;
    connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{
      publicKey: {
        toString: () => string;
        toBytes: () => Uint8Array;
      };
    }>;
    disconnect: () => Promise<void>;
    signMessage: (message: Uint8Array, encoding?: string) => Promise<{
      signature: Uint8Array;
    }>;
    on: (event: string, callback: (args: any) => void) => void;
    off: (event: string, callback: (args: any) => void) => void;
  }
  
  interface Window {
    solana?: SolanaProvider;
    solflare?: SolanaProvider; 
  }