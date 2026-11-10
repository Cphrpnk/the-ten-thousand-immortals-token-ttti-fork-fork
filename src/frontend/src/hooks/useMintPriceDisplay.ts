import { useQuery } from "@tanstack/react-query";
import type { MintPricePreview } from "../backend";
import { formatUsdE8 } from "../lib/token";
import { useActor } from "./useActor";

/**
 * Mint price figures computed by the backend (price per TTTI-T, minimum mint,
 * per-token payment amounts). The frontend only formats them.
 */
export function useMintPriceDisplay() {
  const { actor, isFetching } = useActor();

  return useQuery<MintPricePreview>({
    queryKey: ["mintPricePreview"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMintPricePreview();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** USD e8 amount as a plain number text without the currency symbol. */
export function formatMintUsdE8(usdE8: bigint, maximumFractionDigits = 2) {
  return formatUsdE8(usdE8, maximumFractionDigits).replace("$", "").trim();
}
