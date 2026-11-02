import { Lock } from "lucide-react";
import {
  useGetFee,
  useGetFeeCollector,
  useGetMaxSupply,
  useTokenInfo,
} from "../../hooks/useQueries";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { TTTI_SYMBOL, encodeAccountText, formatTtti } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { Skeleton } from "../ui/skeleton";
import { AdminStat, RevealText } from "./AdminUi";
import { GOLD_CARD } from "./styles";

function TransferFeeNote() {
  return (
    <div className="space-y-2" data-ocid="admin.fee_fixed">
      <p className="admin-stat-label">Transfer fee</p>
      <p className="text-sm text-muted-foreground">
        {DEX_TEXT.en.adminTransferFeeFixed}
      </p>
    </div>
  );
}

/** Supply, mint progress and the TTTI-T transfer fee in one card. */
export function OverviewCard() {
  const { data: tokenInfo, isLoading: isTokenLoading } = useTokenInfo();
  const { data: maxSupply } = useGetMaxSupply();
  const { data: currentFee, isLoading: isFeeLoading } = useGetFee();
  const { data: collector } = useGetFeeCollector();

  const totalSupply = tokenInfo?.totalSupply ?? 0n;
  const cap = maxSupply ?? tokenInfo?.maxSupply ?? 0n;
  const percent = cap > 0n ? Number((totalSupply * 10000n) / cap) / 100 : 0;
  const percentText =
    totalSupply > 0n && percent < 0.01 ? "<0.01%" : `${percent.toFixed(2)}%`;

  const loading = <Skeleton className="h-6 w-28" />;

  return (
    <div
      className={`${GOLD_CARD} space-y-8 pt-6`}
      data-ocid="admin.overview_card"
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat
          label="Total supply"
          value={
            isTokenLoading ? (
              loading
            ) : (
              <>
                {`${formatTtti(totalSupply)} ${TTTI_SYMBOL}`}{" "}
                <FiatAmount token="ttti" amount={totalSupply} />
              </>
            )
          }
          ocid="admin.total_supply"
        />
        <AdminStat
          label="Max supply"
          value={
            isTokenLoading ? (
              loading
            ) : (
              <>
                {`${formatTtti(cap)} ${TTTI_SYMBOL}`}{" "}
                <FiatAmount token="ttti" amount={cap} />
              </>
            )
          }
          ocid="admin.max_supply"
        />
        <div className="min-w-0 space-y-1.5">
          <p className="admin-stat-label">Mint progress</p>
          <div
            className="admin-stat-value text-primary"
            data-ocid="admin.supply_progress"
          >
            {isTokenLoading ? loading : percentText}
          </div>
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
        <AdminStat
          label="Transfer fee"
          value={
            isFeeLoading
              ? loading
              : `${formatTtti(currentFee ?? 0n)} ${TTTI_SYMBOL}`
          }
          ocid="admin.transfer_fee"
        />
      </div>

      <div className="grid gap-8 border-t border-border pt-6 lg:grid-cols-2">
        <TransferFeeNote />
        <div className="space-y-2 text-sm" data-ocid="admin.fee_collector">
          <p className="admin-stat-label">Transfer fee account</p>
          {collector ? (
            <>
              <p className="font-mono tabular-nums">
                {formatTtti(collector.balance)} {TTTI_SYMBOL}
              </p>
              <RevealText
                text={encodeAccountText(collector.account)}
                label="transfer fee account"
                ocid="admin.fee_collector_account"
                head={18}
                tail={10}
              />
            </>
          ) : (
            <Skeleton className="h-10 w-full" />
          )}
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lock
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            Not withdrawable by anyone. Collected fees are delivered only after
            fresh minting reaches the cap.
          </p>
        </div>
      </div>
    </div>
  );
}
