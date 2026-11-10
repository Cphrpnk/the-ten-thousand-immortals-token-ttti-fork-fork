const en = {
  title: "Pools value and capitalisation",
  loading: "Loading…",
  loadError: "The figures could not be loaded.",
  retry: "Retry",
  notAvailable: "Not available",
  poolsValue: "Pools value",
  capitalisation: "Capitalisation",
  currentRatio: "Current ratio",
  averageRatio: "24-hour average ratio",
  targetRatio: "Target ratio",
  lockedShare: "Locked share m",
  samples: (count: string) => `${count} samples`,
  computedAt: (date: string) => `Computed ${date}`,
  noteNoPoolsValue: "No pool value: no open TTTI-T pool or no valid rate.",
  noteNoCapitalisation: "No capitalisation available.",
  referencePrice: "Capitalisation reference price per TTTI-T (target)",
  referencePriceNote:
    "The capitalisation and the pools value are measured with the target of 10,000 USD per TTTI-T.",
  consolidatedInfo: "Consolidated price per TTTI-T (information only)",
  noteNoRatio: "Needs both the pools value and the capitalisation.",
  noteNoAverage: "No ratio sample recorded yet.",
  noteLockedDefault:
    "No retained ratio yet: the locked share is the maximum, 50 %.",
  definitionsToggle: "Definitions",
  defPoolsValue:
    "Pools value: 2 times the counterpart reserve of each TTTI-T pool, at oracle rates. The pools value is measured with the target of 10,000 USD per TTTI-T.",
  defCapitalisation:
    "Capitalisation: circulating TTTI-T times the target of 10,000 USD per TTTI-T, measured at the same moment as the pools value. The consolidated price is displayed for information only.",
  defRatio: "Ratio: pools value divided by capitalisation.",
  defLockedShare:
    "Locked share m: derived from the retained ratio, the lower of the current ratio and the 24-hour average.",
};

export default en;
