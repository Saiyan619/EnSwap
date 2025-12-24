import idl from "@/idl/enswap.json";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import {
  getMint,
} from "@solana/spl-token";
import { toast } from "sonner";
import { EnswapAmm } from "@/idlTypes/enswapType";

interface addLiquidityProp {
  max_amount_a: number;
  max_amount_b: number;
  min_lp_tokens: number;
  mint_a: PublicKey;
  mint_b: PublicKey;
}

export const useAddLiquidity = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  
  const addLiquidity = async ({
    max_amount_a,
    max_amount_b,
    min_lp_tokens,
    mint_a,
    mint_b,
  }: addLiquidityProp) => {
    if (!wallet || !publicKey) {
      throw new Error("Wallet not connected!!");
    }
    
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program<EnswapAmm>(idl as EnswapAmm, provider);
    // const programId = new PublicKey(idl.address);
    const mintAPubkey = new PublicKey(mint_a);
    const mintBPubkey = new PublicKey(mint_b);
    
    try {
      // Get mint info to fetch decimals
      const mintAInfo = await getMint(connection, mintAPubkey);
      const mintBInfo = await getMint(connection, mintBPubkey);
      
      const decimalsA = mintAInfo.decimals;
      const decimalsB = mintBInfo.decimals;
      
      // Convert to raw amounts (multiply by 10^decimals)
      const rawAmountA = Math.floor(max_amount_a * Math.pow(10, decimalsA));
      const rawAmountB = Math.floor(max_amount_b * Math.pow(10, decimalsB));

      console.log("Sending transaction to add liquidity...");
      
      // Use raw amounts (with decimals applied)
      const tx = await program.methods
        .addLiquidity(
          new BN(rawAmountA),  
          new BN(rawAmountB),
          new BN(min_lp_tokens)
        )
        .accounts({
          mintA: mintAPubkey,
          mintB: mintBPubkey,
          signer: publicKey,
        })
        .rpc();
            return tx;
    } catch (error) {
      throw error;
    }
  };
  
  const { mutateAsync: addNewLiquidity, isPending } = useMutation({
    mutationFn: addLiquidity,
    onSuccess: (data) => {
      toast.success("Pool Funded Successfully!", {
        description: `Transaction: ${data}`,
        action: {
          label: "View on Explorer",
          onClick: () => window.open(`https://explorer.solana.com/tx/${data}?cluster=devnet`, '_blank')
        }
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to fund pool: ${error.message}`);
    }
  });
  
  return { addNewLiquidity, isPending };
};