import type { ReactNode } from "react";
import type { PoolView } from "../../backend";
import { useDexPools } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DexAccordion, DexAccordionGroup } from "./DexAccordion";
import {
  AllActivity,
  AllConcentration,
  AllLiquidity,
  AllReserves,
  PerPoolList,
} from "./IndicatorsAll";
import { poolDepthText, removalLabel, swapClosedText } from "./PoolRow";
import {
  ActivityBody,
  ConcentrationBody,
  DepthBody,
  FeesBody,
  type Lang,
  LiquidityBody,
  Muted,
  type PoolItem,
  ReservesBody,
  Row,
  type Text,
  UnlockBody,
  pairLabel,
} from "./indicatorParts";
import { thresholdText } from "./liquidityFormat";

/** Depth, swap threshold, swap state and removal state of one pool. */
function StateBody({ t, view }: { t: Text; view: PoolView | undefined }) {
  const tp = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  if (!view) return <Muted>{t.unavailable}</Muted>;
  const closed = swapClosedText(tp, view, lang);
  return (
    <div className="flex flex-col gap-2">
      <dl className="flex flex-col gap-1.5">
        <Row label={tp.depthLabel}>{poolDepthText(tp, view)}</Row>
        <Row label={tp.thresholdLabel}>{thresholdText(tp, view)}</Row>
        <Row label={tp.swapStateLabel}>
          {view.swapState.open ? tp.swapStateOpen : tp.swapStateClosed}
        </Row>
        <Row label={tp.removalTitle}>{removalLabel(tp, view, lang)}</Row>
      </dl>
      {closed && <p className="text-xs text-muted-foreground">{closed}</p>}
    </div>
  );
}

type BlockDef = {
  key: string;
  title: string;
  note?: string;
  one: (item: PoolItem) => ReactNode;
  all: (items: PoolItem[]) => ReactNode;
};

/** One indicators widget: pool dropdown plus one closed accordion per block. */
export function IndicatorsWidget({
  t,
  lang,
  items,
  selected,
  onSelect,
}: {
  t: Text;
  lang: Lang;
  items: PoolItem[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const tp = useDict(DEX_TEXT);
  const pools = useDexPools();
  const viewOf = (item: PoolItem) =>
    (pools.data ?? []).find((v) => v.id === item.p.poolId);
  const current = items.find((i) => i.p.poolId.toString() === selected);
  const currentView = current ? viewOf(current) : undefined;
  const isOpen = currentView?.swapState.open ?? current?.p.isOpen ?? false;
  const value = current ? selected : "all";
  const blocks: BlockDef[] = [
    {
      key: "state",
      title: `${tp.depthLabel} · ${tp.thresholdLabel} · ${tp.swapStateLabel}`,
      one: (item) => <StateBody t={t} view={viewOf(item)} />,
      all: (list) => (
        <PerPoolList
          items={list}
          render={(item) => <StateBody t={t} view={viewOf(item)} />}
        />
      ),
    },
    {
      key: "reserves",
      title: t.reservesTitle,
      one: (item) => <ReservesBody t={t} item={item} />,
      all: (list) => <AllReserves t={t} items={list} />,
    },
    {
      key: "depth",
      title: t.depthTitle,
      note: t.depthNote,
      one: (item) => <DepthBody t={t} item={item} />,
      all: (list) => (
        <PerPoolList
          items={list}
          render={(item) => <DepthBody t={t} item={item} />}
        />
      ),
    },
    {
      key: "liquidity",
      title: t.liquidityTitle,
      one: (item) => <LiquidityBody t={t} item={item} />,
      all: (list) => <AllLiquidity t={t} items={list} />,
    },
    {
      key: "unlock",
      title: t.unlockTitle,
      one: (item) => <UnlockBody t={t} item={item} />,
      all: (list) => (
        <PerPoolList
          items={list}
          render={(item) => <UnlockBody t={t} item={item} />}
        />
      ),
    },
    {
      key: "concentration",
      title: t.concentrationTitle,
      one: (item) => <ConcentrationBody t={t} item={item} />,
      all: (list) => <AllConcentration t={t} items={list} />,
    },
    {
      key: "activity",
      title: t.activityTitle,
      one: (item) => <ActivityBody t={t} item={item} />,
      all: (list) => <AllActivity t={t} items={list} />,
    },
    {
      key: "fees",
      title: t.feesTitle,
      one: (item) => <FeesBody t={t} item={item} lang={lang} />,
      all: (list) => (
        <PerPoolList
          items={list}
          render={(item) => <FeesBody t={t} item={item} lang={lang} />}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-ocid="pools.indicators.widget">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span
            className="text-sm text-muted-foreground"
            id="pools-indicators-pool-label"
          >
            {t.poolSelectLabel}
          </span>
          <Select value={value} onValueChange={onSelect}>
            <SelectTrigger
              className="token-select min-w-[12rem]"
              aria-labelledby="pools-indicators-pool-label"
              data-ocid="pools.indicators.pool_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allPools}</SelectItem>
              {items.map((item) => (
                <SelectItem
                  key={item.p.poolId.toString()}
                  value={item.p.poolId.toString()}
                >
                  {pairLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
        {current && (
          <span
            className="pool-status"
            data-status={isOpen ? "open" : "filling"}
          >
            {isOpen ? t.open : t.closed}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="border-y border-border py-4 text-sm text-muted-foreground">
          {t.notComputedHint}
        </p>
      ) : (
        <DexAccordionGroup>
          {blocks.map((b) => (
            <DexAccordion
              key={b.key}
              label={b.title}
              ocid={`pools.indicators.block.${b.key}`}
            >
              {b.note && (
                <p className="text-xs text-muted-foreground">{b.note}</p>
              )}
              {current ? b.one(current) : b.all(items)}
            </DexAccordion>
          ))}
        </DexAccordionGroup>
      )}
    </div>
  );
}
