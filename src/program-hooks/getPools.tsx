import { EnswapAmm } from "@/idlTypes/enswapType";
import idl from "@/idl/enswap.json";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { useQuery } from "@tanstack/react-query";
import { getAccount, getMint } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

// Helper function to get reserve balance
const getReserveBalance = async (connection: Connection, address: PublicKey): Promise<number> => {
  try {
    const account = await getAccount(connection, address);
    return Number(account.amount);
  } catch (error) {
    console.error(`Error fetching reserve ${address}:`, error);
    return 0; // Return 0 if account doesn't exist
  }
};

export const useGetAllPools = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const getAllPools = async () => {
    if (!wallet || !publicKey) {
      return [];
    }

    try {
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      const program = new Program<EnswapAmm>(idl as EnswapAmm, provider);
      const pools = await program.account.pool.all();

      console.log("Total Pools Found:", pools.length);

      // Get token list once
      const tokenProvider = await new TokenListProvider().resolve();
      const tokenMap = tokenProvider
        .filterByClusterSlug("devnet")
        .getList()
        .reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map<string, TokenInfo>());

      // console.log("Token Map Size:", tokenMap.size);

      // Enrich pools with token metadata AND reserve balances
      const enrichedPools = await Promise.all(
        pools.map(async (pool) => {
          const mintA = pool.account.mintA;
          const mintB = pool.account.mintB;

          const tokenAInfo = tokenMap.get(mintA.toString());
          const tokenBInfo = tokenMap.get(mintB.toString());

          const [mintAData, mintBData] = await Promise.all([
            getMint(connection, mintA),
            getMint(connection, mintB),
          ]);

          const [balanceA, balanceB] = await Promise.all([
            getReserveBalance(connection, pool.account.tokenReserveA),
            getReserveBalance(connection, pool.account.tokenReserveB),
          ]);

          // Calculate TVL (Total Value Locked)
          // Note: This assumes 1:1 USD value for simplicity
          // Cant use real data cuz im on devnet so i just have to come up with something to fill space here
          const formattedBalanceA = balanceA / Math.pow(10, mintAData.decimals);
          const formattedBalanceB = balanceB / Math.pow(10, mintBData.decimals);
          
          // Mock TVL calculation (simplified)
          const tvl = formattedBalanceA + formattedBalanceB; // again mock value

          const enrichedPool = {
            ...pool,
            tokenA: {
              mint: mintA,
              decimals: mintAData.decimals,
              supply: mintAData.supply.toString(),
              symbol: tokenAInfo?.symbol || "UNKNOWN",
              name: tokenAInfo?.name || "Unknown Token",
              logoURI: tokenAInfo?.logoURI,
            },
            tokenB: {
              mint: mintB,
              decimals: mintBData.decimals,
              supply: mintBData.supply.toString(),
              symbol: tokenBInfo?.symbol || "UNKNOWN",
              name: tokenBInfo?.name || "Unknown Token",
              logoURI: tokenBInfo?.logoURI,
            },
            reserves: {
              balanceA,
              balanceB,
              formattedBalanceA,
              formattedBalanceB,
              reserveAAddress: pool.account.tokenReserveA.toString(),
              reserveBAddress: pool.account.tokenReserveB.toString(),
            },
            tvl,
            // Mock data for UI (Gotta find where to get real data for devnet token to replace later)
            volume24h: Math.random() * 50000000,
            fees24h: Math.random() * 50000,
            apr: Math.random() * 50 + 5, // 5-55% APR
          };

          return enrichedPool;
        })
      );

      return enrichedPools;
    } catch (error) {
      console.error(" Error fetching pools:", error);
      return [];
    }
  };

  const { isPending, data, error } = useQuery({
    queryKey: ["pools", publicKey?.toString()],
    queryFn: getAllPools,
    enabled: !!wallet && !!publicKey,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return { isPending, data: data || [], error };
};


export const useGetSinglePool = (poolId:string | undefined) => {
  const {publicKey} = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["pool", poolId],
    queryFn: async()=>{
      if (!poolId) {
        throw new Error("Pool doesnt exist!!");  
      }

      if (!wallet || !publicKey) {
        throw new Error("Wallet not connected");
      }

      try {
        
      const provider = new AnchorProvider(connection, wallet, {commitment:"confirmed"});
      const program = new Program<EnswapAmm>(idl as EnswapAmm, provider)
      const poolPubKey = new PublicKey(poolId);
      const poolData = await program.account.pool.fetch(poolPubKey);
      // Get token list once
      const tokenProvider = await new TokenListProvider().resolve();
      const tokenMap = tokenProvider
        .filterByClusterSlug("devnet")
        .getList()
        .reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map<string, TokenInfo>());

         const mintA = poolData.mintA
         const mintB = poolData.mintB

          const tokenAInfo = tokenMap.get(mintA.toString());
          const tokenBInfo = tokenMap.get(mintB.toString());

           // Get mint details for decimals
          const [mintAData, mintBData] = await Promise.all([
            getMint(connection, mintA),
            getMint(connection, mintB),
          ]);

          // Get reserve balances for both tokens
          const [balanceA, balanceB] = await Promise.all([
            getReserveBalance(connection, poolData.tokenReserveA),
            getReserveBalance(connection, poolData.tokenReserveB),
          ]);

          
          // Calculate TVL (Total Value Locked)
          // Note: This assumes 1:1 USD value for simplicity - these are just mock im using for now
          const formattedBalanceA = balanceA / Math.pow(10, mintAData.decimals);
          const formattedBalanceB = balanceB / Math.pow(10, mintBData.decimals);
          
          const tvl = formattedBalanceA + formattedBalanceB; 

          const enrichedPool = {
            ...poolData,
            tokenA: {
              mint: mintA,
              decimals: mintAData.decimals,
              supply: mintAData.supply.toString(),
              symbol: tokenAInfo?.symbol || "UNKNOWN",
              name: tokenAInfo?.name || "Unknown Token",
              logoURI: tokenAInfo?.logoURI,
            },
            tokenB: {
              mint: mintB,
              decimals: mintBData.decimals,
              supply: mintBData.supply.toString(),
              symbol: tokenBInfo?.symbol || "UNKNOWN",
              name: tokenBInfo?.name || "Unknown Token",
              logoURI: tokenBInfo?.logoURI,
            },
            reserves: {
              balanceA,
              balanceB,
              formattedBalanceA,
              formattedBalanceB,
              reserveAAddress: poolData.tokenReserveA.toString(),
              reserveBAddress: poolData.tokenReserveB.toString(),
            },
            tvl,
            // Mock data for UI (Gotta find where to get real data for devnet token to replace later)
            volume24h: Math.random() * 50000000,
            fees24h: Math.random() * 50000,
            apr: Math.random() * 50 + 5, // 5-55% APR
          }

          return enrichedPool;
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    enabled: !!poolId && !!wallet && !!publicKey,

  })

  
}