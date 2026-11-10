const en = {
  heading: "Pool",
  legend: "Pool receiving the liquidity",
  recommended: "Recommended",
  feeTier: "Fee tier",
  depth: "Depth",
  price: "Price",
  gap: "Gap with the consolidated price",
  selectedPool: "Selected pool",
  poolLabel: (id: string) => `Pool #${id}`,
  single: (fee: string) => `Single pool, fee tier ${fee}`,
  selectPrompt: "Select a pool to continue.",
  noPool: "No pool is available for this token. The mint is unavailable.",
  loading: "Loading the pools…",
  loadError: "The pools could not be loaded.",
  retry: "Retry",
  fallbackNotice:
    "The pool you chose is no longer available. The recommended pool is selected instead.",
  errUnknownPool: "The chosen pool does not exist. Select a pool again.",
  errOtherPair:
    "The chosen pool is not a pool of this token. Select a pool again.",
  errPoolRemoved: "The chosen pool has been removed. Select a pool again.",
  errPoolRemovalAnnounced: (date: string) =>
    `The removal of the chosen pool is announced for ${date}. Select a pool again.`,
};

export default en;
