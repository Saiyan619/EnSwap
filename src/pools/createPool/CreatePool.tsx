import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown, Info, AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"
import BackgroundGlow from "@/global/BackgroundGlow"
import Navbar from "@/global/Navbar"
import { TokenSelectModal } from "@/swap/components/TokenSelectModal"
import { Token } from "@/lib/data"
import { useInitializePool } from "@/program-hooks/initializePool"
import { Spinner } from "@/components/ui/spinner"
import { useAllTokens } from "@/program-hooks/allToken"

const feeTiers = [
  { value: 0.01, label: "0.01%", description: "Best for stable pairs" },
  { value: 0.05, label: "0.05%", description: "Best for stable pairs" },
  { value: 0.3, label: "0.3%", description: "Best for most pairs" },
  { value: 1, label: "1%", description: "Best for exotic pairs" },
]

export default function CreatePoolPage() {
  const {initializeNewPool, isPending} = useInitializePool();
  const {tokens, isLoading} = useAllTokens();
  const [token0, setToken0] = useState<Token | null>(null)
  const [token1, setToken1] = useState<Token | null>(null)
  const [selectedFee, setSelectedFee] = useState(0.3)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectingFor, setSelectingFor] = useState<0 | 1>(0)

  const openTokenModal = (position: 0 | 1) => {
    setSelectingFor(position)
    setModalOpen(true)
  }

  const handleTokenSelect = (token: Token) => {
    if (selectingFor === 0) {
      if (token.symbol === token1?.symbol) {
        setToken1(token0)
      }
      setToken0(token)
    } else {
      if (token.symbol === token0?.symbol) {
        setToken0(token1)
      }
      setToken1(token)
    }
    setModalOpen(false)
  }

  const isComplete = token0 && token1

  const handleInitializePool = ()=>{
    if (!token0?.mint || !token1?.mint) {
      throw new Error("token is not available!");
      
    }
    const proposedPool = {
      mintAddA: token0?.mint.toString(),
      mintAddB: token1?.mint.toString(),
      fee: selectedFee
    }

    initializeNewPool(proposedPool);

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
          <h1 className="text-2xl font-bold text-foreground">Initialize New Pool</h1>
        </div>

        {/* Info banner */}
        <div className="glass-light rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium mb-1">Creating a new pool</p>
            <p className="text-sm text-muted-foreground">
              This pool does not exist yet. You will be the first liquidity provider and will set the starting price.
            </p>
          </div>
        </div>

        {/* Main card */}
        <div className="glass rounded-3xl p-6 space-y-6">
          {/* Select tokens */}
          <div>
            <label className="text-sm text-muted-foreground mb-3 block">Select pair</label>
            <div className="flex gap-3">
              <button
                onClick={() => openTokenModal(0)}
                className="flex-1 glass-light rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                {token0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs">
                      <img className="w-8" src={token0.logoURI} alt="icon" />
                    </span>
                    <span className="font-semibold text-foreground">{token0.symbol}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select token</span>
                )}
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => openTokenModal(1)}
                className="flex-1 glass-light rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                {token1 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs">
                      <img className="w-8" src={token1.logoURI} alt="icon" />
                    </span>
                    <span className="font-semibold text-foreground">{token1.symbol}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select token</span>
                )}
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Fee tier */}
          <div>
            <label className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              Fee tier
              <Info className="w-4 h-4" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {feeTiers.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => setSelectedFee(tier.value)}
                  className={`glass-light rounded-xl p-4 text-left transition-all ${
                    selectedFee === tier.value ? "border-primary bg-primary/10" : "hover:border-primary/30"
                  }`}
                >
                  <div className="font-semibold text-foreground mb-1">{tier.label}</div>
                  <div className="text-xs text-muted-foreground">{tier.description}</div>
                </button>
              ))}
            </div>
          </div>

          {
            isPending ?

              <Button 
           className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl disabled:opacity-50"
          size="sm" variant="outline" disabled>
      <Spinner />
      Submit
    </Button>
             
          :
<Button
          onClick={handleInitializePool}
            disabled={!isComplete}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl disabled:opacity-50"
          >
            {!token0 || !token1 ? "Select tokens"  : "Initialize Pool"}
          </Button>
          }
         
        
        </div>
      </div>

      <TokenSelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tokens={tokens}
        onSelect={handleTokenSelect}
        selectedToken={selectingFor === 0 ? token0 || tokens[0] : token1 || tokens[1]}
      />
    </main>
  )
}
