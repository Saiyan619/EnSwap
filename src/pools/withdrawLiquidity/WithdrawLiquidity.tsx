import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, Wallet, Info, Check } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import BackgroundGlow from "@/global/BackgroundGlow"
import Navbar from "@/global/Navbar"
import { useGetSinglePool } from "@/program-hooks/getPools"
import { useWithdrawLiquidity } from "@/program-hooks/withdrawLiquidity"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { getAccount, getAssociatedTokenAddressSync, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token"

export default function WithdrawLiquidityPage() {
  const { poolId } = useParams()
  const { data: pool } = useGetSinglePool(poolId)
  const { withdrawNewLiquidity, isPending } = useWithdrawLiquidity()
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [lpTokenAmount, setLpTokenAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [userLpBalance, setUserLpBalance] = useState(0)
  const [estimatedAmountA, setEstimatedAmountA] = useState(0)
  const [estimatedAmountB, setEstimatedAmountB] = useState(0)
  const [totalLpSupply, setTotalLpSupply] = useState(0)
  // Fetch user's LP token balance
  useEffect(() => {
    const fetchLpBalance = async () => {
      if (!pool || !publicKey) return
      try {
         const lpMintInfo = await getMint(connection, pool.lpMint)
      const totalSupply = Number(lpMintInfo.supply) / Math.pow(10, lpMintInfo.decimals)
             // Get user's LP token account (contains user's balance)
      const userLpTokenAccount = await getAssociatedTokenAddressSync(
        pool.lpMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      )
      
      const userLpAccount = await getAccount(connection, userLpTokenAccount)
      const balance = Number(userLpAccount.amount) / Math.pow(10, lpMintInfo.decimals)
      
      setUserLpBalance(balance)
      setTotalLpSupply(totalSupply) 
      } catch (error) {
        console.log("No LP tokens found")
        setUserLpBalance(0)
      }
    }
    fetchLpBalance()
  }, [pool, publicKey, connection])

  // Calculate estimated withdrawals
  useEffect(() => {
    if (!pool || !lpTokenAmount || isNaN(parseFloat(lpTokenAmount))) {
      setEstimatedAmountA(0)
      setEstimatedAmountB(0)
      return
    }

    const lpAmount = parseFloat(lpTokenAmount)
    // Calculate proportional share
    // const shareOfPool = lpAmount / Number(totalLpSupply)
    // Estimated amounts user will receive
    const estimatedA = (lpAmount * pool.reserves.formattedBalanceA) / totalLpSupply
  const estimatedB = (lpAmount * pool.reserves.formattedBalanceB) / totalLpSupply
    setEstimatedAmountA(estimatedA)
    setEstimatedAmountB(estimatedB)
  }, [lpTokenAmount, pool])

  const handleWithdraw = () => {
    if (!pool || !lpTokenAmount) return

    const lpAmount = parseFloat(lpTokenAmount)
    
    // Calculate minimum amounts with slippage protection
    const minAmountA = estimatedAmountA * (1 - slippage / 100)
    const minAmountB = estimatedAmountB * (1 - slippage / 100)

    const data = {
      lp_tokens: lpAmount,
      min_amount_a: minAmountA,
      min_amount_b: minAmountB,
      mint_a: pool.mintA,
      mint_b: pool.mintB,
    }

    console.log("Withdraw data:", data)
    withdrawNewLiquidity(data)
  }

  const setPercentage = (percent: number) => {
    const amount = (userLpBalance * percent) / 100
    setLpTokenAmount(amount.toString())
  }

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

  const withdrawPercentage = userLpBalance > 0 
    ? (parseFloat(lpTokenAmount || "0") / userLpBalance) * 100 
    : 0

  return (
    <main className="relative min-h-screen">
      <BackgroundGlow />
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Header */}
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
              {pool.tokenA.symbol}/{pool.tokenB.symbol} · 0.3% fee tier
            </p>
          </div>
        </div>

        {/* Your Position Summary */}
        <div className="glass-light rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src={pool.tokenA.logoURI} alt="token" className="w-8 h-8 rounded-full bg-secondary" />
                <img src={pool.tokenB.logoURI} alt="token" className="w-8 h-8 rounded-full bg-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Your LP Tokens</p>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{userLpBalance.toFixed(6)}</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-6 space-y-6">
          {/* LP Token Input */}
          <div>
            <label className="text-sm text-muted-foreground mb-3 block">LP Tokens to Burn</label>
            <div className="glass-light rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-sm text-muted-foreground">
                  Balance: {userLpBalance.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={lpTokenAmount}
                  onChange={(e) => setLpTokenAmount(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setLpTokenAmount(userLpBalance.toString())}
                  className="text-xs"
                >
                  MAX
                </Button>
              </div>
              
              {/* Quick percentage buttons */}
              <div className="flex gap-2 mt-4">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setPercentage(percent)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                      Math.abs(withdrawPercentage - percent) < 1
                        ? "bg-amber-500 text-white"
                        : "glass-light text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slippage Settings */}
          <div>
            <label className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              Slippage Protection
              <Info className="w-4 h-4" />
            </label>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0, 3.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`flex-1 px-3 py-2 rounded-xl transition-all ${
                    slippage === value
                      ? "bg-amber-500 text-white font-medium"
                      : "glass-light text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {slippage === value && <Check className="w-4 h-4" />}
                    {value}%
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* You Will Receive */}
          {lpTokenAmount && parseFloat(lpTokenAmount) > 0 && (
            <>
              <div>
                <label className="text-sm text-muted-foreground mb-3 block">You will receive (estimated)</label>
                <div className="space-y-3">
                  <div className="glass-light rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={pool.tokenA.logoURI} alt="token" className="w-8 h-8 rounded-full" />
                      <span className="font-medium text-foreground">{pool.tokenA.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{Number(estimatedAmountA.toFixed(6))}</p>
                      <p className="text-sm text-muted-foreground">
                        Min: {(estimatedAmountA * (1 - slippage / 100)).toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <div className="glass-light rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={pool.tokenB.logoURI} alt="token" className="w-8 h-8 rounded-full" />
                      <span className="font-medium text-foreground">{pool.tokenB.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{estimatedAmountB.toFixed(6)}</p>
                      <p className="text-sm text-muted-foreground">
                        Min: {(estimatedAmountB * (1 - slippage / 100)).toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Summary */}
              <div className="glass-light rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">LP Tokens to Burn</span>
                  <span className="font-semibold text-foreground">{parseFloat(lpTokenAmount).toFixed(6)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Share of Pool</span>
                  <span className="text-foreground">{withdrawPercentage.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Slippage Tolerance</span>
                  <span className="text-foreground">{slippage}%</span>
                </div>
              </div>
            </>
          )}

          {/* Warning for 100% withdrawal */}
          {withdrawPercentage >= 99 && lpTokenAmount && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400 font-medium">Removing all liquidity</p>
                <p className="text-sm text-amber-400/80">
                  You will close this position entirely and stop earning fees.
                </p>
              </div>
            </div>
          )}

          {/* Withdraw Button */}
          <Button
            onClick={handleWithdraw}
            disabled={!lpTokenAmount || parseFloat(lpTokenAmount) <= 0 || isPending}
            className="w-full h-14 text-lg font-semibold bg-amber-500 hover:bg-amber-600 text-primary-foreground rounded-2xl disabled:opacity-50"
          >
            {isPending 
              ? "Withdrawing..." 
              : !lpTokenAmount || parseFloat(lpTokenAmount) <= 0
              ? "Enter LP token amount"
              : `Remove Liquidity`}
          </Button>
        </div>
      </div>
    </main>
  )
}