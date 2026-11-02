import { useState } from "react";
import { useDict, useLanguage } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { nowNs } from "../../lib/approvals";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { formatDexDate } from "./dexFormat";
import { DAY_NS, lockBoundText, parseDaysNs } from "./liquidityFormat";

type PresetKey =
  | "lockPreset3m"
  | "lockPreset2y"
  | "lockPreset3y"
  | "lockPreset4y"
  | "lockPreset5y";

// The 3-month preset is the configured minimum and the 5-year preset the
// configured maximum (days: null); the others are whole 365-day years.
const PRESETS: ReadonlyArray<{ key: PresetKey; days: bigint | "min" | "max" }> =
  [
    { key: "lockPreset3m", days: "min" },
    { key: "lockPreset2y", days: 730n },
    { key: "lockPreset3y", days: 1095n },
    { key: "lockPreset4y", days: 1460n },
    { key: "lockPreset5y", days: "max" },
  ];

/** Optional lock: none by default (0), presets up to 5 years, or a custom number of days. */
export function LockDurationPicker({
  minNs,
  maxNs,
  disabled,
  onChange,
}: {
  minNs: bigint;
  maxNs: bigint;
  disabled: boolean;
  onChange: (lockNs: bigint | null) => void;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const [choice, setChoice] = useState<PresetKey | "none" | "custom">("none");
  const [daysText, setDaysText] = useState("");
  const [lockNs, setLockNs] = useState<bigint | null>(0n);

  const select = (next: PresetKey | "none" | "custom", ns: bigint | null) => {
    setChoice(next);
    setLockNs(ns);
    onChange(ns);
  };

  const onCustom = (text: string) => {
    setDaysText(text);
    const ns = parseDaysNs(text);
    const valid = ns !== null && ns >= minNs && ns <= maxNs ? ns : null;
    setLockNs(valid);
    onChange(valid);
  };

  const presetNs = (days: bigint | "min" | "max"): bigint => {
    if (days === "min") return minNs;
    if (days === "max") return maxNs;
    const ns = days * DAY_NS;
    return ns < minNs ? minNs : ns > maxNs ? maxNs : ns;
  };

  const customInvalid =
    choice === "custom" && daysText.trim() !== "" && lockNs === null;

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">{t.lockPickerLabel}</legend>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={choice === "none" ? "default" : "outline"}
          aria-pressed={choice === "none"}
          onClick={() => select("none", 0n)}
          data-ocid="pools.add.lock_none.toggle"
        >
          {t.lockNone}
        </Button>
        {PRESETS.map(({ key, days }) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={choice === key ? "default" : "outline"}
            aria-pressed={choice === key}
            onClick={() => select(key, presetNs(days))}
            data-ocid={`pools.add.lock_${key.slice(10).toLowerCase()}.toggle`}
          >
            {t[key]}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant={choice === "custom" ? "default" : "outline"}
          aria-pressed={choice === "custom"}
          onClick={() => {
            setChoice("custom");
            onCustom(daysText);
          }}
          data-ocid="pools.add.lock_custom.toggle"
        >
          {t.lockCustom}
        </Button>
      </div>
      {choice === "custom" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dex-lock-days">{t.lockCustomDays}</Label>
          <Input
            id="dex-lock-days"
            value={daysText}
            onChange={(e) => onCustom(e.target.value)}
            inputMode="decimal"
            autoComplete="off"
            className={cn("font-mono tabular-nums")}
            aria-invalid={customInvalid}
            data-ocid="pools.add.lock_days.input"
          />
          {customInvalid && (
            <p
              className="text-xs text-destructive"
              data-ocid="pools.add.lock_days.field_error"
            >
              {t.lockInvalid(lockBoundText(t, minNs), lockBoundText(t, maxNs))}
            </p>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {t.lockHint(lockBoundText(t, minNs), lockBoundText(t, maxNs))}
      </p>
      {lockNs === 0n && (
        <p
          className="text-xs text-muted-foreground"
          data-ocid="pools.add.lock_none.hint"
        >
          {t.lockNoneHint}
        </p>
      )}
      {lockNs !== null && lockNs > 0n && (
        <p
          className="text-xs tabular-nums"
          data-ocid="pools.add.lock_unlock.preview"
        >
          {t.unlockOn(formatDexDate(nowNs() + lockNs, lang))}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{t.lockEnforced}</p>
    </fieldset>
  );
}
