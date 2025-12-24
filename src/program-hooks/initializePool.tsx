import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import idl from "@/idl/enswap.json";
import { EnswapAmm } from "@/idlTypes/enswapType";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
interface initializePoolProp{
    mintAddA: string,
    mintAddB: string,
    fee: number
}
export const useInitializePool = () => {
    const {publicKey} = useWallet();
    const wallet = useAnchorWallet();
    const {connection} = useConnection();
    const initializePool = async ({mintAddA, mintAddB, fee}:initializePoolProp):Promise<{ tx: string; poolRent: number }> => {
        if (!publicKey || !wallet) {
            throw new Error("Please Connect Wallet");
        }
        const feePercentToBps = Math.floor(fee * 100);
        if (feePercentToBps > 100) {
            throw new Error("Fee is too high!!");
            
        }if (feePercentToBps < 0) {
            throw new Error("Fee cannot be negative!!");
            
        }
        if(mintAddA === mintAddB){
            throw new Error("Cannot add the same token in a pool!");
            
        }
        console.log(`Fee: ${fee}% = ${feePercentToBps} basis points`);
        const poolRent = await connection.getMinimumBalanceForRentExemption(8 + 2 + 32 + 32 + 32 + 32 + 32 + 1);
        //convert poolrent when you want to display in any components - poolRent/1e9;

        const provider = new AnchorProvider(connection, wallet, {commitment:"confirmed"});
        const programId = new PublicKey(idl.address);
        console.log(programId.toBase58())
        const program = new Program<EnswapAmm>(idl as EnswapAmm, provider);
        const mintAddAKey = new PublicKey(mintAddA);
        const mintAddBKey = new PublicKey(mintAddB);

        try {
            const [poolPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("pool"),
                mintAddAKey.toBuffer(),
                mintAddBKey.toBuffer()
            ],
            programId
        )

        const [lpMintPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("lp_mint"),
                poolPDA.toBuffer()
            ],
            programId
        )

        const [tokenReserveAPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("reserve_a"),
                poolPDA.toBuffer()
            ],
            programId
        )
        const [tokenReserveBPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("reserve_b"),
                poolPDA.toBuffer()
            ],
            programId
        )
        const [poolAuthorityPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("authority"),
                poolPDA.toBuffer()
            ],
            programId
        )

        console.log("sending transaction to initialize.......");

        const tx = await program.methods.initializePool(new BN(feePercentToBps)).accounts({
            mintA: mintAddAKey,
            mintB: mintAddBKey,
            pool: poolPDA,
            lpMint: lpMintPDA,
            tokenReserveA: tokenReserveAPDA,
            tokenReserveB: tokenReserveBPDA,
            poolAuthority: poolAuthorityPDA,
            signer: publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID
        }).rpc();

        return { tx, poolRent }
        } catch (error: unknown) {
            const err = error as Error & {
                message?: string
            };
            if (err.message.includes("already processed")) {
               console.warn("Transaction was already processed - this might be a false error");
        // If you know the transaction succeeded, you might want to return a success status
        console.log( "Transaction completed (already processed)");
            }

            console.error("initialization failed:", err.message);
            throw error
        }

    }
     const {mutateAsync: initializeNewPool, isPending, data } = useMutation({
        mutationFn:initializePool,
        onSuccess:(data:{tx:string, poolRent:number})=>{
                    const rentInSol = data.poolRent / 1e9;
            toast.success("Pool Created Successfully!", {
                description: `Transaction: ${data.tx}\nRent: ${rentInSol.toFixed(4)} SOL`,
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

     return{initializeNewPool, data, isPending};
};