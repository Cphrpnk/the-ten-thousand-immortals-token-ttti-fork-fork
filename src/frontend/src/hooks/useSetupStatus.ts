import { SetupStatus } from "../backend";
import type { SetupOutcome } from "../backend";
import { useInternetIdentity } from "./useInternetIdentity";
import { useGetMySetupStatus, useSetMySetupStatus } from "./useQueries";

export interface SetupStatusState {
  /** Text of the signed-in principal, or null when signed out. */
  principalText: string | null;
  /** Current status; signed-out visitors always read notStarted. */
  status: SetupStatus;
  /** True until the signed-in user's status has been fetched once. */
  isLoading: boolean;
  /** Persist #completed or #skipped for the signed-in user. */
  saveOutcome: (outcome: SetupOutcome) => Promise<void>;
  isSaving: boolean;
}

/** The guided wallet setup status of the signed-in principal. */
export function useSetupStatus(): SetupStatusState {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const principalText =
    principal && !principal.isAnonymous() ? principal.toText() : null;

  const query = useGetMySetupStatus(principalText);
  const mutation = useSetMySetupStatus(principalText);

  return {
    principalText,
    status: principalText
      ? (query.data?.status ?? SetupStatus.notStarted)
      : SetupStatus.notStarted,
    isLoading: !!principalText && !query.isFetched,
    saveOutcome: async (outcome) => {
      if (!principalText) return;
      await mutation.mutateAsync(outcome);
    },
    isSaving: mutation.isPending,
  };
}
