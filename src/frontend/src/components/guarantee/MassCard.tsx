import type { Principal } from "@icp-sdk/core/principal";
import type { GuaranteeMassView } from "../../backend";
import { useDict, useLanguage } from "../../i18n/core";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import {
  canRedeem,
  formatTokenQuantity,
  formatTttiQuantity,
  formatUsdValue,
} from "../../lib/guarantee";
import { PAY_TOKENS } from "../../lib/token";
import { FiatAmount, type FiatToken } from "../FiatAmount";
import { ExcessWithdraw } from "./ExcessWithdraw";
import { RedeemPanel } from "./RedeemPanel";

interface MassCardProps {
  mass: GuaranteeMassView;
  owner: Principal | undefined;
  /** 1-based position of the mass, used in data-ocid markers. */
  index: number;
}

function Stat({
  label,
  value,
  note,
  ocid,
  accent = false,
  fiatToken,
  fiatAmount,
}: {
  label: string;
  value: string;
  note?: string;
  fiatToken?: FiatToken;
  fiatAmount?: bigint;
  ocid: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`break-words font-mono text-lg tabular-nums ${accent ? "text-primary" : ""}`}
        data-ocid={ocid}
      >
        {value}
        {fiatToken !== undefined && (
          <FiatAmount
            token={fiatToken}
            amount={fiatAmount}
            className="ml-1.5"
            ocid={`${ocid}.fiat`}
          />
        )}
      </dd>
      {note && <dd className="text-xs text-muted-foreground">{note}</dd>}
    </div>
  );
}

/** One personal mass: figures, redeem control and excess withdrawal. */
export function MassCard({ mass, owner, index }: MassCardProps) {
  const t = useDict(GUARANTEE_TEXT);
  const { lang } = useLanguage();
  const symbol = PAY_TOKENS[mass.token].symbol;
  const ocid = `guarantee.mass.${index}`;

  return (
    <article
      className="flex flex-col gap-6 rounded-lg border border-border bg-card p-5 md:p-6"
      aria-labelledby={`${ocid}-title`}
      data-ocid={`${ocid}.card`}
    >
      <h2
        id={`${ocid}-title`}
        className="font-display text-xl tracking-wide md:text-2xl"
      >
        {t.massHeading(symbol)}
      </h2>

      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Stat
          label={t.remainingTtti}
          value={formatTttiQuantity(mass.remainingTtti, lang)}
          note={`${t.totalTtti}: ${formatTttiQuantity(mass.totalTtti, lang)}`}
          ocid={`${ocid}.remaining_ttti`}
          fiatToken="ttti"
          fiatAmount={mass.remainingTtti}
          accent
        />
        <Stat
          label={t.remainingGuarantee}
          value={formatTokenQuantity(mass.remainingGuarantee, mass.token, lang)}
          note={`${t.totalGuarantee}: ${formatTokenQuantity(mass.totalGuarantee, mass.token, lang)}`}
          ocid={`${ocid}.remaining_guarantee`}
          fiatToken={mass.token}
          fiatAmount={mass.remainingGuarantee}
        />
        <Stat
          label={t.valueLabel}
          value={formatUsdValue(mass.guaranteeValueUsdE8, lang)}
          note={
            mass.guaranteeValueUsdE8 === undefined
              ? t.valueUnavailable
              : undefined
          }
          ocid={`${ocid}.value`}
        />
        <Stat
          label={t.excessLabel}
          value={formatTokenQuantity(mass.withdrawableExcess, mass.token, lang)}
          ocid={`${ocid}.excess`}
          fiatToken={mass.token}
          fiatAmount={mass.withdrawableExcess}
        />
      </dl>

      <div className="border-t border-border pt-6">
        {canRedeem(mass) ? (
          <RedeemPanel mass={mass} owner={owner} index={index} />
        ) : (
          <p
            className="text-sm text-muted-foreground"
            data-ocid={`${ocid}.nothing_remaining`}
          >
            {t.errNothingRemaining}
          </p>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <ExcessWithdraw mass={mass} index={index} />
      </div>
    </article>
  );
}
