import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, AlertTriangle, Wallet } from "lucide-react"
import { pools, formatCurrency } from "@/lib/data"
import { Link, useSearchParams } from "react-router-dom"
import BackgroundGlow from "@/global/BackgroundGlow"
import Navbar from "@/global/Navbar"

const percentagePresets = [25, 50, 75, 100]

export default function WithdrawLiquidityPage() {
  const [searchParams] = useSearchParams()
  const poolId = searchParams.get("pool") || "eth-usdc"
  const pool = pools.find((p) => p.id === poolId && p.myLiquidity) || pools[0]

  const [percentage, setPercentage] = useState(50)
  const [collectFees, setCollectFees] = useState(true)

  const myLiquidity = pool.myLiquidity || 12500
  const withdrawAmount = (myLiquidity * percentage) / 100

  // Mock fee earnings
  const earnedFees0 = 0.042
  const earnedFees1 = 78.5

  // Calculate token amounts based on withdrawal percentage
  const token0Amount = (3.2 * percentage) / 100
  const token1Amount = (5920 * percentage) / 100

  return (
    <main className="relative min-h-screen">
      <BackgroundGlow />
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/pool"
            className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Remove Liquidity</h1>
            <p className="text-sm text-muted-foreground">
              {pool.token0.symbol}/{pool.token1.symbol} · 0.3% fee tier
            </p>
          </div>
        </div>

        {/* Position summary */}
        <div className="glass-light rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                  {pool.token0.icon}
                </span>
                <span className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                  {pool.token1.icon}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Your position</p>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{formatCurrency(myLiquidity)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Pooled {pool.token0.symbol}</p>
              <p className="font-medium text-foreground">3.2 {pool.token0.symbol}</p>
              <p className="text-xs text-muted-foreground">${(3.2 * pool.token0.price).toLocaleString()}</p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Pooled {pool.token1.symbol}</p>
              <p className="font-medium text-foreground">5,920 {pool.token1.symbol}</p>
              <p className="text-xs text-muted-foreground">${(5920 * pool.token1.price).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="glass rounded-3xl p-6 space-y-6">
          {/* Percentage selector */}
          <div>
            <label className="text-sm text-muted-foreground mb-3 block">Amount to remove</label>

            <div className="glass-light rounded-2xl p-6 mb-4">
              <div className="text-center mb-4">
                <span className="text-5xl font-bold text-foreground">{percentage}%</span>
              </div>
              <Slider
                value={[percentage]}
                onValueChange={(values) => setPercentage(values[0])}
                min={0}
                max={100}
                step={1}
                className="w-full mb-4"
              />
              <div className="flex gap-2">
                {percentagePresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPercentage(preset)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      percentage === preset
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* You will receive */}
          <div>
            <label className="text-sm text-muted-foreground mb-3 block">You will receive</label>
            <div className="space-y-3">
              <div className="glass-light rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pool.token0.icon}</span>
                  <span className="font-medium text-foreground">{pool.token0.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{token0Amount.toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">
                    ~${(token0Amount * pool.token0.price).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="glass-light rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pool.token1.icon}</span>
                  <span className="font-medium text-foreground">{pool.token1.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{token1Amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    ~${(token1Amount * pool.token1.price).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Collect fees toggle */}
          <div className="glass-light rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-foreground">Collect earned fees</p>
                <p className="text-sm text-muted-foreground">Withdraw accumulated trading fees</p>
              </div>
              <button
                onClick={() => setCollectFees(!collectFees)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  collectFees ? "bg-primary" : "bg-secondary"
                } relative`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    collectFees ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {collectFees && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Earned {pool.token0.symbol}</p>
                  <p className="font-medium text-emerald-400">+{earnedFees0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Earned {pool.token1.symbol}</p>
                  <p className="font-medium text-emerald-400">+{earnedFees1}</p>
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          {percentage === 100 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400 font-medium">Removing 100% of liquidity</p>
                <p className="text-sm text-amber-400/80">
                  You will close this position entirely and stop earning fees.
                </p>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="glass-light rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total withdrawal value</span>
              <span className="font-semibold text-foreground">{formatCurrency(withdrawAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining position</span>
              <span className="text-foreground">{formatCurrency(myLiquidity - withdrawAmount)}</span>
            </div>
            {collectFees && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fees to collect</span>
                <span className="text-emerald-400">
                  +${(earnedFees0 * pool.token0.price + earnedFees1 * pool.token1.price).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Remove button */}
          <Button
            disabled={percentage === 0}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl disabled:opacity-50"
          >
            {percentage === 0 ? "Select amount" : `Remove ${percentage}% Liquidity`}
          </Button>
        </div>
      </div>
    </main>
  )
}
