import { Token } from "@/lib/data";
import { ChevronDown } from "lucide-react";

interface TokenInputProps {
  label: string;
  token: Token;
  amount: string;
  supply: string;
  mint: string;
  onAmountChange: (value: string) => void;
  onTokenClick: () => void;
  readOnly?: boolean;
}

export function TokenInput({
  label,
  token,
  amount,
  mint,
  onAmountChange,
  onTokenClick,
  readOnly = false,
}: TokenInputProps) {
  return (
    <div className="glass-light rounded-2xl p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">Mint: {mint}</span>
        {/* <span className="text-sm text-muted-foreground">Balance: {token.balance}</span> */}
      </div>
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          readOnly={readOnly}
          className="flex-1 bg-transparent text-3xl font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none w-0"
        />
        <button
          onClick={onTokenClick}
          className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary px-3 py-2 rounded-2xl transition-colors shrink-0"
        >
          <span className="text-xl">
            <img className="w-8" src={token?.logoURI} alt="icon" />
          </span>
          <span className="font-semibold text-foreground">{token?.symbol}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      {amount && (
        <div className="mt-2 text-sm text-muted-foreground">
          ~$
          {(
            Number.parseFloat(amount || "0") *
            (token?.symbol === "ETH" ? 1850 : 1)
          ).toLocaleString()}
        </div>
      )}
    </div>
  );
}
