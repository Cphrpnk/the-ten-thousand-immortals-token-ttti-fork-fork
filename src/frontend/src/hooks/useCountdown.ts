import { useEffect, useState } from "react";
import { nowNs } from "../lib/approvals";

const NS_PER_SECOND = 1_000_000_000n;
const SECONDS_PER_MINUTE = 60n;
const SECONDS_PER_HOUR = 3_600n;
const SECONDS_PER_DAY = 86_400n;

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target timestamp is now or in the past. */
  reached: boolean;
}

function split(targetNs: bigint | undefined, now: bigint): Countdown {
  if (targetNs === undefined || targetNs <= now) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, reached: true };
  }
  // Round up so the display shows 0:00:01 until the last second has passed.
  const total = (targetNs - now + NS_PER_SECOND - 1n) / NS_PER_SECOND;
  return {
    days: Number(total / SECONDS_PER_DAY),
    hours: Number((total % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Number((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: Number(total % SECONDS_PER_MINUTE),
    reached: false,
  };
}

/**
 * Remaining time until `targetNs` (nanoseconds since the epoch), split into
 * days, hours, minutes and seconds. Ticks every second while the target is in
 * the future and clears its interval on unmount or once the target is reached.
 */
export function useCountdown(targetNs: bigint | undefined): Countdown {
  const [now, setNow] = useState<bigint>(() => nowNs());

  useEffect(() => {
    setNow(nowNs());
    if (targetNs === undefined || targetNs <= nowNs()) return;
    const id = window.setInterval(() => {
      const current = nowNs();
      setNow(current);
      if (current >= targetNs) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetNs]);

  return split(targetNs, now);
}
