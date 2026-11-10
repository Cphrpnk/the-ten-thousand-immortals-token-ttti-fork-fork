const en = {
  // GetIcpFirstPanel
  getIcpAria: "Add ICP",
  getIcpAdd: "Add",
  getIcpAddToBuy: "Add ICP to mint",
  getIcpBuyAria:
    "Buy ICP on Onramper (copies your address, opens in a new tab)",
  getIcpBuy: "Buy ICP",
  getIcpCopyAria: "Copy wallet address",
  getIcpCopied: "Address copied",
  getIcpCopyFailed: "Copy failed — click the address",
  getIcpBalance: (amount: string) => `Balance: ${amount} ICP`,
  // MigrationNotice
  migrationTitle: (symbol: string) =>
    `Your ${symbol} will need to be migrated at launch`,
  migrationBody:
    "Add a wallet address to receive them automatically. You can still buy now without one.",
  migrationStep1Title: "Create a wallet",
  migrationStep1Body: "Open Plug, NNS or OISY and create a wallet.",
  migrationStep2Title: "Copy the correct Principal ID",
  migrationStep2Body:
    "Copy the Principal ID — not the 64-character account ID.",
  migrationStep3Title: "Paste it here",
  migrationStep3Body:
    "Paste it into the delivery address field below and save.",
  opensNewTab: "(opens in a new tab)",
  migrationAdd: "Add address",
  migrationLater: "Later",
  // OrderModeToggle
  orderLegend: "Order amount",
  orderAmountIn: (symbol: string) => `Amount in ${symbol}`,
  orderAmountTtti: "Amount in TTTI-T",
  // PayTokenSelector
  payWith: "Pay with",
  unavailable: "Unavailable",
  // PresaleProgress
  maxSupply: "Maximum supply",
  totalSupply: "Total supply",
  remaining: "Remaining",
  supplyValueNote:
    "USD equivalents use the consolidated TTTI-T price (hourly average).",
  complete: "Complete",
  paused: "Paused",
  live: "Live",
  maxReached: "Maximum supply reached",
  maxReachedBody: (max: string, symbol: string) =>
    `Total supply has reached the maximum supply of ${max} ${symbol}. Purchases are closed.`,
  salesPaused: "Sales are paused",
  pausedBody: "Purchases are temporarily disabled. Please check back soon.",
  totalSupplyPercent: (percent: string) => `Total supply ${percent}%`,
  progressAria: (percent: string) =>
    `Total supply: ${percent}% of the maximum supply`,
  reserved: (amount: string, symbol: string) =>
    `${amount} ${symbol} is reserved by purchases in progress.`,
  // TokenRateCard
  never: "Never",
  noRate: (symbol: string) => `No valid ${symbol}/USD rate for this hour`,
  unavailableUntilRate: (symbol: string) =>
    `Purchases in ${symbol} are unavailable until a rate is set.`,
  oneBuys: (symbol: string) => `1 ${symbol} buys`,
  source: "Source",
  fetched: "Fetched",
  minimum: "Minimum",
  treasury: "Treasury",
  notConfigured: "Not configured",
  treasuryCopied: (symbol: string) => `Treasury ${symbol} account copied`,
  treasuryCopy: (symbol: string) => `Copy treasury ${symbol} account`,
  // WalletPercentBar
  percentConnect: "Connect a wallet to use the bar.",
  percentBalanceUnavailable: "Balance unavailable.",
  percentNotCover: (fees: string) =>
    `Balance does not cover the ${fees} network fees.`,
  percentShare: (symbol: string) => `Share of wallet ${symbol}`,
  percentSummary: (percent: string, amount: string, ttti: string) =>
    `${percent}% = ${amount} · you receive ${ttti} TTTI-T`,
  percentComputedOn: (fees: string) =>
    `Computed on balance minus ${fees} network fees.`,
};

export default en;
