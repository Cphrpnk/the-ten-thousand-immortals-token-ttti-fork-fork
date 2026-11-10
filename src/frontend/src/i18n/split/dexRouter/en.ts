const en = {
  routeLabel: "Route",
  routeNative: "Native pool",
  routeIcpswap: "ICPSwap",
  reasonBestAmount: "Chosen: higher amount received, fees included.",
  reasonNativeUnavailable:
    "The native pool is empty, filling or too shallow for this amount.",
  reasonIcpswapUnavailable: "No ICPSwap quote is available for this pair.",
  icpswapFee: (pct: string) => `ICPSwap fee (${pct})`,
  protocolFee: (pct: string) => `Protocol fee (${pct})`,
  protocolSplit: (lp: string, permanent: string) =>
    `70 % to the native pool LPs: ${lp} · 30 % to its permanent liquidity: ${permanent}`,
  alternativeLabel: (route: string) => `Other route (${route})`,
  alternativeNone: "Other route",
  alternativeUnavailable: "Unavailable",
  routeRule:
    "One route per swap: the native pool (0.3 %) or ICPSwap (0.3 % plus a 0.1 % protocol fee), whichever gives the higher amount received, fees included. The quoted route is sent with the swap.",
  fillingViaIcpswap: (gauge: string) =>
    `Native pool swaps are closed while it fills: ${gauge}. The swap can go through ICPSwap.`,
  swapDoneRoute: (input: string, output: string, route: string) =>
    `Swapped ${input} for ${output} via ${route}.`,
  errSameToken: "The two tokens must be different.",
  errPairNotFound: "This pair is not in the registry.",
  errNoRoute: "No route is available for this swap right now.",
  errRouteMismatch: (route: string) =>
    `The route is now ${route}. Check the new quote and confirm again.`,
  errIcpswapReturned: (message: string) =>
    `ICPSwap did not complete the swap: ${message}. The input amount is back in your DEX balance.`,
  errIcpswapHeld: (id: string, message: string) =>
    `ICPSwap did not complete routed swap #${id}: ${message}. The input amount is not back yet; it is followed up.`,
  errOutcomeUnknown: (id: string) =>
    `The outcome of routed swap #${id} is not known yet. It is checked by the admin; your DEX balance is updated once confirmed.`,
};

export default en;
