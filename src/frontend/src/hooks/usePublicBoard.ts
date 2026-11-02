import { useQuery } from "@tanstack/react-query";
import type {
  CreatorSection,
  CreatorTokenView,
  CyclesSection,
  PermanentLogEntry,
  PermanentSection,
  PublicBoard,
  ReserveCoverage,
} from "../backend";
import { useActor } from "./useActor";

export { PermanentKind } from "../backend";

export type {
  CreatorSection,
  CreatorTokenView,
  CyclesSection,
  PermanentLogEntry,
  PermanentSection,
  PublicBoard,
  ReserveCoverage,
};

export const PUBLIC_BOARD_KEY = ["publicBoard"] as const;

const REFETCH_MS = 60_000;

/**
 * Public board: cycles reserve (balance, pending fee share, coverage in months x 100
 * against the one-year target), permanent liquidity (summary and latest journal entries)
 * and creator holdings per token. Readable without sign-in.
 */
export function usePublicBoard() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicBoard>({
    queryKey: PUBLIC_BOARD_KEY,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPublicBoard();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: REFETCH_MS,
  });
}
