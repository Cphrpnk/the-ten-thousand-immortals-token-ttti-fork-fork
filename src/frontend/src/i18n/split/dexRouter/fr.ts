import type en from "./en";

const fr: typeof en = {
  routeLabel: "Route",
  routeNative: "Pool natif",
  routeIcpswap: "ICPSwap",
  reasonBestAmount: "Choisie : montant reçu le plus élevé, frais compris.",
  reasonNativeUnavailable:
    "Le pool natif est vide, en remplissage ou trop peu profond pour ce montant.",
  reasonIcpswapUnavailable:
    "Aucun devis ICPSwap n'est disponible pour cette paire.",
  icpswapFee: (pct: string) => `Frais ICPSwap (${pct})`,
  protocolFee: (pct: string) => `Frais du protocole (${pct})`,
  protocolSplit: (lp: string, permanent: string) =>
    `70 % aux LP du pool natif : ${lp} · 30 % à sa liquidité permanente : ${permanent}`,
  alternativeLabel: (route: string) => `Autre route (${route})`,
  alternativeNone: "Autre route",
  alternativeUnavailable: "Indisponible",
  routeRule:
    "Une seule route par échange : le pool natif (0,3 %) ou ICPSwap (0,3 % plus 0,1 % de frais du protocole), celle qui donne le montant reçu le plus élevé, frais compris. La route du devis est envoyée avec l'échange.",
  fillingViaIcpswap: (gauge: string) =>
    `Les échanges du pool natif sont fermés pendant son remplissage : ${gauge}. L'échange peut passer par ICPSwap.`,
  swapDoneRoute: (input: string, output: string, route: string) =>
    `${input} échangés contre ${output} via ${route}.`,
  errSameToken: "Les deux jetons doivent être différents.",
  errPairNotFound: "Cette paire n'est pas dans le registre.",
  errNoRoute: "Aucune route n'est disponible pour cet échange pour le moment.",
  errRouteMismatch: (route: string) =>
    `La route est maintenant ${route}. Vérifiez le nouveau devis et confirmez à nouveau.`,
  errIcpswapReturned: (message: string) =>
    `ICPSwap n'a pas effectué l'échange : ${message}. Le montant envoyé est revenu dans votre solde DEX.`,
  errIcpswapHeld: (id: string, message: string) =>
    `ICPSwap n'a pas effectué l'échange routé n° ${id} : ${message}. Le montant envoyé n'est pas encore revenu ; il est suivi.`,
  errOutcomeUnknown: (id: string) =>
    `L'issue de l'échange routé n° ${id} n'est pas encore connue. Elle est vérifiée par l'admin ; votre solde DEX est mis à jour une fois confirmée.`,
};

export default fr;
