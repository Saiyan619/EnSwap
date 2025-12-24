import { MoreHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"


const navItems = [
  { label: "Swap", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Pool", href: "/pool" },
]

export function Dropdown() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" aria-label="Open menu" size="sm">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuGroup>
              {navItems.map((item) => (
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
               <Link
                            key={item.label}
                            to={item.href}
                            className={"px-2 py-1 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50"}
                          >
                            {item.label}
                          </Link>
            </DropdownMenuItem>
                         
                        ))}
           
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}