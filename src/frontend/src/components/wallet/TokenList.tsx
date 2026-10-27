import { useEffect, useRef, useState } from "react";
import type { Account } from "../../backend";
import { PAY_TOKEN_LEDGER_IDS } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { TokenRow } from "./TokenRow";

interface TokenListProps {
  tokens: Array<TokenDescriptor>;
  account: Account | undefined;
  rates: Map<string, bigint | null>;
  onSend: (canisterId: string) => void;
  onReceive: (canisterId: string) => void;
  onHistory: (canisterId: string) => void;
  /** Buyback action of the TTTI-T card. */
  onBuyback?: () => void;
  /** Buy via Onramper, shown on the ICP, ckBTC, ckUSDC and ckUSDT cards. */
  onBuy?: (canisterId: string) => void;
  /** Called with the selected row's canister ID (null when none). */
  onSelect?: (canisterId: string | null) => void;
}

/**
 * Compact token list. One row at a time can be selected to show its Send,
 * Receive and History actions (plus Buy on ICP and the ck tokens, Buyback on
 * TTTI-T); a click outside that row or Escape hides them.
 */
export function TokenList({
  tokens,
  account,
  rates,
  onSend,
  onReceive,
  onHistory,
  onBuyback,
  onBuy,
  onSelect,
}: TokenListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    onSelectRef.current?.(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (selectedId === null) return;
    const handlePointer = (event: PointerEvent) => {
      const rows = listRef.current?.querySelectorAll("[data-token-row]") ?? [];
      const row = Array.from(rows).find(
        (el) => el.getAttribute("data-token-row") === selectedId,
      );
      if (row && event.target instanceof Node && row.contains(event.target)) {
        return;
      }
      setSelectedId(null);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [selectedId]);

  return (
    <ul
      ref={listRef}
      className="flex flex-col gap-1"
      data-ocid="wallet.token.list"
    >
      {tokens.map((token, i) => {
        const id = token.canisterId.toText();
        return (
          <TokenRow
            key={id}
            token={token}
            account={account}
            rateUsdE8={rates.get(id) ?? null}
            index={i + 1}
            selected={selectedId === id}
            onToggle={() =>
              setSelectedId((current) => (current === id ? null : id))
            }
            onSend={() => onSend(id)}
            onReceive={() => onReceive(id)}
            onHistory={() => onHistory(id)}
            onBuyback={onBuyback}
            onBuy={
              onBuy && PAY_TOKEN_LEDGER_IDS.includes(id)
                ? () => onBuy(id)
                : undefined
            }
          />
        );
      })}
    </ul>
  );
}
