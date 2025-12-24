import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { formatCurrency } from "@/lib/data"
import BackgroundGlow from "@/global/BackgroundGlow"
import Navbar from "@/global/Navbar"
import { useGetAllPools } from "@/program-hooks/getPools"
import { Link } from "react-router-dom"

type Tab = "tokens" | "pools"
type SortKey = "name" | "price" | "tvl" | "volume" | "change"

export default function ExplorePage() {
  const { data: pools, isPending, error } = useGetAllPools();
  const [activeTab, setActiveTab] = useState<Tab>("pools")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("tvl")
  const [sortAsc, setSortAsc] = useState(false)

  // Mock price change data
  // const tokenData = tokens.map((t) => ({
  //   ...t,
  //   change24h: Math.random() * 20 - 10,
  //   volume24h: Math.random() * 50000000,
  //   tvl: Math.random() * 200000000,
  // }))

  //Task - remember to come back to this and work on fetching the tokens
  // const filteredTokens = tokenData.filter(
  //   (t) =>
  //     t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     t.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  // )

  const filteredPools = pools.filter(
    (p) =>
      p.tokenA.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tokenB.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${p.tokenA.symbol}/${p.tokenB.symbol}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort pools based on selected key
  const sortedPools = [...filteredPools].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortKey) {
      case "tvl":
        aValue = a.tvl;
        bValue = b.tvl;
        break;
      case "volume":
        aValue = a.volume24h;
        bValue = b.volume24h;
        break;
      case "name":
      default:
        aValue = `${a.tokenA.symbol}/${a.tokenB.symbol}`;
        bValue = `${b.tokenA.symbol}/${b.tokenB.symbol}`;
    }
    
    if (typeof aValue === 'string') {
      return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortAsc ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  if (isPending) {
    return (
      <main className="relative min-h-screen">
        <BackgroundGlow />
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Loading pools...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="relative min-h-screen">
        <BackgroundGlow />
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-red-400">Error loading pools: {error.message}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundGlow />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore</h1>
          <p className="text-muted-foreground">Discover tokens and pools across the ecosystem</p>
        </div>

        {/* Tabs and search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "tokens" ? "default" : "secondary"}
              onClick={() => setActiveTab("tokens")}
              className={activeTab === "tokens" ? "bg-primary text-primary-foreground" : "glass-light border-0"}
            >
              Tokens
            </Button>
            <Button
              variant={activeTab === "pools" ? "default" : "secondary"}
              onClick={() => setActiveTab("pools")}
              className={activeTab === "pools" ? "bg-primary text-primary-foreground" : "glass-light border-0"}
            >
              Pools ({pools.length})
            </Button>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Tokens table */}
        {/* {activeTab === "tokens" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">#</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Token</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      <button
                        onClick={() => handleSort("price")}
                        className="flex items-center gap-1 ml-auto hover:text-foreground"
                      >
                        Price <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      <button
                        onClick={() => handleSort("change")}
                        className="flex items-center gap-1 ml-auto hover:text-foreground"
                      >
                        24h Change <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      <button
                        onClick={() => handleSort("volume")}
                        className="flex items-center gap-1 ml-auto hover:text-foreground"
                      >
                        24h Volume <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                      <button
                        onClick={() => handleSort("tvl")}
                        className="flex items-center gap-1 ml-auto hover:text-foreground"
                      >
                        TVL <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((token, index) => (
                    <tr
                      key={token.symbol}
                      className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <td className="p-4 text-muted-foreground">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{token.icon}</span>
                          <div>
                            <p className="font-medium text-foreground">{token.name}</p>
                            <p className="text-sm text-muted-foreground">{token.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-foreground">${token.price.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <span
                          className={`flex items-center justify-end gap-1 ${
                            token.change24h >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {token.change24h >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {Math.abs(token.change24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-foreground hidden md:table-cell">
                        {formatCurrency(token.volume24h)}
                      </td>
                      <td className="p-4 text-right font-medium text-foreground hidden lg:table-cell">
                        {formatCurrency(token.tvl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}

        {/* Pools table */}
        {activeTab === "pools" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">#</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pool</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Token A Balance</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Token B Balance</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      <button
                        onClick={() => handleSort("tvl")}
                        className="flex items-center gap-1 ml-auto hover:text-foreground"
                      >
                        TVL <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      <button
                        onClick={() => handleSort("volume")}
                        className="flex items-center gap-1 ml-auto hover:text-foreground"
                      >
                        24h Volume <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                      24h Fees
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">APR</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPools.map((pool, index) => (
                    <tr
                      key={pool.publicKey.toString()}
                      className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                                      
                      <td className="p-4 text-muted-foreground">{index + 1}</td>
                      <td className="p-4">
                        <Link to={`/explore/${pool.publicKey.toString()}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            <span className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                              {pool.tokenA.logoURI ? (
                                <img 
                                  src={pool.tokenA.logoURI} 
                                  alt={pool.tokenA.symbol} 
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                pool.tokenA.symbol.charAt(0)
                              )}
                            </span>
                            <span className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                              {pool.tokenB.logoURI ? (
                                <img 
                                  src={pool.tokenB.logoURI} 
                                  alt={pool.tokenB.symbol} 
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                pool.tokenB.symbol.charAt(0)
                              )}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {pool.tokenA.symbol}/{pool.tokenB.symbol}
                            </p>
                            <p className="text-sm text-muted-foreground">0.3% fee</p>
                          </div>
                        </div>
                           </Link>
                      </td>
                      <td className="p-4 text-right font-medium text-foreground">
                        {pool.reserves.formattedBalanceA.toFixed(4)} {pool.tokenA.symbol}
                      </td>
                      <td className="p-4 text-right font-medium text-foreground">
                        {pool.reserves.formattedBalanceB.toFixed(4)} {pool.tokenB.symbol}
                      </td>
                      <td className="p-4 text-right font-medium text-foreground">
                        ${Number(pool.tvl.toFixed(2)).toLocaleString("en-US")}
                      </td>
                      <td className="p-4 text-right font-medium text-foreground hidden md:table-cell">
                        {formatCurrency(pool.volume24h)}
                      </td>
                      <td className="p-4 text-right font-medium text-foreground hidden lg:table-cell">
                        {formatCurrency(pool.fees24h)}
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-emerald-400 font-medium">{pool.apr.toFixed(1)}%</span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {sortedPools.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No pools found. Create the first pool!
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}