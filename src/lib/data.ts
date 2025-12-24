import { PublicKey } from "@solana/web3.js"

// Shared token and pool data for the entire app
export interface Token {
  symbol: string
  name: string
  logoURI: string | undefined
  supply: string
  // price: number 
  mint: PublicKey
  decimals: number
}

export interface Pool {
  id: string
  token0: Token
  token1: Token
  tvl: number
  volume24h: number
  fees24h: number
  apr: number
  myLiquidity?: number
  myShare?: number
}

// export const pools: Pool[] = [
//   {
//     id: "eth-usdc",
//     token0: tokens[0],
//     token1: tokens[1],
//     tvl: 245000000,
//     volume24h: 89000000,
//     fees24h: 267000,
//     apr: 24.5,
//     myLiquidity: 12500,
//     myShare: 0.005,
//   },
//   {
//     id: "wbtc-eth",
//     token0: tokens[1],
//     token1: tokens[0],
//     tvl: 180000000,
//     volume24h: 45000000,
//     fees24h: 135000,
//     apr: 18.2,
//     myLiquidity: 5000,
//     myShare: 0.003,
//   },
//   // {
//   //   id: "eth-dai",
//   //   token0: tokens[0],
//   //   token1: tokens[3],
//   //   tvl: 120000000,
//   //   volume24h: 32000000,
//   //   fees24h: 96000,
//   //   apr: 15.8,
//   // },
//   // {
//   //   id: "usdc-dai",
//   //   token0: tokens[1],
//   //   token1: tokens[3],
//   //   tvl: 95000000,
//   //   volume24h: 28000000,
//   //   fees24h: 14000,
//   //   apr: 5.2,
//   // },
//   // {
//   //   id: "link-eth",
//   //   token0: tokens[4],
//   //   token1: tokens[0],
//   //   tvl: 45000000,
//   //   volume24h: 12000000,
//   //   fees24h: 36000,
//   //   apr: 28.4,
//   // },
//   // {
//   //   id: "uni-eth",
//   //   token0: tokens[5],
//   //   token1: tokens[0],
//   //   tvl: 38000000,
//   //   volume24h: 9500000,
//   //   fees24h: 28500,
//   //   apr: 22.1,
//   // },
// ]

export function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
}



