import { useState } from "react";
import { useDict, useLanguage } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { nowNs } from "../../lib/approvals";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { formatDexDate } from "./dexFormat";
import { DAY_NS, durationText, parseDaysNs } from "./liquidityFormat";

type PresetKey =
  | "lockPreset1d"
  | "lockPreset7d"
  | "lockPreset30d"
  | "lockPreset90d"
  | "lockPreset1y"
  | "lockPreset5y";

const PRESETS: ReadonlyArray<{ key: PresetKey; days: bigint | null }> = [
  { key: "lockPreset1d", days: 1n },
  { key: "lockPreset7d", days: 7n },
  { key: "lockPreset30d", days: 30n },
  { key: "lockPreset90d", days: 90n },
  { key: "lockPreset1y", days: 365n },
  // 5 years = the contract maximum.
  { key: "lockPreset5y", days: null },
];

/** Lock duration: presets from 24 h to 5 years, or a custom number of days. */
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
  const [choice, setChoice] = useState<PresetKey | "custom">("lockPreset30d");
  const [daysText, setDaysText] = useState("");
  const [lockNs, setLockNs] = useState<bigint | null>(30n * DAY_NS);

  const select = (next: PresetKey | "custom", ns: bigint | null) => {
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

  const customInvalid =
    choice === "custom" && daysText.trim() !== "" && lockNs === null;

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">{t.lockLabel}</legend>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ key, days }) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={choice === key ? "default" : "outline"}
            aria-pressed={choice === key}
            onClick={() => select(key, days === null ? maxNs : days * DAY_NS)}
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
              {t.lockInvalid(durationText(t, minNs), durationText(t, maxNs))}
            </p>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {t.lockHint(durationText(t, minNs), durationText(t, maxNs))}
      </p>
      {lockNs !== null && (
        <p className="text-xs tabular-nums">
          {t.unlockOn(formatDexDate(nowNs() + lockNs, lang))}
        </p>
      )}
    </fieldset>
  );
}
