import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { EnswapAmm } from "@/idlTypes/enswapType";
import idl from "@/idl/enswap.json";
import {
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface withdrawLiquidityProp {
  min_amount_a: number;
  min_amount_b: number;
  lp_tokens: number;
  mint_a: PublicKey;
  mint_b: PublicKey;
}

export const useWithdrawLiquidity = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const withdrawLiquidity = async ({
    min_amount_a,
    min_amount_b,
    lp_tokens,
    mint_a,
    mint_b,
  }: withdrawLiquidityProp) => {
    if (!wallet || !publicKey) {
      throw new Error("Wallet not connected!!!");
    }
    try {
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      const programId = new PublicKey(idl.address);
      const program = new Program<EnswapAmm>(idl as EnswapAmm, provider);
      const mintAPubkey = new PublicKey(mint_a);
      const mintBPubkey = new PublicKey(mint_b);

      const mintAInfo = await getMint(connection, mintAPubkey);
            const mintBInfo = await getMint(connection, mintBPubkey);
      const decimalsA = mintAInfo.decimals;
      const decimalsB = mintBInfo.decimals;
      const rawAmountA = Math.floor(min_amount_a * Math.pow(10, decimalsA));
      const rawAmountB = Math.floor(min_amount_b * Math.pow(10, decimalsB));

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

      const [reserveAPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("reserve_a"), poolPDA.toBuffer()],
        programId
      );

      const [reserveBPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("reserve_b"), poolPDA.toBuffer()],
        programId
      );

      const [lpMintPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("lp_mint"), poolPDA.toBuffer()],
        programId
      );
// After getting decimals for A and B, also get LP mint decimals:
const lpMintInfo = await getMint(connection, lpMintPDA);
const lpDecimals = lpMintInfo.decimals;

const rawLpTokens = Math.floor(lp_tokens * Math.pow(10, lpDecimals));
      const [poolAuthorityPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("authority"), poolPDA.toBuffer()],
        programId
      );

      const tx = program.methods
        .withdrawLiquidity(
          new BN(rawLpTokens),
          new BN(rawAmountA),
          new BN(rawAmountB)
        )
        .accounts({
          mintA: mintAPubkey,
          mintB: mintBPubkey,
          pool: poolPDA,
          lpMint: lpMintPDA,
          userTokenA: userTokenA,
          userTokenB: userTokenB,
          reserveA: reserveAPDA,
          reserveB: reserveBPDA,
          poolAuthority: poolAuthorityPDA,
          signer: publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc();
        return tx;
    } catch (error) {
      throw error;
    }
  };

  const {mutateAsync:withdrawNewLiquidity, isPending} = useMutation({
     mutationFn: withdrawLiquidity,
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
      toast.error(`Failed to Withdraw from pool: ${error.message}`);
    }
  })
  return{withdrawNewLiquidity, isPending}
};
