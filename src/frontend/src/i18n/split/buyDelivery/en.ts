const en = {
  saved: "Delivery address saved.",
  saveFailed: "Saving the address failed. Try again.",
  removed: "Delivery address removed.",
  removeFailed: "Removing the address failed. Try again.",
  title: "Delivery wallet address",
  optional: "Optional",
  recommended: "Recommended",
  descPlug: (symbol: string) =>
    `Auto-filled with your connected Plug principal. Your ${symbol} is credited here.`,
  descIi: (symbol: string) =>
    `Auto-filled with your principal. Your ${symbol} is credited here.`,
  descNone: (symbol: string) =>
    `Not required to mint. Add the Principal ID of a wallet you control so your ${symbol} reaches it automatically at launch.`,
  principalId: "Principal ID",
  placeholder: "e.g. abcde-fghij-…-cai",
  save: "Save address",
  clear: "Clear",
  savedAddress: "Saved address",
  loadFailed:
    "Couldn't load your saved address. You can still enter one above.",
  retry: "Retry",
  noneSaved:
    "None saved — purchases are credited to the principal you buy with.",
};

export default en;
