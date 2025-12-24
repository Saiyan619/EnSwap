import { EnswapAmm } from "@/idlTypes/enswapType";
import idl from "@/idl/enswap.json";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, getMint } from "@solana/spl-token";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface swapProp {
    mintAddressSrc: string;
    mintAddressDestination: string;
    amount_in: number;
    min_amount_out: number;
}

export const useSwap = () => {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    
    const swap = async ({ amount_in, min_amount_out, mintAddressSrc, mintAddressDestination }: swapProp) => {
        if (!wallet || !publicKey) {
            throw new Error("Wallet is not connected!!!");
        }

        try {
            const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
            const program = new Program<EnswapAmm>(idl as EnswapAmm, provider);
            const programId = new PublicKey(idl.address);
            const mintSrcPubkey = new PublicKey(mintAddressSrc);
            const mintDestPubkey = new PublicKey(mintAddressDestination);

            // Get mint info to properly scale amounts with decimals
            const mintSrcInfo = await getMint(connection, mintSrcPubkey);
            const mintDestInfo = await getMint(connection, mintDestPubkey);
            
            const srcDecimals = mintSrcInfo.decimals;
            const destDecimals = mintDestInfo.decimals;
            
            // Convert to raw amounts (multiply by 10^decimals)
            const rawAmountIn = Math.floor(amount_in * Math.pow(10, srcDecimals));
            const rawMinAmountOut = Math.floor(min_amount_out * Math.pow(10, destDecimals));
            
            // Determine the canonical mint order for the pool
            // Sort mints to match how the pool was created
            const mintsOrdered = [mintSrcPubkey, mintDestPubkey].sort((a, b) => 
                a.toBuffer().compare(b.toBuffer())
            );
            const mintA = mintsOrdered[0];
            const mintB = mintsOrdered[1];

            const [poolPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("pool"), mintA.toBuffer(), mintB.toBuffer()],
                programId
            );

            const poolAccount = await program.account.pool.fetch(poolPDA);

            const actualMintA = poolAccount.mintA;
            const actualMintB = poolAccount.mintB;

            const userSrcTokenAcc = await getAssociatedTokenAddressSync(
                mintSrcPubkey,
                publicKey,
                false,
                TOKEN_PROGRAM_ID
            );
            const userDestTokenAcc = await getAssociatedTokenAddressSync(
                mintDestPubkey,
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

            // FIX: Check if DESTINATION mint equals mintA (not source!)(Come back to this later to learn why)
            // This is the key fix - we check destination, not source
            const isDestMintA = mintDestPubkey.equals(actualMintA);
            
            // token_reserve_src must have the mint of the DESTINATION token (what user receives)
            // token_reserve_dst must have the mint of the SOURCE token (what user sends)
            const tokenReserveSrcPDA = isDestMintA ? tokenReserveAPDA : tokenReserveBPDA;
            const tokenReserveDestPDA = isDestMintA ? tokenReserveBPDA : tokenReserveAPDA;


            console.log('Sending swap transaction...');
            console.log('==================');

            const tx = await program.methods
                .swap(new BN(rawAmountIn), new BN(rawMinAmountOut))
                .accounts({
                    mintA: actualMintA,
                    mintB: actualMintB,
                    userSrcTokenAcc: userSrcTokenAcc,
                    userDstTokenAcc: userDestTokenAcc,
                    tokenReserveSrc: tokenReserveSrcPDA,
                    tokenReserveDst: tokenReserveDestPDA,
                    signer: publicKey,
                })
                .rpc();
            return tx;
        } catch (error) {
            console.error("Swap error:", error);
            throw error;
        }
    };

    const { mutateAsync: swapToken, isPending } = useMutation({
        mutationFn: swap,
        onSuccess: (data) => {
            toast.success("Token Swapped Successfully!", {
                description: `Transaction: ${data}`,
                action: {
                    label: "View on Explorer",
                    onClick: () => window.open(`https://explorer.solana.com/tx/${data}?cluster=devnet`, '_blank')
                }
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to swap tokens: ${error.message}`);
        }
    });

    return { swapToken, isPending };
};