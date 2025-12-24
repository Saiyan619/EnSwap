// import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { useGetAllPools } from "./getPools";
import { useMemo } from "react";


export function useAllTokens() {
  const { data: pools, isPending:isLoading } = useGetAllPools()

  const tokens = useMemo(() => {
    if (!pools) return []
    return [
      ...new Map(
        pools.flatMap(pool => [
          [pool.tokenA.mint.toString(), pool.tokenA],
          [pool.tokenB.mint.toString(), pool.tokenB],
        ])
      ).values(),
    ]
  }, [pools])

  return { tokens, isLoading }
}

export function useFindDirectPool(fromMint: PublicKey | null, toMint: PublicKey | null) {
  const { data: pools, isPending: isLoading } = useGetAllPools()

  const pool = useMemo(() => {
    // Early returns
    if (!pools || !fromMint || !toMint) return undefined
    
    // Convert to strings for comparison
    const fromStr = fromMint.toString()
    const toStr = toMint.toString()
    
    // Find matching pool
    return pools.find(pool => {
      const mintA = pool.tokenA.mint.toString()
      const mintB = pool.tokenB.mint.toString()
      
      // Check both directions
      const isDirect = mintA === fromStr && mintB === toStr
      const isReverse = mintA === toStr && mintB === fromStr
      
      return isDirect || isReverse
    })
  }, [pools, fromMint, toMint])

  return { 
    pool, 
    isLoading,
    exists: !!pool 
  }
}

// Core AMM swap formula (Constant Product x*y=k)
export const calculateSwapOutput = (
  inputAmount: number,      // Amount user is selling
  inputReserve: number,     // Pool's reserve of input token
  outputReserve: number,    // Pool's reserve of output token  
  feeBps: number = 30       // Fee in basis points (0.3% = 30)
): number => {
  if (inputAmount <= 0 || inputReserve <= 0 || outputReserve <= 0) {
    return 0
  }
  
  // 1. Apply trading fee (0.3%)
  const inputAmountAfterFee = inputAmount * (1 - feeBps / 10000)
  
  // 2. Constant product formula: (x + Δx) * (y - Δy) = k
  // Where: x = inputReserve, Δx = inputAmountAfterFee, y = outputReserve
  // Solve for Δy (outputAmount):
  const numerator = inputAmountAfterFee * outputReserve
  const denominator = inputReserve + inputAmountAfterFee
  const outputAmount = numerator / denominator
  
  // 3. Ensure we don't exceed pool reserves
  return Math.min(outputAmount, outputReserve * 0.999) // Safety margin
}

// Reverse calculation: How much input needed for desired output
export const calculateSwapInput = (
  desiredOutput: number,    // Amount user wants to receive
  inputReserve: number,     // Pool's reserve of input token
  outputReserve: number,    // Pool's reserve of output token
  feeBps: number = 30
): number => {
  if (desiredOutput <= 0 || desiredOutput >= outputReserve) {
    return Infinity // Not enough liquidity
  }
  
  // Reverse formula: Δx = (Δy * x) / ((y - Δy) * (1 - fee))
  const numerator = desiredOutput * inputReserve
  const denominator = (outputReserve - desiredOutput) * (1 - feeBps / 10000)
  
  return numerator / denominator
}

// Calculate price impact (% change)
export const calculatePriceImpact = (
  inputAmount: number,
  inputReserve: number,
  outputReserve: number,
  feeBps: number = 30
): number => {
  const outputAmount = calculateSwapOutput(inputAmount, inputReserve, outputReserve, feeBps)
  
  // Spot price before swap
  const spotPriceBefore = outputReserve / inputReserve
  
  // Spot price after swap
  const spotPriceAfter = (outputReserve - outputAmount) / (inputReserve + inputAmount)
  
  // Price impact percentage
  return Math.abs((spotPriceAfter - spotPriceBefore) / spotPriceBefore) * 100
}
export function useSwapQuote(
  fromMint: PublicKey | null,
  toMint: PublicKey | null,
  inputAmount: number,
  slippageTolerance: number = 0.5 // Add slippage parameter with default
) {
  const { pool, isLoading } = useFindDirectPool(fromMint, toMint)
  
  return useMemo(() => {
    if (!pool || !fromMint || !toMint || !inputAmount || inputAmount <= 0) {
      return {
        outputAmount: 0,
        priceImpact: 0,
        minimumReceived: 0,
        fee: 0,
        spotPrice: 0,
        isValid: false,
        isLoading
      }
    }
    
    // Convert to strings for comparison
    const fromStr = fromMint.toString()
    const toStr = toMint.toString()
    const poolMintA = pool.tokenA.mint.toString()
    
    // Determine direction
    const isDirect = poolMintA === fromStr
    
    // formattedBalanceA/B are ALREADY formatted with decimals applied!
    const inputReserve = isDirect 
      ? pool.reserves.formattedBalanceA 
      : pool.reserves.formattedBalanceB
    
    const outputReserve = isDirect
      ? pool.reserves.formattedBalanceB
      : pool.reserves.formattedBalanceA
    
    // Calculate output
    const feeBps = pool.account.feeBps || 30
    const outputAmount = calculateSwapOutput(
      inputAmount,
      inputReserve,
      outputReserve,
      feeBps
    )
    
    // Calculate price impact
    const spotPriceBefore = outputReserve / inputReserve
    const spotPriceAfter = (outputReserve - outputAmount) / (inputReserve + inputAmount)
    const priceImpact = Math.abs((spotPriceAfter - spotPriceBefore) / spotPriceBefore) * 100
    
    // Calculate minimum received using user's slippage tolerance
    const minimumReceived = outputAmount * (1 - slippageTolerance / 100)
    
    return {
      outputAmount,
      priceImpact,
      minimumReceived,
      fee: (inputAmount * feeBps) / 10000,
      spotPrice: spotPriceBefore,
      isValid: true,
      isLoading: false
    }
  }, [pool, fromMint, toMint, inputAmount, slippageTolerance, isLoading]) // Add slippageTolerance to deps
}