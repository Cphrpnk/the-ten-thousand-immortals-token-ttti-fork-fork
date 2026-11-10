import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import type { DepositEntry, DepositTracking, MyBtcDeposits } from "../backend";
import { useConnectedWallet } from "./useConnectedWallet";
import { useInternetIdentity } from "./useInternetIdentity";
import {
  useBtcWalletDepositsFor,
  useMyBtcDeposits,
  useWalletBtcDeposits,
} from "./useQueries";

/** A BTC deposit that has just been delivered (TTTI-T) or refunded (ckBTC). */
export interface DepositAlert {
  /** Stable identity of the event; one alert per id, ever. */
  id: string;
  type: "delivered" | "refunded";
  /** TTTI-T base units when delivered, ckBTC satoshis when refunded. */
  amount: bigint;
}

type DepositSourceId = "my" | "wallet" | "for";

interface AlertStore {
  /** Sources already observed once for this principal (silent baseline). */
  sources: DepositSourceId[];
  /** Alert ids already shown or silently marked as seen. */
  seen: string[];
}

const STORE_PREFIX = "ttti.depositAlerts.v1.";
const MAX_SEEN = 500;

function isStore(value: unknown): value is AlertStore {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<AlertStore>;
  return (
    Array.isArray(candidate.sources) &&
    Array.isArray(candidate.seen) &&
    candidate.seen.every((id) => typeof id === "string")
  );
}

/** Reads the principal's marks; the in-memory copy covers a blocked storage. */
function readStore(
  principal: string,
  fallback: Map<string, AlertStore>,
): AlertStore {
  try {
    const raw = window.localStorage.getItem(STORE_PREFIX + principal);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isStore(parsed)) return parsed;
    }
  } catch {
    // Storage unavailable or corrupt: use the in-memory copy.
  }
  return fallback.get(principal) ?? { sources: [], seen: [] };
}

function writeStore(
  principal: string,
  store: AlertStore,
  fallback: Map<string, AlertStore>,
) {
  const trimmed: AlertStore = {
    sources: store.sources,
    seen: store.seen.slice(-MAX_SEEN),
  };
  fallback.set(principal, trimmed);
  try {
    window.localStorage.setItem(
      STORE_PREFIX + principal,
      JSON.stringify(trimmed),
    );
  } catch {
    // Storage unavailable: the in-memory copy still prevents repeats.
  }
}

function alertOf(
  tracking: DepositTracking,
  entry: DepositEntry,
): DepositAlert | null {
  const key = `${tracking.kind}:${tracking.btcAddress}:${entry.index}`;
  switch (entry.stage.__kind__) {
    case "delivered":
      return {
        id: `${key}:delivered`,
        type: "delivered",
        amount: entry.tttiDelivered,
      };
    case "refunded":
      return {
        id: `${key}:refunded`,
        type: "refunded",
        amount: entry.refundedSats,
      };
    default:
      return null;
  }
}

function terminalAlerts(trackings: DepositTracking[]): DepositAlert[] {
  const alerts: DepositAlert[] = [];
  for (const tracking of trackings) {
    // Oldest first, so several events of one pass are announced in order.
    for (const entry of [...tracking.deposits].reverse()) {
      const alert = alertOf(tracking, entry);
      if (alert) alerts.push(alert);
    }
  }
  return alerts;
}

function trackingsOfMy(
  data: MyBtcDeposits | undefined,
): DepositTracking[] | undefined {
  if (!data) return undefined;
  const list: DepositTracking[] = [];
  if (data.purchase) list.push(data.purchase);
  if (data.wallet) list.push(data.wallet);
  return list;
}

/**
 * Watches one source of deposit trackings for `principal`. The first time a
 * source is read for a principal, already final deposits are marked seen
 * without an alert; afterwards each newly delivered or refunded deposit is
 * reported once.
 */
function useSourceAlerts(
  principal: string | undefined,
  sourceId: DepositSourceId,
  trackings: DepositTracking[] | undefined,
  marks: MutableRefObject<Map<string, AlertStore>>,
  onAlert: (alert: DepositAlert) => void,
) {
  useEffect(() => {
    if (!principal || !trackings) return;
    const store = readStore(principal, marks.current);
    const events = terminalAlerts(trackings);

    if (!store.sources.includes(sourceId)) {
      const known = new Set(store.seen);
      for (const event of events) known.add(event.id);
      writeStore(
        principal,
        { sources: [...store.sources, sourceId], seen: [...known] },
        marks.current,
      );
      return;
    }

    const fresh = events.filter((event) => !store.seen.includes(event.id));
    if (fresh.length === 0) return;
    writeStore(
      principal,
      {
        sources: store.sources,
        seen: [...store.seen, ...fresh.map((e) => e.id)],
      },
      marks.current,
    );
    for (const event of fresh) onAlert(event);
  }, [principal, sourceId, trackings, marks, onAlert]);
}

/**
 * Reports BTC deposits of the signed-in user (and of the connected external
 * wallet) that become delivered or refunded, once per event. Marks are kept
 * per principal in the browser; nothing is shared between users.
 */
export function useDepositAlerts(onAlert: (alert: DepositAlert) => void) {
  const { identity } = useInternetIdentity();
  const wallet = useConnectedWallet();
  const identityPrincipal = identity?.getPrincipal();
  const identityText =
    identityPrincipal && !identityPrincipal.isAnonymous()
      ? identityPrincipal.toText()
      : undefined;
  const walletPrincipal = wallet.principal ?? undefined;
  const walletText = walletPrincipal?.toText();
  const marks = useRef<Map<string, AlertStore>>(new Map());

  const mine = useMyBtcDeposits();
  const signed = useWalletBtcDeposits(true);
  const walletOnly = useBtcWalletDepositsFor(walletPrincipal);

  const myTrackings = useMemo(() => trackingsOfMy(mine.data), [mine.data]);
  const signedTrackings = useMemo(
    () => trackingsOfMy(signed.data),
    [signed.data],
  );
  const walletOnlyTrackings = useMemo(
    () =>
      walletOnly.data === undefined
        ? undefined
        : walletOnly.data
          ? [walletOnly.data]
          : [],
    [walletOnly.data],
  );

  // Signing out clears the in-memory copy; the stored marks stay per principal.
  useEffect(() => {
    if (!identityText && !walletText) marks.current.clear();
  }, [identityText, walletText]);

  useSourceAlerts(identityText, "my", myTrackings, marks, onAlert);
  useSourceAlerts(walletText, "wallet", signedTrackings, marks, onAlert);
  useSourceAlerts(walletText, "for", walletOnlyTrackings, marks, onAlert);
}
