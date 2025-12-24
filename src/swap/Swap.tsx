import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Settings2, Info, Check } from "lucide-react";
import { TokenInput } from "./components/TokenInput";
import { TokenSelectModal } from "./components/TokenSelectModal";
import { useAllTokens, useSwapQuote } from "@/program-hooks/allToken";
import { useSwap } from "@/program-hooks/swap";
import { Skeleton } from "@/components/ui/skeleton";

export function SwapCard() {
  const { tokens, isLoading } = useAllTokens();
  const { swapToken, isPending } = useSwap();
  // claude already gave you the solution for the bug in your rust code check claude when you get back on.

  // Initialize with undefined, set once tokens load
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"from" | "to">("from");
  const [slippage, setSlippage] = useState(0.5); // Default 0.5% slippage
  const [showSettings, setShowSettings] = useState(false);
  // Set initial tokens when they load
  useEffect(() => {
    if (tokens.length >= 2 && !fromToken && !toToken) {
      setFromToken(tokens[0]);
      setToToken(tokens[1]);
    }
  }, [tokens, fromToken, toToken]);

  // Use swap quote with slippage - only call when tokens are available
  const swapQuote = useSwapQuote(
    fromToken?.mint ?? null,
    toToken?.mint ?? null,
    parseFloat(fromAmount) || 0,
    slippage // Pass user's slippage preference
  );

  // Update toAmount based on swap quote
  useEffect(() => {
    if (swapQuote.isValid && fromAmount) {
      setToAmount(swapQuote.outputAmount.toFixed(6));
    } else if (!fromAmount) {
      setToAmount("");
    }
  }, [swapQuote.outputAmount, swapQuote.isValid, fromAmount]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleTokenSelect = (token: (typeof tokens)[0]) => {
    if (selectingFor === "from") {
      if (token.symbol === toToken?.symbol) {
        setToToken(fromToken);
      }
      setFromToken(token);
    } else {
      if (token.symbol === fromToken?.symbol) {
        setFromToken(toToken);
      }
      setToToken(token);
    }
    setModalOpen(false);
  };

  const openTokenModal = (type: "from" | "to") => {
    setSelectingFor(type);
    setModalOpen(true);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // toAmount will be updated by the useEffect watching swapQuote
  };

  const swap = () => {
    if (!fromToken || !toToken || !swapQuote.isValid) return;

    const swapData = {
      amount_in: parseFloat(fromAmount),
      min_amount_out: swapQuote.minimumReceived, // Already includes slippage protection
      mintAddressSrc: fromToken.mint.toString(), // Convert PublicKey to string
      mintAddressDestination: toToken.mint.toString(), // Convert PublicKey to string
    };

    console.log("Swap Data:", swapData);
    swapToken(swapData);
  };

  // Format spot price for display
  const formatSpotPrice = (price: number) => {
    if (price === 0) return "0";
    if (price < 0.0001) {
      // Show inverse for very small prices
      const inversePrice = 1 / price;
      return `1 ${toToken.symbol} = ${inversePrice.toFixed(2)} ${fromToken.symbol}`;
    }
    return `1 ${fromToken.symbol} = ${price.toFixed(6)} ${toToken.symbol}`;
  };

  // Show loading state
  if (isLoading || !fromToken || !toToken) {
    return (
      // <div className="w-full max-w-md">
      //   <div className="glass rounded-3xl p-4">
      //     <p className="text-center text-muted-foreground">Loading tokens...</p>
      //   </div>
      // </div>

      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] sm:w-[450px] rounded-xl" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-[125px] w-[250px] sm:w-[450px] rounded-xl" />
          <Skeleton className="mt-4 w-[450px] h-[70px] sm:h-[125px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-1/2">
      <div className="">
        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Swap</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Slippage Settings */}
        {showSettings && (
          <div className="glass-light rounded-2xl p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-3">
              Slippage Tolerance
            </p>
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
            {slippage > 1 && (
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                High slippage tolerance may result in unfavorable rates
              </p>
            )}
          </div>
        )}

        {/* Swap card */}
        <div className="glass rounded-3xl p-4 space-y-2">
          {/* From token */}
          <TokenInput
            label="You pay"
            token={fromToken}
            amount={fromAmount}
            supply=""
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
            mint=""
            supply=""
            onAmountChange={setToAmount}
            onTokenClick={() => openTokenModal("to")}
            readOnly
          />

          {/* Swap details */}
          {fromAmount && swapQuote.isValid && (
            <div className="glass-light rounded-2xl p-3 space-y-2 mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Rate
                  <Info className="w-3.5 h-3.5" />
                </span>
                <span className="text-foreground text-xs">
                  {formatSpotPrice(swapQuote.spotPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price Impact</span>
                <span
                  className={
                    swapQuote.priceImpact > 5
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                >
                  {swapQuote.priceImpact < 0.01
                    ? "<0.01%"
                    : `${swapQuote.priceImpact.toFixed(2)}%`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Minimum Received</span>
                <span className="text-foreground">
                  {swapQuote.minimumReceived.toFixed(6)} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Fee ({slippage}% slippage)
                </span>
                <span className="text-foreground">
                  {swapQuote.fee?.toFixed(6) || "0"} {fromToken.symbol}
                </span>
              </div>
            </div>
          )}

          {/* High price impact warning */}
          {swapQuote.priceImpact > 5 && fromAmount && (
            <div className="glass-light rounded-xl p-3 border border-red-500/20">
              <p className="text-xs text-red-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                High price impact! Consider reducing your swap amount.
              </p>
            </div>
          )}

          {/* Swap button */}
          <Button
            className="w-full h-14 text-lg font-semibold bg-amber-500 hover:bg-amber-600 text-primary-foreground rounded-2xl mt-3 disabled:opacity-50"
            disabled={!fromAmount || !swapQuote.isValid || isPending}
            onClick={swap}
          >
            {isPending
              ? "Swapping..."
              : !fromAmount
                ? "Enter an amount"
                : "Swap"}
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
    </div>
  );
}
