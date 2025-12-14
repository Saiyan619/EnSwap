"use client"
import { Button } from "@/components/ui/button"
import { formatCurrency, Pool } from "@/lib/data"
import { Plus, Minus, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"

interface PoolCardProps {
  pool: Pool
}

export function PoolCard({ pool }: PoolCardProps) {
  return (
    <div className="glass rounded-2xl p-4 hover:border-primary/30 transition-all">
      {/* Pool header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-secondary">
              {pool.token0.icon}
            </span>
            <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-secondary">
              {pool.token1.icon}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {pool.token0.symbol}/{pool.token1.symbol}
            </h3>
            <span className="text-xs text-muted-foreground">0.3% fee tier</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>{pool.apr.toFixed(1)}% APR</span>
        </div>
      </div>

      {/* Pool stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">TVL</p>
          <p className="font-medium text-foreground">{formatCurrency(pool.tvl)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
          <p className="font-medium text-foreground">{formatCurrency(pool.volume24h)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">24h Fees</p>
          <p className="font-medium text-foreground">{formatCurrency(pool.fees24h)}</p>
        </div>
      </div>

      {/* My position (if exists) */}
      {pool.myLiquidity && (
        <div className="glass-light rounded-xl p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-2">My Position</p>
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{formatCurrency(pool.myLiquidity)}</span>
            <span className="text-xs text-muted-foreground">{(pool.myShare! * 100).toFixed(4)}% share</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to={`/pool/add?pool=${pool.id}`}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Link>
        </Button>
        {pool.myLiquidity && (
          <Button asChild variant="secondary" className="flex-1 glass-light border-0">
            <Link to={`/pool/withdraw?pool=${pool.id}`}>
              <Minus className="w-4 h-4 mr-2" />
              Remove
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
