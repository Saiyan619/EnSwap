import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Info, TrendingUp } from "lucide-react"
import BackgroundGlow from "@/global/BackgroundGlow"
import Navbar from "@/global/Navbar"
import { Link, useParams } from "react-router-dom"
import { useAddLiquidity } from "@/program-hooks/addLiquidity"
import { useGetSinglePool } from "@/program-hooks/getPools"
import { getMint } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"

export default function AddLiquidityPage() {
   const {poolId} = useParams();
    const {data:pool} = useGetSinglePool(poolId);
  const {addNewLiquidity, isPending} = useAddLiquidity();
  const {connection} = useConnection();
  // const [searchParams] = useSearchParams()
  // const poolId = searchParams.get("pool") || "eth-usdc"
  // const pool = pools.find((p) => p.id === poolId) || pools[0]

  const [amount0, setAmount0] = useState("")
  const [amount1, setAmount1] = useState("")
  const [minPrice, setMinPrice] = useState(1700)
  const [maxPrice, setMaxPrice] = useState(2100)
const [selected, setSelected] = useState("0.5");

  const options = [
    { id: 'low', title: 'Low', desc: '0.1% slippage', percent: "0.1" },
    { id: 'medium', title: 'Medium', desc: '0.5% slippage', percent: "0.5" },
    { id: 'high', title: 'High', desc: '1.0% slippage', percent: "1.0" },
  ];
  const currentPrice = pool?.reserves.formattedBalanceA
  const isFullRange = minPrice <= Number(currentPrice) * 0.5 && maxPrice >= Number(currentPrice) * 1.5

  // Sync amount1 based on amount0 and current price ratio
  useEffect(() => {
    if (amount0 && !isNaN(Number.parseFloat(amount0))) {
      const reserveA = pool?.reserves.formattedBalanceA
      const reserveB = pool?.reserves.formattedBalanceB
     if(!reserveA || !reserveB){
        throw new Error("pool reserves not found")
      }
       const priceRatio = reserveB / reserveA;
     const calculatedAmount1 = Number.parseFloat(amount0) * priceRatio;
    
    setAmount1(calculatedAmount1.toFixed(pool?.tokenB.decimals));
    }
  }, [amount0, currentPrice, pool?.tokenA.supply, pool?.tokenB.supply])


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
  const handleAddLiquidity = async() => {
   
    const firstLp = pool.reserves.formattedBalanceA <= 0 && pool.reserves.formattedBalanceB <= 0;
    let expectedLp;
    let minLpTokens;
    if(firstLp){
      // First deposit: sqrt(a * b)
     expectedLp = Math.sqrt(Number(amount0) * Number(amount1));

    const slippagePercent = Number(selected);
    minLpTokens = Math.floor(expectedLp * (1 - slippagePercent / 100));
    }else{
     // Existing pool: use ratio calculation
    const lpMintInfo = await getMint(connection, pool.lpMint);
    const totalLpSupply = lpMintInfo.supply;   
const reserveA = BigInt(pool.reserves.balanceA);
const reserveB = BigInt(pool.reserves.balanceB);

const lpFromA = (BigInt(amount0) * totalLpSupply) / reserveA;
const lpFromB = (BigInt(amount1) * totalLpSupply) / reserveB;
 expectedLp = lpFromA < lpFromB ? lpFromA : lpFromB;
// console.log("expected LP Token", expectedLp);

const slippagePercent = Number(selected);
const slippageFactor = BigInt(Math.floor((1 - slippagePercent / 100) * 10000));
minLpTokens = Number((expectedLp * slippageFactor) / BigInt(10000));
    }

        // console.log("expected LP Token", expectedLp);

     const data = {
       max_amount_a:Number(amount0),
      max_amount_b:Number(amount1),
      min_lp_tokens:minLpTokens,
      mint_a:pool?.mintA,
      mint_b:pool?.mintB,
    }
    addNewLiquidity(data);
  }


  return (
    <main className="relative min-h-screen">
      <BackgroundGlow />
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
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
                    <img className="w-8" src={pool?.tokenA.logoURI} alt="icon" />
                  </span>
                  <span className="font-semibold text-foreground">{pool?.tokenA.symbol}</span>
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
                    <img className="w-8" src={pool?.tokenB.logoURI} alt="icon" />
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
                Set Slippage Protection
                <Info className="w-4 h-4" />
              </label>
            </div>

            {/* Current price indicator */}
            {/* Will work on this after after adding liquidity */}
            {/* <div className="glass-light rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Current price</p>
              <p className="text-lg font-semibold text-foreground">
                {currentPrice} {pool?.tokenB.symbol} per {pool?.tokenA.symbol}
              </p>
            </div> */}

    <div className="grid grid-cols-3 gap-4 max-w-4xl">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.percent)}
            className="text-left"
          >
            <div className={`glass-light rounded-2xl p-4 cursor-pointer transition-all ${
              selected === opt.percent ? 'ring-2 ring-orange-300' : ''
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{opt.desc}</span>
                {selected === opt.percent && (
                  <Check className="w-5 h-5 text-orange-300" />
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-2xl font-medium text-foreground">
                  {opt.title}
                </span>
              </div>
            </div>
          </button>
        ))}
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
                <span className="text-muted-foreground">Rent</span>
                <span className="text-foreground">
                  {/* make changes with adding the rent */}
                  0.5 SOL
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

          {isPending ? 
           <Button
            disabled={isPending}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl disabled:opacity-50"
          >
            Adding Liquidity....
          </Button>
          :
           <Button
           onClick={handleAddLiquidity}
            disabled={!isComplete}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl disabled:opacity-50"
          >
            {!amount0 ? "Enter an amount" : "Add Liquidity"}
          </Button>}
        </div>
    </main>
  )
}
