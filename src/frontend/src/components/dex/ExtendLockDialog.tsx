import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { PositionView } from "../../backend";
import { useExtendLock } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { nowNs } from "../../lib/approvals";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { formatDexDate } from "./dexFormat";
import { extendLockErrorText, parseDaysNs } from "./liquidityFormat";

const NS_PER_MS = 1_000_000n;
const pad = (n: number) => n.toString().padStart(2, "0");

/** Local yyyy-mm-dd of a nanosecond timestamp. */
function toDateInput(ns: bigint): string {
  const d = new Date(Number(ns / NS_PER_MS));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local date, at the time of day of `timeOf`, in nanoseconds. */
function fromDateInput(text: string, timeOf: bigint): bigint | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) return null;
  const ref = new Date(Number(timeOf / NS_PER_MS));
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    ref.getHours(),
    ref.getMinutes(),
    ref.getSeconds(),
  );
  const ms = d.getTime();
  return Number.isNaN(ms) ? null : BigInt(ms) * NS_PER_MS;
}

/** Move a position's unlock later: never earlier, at most maxLockNs from now. */
export function ExtendLockDialog({
  position,
  maxLockNs,
  onClose,
}: {
  position: PositionView;
  maxLockNs: bigint;
  onClose: () => void;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const extend = useExtendLock();
  const [mode, setMode] = useState<"date" | "days">("days");
  const [dateText, setDateText] = useState("");
  const [daysText, setDaysText] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "info" | "danger";
    text: string;
  } | null>(null);
  const [now] = useState(() => nowNs());

  const current = position.unlockAt;
  const latest = now + maxLockNs;
  const days = parseDaysNs(daysText);
  const next =
    mode === "date"
      ? fromDateInput(dateText, current)
      : days !== null
        ? current + days
        : null;
  const tooEarly = next !== null && next <= current;
  const tooLate = next !== null && next > latest;
  const valid = next !== null && !tooEarly && !tooLate;
  const pending = extend.isPending;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || next === null || pending) return;
    setFeedback(null);
    extend.mutate(
      { positionId: position.id, newUnlockAt: next },
      {
        onSuccess: (outcome) =>
          setFeedback(
            outcome.__kind__ === "ok"
              ? {
                  tone: "info",
                  text: t.extendDone(formatDexDate(outcome.ok.unlockAt, lang)),
                }
              : {
                  tone: "danger",
                  text: extendLockErrorText(t, outcome.err, lang),
                },
          ),
        onError: (err) =>
          setFeedback({ tone: "danger", text: t.errCall(err.message) }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="pools.extend.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            {t.extendTitle(formatNumber(position.id))}
          </DialogTitle>
          <DialogDescription>
            {t.extendCurrent(formatDexDate(current, lang))}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex gap-2">
            {(["days", "date"] as const).map((m) => (
              <Button
                key={m}
                type="button"
                size="sm"
                variant={mode === m ? "default" : "outline"}
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                disabled={pending}
                data-ocid={`pools.extend.mode_${m}.toggle`}
              >
                {m === "days" ? t.extendModeDays : t.extendModeDate}
              </Button>
            ))}
          </div>
          {mode === "date" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="dex-extend-date">{t.extendDateLabel}</Label>
              <Input
                id="dex-extend-date"
                type="date"
                value={dateText}
                min={toDateInput(current)}
                max={toDateInput(latest)}
                onChange={(e) => setDateText(e.target.value)}
                disabled={pending}
                aria-invalid={tooEarly || tooLate}
                data-ocid="pools.extend.date.input"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="dex-extend-days">{t.extendDaysLabel}</Label>
              <Input
                id="dex-extend-days"
                value={daysText}
                onChange={(e) => setDaysText(e.target.value)}
                inputMode="decimal"
                autoComplete="off"
                className="font-mono tabular-nums"
                disabled={pending}
                aria-invalid={tooEarly || tooLate}
                data-ocid="pools.extend.days.input"
              />
            </div>
          )}
          <div className="text-xs tabular-nums" aria-live="polite">
            {tooEarly ? (
              <p
                className="text-destructive"
                data-ocid="pools.extend.field_error"
              >
                {t.extendTooEarly}
              </p>
            ) : tooLate ? (
              <p
                className="text-destructive"
                data-ocid="pools.extend.field_error"
              >
                {t.extendTooLate(formatDexDate(latest, lang))}
              </p>
            ) : next !== null ? (
              <p>{t.extendNewUnlock(formatDexDate(next, lang))}</p>
            ) : null}
          </div>

          <div aria-live="polite">
            {pending && (
              <p
                className="callout-info flex items-center gap-2 px-3 py-2 text-sm text-foreground"
                data-ocid="pools.extend.loading_state"
              >
                <Loader2
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                {t.extending}
              </p>
            )}
            {!pending && feedback && (
              <p
                className={`${feedback.tone === "info" ? "callout-info text-foreground" : "callout-danger"} px-3 py-2 text-sm break-words`}
                data-ocid={
                  feedback.tone === "info"
                    ? "pools.extend.success_state"
                    : "pools.extend.error_state"
                }
              >
                {feedback.text}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
              className="min-h-11"
              data-ocid="pools.extend.cancel_button"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!valid || pending}
              className="min-h-11"
              data-ocid="pools.extend.confirm_button"
            >
              {pending ? t.extending : t.confirmExtend}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
