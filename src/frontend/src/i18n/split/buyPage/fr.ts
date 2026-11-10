import type en from "./en";

const fr: typeof en = {
  title: (symbol: string) => `Frapper du ${symbol}`,
  noExtraTaken:
    "Aucun montant du jeton payé n'est prélevé au-delà du coût de ce qui est livré.",
  shownAs: (symbol: string) => `Affiché comme ${symbol} dans les wallets.`,
  ackReadFirst: "J'ai lu la section « À lire en premier » du livre blanc.",
  ackNoRights:
    "Je comprends que TTTI n'a aucun usage et aucune valeur intrinsèque. Le seul droit dont je dispose est le droit de rachat : je peux rendre du TTTI-T au contrat et recevoir le plus faible de 10 000 USD par TTTI-T ou de la part proportionnelle de la réserve commune, sans promesse de valeur.",
  ackPriceZero:
    "Je comprends que son prix peut tomber à zéro et que rien ne lui promet une valeur. 10 000 USD par TTTI-T minté sont calculés en USD et détenus dans le jeton payé (ICP, ckBTC, ckUSDC ou ckUSDT) dans une réserve commune, sans conversion, et n'importe quel détenteur peut rendre du TTTI-T au contrat selon les règles de rachat. 1 TTTI-T se rachète toujours 10 000 $, par n'importe quel détenteur.",
  ackIcpCreator:
    "La frappe coûte (10\u202f000 USD + la liquidité que j’apporte) × q divisé par 0,99, en ICP, ckBTC, ckUSDC ou ckUSDT. 10\u202f000 USD × q vont à la réserve commune, 1 % du montant que je paie revient au créateur, et le reste est la liquidité que j’apporte, qui reste à moi dans ma position.",
  ackNoProfit:
    "Je ne me fie à aucune promesse de profit, ni du créateur ni de quiconque.",
  ackAffordLoss:
    "Je ne dépense que ce que je peux me permettre de perdre entièrement.",
  ackLegend: "Requis avant votre premier achat.",
  wtTitle: "Conditions du portefeuille",
  wtDescription:
    "Lisez les six points ci-dessous, puis cochez la case et acceptez. Cette demande n'est faite qu'une seule fois ; elle est requise pour effectuer un mint ou un rachat.",
  wtAcceptLabel: "J'ai lu et j'accepte ces conditions",
  wtAcceptButton: "Accepter les conditions",
  wtBannerText: "Les conditions du portefeuille ne sont pas encore acceptées.",
  wtBannerButton: "Lire les conditions",
  wtOpenRefusal: "Lire et accepter les conditions du portefeuille",
  wtPoint1Title: "Livre blanc",
  wtPoint2Title: "Droits",
  wtPoint3Title: "Prix",
  wtPoint4Title: "Coût du mint",
  wtPoint5Title: "Aucune promesse de profit",
  wtPoint6Title: "Risque de perte",
  ackWhitePaperLink: "Ouvrir la section « À lire en premier »",
  ackStatusUnavailable: "Statut des confirmations d'achat indisponible",
  ackTickAll: "Cochez les six déclarations pour activer la frappe.",
  retry: "Réessayer",
  invalidAmountTitle: "Montant invalide",
  invalidAmountMessage: (symbol: string, decimals: number) =>
    `Saisissez un montant en ${symbol} supérieur à 0 avec au plus ${decimals} décimales.`,
  belowMinimumTitle: "Inférieur à l'achat minimum",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    about: string | null,
  ) =>
    `Minimum ${minimum} ${display} (${minimumUsd} en ${symbol})${about !== null ? `, soit environ ${about}` : ""}.`,
  aboveRemainingTitle: "Supérieur au montant restant",
  aboveRemainingMessage: (remaining: string, display: string, max: string) =>
    `Il ne reste que ${remaining} ${display} (${max}).`,
  insufficientTitle: (symbol: string, fee: string) =>
    `${symbol} insuffisant (montant + ${fee} de frais)`,
  insufficientMessage: (required: string) =>
    `Il vous faut ${required}, frais compris.`,
  useMaximum: "Utiliser le maximum",
  approvalFailed: (symbol: string) => `Échec de l'approbation ${symbol}`,
  purchaseNotCompleted: "Achat non effectué",
  purchaseNotSubmitted: "L'achat n'a pas pu être soumis. Veuillez réessayer.",
  recordingAcks: "Enregistrement des confirmations d'achat…",
  approving: (symbol: string) => `Approbation ${symbol} en cours…`,
  buying: "Frappe en cours…",
  saleComplete: "Vente terminée",
  salesPaused: "Les ventes sont suspendues",
  tokenUnavailable: (symbol: string) => `${symbol} indisponible`,
  buyWith: (symbol: string) => `Frapper avec ${symbol}`,
  received: (amount: string, display: string) =>
    `Vous avez reçu ${amount} ${display}`,
  buyTtti: "Frapper du TTTI-T",
  buyHeading: "Frapper",
  mintInfoToggle: "Qu'est-ce que le buy-to-mint ?",
  mintInfoBody1:
    "Un TTTI-T n'est créé que lorsque quelqu'un paie en ICP, ckBTC, ckUSDC ou ckUSDT au taux affiché. La liquidité que le minteur apporte lui reste, dans sa propre position du pool. Personne, administrateur compris, ne peut créer de TTTI-T d'une autre manière.",
  mintInfoBody2:
    "Un bitcoin ne vient au monde que lorsqu'un mineur dépense une ressource réelle : de l'énergie et du matériel. Un TTTI-T ne vient au monde que lorsque quelqu'un apporte un jeton réel. Des deux côtés, c'est l'engagement réel (skin in the game).",
  walletPlug: "Plug",
  walletBuiltIn: "Wallet intégré",
  balanceLabel: (symbol: string) => `Solde ${symbol}`,
  unavailable: "Indisponible",
  noTreasury: (symbol: string) =>
    `La frappe avec ${symbol} n'est pas disponible pour le moment.`,
  youPayIn: (symbol: string) => `Vous payez en ${symbol}`,
  youReceive: "Vous recevez",
  withFees: (amount: string) => ` · ${amount} frais compris`,
  totalDebited: "Total débité avec les frais de réseau :",
  noRateTitle: (symbol: string) =>
    `Aucun taux ${symbol}/USD valide pour cette heure`,
  noRateBody: (symbol: string) =>
    `Les achats en ${symbol} sont indisponibles tant qu'aucun taux n'est fixé.`,
  finalMint: (symbol: string) => `Mint ${symbol}`,
  finalMinting: "Mint en cours…",
  finalConverting: "Conversion du ckBTC détenu…",
  finalMoving: "Transfert du solde DEX vers le wallet…",
  finalChecking: "Vérification des soldes…",
  finalSourceLabel: "Solde utilisé",
  finalSourceWallet: (amount: string) => `Wallet : ${amount}`,
  finalSourceDex: (amount: string) => `Solde interne DEX : ${amount}`,
  finalSourceContract: (amount: string) => `Détenu par le contrat : ${amount}`,
  finalPreview: (ttti: string, pay: string) => `${ttti} pour ${pay}`,
  finalFundFirst: (symbol: string) =>
    `Aucun ${symbol} dans votre wallet, dans le DEX ou détenu par le contrat. Alimentez d'abord le compte.`,
  finalEnterAmount:
    "Saisissez un montant dans le formulaire ci-dessus, puis cliquez sur Mint.",
  finalDexMoved: (amount: string) =>
    `Retrait de ${amount} du solde DEX vers votre wallet terminé. Saisissez un montant, puis cliquez sur Mint.`,
  finalDexFailed: (detail: string) =>
    detail
      ? `Le retrait depuis le DEX a échoué. ${detail}`
      : "Le retrait depuis le DEX a échoué.",
  finalDexWithdrawing: "Étape 1 sur 2 : retrait depuis le DEX…",
  finalDexMinting: "Étape 2 sur 2 : mint en cours…",
  finalDexTooLow: (available: string, required: string) =>
    `Le solde DEX après les frais du ledger (${available}) est inférieur aux ${required} nécessaires pour ce mint. Rien n’a été retiré.`,
  finalDexShort: (balance: string, required: string) =>
    `Le retrait est terminé. Le solde du wallet (${balance}) est inférieur aux ${required} nécessaires pour ce mint. Les fonds restent dans votre wallet.`,
  finalDexMintKept: (amount: string) =>
    `Le mint n’a pas abouti. ${amount} reste dans votre wallet. Cliquez sur Mint pour relancer depuis le wallet.`,
  finalUseTokenForm:
    "Ce solde est minté depuis le formulaire de paiement en ckBTC, qui s'ouvre quand vous cliquez sur Mint.",
};

export default fr;
