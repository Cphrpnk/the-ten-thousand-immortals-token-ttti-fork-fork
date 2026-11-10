import type { Principal } from "@icp-sdk/core/principal";
import { useState } from "react";
import type { DexConfig, PairRequestView } from "../../backend";
import { useMyPairRequests, usePairRequests } from "../../hooks/useDex";
import { LAYOUT_TEXT } from "../../i18n/common/layout";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  DexAccordion,
  DexAccordionGroup,
  DexFilterChips,
} from "./DexAccordion";
import { PairRequestForm } from "./PairRequestForm";
import { PairRequestList } from "./PairRequestList";

type RequestFilter = "all" | "mine" | "pending" | "approved" | "refused";

/** Requests section: closed form accordion plus one filterable request list. */
export function PairRequestsSection({
  caller,
  config,
  configError,
  onSignIn,
  signingIn,
}: {
  caller: Principal | undefined;
  config: DexConfig | undefined;
  configError: boolean;
  onSignIn: () => void;
  signingIn: boolean;
}) {
  const t = useDict(DEX_TEXT);
  const layout = useDict(LAYOUT_TEXT);
  const requests = usePairRequests();
  const myRequests = useMyPairRequests(caller?.toText());
  const [chosen, setChosen] = useState<RequestFilter>("all");
  const filter: RequestFilter = !caller && chosen === "mine" ? "all" : chosen;

  const options: Array<{ value: RequestFilter; label: string }> = [
    { value: "all", label: t.filterAll },
    ...(caller ? [{ value: "mine" as const, label: t.myRequestsTitle }] : []),
    { value: "pending", label: t.requestStatusPending },
    { value: "approved", label: t.requestStatusApproved },
    { value: "refused", label: t.filterRejected },
  ];

  const source = filter === "mine" ? myRequests : requests;
  const list: PairRequestView[] | undefined =
    filter === "all" || filter === "mine"
      ? source.data
      : source.data?.filter((r) => r.status.__kind__ === filter);

  return (
    <div className="flex flex-col gap-8">
      <DexAccordionGroup>
        <DexAccordion label={t.requestTitle} ocid="pair_request.form">
          {!caller ? (
            <div
              className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6"
              data-ocid="pair_request.signin_state"
            >
              <p className="text-sm text-muted-foreground">{t.signInNeeded}</p>
              <Button
                type="button"
                onClick={onSignIn}
                disabled={signingIn}
                className="min-h-11"
                data-ocid="pair_request.signin_button"
              >
                {layout.signIn}
              </Button>
            </div>
          ) : config ? (
            <div className="max-w-xl">
              <PairRequestForm config={config} caller={caller} />
            </div>
          ) : configError ? (
            <p
              className="callout-danger px-3 py-2 text-sm"
              data-ocid="pair_request.error_state"
            >
              {t.loadError}
            </p>
          ) : (
            <Skeleton
              className="h-96 rounded-lg"
              data-ocid="pair_request.loading_state"
            />
          )}
        </DexAccordion>
      </DexAccordionGroup>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-xl tracking-wide">
            {t.requestsTitle}
          </h3>
          {requests.data && (
            <span className="font-mono text-xs text-muted-foreground">
              {formatNumber(requests.data.length)}
            </span>
          )}
        </div>
        <DexFilterChips
          label={t.requestsFilterLabel}
          options={options}
          value={filter}
          onChange={setChosen}
          ocid="pair_requests.filter"
        />
        {source.isError ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="pair_requests.error_state"
          >
            {t.loadError}
          </p>
        ) : (
          <PairRequestList
            requests={list}
            loading={source.isPending}
            ocid="pair_requests"
            emptyText={
              filter === "all" ? t.noRequests : t.requestsEmptyFiltered
            }
          />
        )}
      </div>
    </div>
  );
}
