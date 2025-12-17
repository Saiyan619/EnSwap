import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Info, Minus, Plus, TrendingUp } from "lucide-react"
import { pools, formatCurrency } from "@/lib/data"
import BackgroundGlow from "@/global/BackgroundGlow"
import Navbar from "@/global/Navbar"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Slider } from "@radix-ui/react-slider"
import { useAddLiquidity } from "@/program-hooks/addLiquidity"
import { useGetSinglePool } from "@/program-hooks/getPools"

export default function AddLiquidityPage() {
   const {poolId} = useParams();
    console.log(poolId)
    const {data:pool} = useGetSinglePool(poolId);
    console.log(pool)
  const {addNewLiquidity, isPending} = useAddLiquidity();
  // const [searchParams] = useSearchParams()
  // const poolId = searchParams.get("pool") || "eth-usdc"
  // const pool = pools.find((p) => p.id === poolId) || pools[0]

  const [amount0, setAmount0] = useState("")
  const [amount1, setAmount1] = useState("")
  const [minPrice, setMinPrice] = useState(1700)
  const [maxPrice, setMaxPrice] = useState(2100)
  const [priceRange, setPriceRange] = useState([1700, 2100])

  const currentPrice = pool?.reserves.formattedBalanceA
  const isFullRange = minPrice <= Number(currentPrice) * 0.5 && maxPrice >= Number(currentPrice) * 1.5

  // Sync amount1 based on amount0 and current price ratio
  useEffect(() => {
    if (amount0 && !isNaN(Number.parseFloat(amount0))) {
      const ratio = Number(pool?.tokenA.supply) / Number(pool?.tokenB.supply)
      setAmount1((Number.parseFloat(amount0) * Number(currentPrice)).toFixed(2))
    }
  }, [amount0, currentPrice, pool?.tokenA.supply, pool?.tokenB.supply])

  const handleRangeChange = (values: number[]) => {
    setPriceRange(values)
    setMinPrice(values[0])
    setMaxPrice(values[1])
  }

  const isComplete = amount0 && amount1 && Number.parseFloat(amount0) > 0
  if (!pool) {
      return (
        <main className="relative min-h-screen">
          <BackgroundGlow />
        <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Pool not found</p>
          </div>
        </main>
      )
    }
  const handleAddLiquidity = () => {
    addNewLiquidity({
      max_amount_a:Number(amount0),
      max_amount_b:Number(amount1),
      min_lp_tokens:minPrice,
      mint_a:pool?.mintA,
      mint_b:pool?.mintB,
    })
  }

  

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
            <h1 className="text-2xl font-bold text-foreground">Add Liquidity</h1>
            <p className="text-sm text-muted-foreground">
              {pool?.tokenA.symbol}/{pool?.tokenB.symbol} · 0.3% fee tier
            </p>
          </div>
        </div>

        {/* Pool info */}
        <div className="glass-light rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
               <img src= {pool?.tokenA.logoURI} alt="icon" />
              </span>
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                <img src= {pool?.tokenB.logoURI} alt="icon" />
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pool TVL</p>
              <p className="font-semibold text-foreground">{Number(pool?.tvl)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{pool?.apr.toFixed(1)}% APR</span>
          </div>
        </div>

        {/* Main card */}
        <div className="glass rounded-3xl p-6 space-y-6">
          {/* Deposit amounts */}
          <div>
            <label className="text-sm text-muted-foreground mb-3 block">Deposit amounts</label>

            {/* Token 0 input */}
            <div className="glass-light rounded-2xl p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-sm text-muted-foreground">Balance: {pool?.reserves.formattedBalanceA}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount0}
                  onChange={(e) => setAmount0(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <div className="flex items-center gap-2 bg-secondary/80 px-3 py-2 rounded-2xl">
                  <span className="text-xl">
                    <img src={pool?.tokenA.logoURI} alt="icon" />
                  </span>
                  <span className="font-semibold text-foreground">{pool?.tokenB.symbol}</span>
                </div>
              </div>
            </div>

            {/* Token 1 input */}
            <div className="glass-light rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-sm text-muted-foreground">Balance: {pool?.reserves.formattedBalanceB}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount1}
                  onChange={(e) => setAmount1(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <div className="flex items-center gap-2 bg-secondary/80 px-3 py-2 rounded-2xl">
                  <span className="text-xl">
                    <img src={pool?.tokenB.logoURI} alt="icon" />
                  </span>
                  <span className="font-semibold text-foreground">{pool?.tokenB.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                Set price range
                <Info className="w-4 h-4" />
              </label>
              <button
                onClick={() => {
                  setMinPrice(0)
                  setMaxPrice(999999)
                  setPriceRange([0, 3700])
                }}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                Full Range
              </button>
            </div>

            {/* Current price indicator */}
            <div className="glass-light rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Current price</p>
              <p className="text-lg font-semibold text-foreground">
                {(currentPrice?.toLocaleString())} {pool?.tokenB.symbol} per {pool?.tokenA.symbol}
              </p>
            </div>

            {/* Price range slider */}
            <div className="mb-4 px-2">
              <Slider
                value={priceRange}
                onValueChange={handleRangeChange}
                min={1000}
                max={3000}
                step={10}
                className="w-full"
              />
            </div>

            {/* Min/Max inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-light rounded-xl p-3">
                <label className="text-xs text-muted-foreground mb-2 block">Min price</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newMin = Math.max(1000, minPrice - 50)
                      setMinPrice(newMin)
                      setPriceRange([newMin, maxPrice])
                    }}
                    className="p-1 rounded-lg hover:bg-secondary/50"
                  >
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setMinPrice(val)
                      setPriceRange([val, maxPrice])
                    }}
                    className="flex-1 bg-transparent text-center text-lg font-medium text-foreground focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const newMin = Math.min(maxPrice - 50, minPrice + 50)
                      setMinPrice(newMin)
                      setPriceRange([newMin, maxPrice])
                    }}
                    className="p-1 rounded-lg hover:bg-secondary/50"
                  >
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {pool?.tokenB.symbol} per {pool?.tokenA.symbol}
                </p>
              </div>

              <div className="glass-light rounded-xl p-3">
                <label className="text-xs text-muted-foreground mb-2 block">Max price</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newMax = Math.max(minPrice + 50, maxPrice - 50)
                      setMaxPrice(newMax)
                      setPriceRange([minPrice, newMax])
                    }}
                    className="p-1 rounded-lg hover:bg-secondary/50"
                  >
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setMaxPrice(val)
                      setPriceRange([minPrice, val])
                    }}
                    className="flex-1 bg-transparent text-center text-lg font-medium text-foreground focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const newMax = Math.min(3000, maxPrice + 50)
                      setMaxPrice(newMax)
                      setPriceRange([minPrice, newMax])
                    }}
                    className="p-1 rounded-lg hover:bg-secondary/50"
                  >
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {pool?.tokenB.symbol} per {pool?.tokenA.symbol}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          {isComplete && (
            <div className="glass-light rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated APR</span>
                <span className="text-emerald-400 font-medium">
                  {(Number(pool?.apr) * (isFullRange ? 0.8 : 1.2)).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price range</span>
                <span className="text-foreground">
                  ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Position value</span>
                <span className="text-foreground">
                  ~$
                  {(
                    (Number.parseFloat(amount0) || 0) * Number(currentPrice) +
                    (Number.parseFloat(amount1) || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Add button */}
          {isPending ? 
           <Button
            disabled={!isPending}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl disabled:opacity-50"
          >
            Adding Liquidity....
          </Button>
          :
           <Button
            disabled={!isComplete}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl disabled:opacity-50"
          >
            {!amount0 ? "Enter an amount" : "Add Liquidity"}
          </Button>}
        </div>
      </div>
    </main>
  )
}
