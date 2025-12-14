import { EnswapAmm } from "@/idlTypes/enswapType";
import idl from "@/idl/enswap.json"
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useMutation } from "@tanstack/react-query"
import { PublicKey } from "@solana/web3.js";


export const useAddLiquidity = () =>{
    const wallet = useAnchorWallet();
    const {connection} = useConnection();
    const {publicKey} = useWallet();
    const addLiquidity = async () => {
        if (!wallet || !publicKey) {
            throw new Error("Wallet not connected!!");
        }

        const provider = new AnchorProvider(connection, wallet, {commitment:"confirmed"});
        const program = new Program<EnswapAmm>(idl as EnswapAmm, provider);
        const programId = new PublicKey(idl.address);
    }

    const {} = useMutation({
        mutationFn: addLiquidity
    })
}