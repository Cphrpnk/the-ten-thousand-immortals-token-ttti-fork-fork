import { AlertCircle, ShieldAlert } from "lucide-react";
import {
  AdminSection,
  type AdminSectionDef,
} from "../components/admin/AdminUi";
import { BuybackFundingCard } from "../components/admin/BuybackFundingCard";
import { CyclesAutonomyCard } from "../components/admin/CyclesAutonomyCard";
import { CyclesReserveCard } from "../components/admin/CyclesReserveCard";
import { DexIndicatorsCard } from "../components/admin/DexIndicatorsCard";
import { DexPairsCard } from "../components/admin/DexPairsCard";
import { DexReserveCheckCard } from "../components/admin/DexReserveCheckCard";
import { HistoryCard } from "../components/admin/HistoryCard";
import { LaunchControls } from "../components/admin/LaunchControls";
import { OverviewCard } from "../components/admin/OverviewCard";
import { ProtocolLiquidityCard } from "../components/admin/ProtocolLiquidityCard";
import { RoutedSwapsCard } from "../components/admin/RoutedSwapsCard";
import { SnapshotExport } from "../components/admin/SnapshotExport";
import { ToReviewCard } from "../components/admin/ToReviewCard";
import { TokenRatesCard } from "../components/admin/TokenRatesCard";
import { TreasurySection } from "../components/admin/TreasurySection";
import { UpgradeReadinessCard } from "../components/admin/UpgradeReadinessCard";
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
import { useIsCallerAdmin } from "../hooks/useQueries";

const SECTIONS: ReadonlyArray<AdminSectionDef> = [
  { id: "overview", title: "Overview" },
  { id: "sales", title: "Sales & rate" },
  { id: "treasury", title: "Treasury" },
  { id: "cycles", title: "Cycles" },
  { id: "review", title: "To review" },
  { id: "history", title: "History" },
  { id: "buyback", title: "Buyback funding" },
  { id: "dex", title: "DEX" },
  { id: "snapshot", title: "Snapshot export" },
];

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
            rates, set the receiving wallets, review transfers, or export the
            balance snapshot.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function SectionNav() {
  return (
    <nav
      aria-label="Admin sections"
      className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur"
      data-ocid="admin.section_nav"
    >
      <ol className="flex gap-1 overflow-x-auto whitespace-nowrap">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="admin-nav-link"
              data-ocid={`admin.nav.${s.id}`}
            >
              <span className="font-mono text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AdminPage() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

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

  const n = (id: string) => SECTIONS.findIndex((s) => s.id === id) + 1;
  const t = (id: string) => SECTIONS.find((s) => s.id === id)?.title ?? id;

  return (
    <div
      className="mx-auto flex max-w-6xl flex-col gap-8"
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
          Supply, sales, receiving wallets, transfers to review, history, DEX
          and the balance snapshot.
        </p>
      </header>

      <SectionNav />

      <div className="space-y-16">
        <AdminSection index={n("overview")} id="overview" title={t("overview")}>
          <OverviewCard />
        </AdminSection>

        <AdminSection
          index={n("sales")}
          id="sales"
          title={t("sales")}
          note="Pause or resume sales, upgrade readiness and the hourly token rates."
        >
          <div className="space-y-10">
            <LaunchControls />
            <UpgradeReadinessCard />
            <TokenRatesCard />
          </div>
        </AdminSection>

        <AdminSection
          index={n("treasury")}
          id="treasury"
          title={t("treasury")}
          note="Receiving wallet, one-time settlement and fee account per payment token."
        >
          <TreasurySection />
        </AdminSection>

        <AdminSection
          index={n("cycles")}
          id="cycles"
          title={t("cycles")}
          note="Current cycles status, autonomy and the ICP reserve."
        >
          <div className="space-y-10">
            <CyclesAutonomyCard />
            <CyclesReserveCard />
          </div>
        </AdminSection>

        <AdminSection
          index={n("review")}
          id="review"
          title={t("review")}
          note="Transfers whose outcome stays unknown after 23 h and payments to refund."
        >
          <ToReviewCard />
        </AdminSection>

        <AdminSection
          index={n("history")}
          id="history"
          title={t("history")}
          note="Every admin-relevant transfer, newest first, 25 per page."
        >
          <HistoryCard />
        </AdminSection>

        <AdminSection index={n("buyback")} id="buyback" title={t("buyback")}>
          <BuybackFundingCard />
        </AdminSection>

        <AdminSection
          index={n("dex")}
          id="dex"
          title={t("dex")}
          note="Pairs, indicators, reserve check, protocol liquidity, routed swaps and router fees."
        >
          <div className="space-y-10">
            <DexPairsCard />
            <DexIndicatorsCard />
            <DexReserveCheckCard />
            <ProtocolLiquidityCard />
            <RoutedSwapsCard />
          </div>
        </AdminSection>

        <AdminSection index={n("snapshot")} id="snapshot" title={t("snapshot")}>
          <SnapshotExport />
        </AdminSection>
      </div>
    </div>
  );
}
