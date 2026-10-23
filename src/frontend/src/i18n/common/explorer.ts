import { defineDict } from "../core/dict";

/**
 * Explorer link tooltips shared by every page (components/ExplorerLink.tsx and
 * the pages that render block, txid, address and canister links). Explorer
 * names, URLs and identifiers stay unchanged in every language.
 */
export const EXPLORER_TEXT = defineDict({
  en: {
    viewOnIcpDashboard: "View on the ICP Dashboard",
    trackOnMempool: "Track live on mempool.space",
    viewBlockInHistory: "View block in History",
    addressOnMempool: "Deposit address on mempool.space",
    viewCanisterOnIcpDashboard: "View canister on the ICP Dashboard",
    newTab: "opens in a new tab",
  },
  fr: {
    viewOnIcpDashboard: "Voir sur l'ICP Dashboard",
    trackOnMempool: "Suivre en direct sur mempool.space",
    viewBlockInHistory: "Voir le bloc dans l'historique",
    addressOnMempool: "Adresse de dépôt sur mempool.space",
    viewCanisterOnIcpDashboard: "Voir le canister sur l'ICP Dashboard",
    newTab: "s'ouvre dans un nouvel onglet",
  },
  es: {
    viewOnIcpDashboard: "Ver en el ICP Dashboard",
    trackOnMempool: "Seguir en directo en mempool.space",
    viewBlockInHistory: "Ver el bloque en el historial",
    addressOnMempool: "Dirección de depósito en mempool.space",
    viewCanisterOnIcpDashboard: "Ver el canister en el ICP Dashboard",
    newTab: "se abre en una pestaña nueva",
  },
  "zh-Hans": {
    viewOnIcpDashboard: "在 ICP Dashboard 上查看",
    trackOnMempool: "在 mempool.space 上实时跟踪",
    viewBlockInHistory: "在历史记录中查看区块",
    addressOnMempool: "mempool.space 上的存款地址",
    viewCanisterOnIcpDashboard: "在 ICP Dashboard 上查看 canister",
    newTab: "在新标签页中打开",
  },
  "pt-BR": {
    viewOnIcpDashboard: "Ver no ICP Dashboard",
    trackOnMempool: "Acompanhar ao vivo no mempool.space",
    viewBlockInHistory: "Ver o bloco no histórico",
    addressOnMempool: "Endereço de depósito no mempool.space",
    viewCanisterOnIcpDashboard: "Ver o canister no ICP Dashboard",
    newTab: "abre em uma nova aba",
  },
  ko: {
    viewOnIcpDashboard: "ICP Dashboard에서 보기",
    trackOnMempool: "mempool.space에서 실시간 추적",
    viewBlockInHistory: "기록에서 블록 보기",
    addressOnMempool: "mempool.space의 입금 주소",
    viewCanisterOnIcpDashboard: "ICP Dashboard에서 canister 보기",
    newTab: "새 탭에서 열림",
  },
  "pa-Guru": {
    viewOnIcpDashboard: "ICP Dashboard 'ਤੇ ਵੇਖੋ",
    trackOnMempool: "mempool.space 'ਤੇ ਲਾਈਵ ਟ੍ਰੈਕ ਕਰੋ",
    viewBlockInHistory: "ਇਤਿਹਾਸ ਵਿੱਚ ਬਲਾਕ ਵੇਖੋ",
    addressOnMempool: "mempool.space 'ਤੇ ਜਮ੍ਹਾਂ ਪਤਾ",
    viewCanisterOnIcpDashboard: "ICP Dashboard 'ਤੇ canister ਵੇਖੋ",
    newTab: "ਨਵੀਂ ਟੈਬ ਵਿੱਚ ਖੁੱਲ੍ਹਦਾ ਹੈ",
  },
});

export type ExplorerText = (typeof EXPLORER_TEXT)["en"];
