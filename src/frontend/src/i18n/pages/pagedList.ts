import { defineDict } from "../core/dict";

/**
 * Page-by-page loading of the public DEX lists (swap history, transfers and
 * other cursor-paged lists). English is authoritative. Counts are passed in
 * already formatted for the active language.
 */
export const PAGED_LIST_TEXT = defineDict({
  en: {
    loadMore: "Load more",
    loading: "Loading…",
    loadingMore: "Loading more…",
    noMoreResults: "No more results",
    empty: "Nothing to show yet.",
    loadError: "The list could not be loaded.",
    loadMoreError: "More results could not be loaded.",
    retry: "Retry",
    showing: (count: string) => `Showing ${count}`,
  },
  fr: {
    loadMore: "Charger plus",
    loading: "Chargement…",
    loadingMore: "Chargement de la suite…",
    noMoreResults: "Plus aucun résultat",
    empty: "Rien à afficher pour le moment.",
    loadError: "La liste n’a pas pu être chargée.",
    loadMoreError: "La suite n’a pas pu être chargée.",
    retry: "Réessayer",
    showing: (count: string) => `${count} affichés`,
  },
  es: {
    loadMore: "Cargar más",
    loading: "Cargando…",
    loadingMore: "Cargando más…",
    noMoreResults: "No hay más resultados",
    empty: "Todavía no hay nada que mostrar.",
    loadError: "No se pudo cargar la lista.",
    loadMoreError: "No se pudieron cargar más resultados.",
    retry: "Reintentar",
    showing: (count: string) => `Mostrando ${count}`,
  },
  "zh-Hans": {
    loadMore: "加载更多",
    loading: "加载中…",
    loadingMore: "正在加载更多…",
    noMoreResults: "没有更多结果",
    empty: "暂无内容。",
    loadError: "无法加载列表。",
    loadMoreError: "无法加载更多结果。",
    retry: "重试",
    showing: (count: string) => `已显示 ${count} 项`,
  },
  "pt-BR": {
    loadMore: "Carregar mais",
    loading: "Carregando…",
    loadingMore: "Carregando mais…",
    noMoreResults: "Não há mais resultados",
    empty: "Nada para mostrar por enquanto.",
    loadError: "Não foi possível carregar a lista.",
    loadMoreError: "Não foi possível carregar mais resultados.",
    retry: "Tentar novamente",
    showing: (count: string) => `Exibindo ${count}`,
  },
  ko: {
    loadMore: "더 보기",
    loading: "불러오는 중…",
    loadingMore: "더 불러오는 중…",
    noMoreResults: "더 이상 결과가 없습니다",
    empty: "아직 표시할 내용이 없습니다.",
    loadError: "목록을 불러오지 못했습니다.",
    loadMoreError: "추가 결과를 불러오지 못했습니다.",
    retry: "다시 시도",
    showing: (count: string) => `${count}개 표시 중`,
  },
  "pa-Guru": {
    loadMore: "ਹੋਰ ਲੋਡ ਕਰੋ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
    loadingMore: "ਹੋਰ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
    noMoreResults: "ਹੋਰ ਨਤੀਜੇ ਨਹੀਂ ਹਨ",
    empty: "ਹਾਲੇ ਦਿਖਾਉਣ ਲਈ ਕੁਝ ਨਹੀਂ ਹੈ।",
    loadError: "ਸੂਚੀ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ।",
    loadMoreError: "ਹੋਰ ਨਤੀਜੇ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    showing: (count: string) => `${count} ਦਿਖਾਏ ਜਾ ਰਹੇ ਹਨ`,
  },
});

/** English text of the admin lists (admin screens stay in English). */
export const ADMIN_PAGED_LIST_TEXT = {
  loadMore: "Load more",
  loading: "Loading…",
  loadingMore: "Loading more…",
  noMoreResults: "No more results",
  empty: "Nothing to show yet.",
  loadError: "The list could not be loaded.",
  loadMoreError: "More results could not be loaded.",
  retry: "Retry",
  showing: (count: string) => `Showing ${count}`,
} as const;

/** English text of the reserve-check alert and its progress (admin). */
export const RESERVE_ALERT_TEXT = {
  title: "Reserve check alert",
  accountsCompared: (compared: string, toCompare: string) =>
    `${compared} of ${toCompare} accounts compared`,
  raisedAt: (date: string) => `Raised ${date}`,
  runLabel: (runId: string) => `Run #${runId}`,
  alertId: (id: string) => `Alert #${id}`,
  progressTitle: "Reserve check progress",
  progressRunning: "A reserve check is running.",
  progressIdle: "No reserve check is running.",
  progressInProgress: (batch: string, totalBatches: string) =>
    `In progress (batch ${batch} of ${totalBatches})`,
  progressFinished: "Finished",
  progressIdleBadge: "Idle",
  checkInProgress: (batch: string, totalBatches: string) =>
    `Reserve check in progress (batch ${batch} of ${totalBatches}). The result is final once every batch is read.`,
  excludedTitle: "Excluded accounts daily re-read",
  excludedActive: "Re-reading",
  excludedIdle: "Idle",
  excludedRead: (read: string, total: string) =>
    `Read ${read} of ${total} excluded accounts`,
  excludedReincluded: (count: string) => `Re-included: ${count}`,
  excludedUnreadable: (count: string) => `Unreadable: ${count}`,
  excludedBatchSize: (size: string) => `Batch size ${size}`,
  excludedStarted: (date: string) => `Started ${date}`,
  excludedLastBatch: (date: string) => `Last batch ${date}`,
  excludedLastFinished: (date: string) => `Last finished ${date}`,
  excludedNextRun: (date: string) => `Next run ${date}`,
  excludedNever: "Never",
  excludedNote:
    "A non-zero balance re-includes an excluded account at once, in the check and in the sweep.",
  batchSize: (size: string) => `Batch size ${size}`,
  excludedZero: (count: string) => `Excluded at zero: ${count}`,
  unreadable: (count: string) => `Unreadable: ${count}`,
  lastBatch: (date: string) => `Last batch ${date}`,
  runAgain: "Run the reserve check again",
} as const;

/** English text of the DEX sweep progress (admin). */
export const SWEEP_PROGRESS_TEXT = {
  title: "Sweep progress",
  running: "A sweep is running.",
  idle: "No sweep is running.",
  runLabel: (runId: string) => `Run #${runId}`,
  batches: (count: string) => `${count} batches`,
  batchSize: (size: string) => `Batch size ${size}`,
  startedAt: (date: string) => `Started ${date}`,
  lastBatch: (date: string) => `Last batch ${date}`,
  tokenDone: "Done",
  tokenPending: "In progress",
  listed: "Accounts listed",
  read: "Accounts read",
  withBalance: "With a balance",
  excludedZero: "Excluded at zero",
  skipped: "Skipped",
  unreadable: "Unreadable",
  inFlight: "In flight",
} as const;
