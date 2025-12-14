import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import BackgroundGlow from "@/global/BackgroundGlow"
import { PoolCard } from "./components/PoolCard"
import { Link } from "react-router-dom"
import { pools } from "@/lib/data"
import Navbar from "@/global/Navbar"

export default function PoolPage() {
  const myPools = pools.filter((p) => p.myLiquidity)
  const allPools = pools

  return (
    <main className="relative min-h-screen">
      <BackgroundGlow />
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Pools</h1>
            <p className="text-muted-foreground">Provide liquidity and earn fees on every trade</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/pool/initialize">
              <Plus className="w-4 h-4 mr-2" />
              New Position
            </Link>
          </Button>
        </div>

        {/* My positions section */}
        {myPools.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Positions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          </section>
        )}

        {/* Top pools section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Top Pools</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search pools..."
                className="pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 w-64"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
