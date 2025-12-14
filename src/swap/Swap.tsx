import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Settings2, Info } from "lucide-react"
import { TokenInput } from "./components/TokenInput"
import { TokenSelectModal } from "./components/TokenSelectModal"

const tokens = [
  { symbol: "USDT", name: "Tether coin", icon: "⟠", balance: "1.234", price: 1850, mint:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS" },
  { symbol: "USDC", name: "USD Coin", icon: "💲", balance: "5,000.00", price: 1, mint:"Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr" },
  // { symbol: "WBTC", name: "Wrapped Bitcoin", icon: "₿", balance: "0.05" },
  // { symbol: "DAI", name: "Dai Stablecoin", icon: "◈", balance: "2,500.00" },
  // { symbol: "LINK", name: "Chainlink", icon: "⬡", balance: "150.00" },
  // { symbol: "UNI", name: "Uniswap", icon: "🦄", balance: "75.00" },
]

export function SwapCard() {
  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectingFor, setSelectingFor] = useState<"from" | "to">("from")

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleTokenSelect = (token: (typeof tokens)[0]) => {
    if (selectingFor === "from") {
      if (token.symbol === toToken.symbol) {
        setToToken(fromToken)
      }
      setFromToken(token)
    } else {
      if (token.symbol === fromToken.symbol) {
        setFromToken(toToken)
      }
      setToToken(token)
    }
    setModalOpen(false)
  }

  const openTokenModal = (type: "from" | "to") => {
    setSelectingFor(type)
    setModalOpen(true)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (value && !isNaN(Number.parseFloat(value))) {
      const rate = 1850
      setToAmount((Number.parseFloat(value) * rate).toFixed(2))
    } else {
      setToAmount("")
    }
  }

  return (
    <>
      <div className="w-full max-w-md">
        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Swap</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Swap card */}
        <div className="glass rounded-3xl p-4 space-y-2">
          {/* From token */}
          <TokenInput
            label="You pay"
            token={fromToken}
            amount={fromAmount}
            mint=""
            onAmountChange={handleFromAmountChange}
            onTokenClick={() => openTokenModal("from")}
          />

          {/* Swap button */}
          <div className="relative flex justify-center -my-2 z-10">
            <button
              onClick={handleSwapTokens}
              className="glass-light p-2 rounded-xl border border-border/50 hover:border-primary/50 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowDown className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* To token */}
          <TokenInput
            label="You receive"
            token={toToken}
            amount={toAmount}
            onAmountChange={setToAmount}
            onTokenClick={() => openTokenModal("to")}
            readOnly
          />

          {/* Swap details */}
          {fromAmount && toAmount && (
            <div className="glass-light rounded-2xl p-3 space-y-2 mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Rate
                  <Info className="w-3.5 h-3.5" />
                </span>
                <span className="text-foreground">
                  1 {fromToken.symbol} = 1,850 {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price Impact</span>
                <span className="text-emerald-400">{"<0.01%"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="text-foreground">~$2.50</span>
              </div>
            </div>
          )}

          {/* Swap button */}
          <Button
            className="w-full h-14 text-lg font-semibold bg-amber-500 hover:bg-amber-600 text-gray-90 text-primary-foreground rounded-2xl mt-3"
            disabled={!fromAmount || !toAmount}
          >
            {!fromAmount ? "Enter an amount" : "Swap"}
          </Button>
        </div>
      </div>

      <TokenSelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tokens={tokens}
        onSelect={handleTokenSelect}
        selectedToken={selectingFor === "from" ? fromToken : toToken}
      />
    </>
  )
}
