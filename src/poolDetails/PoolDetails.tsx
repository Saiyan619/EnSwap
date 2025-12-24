import Navbar from "@/global/Navbar"
import { useGetSinglePool } from "@/program-hooks/getPools";
import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Minus, ExternalLink, TrendingUp } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/data"
import BackgroundGlow from "@/global/BackgroundGlow";
import { PoolCharts } from "./components/PoolCharts";


export default function PoolDetails() {
     const {poolId} = useParams();
    const {data:pool} = useGetSinglePool(poolId);

  if (!pool) {
    return (
      <main className="relative min-h-screen">
        <BackgroundGlow />
      <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Please Wait....</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundGlow />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button and header */}
        <div className="mb-6">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2">
                  <span className="text-3xl w-12 h-12 flex items-center justify-center rounded-full bg-secondary">
                   <img src={pool.tokenA.logoURI} alt="icon" />
                  </span>
                  <span className="text-3xl w-12 h-12 flex items-center justify-center rounded-full bg-secondary">
                     <img src={pool.tokenB.logoURI} alt="icon" />
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {pool.tokenA.symbol}/{pool.tokenB.symbol}
                  </h1>
                  <p className="text-muted-foreground">0.3% fee tier</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {/* the apr should be the id i havnt found how to get the pool id 
                  thats why i used a random value not to get an error fix this later!! */}
                <Link to={`/pool/add/${poolId}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Liquidity
                </Link>
              </Button>
                 {/* the apr should be the myLiquidty i havnt found how to get the pool id 
                  thats why i used a random value not to get an error fix this later!! */}
              {pool.apr && (
                <Button asChild variant="secondary" className="glass-light border-0">
                  {/* the apr should be the id i havnt found how to get the pool id 
                  thats why i used a random value not to get an error fix this later!! */}
                  <Link to={`/pool/withdraw/${poolId}`}>
                    <Minus className="w-4 h-4 mr-2" />
                    Remove Liquidity
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Value Locked</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(pool.tvl)}</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +12.5% (24h)
            </p>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(pool.volume24h)}</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +8.2% (24h)
            </p>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-1">24h Fees</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(pool.fees24h)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ {formatCurrency((pool.fees24h / pool.tvl) * 365 * 100)}% APR
            </p>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Current APR</p>
            <p className="text-2xl font-bold text-emerald-400">{pool.apr.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Based on 24h fees</p>
          </div>
        </div>

        {/* Will figure this part out after integrating addliquidty function */}
        {/* My Position (if exists) */}
           {/* the apr should be the id i havnt found how to get the pool id 
                  thats why i used a random value not to get an error fix this later!! */}
        {/* {pool.apr && (
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Your Position</h2>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                   the apr should be the id i havnt found how to get the pool id 
                  thats why i used a random value not to get an error fix this later!!
                <Link to={`/pool/withdraw?pool=${pool.apr}`}>Manage Position</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Liquidity</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(pool.myLiquidity)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pool Share</p>
                <p className="text-2xl font-bold text-foreground">{(pool.myShare! * 100).toFixed(4)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unclaimed Fees</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(pool.myLiquidity * 0.024)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-2">Your Pooled Tokens</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{pool.tokenA.logoURI}</span>
                  <span className="font-medium text-foreground">
                    {formatNumber((pool.myLiquidity / pool.token0.price) * 0.5)} {pool.token0.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{pool.token1.icon}</span>
                  <span className="font-medium text-foreground">
                    {formatNumber((pool.myLiquidity / pool.token1.price) * 0.5)} {pool.token1.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )} */}

Pool Information
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pool Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">Pool Address</span>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-mono text-sm">0x1234...5678</span>
                <button className="text-primary hover:text-primary/80">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">Fee Tier</span>
              <span className="text-foreground font-medium">0.3%</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">{pool.tokenA.symbol} Price</span>
              <span className="text-foreground font-medium">${formatNumber(pool.reserves.balanceA)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">{pool.tokenB.symbol} Price</span>
              <span className="text-foreground font-medium">${formatNumber(pool.reserves.balanceB)}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Total Transactions</span>
              <span className="text-foreground font-medium">1,234,567</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground font-medium">365 days ago</span>
            </div>
          </div>
        </div>

        
        <PoolCharts />
      </div>
    </main>
  )
}
