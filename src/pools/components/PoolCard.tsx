import { Button } from "@/components/ui/button"
import type { UserPosition } from "@/program-hooks/userPositions"
import { Plus, Minus } from "lucide-react"
import { Link } from "react-router-dom"

interface PoolCardProps {
  pool: UserPosition
}

export function PoolCard({ pool }: PoolCardProps) {

  return (
    <div className="glass rounded-2xl p-4 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <span className="text-xs w-10 h-10 flex items-center justify-center rounded-full bg-secondary">
              <img className="w-8" src={pool.tokenA.logoURI} alt={pool.tokenA.name} />
            </span>
            <span className="text-xs w-10 h-10 flex items-center justify-center rounded-full bg-secondary">
              <img className="w-8" src={pool.tokenB.logoURI} alt={pool.tokenB.name} />
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {pool.tokenA.symbol}/{pool.tokenB.symbol}
            </h3>
            <span className="text-xs text-muted-foreground">0.3% fee tier</span>
          </div>
        </div>
        {/* <div className="flex items-center gap-1 text-emerald-400 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>{pool.apr.toFixed(1)}% APR</span>
        </div> */}
      </div>

      {/* Pool stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* <div>
          <p className="text-xs text-muted-foreground mb-1">TVL</p>
          <p className="font-medium text-foreground">{formatCurrency(pool.tvl)}</p>
        </div> */}
        {/* <div>
          <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
          <p className="font-medium text-foreground">{formatCurrency(volume24h)}</p>
        </div> */}
        {/* <div>
          <p className="text-xs text-muted-foreground mb-1">24h Fees</p>
          <p className="font-medium text-foreground">{formatCurrency(fees24h)}</p>
        </div> */}
      </div>

      {/* My position (if exists) */}
      {pool.lpTokenBalance && (
        <div className="glass-light rounded-xl p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-2">My Position</p>
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{pool.lpTokenBalance}LP Tokens</span>
            <span className="text-xs text-muted-foreground">{((pool.shareOfPool || 0)).toFixed(2)}% share</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to={`/pool/add/${pool.poolId}`}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Link>
        </Button>
        {pool.lpTokenBalance && (
          <Button asChild variant="secondary" className="flex-1 glass-light border-0">
            <Link to={`/pool/withdraw/${pool.poolId}`}>
              <Minus className="w-4 h-4 mr-2" />
              Remove
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
