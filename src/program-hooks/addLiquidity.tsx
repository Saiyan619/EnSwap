import { EnswapAmm } from "@/idlTypes/enswapType";
import idl from "@/idl/enswap.json";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";

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
    const programId = new PublicKey(idl.address);
    const mintAPubkey = new PublicKey(mint_a);
    const mintBPubkey = new PublicKey(mint_b);
    try {
      const [poolPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), mintAPubkey.toBuffer(), mintBPubkey.toBuffer()],
        programId
      );

      const userTokenA = await getAssociatedTokenAddressSync(
        mintAPubkey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      );
      const userTokenB = await getAssociatedTokenAddressSync(
        mintBPubkey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      const [tokenReserveAPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("reserve_a"), poolPDA.toBuffer()],
        programId
      );
      const [tokenReserveBPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("reserve_b"), poolPDA.toBuffer()],
        programId
      );
      const [lpMintPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("lp_mint"), poolPDA.toBuffer()],
        programId
      );

      const [poolAuthorityPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("authority"), poolPDA.toBuffer()],
        programId
      );

      console.log("sending transaction to add liqudity.........");

      const tx = await program.methods.addLiquidity(new BN(max_amount_a), new BN(max_amount_b), new BN(min_lp_tokens)).accounts({
        mintA: mintAPubkey,
            mintB: mintBPubkey,
            pool: poolPDA,
            lpMint: lpMintPDA,
            userTokenA:userTokenA,
            userTokenB:userTokenB,
            tokenReserveA: tokenReserveAPDA,
            tokenReserveB: tokenReserveBPDA,
            poolAuthority: poolAuthorityPDA,
            signer: publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID
      }).rpc();
      console.log("transaction", tx);
      return tx    
    } catch (error) {
      throw error;
    }
  };

  const {mutateAsync:addNewLiquidity, isPending} = useMutation({
    mutationFn: addLiquidity,
     onSuccess:(data)=>{
                toast.success("Pool Created Successfully!", {
                    description: `Transaction: ${data}L`,
                    action: {
                        label: "View on Explorer",
                        onClick: () => window.open(`https://explorer.solana.com/tx/${data}?cluster=devnet`, '_blank')
                    }
                });
            },
            onError:(error:Error)=>{
                 toast.error(`Failed to create pool. Please try again.: ${error.message}`);
            }
  });
  return{addNewLiquidity, isPending};
};
