import type en from "./en";

const fr: typeof en = {
  description:
    "Échangez ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT et les jetons listés sur ICPSwap que vous ajoutez, via un pool ICPSwap, depuis votre propre wallet.",
  from: "De",
  to: "Vers",
  switchTokens: "Inverser les deux jetons",
  amount: "Montant",
  balance: (amount: string, symbol: string) => `Solde : ${amount} ${symbol}`,
  sameToken: "Choisissez deux jetons différents.",
  poolLoading: "Recherche du pool ICPSwap…",
  poolError: "Le pool ICPSwap n'a pas pu être lu.",
  noPool: (a: string, b: string) =>
    `ICPSwap n'a pas de pool direct pour ${a} et ${b}. Cette paire ne peut pas être échangée ici.`,
  quoteLoading: "Lecture du devis ICPSwap…",
  quoteError: "Le pool ICPSwap n'a pas renvoyé de devis.",
  livePriceUnavailable:
    "Le prix ICPSwap en temps réel est indisponible : l'échange n'a pas été lancé. Réessayez dans un instant.",
  quoteExpired: "Le devis a expiré. Actualisez-le avant d'échanger.",
  refreshQuote: "Actualiser le devis",
  estimated: "Montant estimé reçu",
  poolFee: "Frais du pool",
  ledgerFees: "Frais des ledgers",
  ledgerFeesValue: (inFees: string, outFee: string) =>
    `${inFees} (autorisation et dépôt) + ${outFee} (retrait)`,
  minimumReceived: "Minimum garanti reçu",
  slippage: "Tolérance de glissement",
  slippageHint:
    "ICPSwap refuse l'échange si le montant obtenu est inférieur au minimum garanti.",
  slippageInvalid: "Saisissez une tolérance entre 0,01 % et 50 %.",
  amountInvalid: (symbol: string) => `Saisissez un montant ${symbol} valide.`,
  insufficient: (max: string, symbol: string) =>
    `Montant supérieur au solde utilisable. Maximum : ${max} ${symbol} (solde moins les frais d'autorisation et de dépôt).`,
  tooSmall: "Le montant estimé ne couvre pas les frais de retrait.",
  connectHint: "Connectez un wallet pour échanger.",
  review: "Vérifier l'échange",
  confirmTitle: "Ce que vous signez",
  confirmApproval: (amount: string, symbol: string, pool: string) =>
    `Une autorisation ICRC-2 qui permet au pool ICPSwap ${pool} de prélever exactement ${amount} ${symbol} (montant échangé plus un frais de ledger) sur votre compte.`,
  confirmExpiry: (time: string) =>
    `L'autorisation expire 15 minutes après la signature (vers ${time}).`,
  confirmSteps: (symbolIn: string, symbolOut: string) =>
    `Le pool prélève ensuite les ${symbolIn} (dépôt), les échange et envoie les ${symbolOut} dans votre wallet (retrait). Votre wallet peut demander de confirmer chaque étape.`,
  confirmMinimum: (amount: string, symbol: string) =>
    `Minimum reçu : ${amount} ${symbol}. En dessous, l'échange est refusé.`,
  confirmSigner: (wallet: string) =>
    `Signé par ${wallet}, qui détient ce compte.`,
  warning:
    "ICPSwap est une plateforme d'échange tierce. Les échanges sont définitifs et les frais des ledgers ne sont pas remboursés. Si une étape échoue, le montant déposé reste dans le pool jusqu'à ce que vous le retiriez.",
  confirmCheck: "J'ai lu ce que je signe et je confirme cet échange.",
  confirm: "Confirmer et signer",
  back: "Retour",
  stepApprove: "Autorisation dans le wallet…",
  stepDeposit: "Dépôt dans le pool…",
  stepSwap: "Échange…",
  stepWithdraw: "Retrait vers votre wallet…",
  refused: "La signature a été refusée. Rien n'a été échangé.",
  slippageError:
    "Le pool a refusé l'échange : le montant obtenu serait inférieur au minimum garanti. Actualisez le devis ou augmentez la tolérance.",
  failed: (detail: string) => `L'échange n'a pas abouti : ${detail}`,
  success: (amount: string, symbol: string) =>
    `Échange terminé. ${amount} ${symbol} reçus dans votre wallet.`,
  newSwap: "Nouvel échange",
  unusedTitle: "Solde resté dans le pool ICPSwap",
  unusedText:
    "Le pool conserve ce montant pour votre compte après un échange incomplet.",
  dexBalanceTitle: "Solde resté dans le DEX",
  dexBalanceText:
    "Le DEX conserve ce montant pour votre compte après un échange incomplet.",
  withdrawUnused: "Retirer vers mon wallet",
  withdrawing: "Retrait…",
  withdrawDone: "Solde retiré vers votre wallet.",
  withdrawFailed: (detail: string) => `Le retrait a échoué : ${detail}`,
  feeError: "Les frais du ledger du jeton n'ont pas pu être lus. Réessayez.",
  addToken: "Ajouter un jeton",
  addTokenLabel: "Symbole ou ID de ledger",
  addTokenHint:
    "Cherchez un jeton listé sur ICPSwap par son symbole, ou collez l'ID de son ledger. Les jetons ajoutés sont conservés dans ce navigateur et n'apparaissent que dans ce sélecteur.",
  addTokenSubmit: "Ajouter",
  addTokenReading: "Lecture du ledger du jeton…",
  addTokenListLoading: "Lecture de la liste des jetons ICPSwap…",
  addTokenListError:
    "La liste des jetons ICPSwap n'a pas pu être lue. Collez plutôt l'ID du ledger.",
  addTokenNoMatch:
    "Aucun jeton listé sur ICPSwap ne correspond à ce symbole. Collez plutôt l'ID du ledger.",
  addTokenInvalidId: "ID de ledger invalide.",
  addTokenNotIcrc:
    "Ce canister n'a pas renvoyé de métadonnées de jeton ICRC-1. Il ne peut pas être ajouté.",
  addTokenAlready: (symbol: string) => `${symbol} est déjà dans la liste.`,
  addTokenDone: (symbol: string) => `${symbol} ajouté.`,
  addedTokens: "Jetons ajoutés",
  removeToken: (symbol: string) => `Retirer ${symbol}`,
  closeAddToken: "Fermer",
  unifiedDescription:
    "Échangez ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT et les jetons listés sur ICPSwap que vous ajoutez, via les pools natifs ou ICPSwap, depuis votre propre wallet.",
  routesTitle: "Routes",
  routeBestPrice: "Meilleur prix",
  routeSelected: "Sélectionnée",
  routeEnterAmount: "Saisissez un montant pour voir le devis de cette route.",
  routeQuoteLoading: "Lecture du devis…",
  routeNativeNoPool: (a: string, b: string) =>
    `Aucun pool natif n'existe pour ${a} et ${b}.`,
  routeIcpswapNoPool: (a: string, b: string) =>
    `ICPSwap n'a pas de pool direct pour ${a} et ${b}.`,
  routeNativeAccount:
    "La route par le pool natif n'est disponible que pour le compte connecté sur ce site.",
  routeNativeError: "Le pool natif n'a pas renvoyé de devis.",
  routeOnlyIcpswap: "Seul ICPSwap est proposé pour cette paire.",
  routeOnlyNative: "Seul le pool natif est proposé pour cette paire.",
  bestPriceNote:
    "Meilleur prix : la route qui rend le plus de jetons, frais compris. C'est la route que vous sélectionnez qui est exécutée.",
  routeUsed: "Route utilisée",
  amountGiven: "Montant donné",
  confirmNativeApproval: (amount: string, symbol: string) =>
    `Une approbation ICRC-2 autorisant le DEX à prélever jusqu'à ${amount} ${symbol} (montant de l'échange plus un frais du ledger) sur votre compte.`,
  confirmNativeSteps: (symbolIn: string, symbolOut: string) =>
    `Le DEX prélève ensuite les ${symbolIn} (dépôt), les échange dans le pool natif et envoie les ${symbolOut} vers votre wallet (retrait).`,
  warningNative:
    "Les échanges sont définitifs et les frais du ledger ne sont pas remboursés. Si le retrait échoue, le montant échangé reste dans votre solde DEX.",
  nativeWithdrawFailed: (amount: string, symbol: string, detail: string) =>
    `L'échange est terminé, mais le retrait de ${amount} ${symbol} vers votre wallet a échoué : ${detail}. Le montant reste dans votre solde DEX.`,
};

export default fr;
