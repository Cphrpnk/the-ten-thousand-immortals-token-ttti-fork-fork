import {
  AlertCircle,
  Coins,
  Landmark,
  Lock,
  Percent,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { BuybackFundingCard } from "../components/admin/BuybackFundingCard";
import { ConversionsCard } from "../components/admin/ConversionsCard";
import { CyclesAutonomyCard } from "../components/admin/CyclesAutonomyCard";
import { CyclesReserveCard } from "../components/admin/CyclesReserveCard";
import { DcBatchesCard } from "../components/admin/DcBatchesCard";
import { DexPairsCard } from "../components/admin/DexPairsCard";
import { LaunchControls } from "../components/admin/LaunchControls";
import { MintTreasuryAccounts } from "../components/admin/MintTreasuryAccounts";
import { OwnerDestinationsCard } from "../components/admin/OwnerDestinationsCard";
import { OwnerSendsCard } from "../components/admin/OwnerSendsCard";
import { ProtocolLiquidityCard } from "../components/admin/ProtocolLiquidityCard";
import { SnapshotExport } from "../components/admin/SnapshotExport";
import { ToReviewCard } from "../components/admin/ToReviewCard";
import { TokenRatesCard } from "../components/admin/TokenRatesCard";
import { TransferFeeCard } from "../components/admin/TransferFeeCard";
import { TreasurySweepCard } from "../components/admin/TreasurySweepCard";
import { UpgradeReadinessCard } from "../components/admin/UpgradeReadinessCard";
import { WeeklyAllocationCard } from "../components/admin/WeeklyAllocationCard";
import { GOLD_CARD } from "../components/admin/styles";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  useGetFee,
  useGetFeeCollector,
  useGetMaxSupply,
  useIsCallerAdmin,
  useTokenInfo,
} from "../hooks/useQueries";
import { TTTI_SYMBOL, formatTtti } from "../lib/token";

function toHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function AdminOnlyNotice() {
  return (
    <Card
      className="w-full max-w-2xl mx-auto rounded-lg border-destructive/40 bg-card"
      data-ocid="admin.denied_card"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg text-destructive">
          <ShieldAlert className="h-5 w-5" />
          Admins Only
        </CardTitle>
        <CardDescription>
          Your principal does not have administrator access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" data-ocid="admin.denied_state">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access denied</AlertTitle>
          <AlertDescription>
            Sign in with an administrator identity to pause sales, refresh the
            rates, set the test transfer fee, review the protocol treasury, or
            export the balance snapshot.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function AdminPage() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: tokenInfo, isLoading: isTokenLoading } = useTokenInfo();
  const { data: maxSupply } = useGetMaxSupply();
  const { data: currentFee, isLoading: isFeeLoading } = useGetFee();
  const { data: feeCollector, isLoading: isCollectorLoading } =
    useGetFeeCollector();

  if (isAdminLoading) {
    return (
      <div
        className="w-full max-w-2xl mx-auto space-y-4"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-6" data-ocid="admin.page">
        <AdminOnlyNotice />
      </div>
    );
  }

  const totalSupply = tokenInfo?.totalSupply ?? 0n;
  const supplyCap = maxSupply ?? tokenInfo?.maxSupply ?? 0n;
  const usedPercent =
    supplyCap > 0n ? Number((totalSupply * 10000n) / supplyCap) / 100 : 0;
  const usedPercentText =
    totalSupply > 0n && usedPercent < 0.01
      ? "<0.01%"
      : `${usedPercent.toFixed(2)}%`;

  return (
    <div
      className="mx-auto flex max-w-6xl flex-col gap-12 md:gap-16"
      data-ocid="admin.page"
    >
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-imperial text-gradient-gold text-2xl leading-tight md:text-3xl">
            Admin Panel
          </h1>
          <Badge variant="secondary" className="gap-1 border-gold text-primary">
            <ShieldAlert className="w-3 h-3" />
            Admin
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Pause sales, refresh the rates, set the test transfer fee, review the
          mint treasuries and protocol fees, and export the balance snapshot.
        </p>
      </header>

      <section
        className="grid gap-x-8 gap-y-6 border-t border-border pt-8 sm:grid-cols-3"
        data-ocid="admin.supply_section"
      >
        <StatCard
          icon={<Coins className="w-4 h-4" />}
          label="Total Supply"
          value={
            isTokenLoading ? null : `${formatTtti(totalSupply)} ${TTTI_SYMBOL}`
          }
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Max Supply"
          value={
            isTokenLoading ? null : `${formatTtti(supplyCap)} ${TTTI_SYMBOL}`
          }
        />
        <StatCard
          icon={<Percent className="w-4 h-4" />}
          label="Transfer Fee"
          value={
            isFeeLoading
              ? null
              : `${formatTtti(currentFee ?? 0n)} ${TTTI_SYMBOL}`
          }
        />
      </section>

      <section className="space-y-2" data-ocid="admin.supply_progress">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Supply used</span>
          <span className="font-mono tabular-nums text-primary">
            {usedPercentText}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all"
            style={{ width: `${Math.min(usedPercent, 100)}%` }}
          />
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <Card className={GOLD_CARD} data-ocid="admin.fee_collector_card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Landmark className="w-5 h-5 text-primary" />
              Fee Account
            </CardTitle>
            <CardDescription>
              Collected transfer fees accrue here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol
              className="space-y-1.5 border-l border-border pl-4 text-sm text-muted-foreground"
              data-ocid="admin.delivery_order"
            >
              <li>
                1. New {TTTI_SYMBOL} tokens are minted first, up to the{" "}
                {supplyCap > 0n ? `${formatTtti(supplyCap)} ` : ""}
                {TTTI_SYMBOL} cap.
              </li>
              <li>
                2. Once the cap is reached, collected transfer fees are
                delivered from the fee account.
              </li>
            </ol>
            <p
              className="flex items-center gap-2 text-sm text-foreground"
              data-ocid="admin.fee_account_locked"
            >
              <Lock
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              The fee account cannot be withdrawn by anyone, admin included.
            </p>
            {isCollectorLoading || !feeCollector ? (
              <Skeleton
                className="h-24 w-full"
                data-ocid="admin.fee_collector_loading_state"
              />
            ) : (
              <>
                <SupplyRow
                  label="Balance"
                  value={`${formatTtti(feeCollector.balance)} ${TTTI_SYMBOL}`}
                />
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd
                    className="font-mono break-all"
                    data-ocid="admin.fee_collector_owner"
                  >
                    {feeCollector.account.owner.toText()}
                  </dd>
                  <dt className="text-muted-foreground">Subaccount</dt>
                  <dd className="font-mono break-all">
                    {toHex(feeCollector.account.subaccount) || "Default"}
                  </dd>
                </dl>
              </>
            )}
          </CardContent>
        </Card>
        <CyclesReserveCard />
      </div>

      <LaunchControls />

      <UpgradeReadinessCard />

      <TokenRatesCard />

      <TransferFeeCard />

      <section
        className="space-y-4"
        data-ocid="admin.treasury_accounts_section"
      >
        <div className="space-y-1">
          <h2 className="font-display text-xl">Mint Treasury Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Internal accounts of the contract, one per pay token. The funds they
            held are emptied once to the owner destinations. Former external
            accounts are shown read-only.
          </p>
        </div>
        <MintTreasuryAccounts />
      </section>

      <OwnerDestinationsCard />

      <OwnerSendsCard />

      <TreasurySweepCard />

      <CyclesAutonomyCard />

      <ProtocolLiquidityCard />

      <SnapshotExport />

      <BuybackFundingCard />

      <ToReviewCard className={GOLD_CARD} />

      <ConversionsCard className={GOLD_CARD} />

      <DexPairsCard />

      <WeeklyAllocationCard />

      <DcBatchesCard />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card
      className="surface-open gap-2 rounded-none border-l border-border py-2 pl-4 shadow-none"
      data-ocid="admin.stat_card"
    >
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground [&_svg]:text-primary">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-widest">
            {label}
          </span>
        </div>
        {value === null ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className="text-xl font-semibold tracking-tight font-mono tabular-nums text-foreground">
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SupplyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-l border-border pl-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tracking-tight font-mono tabular-nums">
        {value}
      </p>
    </div>
  );
}
