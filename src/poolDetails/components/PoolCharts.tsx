import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Info } from "lucide-react"
import { formatCurrency } from "@/lib/data"

// Mock chart data
const tvlData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  value: 180000000 + Math.random() * 65000000,
}))

const volumeData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  value: Math.random() * 90000000,
}))

const liquidityDistribution = Array.from({ length: 20 }, (_, i) => ({
  price: 1800 + i * 10,
  liquidity: Math.random() * 50000000,
}))

export function PoolCharts() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* TVL Chart */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">TVL</h2>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                1D
              </button>
              <button className="text-xs px-3 py-1 rounded-lg bg-primary/20 text-primary">7D</button>
              <button className="text-xs px-3 py-1 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                30D
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={tvlData}>
              <defs>
                <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(251 146 60)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(251 146 60)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 12 }}
                tickFormatter={(value:string) => `$${(Number(value) / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(251, 146, 60, 0.3)",
                  borderRadius: "12px",
                }}
                formatter={(value: number) => [`${formatCurrency(value)}`, "TVL"]}
              />
              <Area type="monotone" dataKey="value" stroke="rgb(251 146 60)" fill="url(#tvlGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Volume</h2>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                1D
              </button>
              <button className="text-xs px-3 py-1 rounded-lg bg-primary/20 text-primary">7D</button>
              <button className="text-xs px-3 py-1 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                30D
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 12 }}
                tickFormatter={(value:number) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(251, 146, 60, 0.3)",
                  borderRadius: "12px",
                }}
                formatter={(value: number) => [`${formatCurrency(value)}`, "Volume"]}
              />
              <Bar dataKey="value" fill="rgb(251 146 60)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liquidity Distribution Chart */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Liquidity Distribution</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={liquidityDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="price"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fontSize: 12 }}
              label={{ value: "Price", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fontSize: 12 }}
              tickFormatter={(value:number) => `$${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(251, 146, 60, 0.3)",
                borderRadius: "12px",
              }}
              formatter={(value: number) => [`${formatCurrency(value)}`, "Liquidity"]}
            />
            <Bar dataKey="liquidity" fill="rgb(251 146 60)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
