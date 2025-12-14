import { useState } from "react"
import { Wallet, Settings, MoreHorizontal } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

const navItems = [
  { label: "Swap", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Pool", href: "/pool" },
]

export default function Navbar() {
  const [connected, setConnected] = useState(false)

  return (
    <header className="glass sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <span className="text-black font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-foreground">EnSwapp</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50"}
              >
                {item.label}
              </Link>
            ))}
            <button className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 flex items-center gap-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
                  <WalletMultiButton />

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
