import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Token } from "@/lib/data"

interface TokenSelectModalProps {
  open: boolean
  onClose: () => void
  tokens: Token[]
  onSelect: (token: Token) => void
  selectedToken: Token
}

export function TokenSelectModal({ open, onClose, tokens, onSelect, selectedToken }: TokenSelectModalProps) {
  const [search, setSearch] = useState("")

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase()),
  )

  const popularTokens = tokens.slice(0, 4)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-foreground">Select a token</DialogTitle>
            {/* <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button> */}
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or paste address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 h-12 rounded-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Popular tokens */}
          <div className="flex flex-wrap gap-2">
            {popularTokens?.map((token) => (
              <button
                key={token.symbol}
                onClick={() => onSelect(token)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                  selectedToken?.symbol === token?.symbol
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30 bg-secondary/30"
                }`}
              >
                <span className="text-base">
                  <img className="w-8" src={token.logoURI} alt="icon" />
                  </span>
                <span className="text-sm font-medium text-foreground">{token.symbol}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Token list */}
          <div className="space-y-1 max-h-72 overflow-y-auto -mx-4 px-4">
            {filteredTokens?.map((token) => (
              <button
                key={token.symbol}
                onClick={() => onSelect(token)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  selectedToken?.symbol === token?.symbol ? "bg-primary/10" : "hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                     <img className="w-8" src={token.logoURI} alt="icon" />
                    </span>
                  <div className="text-left">
                    <div className="font-medium text-foreground">{token.symbol}</div>
                    <div className="text-sm text-muted-foreground">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  {/* <div className="font-medium text-foreground">{token.balance}</div> */}
                  {/* <div className="text-sm text-muted-foreground">
                    $
                    {(
                      Number.parseFloat(token.balance.replace(/,/g, "")) *
                      (token.symbol === "ETH" ? 1850 : token.symbol === "WBTC" ? 43000 : 1)
                    ).toLocaleString()}
                  </div> */}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
