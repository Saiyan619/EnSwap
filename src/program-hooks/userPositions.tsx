import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { 
  getAccount, 
  getAssociatedTokenAddressSync, 
  getMint,
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { EnswapAmm } from "@/idlTypes/enswapType";
import idl from "@/idl/enswap.json";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";

export interface UserPosition {
  poolId: string;
  poolAddress: PublicKey;
  lpMint: PublicKey;
  tokenA: {
    mint: PublicKey;
    symbol: string;
    name: string;
    decimals: number;
    logoURI: string;
  };
  tokenB: {
    mint: PublicKey;
    symbol: string;
    name: string;
    decimals: number;
    logoURI: string;
  };
  lpTokenBalance: number;        
  lpTokenBalanceRaw: bigint;   
  shareOfPool: number;           // Percentage (0-100)
  totalLpSupply: number;         
  feeTier: number;               // Fee in basis points 
}

export const useUserPositions = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const fetchUserPositions = async (): Promise<UserPosition[]> => {
    if (!publicKey || !wallet) {
      return [];
    }

    try {
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      const program = new Program<EnswapAmm>(idl as EnswapAmm, provider);

      // Get token list/registry
      const tokenProvider = await new TokenListProvider().resolve();
      const tokenMap = tokenProvider
        .filterByClusterSlug("devnet")
        .getList()
        .reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map<string, TokenInfo>());

      // 1. Get all pools
      const allPools = await program.account.pool.all();
      console.log("Total pools found:", allPools.length);

      const userPositions: UserPosition[] = [];

      // 2. For each pool, check if user has LP tokens
      for (const poolData of allPools) {
        const pool = poolData.account;
        
        try {
          // Get LP mint info (for total supply and decimals)
          const lpMintInfo = await getMint(connection, pool.lpMint);
          const lpDecimals = lpMintInfo.decimals;
          const totalLpSupply = Number(lpMintInfo.supply) / Math.pow(10, lpDecimals);

          // Derive user's LP token account address
          const userLpTokenAccount = getAssociatedTokenAddressSync(
            pool.lpMint,
            publicKey,
            false,
            TOKEN_PROGRAM_ID
          );

          // Try to fetch user's LP token account
          const lpTokenAccount = await getAccount(connection, userLpTokenAccount);
          const lpBalanceRaw = lpTokenAccount.amount;
          const lpBalance = Number(lpBalanceRaw) / Math.pow(10, lpDecimals);

          // Skip if user has no LP tokens in this pool
          if (lpBalance === 0) {
            continue;
          }

          console.log(`Position found in pool: ${poolData.publicKey.toString()}`);
          console.log(`LP Balance: ${lpBalance}`);

          // Get token decimals
          const mintAInfo = await getMint(connection, pool.mintA);
          const mintBInfo = await getMint(connection, pool.mintB);

          // Get token metadata from registry
          const tokenAFromRegistry = tokenMap.get(pool.mintA.toString());
          const tokenBFromRegistry = tokenMap.get(pool.mintB.toString());

          // Calculate share of pool
          const shareOfPool = (lpBalance / totalLpSupply) * 100;

          // Build token objects with full metadata
          const tokenA = {
            mint: pool.mintA,
            symbol: tokenAFromRegistry?.symbol || "UNKNOWN",
            name: tokenAFromRegistry?.name || "Unknown Token",
            decimals: mintAInfo.decimals,
            logoURI: tokenAFromRegistry?.logoURI || "",
          };

          const tokenB = {
            mint: pool.mintB,
            symbol: tokenBFromRegistry?.symbol || "UNKNOWN",
            name: tokenBFromRegistry?.name || "Unknown Token",
            decimals: mintBInfo.decimals,
            logoURI: tokenBFromRegistry?.logoURI || "",
          };

          userPositions.push({
            poolId: poolData.publicKey.toString(),
            poolAddress: poolData.publicKey,
            lpMint: pool.lpMint,
            tokenA,
            tokenB,
            lpTokenBalance: lpBalance,
            lpTokenBalanceRaw: lpBalanceRaw,
            shareOfPool,
            totalLpSupply,
            feeTier: pool.feeBps,
          });
        } catch (error) {
          // User doesn't have an LP token account for this pool (no position)
          // This is expected, so we just continue
          continue;
        }
      }

      // console.log("Total user positions found:", userPositions.length);

      return userPositions;
    } catch (error) {
      throw error;
    }
  };

  return useQuery({
    queryKey: ["userPositions", publicKey?.toString()],
    queryFn: fetchUserPositions,
    enabled: !!publicKey && !!wallet,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });
};


// Hook to get a single position by pool ID
export const useUserPosition = (poolId: string | undefined) => {
  const { data: positions, ...rest } = useUserPositions();

  const position = positions?.find((pos) => pos.poolId === poolId);

  return {
    data: position,
    ...rest,
  };
};