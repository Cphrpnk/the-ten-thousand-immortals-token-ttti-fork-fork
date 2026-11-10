import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { RemainderChoice } from "../backend";
import { AuctionEmpty } from "../components/auction/AuctionEmpty";
import { AuctionSummary } from "../components/auction/AuctionSummary";
import { BidForm } from "../components/auction/BidForm";
import { ClosedAuctions } from "../components/auction/ClosedAuctions";
import { MyBalances } from "../components/auction/MyBalances";
import { MyBids } from "../components/auction/MyBids";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useAuctionView, useAuctionViewSync } from "../hooks/useAuction";
import { useCountdown } from "../hooks/useCountdown";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { LAYOUT_TEXT } from "../i18n/common/layout";
import { useDict } from "../i18n/core";
import { AUCTION_TEXT } from "../i18n/pages/auction";

/** Sealed-bid auction of the returned TTTI-T: summary, offer form, own offers. */
export function AuctionPage() {
  const t = useDict(AUCTION_TEXT);
  const layout = useDict(LAYOUT_TEXT);
  const { identity, login, loginStatus } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const owner = principal && !principal.isAnonymous() ? principal : undefined;
  const view = useAuctionView();
  const [choice, setChoice] = useState<RemainderChoice>(RemainderChoice.pool);
  const countdown = useCountdown(view.data?.closesAt);
  useAuctionViewSync(view.data);

  return (
    <div
      className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 px-4 py-10 md:py-14"
      data-ocid="auction.page"
    >
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl uppercase tracking-[0.25em] md:text-5xl">
          {t.title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{t.intro}</p>
      </header>

      {view.isPending ? (
        <div
          className="flex flex-col gap-4"
          data-ocid="auction.loading_state"
          aria-busy="true"
        >
          <span className="sr-only">{t.loading}</span>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : view.isError || !view.data ? (
        <div
          className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6"
          data-ocid="auction.error_state"
        >
          <p className="callout-danger px-3 py-2 text-sm">{t.loadError}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void view.refetch()}
            className="min-h-11 gap-2"
            data-ocid="auction.retry_button"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t.retryButton}
          </Button>
        </div>
      ) : (
        <>
          {view.data.closingPending && (
            <output
              className="block rounded-md border border-border bg-card px-3 py-2 text-sm"
              data-ocid="auction.closing_pending_state"
            >
              {t.closingPendingNotice}
            </output>
          )}
          {view.data.open ? (
            <AuctionSummary view={view.data} />
          ) : (
            <AuctionEmpty view={view.data} />
          )}
          {owner ? (
            <>
              {view.data.open && (
                <BidForm
                  view={view.data}
                  owner={owner}
                  closed={countdown.reached}
                  choice={choice}
                  onChoiceChange={setChoice}
                />
              )}
              <MyBids view={view.data} />
              <MyBalances />
            </>
          ) : view.data.open ? (
            <div
              className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6"
              data-ocid="auction.signin_state"
            >
              <p className="text-sm text-muted-foreground">{t.signInPrompt}</p>
              <Button
                type="button"
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                className="min-h-11"
                data-ocid="auction.signin_button"
              >
                {layout.signIn}
              </Button>
            </div>
          ) : null}
          <ClosedAuctions />
        </>
      )}
    </div>
  );
}
