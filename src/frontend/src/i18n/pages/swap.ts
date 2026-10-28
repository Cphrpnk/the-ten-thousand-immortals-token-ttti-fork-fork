import { defineDict } from "../core/dict";

/**
 * Wallet swap dialog (ICPSwap) and its entry points: the Mint TTTI-T header
 * button and the Onramper Buy notes. English is authoritative. Amounts,
 * symbols, canister IDs and times are passed in unchanged.
 */
export const SWAP_TEXT = defineDict({
  en: {
    description:
      "Swap ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT and the ICPSwap-listed tokens you add, through an ICPSwap pool, from your own wallet.",
    from: "From",
    to: "To",
    switchTokens: "Switch the two tokens",
    amount: "Amount",
    balance: (amount: string, symbol: string) => `Balance: ${amount} ${symbol}`,
    sameToken: "Choose two different tokens.",
    poolLoading: "Looking up the ICPSwap pool…",
    poolError: "The ICPSwap pool could not be read.",
    noPool: (a: string, b: string) =>
      `ICPSwap has no direct pool for ${a} and ${b}. This pair cannot be swapped here.`,
    quoteLoading: "Reading the ICPSwap quote…",
    quoteError: "The ICPSwap pool did not return a quote.",
    quoteExpired: "The quote has expired. Refresh it before swapping.",
    refreshQuote: "Refresh quote",
    estimated: "Estimated received",
    poolFee: "Pool fee",
    ledgerFees: "Ledger fees",
    ledgerFeesValue: (inFees: string, outFee: string) =>
      `${inFees} (approval and deposit) + ${outFee} (withdrawal)`,
    minimumReceived: "Guaranteed minimum received",
    slippage: "Slippage tolerance",
    slippageHint:
      "ICPSwap refuses the swap if the output is below the guaranteed minimum.",
    slippageInvalid: "Enter a tolerance between 0.01 % and 50 %.",
    amountInvalid: (symbol: string) => `Enter a valid ${symbol} amount.`,
    insufficient: (max: string, symbol: string) =>
      `Amount above the usable balance. Maximum: ${max} ${symbol} (balance minus the approval and deposit fees).`,
    tooSmall: "The estimated output does not cover the withdrawal fee.",
    connectHint: "Connect a wallet to swap.",
    review: "Review swap",
    confirmTitle: "What you sign",
    confirmApproval: (amount: string, symbol: string, pool: string) =>
      `An ICRC-2 approval allowing the ICPSwap pool ${pool} to take exactly ${amount} ${symbol} (swap amount plus one ledger fee) from your account.`,
    confirmExpiry: (time: string) =>
      `The approval expires 15 minutes after signing (around ${time}).`,
    confirmSteps: (symbolIn: string, symbolOut: string) =>
      `The pool then takes the ${symbolIn} (deposit), swaps them and sends the ${symbolOut} to your wallet (withdrawal). Your wallet may ask you to confirm each step.`,
    confirmMinimum: (amount: string, symbol: string) =>
      `Minimum received: ${amount} ${symbol}. Below that, the swap is refused.`,
    confirmSigner: (wallet: string) =>
      `Signed by ${wallet}, which holds this account.`,
    warning:
      "ICPSwap is a third-party exchange. Swaps are final and ledger fees are not refunded. If a step fails, the deposited amount stays in the pool until you withdraw it.",
    confirmCheck: "I have read what I sign and confirm this swap.",
    confirm: "Confirm and sign",
    back: "Back",
    stepApprove: "Approval in the wallet…",
    stepDeposit: "Deposit into the pool…",
    stepSwap: "Swap…",
    stepWithdraw: "Withdrawal to your wallet…",
    refused: "The signature was refused. Nothing was swapped.",
    slippageError:
      "The pool refused the swap: the output would be below the guaranteed minimum. Refresh the quote or raise the tolerance.",
    failed: (detail: string) => `The swap did not complete: ${detail}`,
    success: (amount: string, symbol: string) =>
      `Swap completed. ${amount} ${symbol} received in your wallet.`,
    newSwap: "New swap",
    unusedTitle: "Balance left in the ICPSwap pool",
    unusedText:
      "The pool holds this amount for your account after an incomplete swap.",
    withdrawUnused: "Withdraw to my wallet",
    withdrawing: "Withdrawing…",
    withdrawDone: "Balance withdrawn to your wallet.",
    withdrawFailed: (detail: string) => `The withdrawal failed: ${detail}`,
    feeError: "The token ledger fee could not be read. Try again.",
    addToken: "Add a token",
    addTokenLabel: "Symbol or ledger ID",
    addTokenHint:
      "Search a token listed on ICPSwap by symbol, or paste its ledger ID. Added tokens are kept in this browser and appear only in this selector.",
    addTokenSubmit: "Add",
    addTokenReading: "Reading the token ledger…",
    addTokenListLoading: "Reading the ICPSwap token list…",
    addTokenListError:
      "The ICPSwap token list could not be read. Paste the ledger ID instead.",
    addTokenNoMatch:
      "No ICPSwap-listed token matches this symbol. Paste the ledger ID instead.",
    addTokenInvalidId: "Invalid ledger ID.",
    addTokenNotIcrc:
      "This canister did not return ICRC-1 token metadata. It cannot be added.",
    addTokenAlready: (symbol: string) => `${symbol} is already in the list.`,
    addTokenDone: (symbol: string) => `${symbol} added.`,
    addedTokens: "Added tokens",
    removeToken: (symbol: string) => `Remove ${symbol}`,
    closeAddToken: "Close",
  },
  fr: {
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
  },
  es: {
    description:
      "Intercambie ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT y los tokens listados en ICPSwap que añada, a través de un pool de ICPSwap, desde su propio wallet.",
    from: "De",
    to: "A",
    switchTokens: "Invertir los dos tokens",
    amount: "Importe",
    balance: (amount: string, symbol: string) => `Saldo: ${amount} ${symbol}`,
    sameToken: "Elija dos tokens distintos.",
    poolLoading: "Buscando el pool de ICPSwap…",
    poolError: "No se pudo leer el pool de ICPSwap.",
    noPool: (a: string, b: string) =>
      `ICPSwap no tiene un pool directo para ${a} y ${b}. Este par no se puede intercambiar aquí.`,
    quoteLoading: "Leyendo la cotización de ICPSwap…",
    quoteError: "El pool de ICPSwap no devolvió una cotización.",
    quoteExpired:
      "La cotización ha caducado. Actualícela antes de intercambiar.",
    refreshQuote: "Actualizar cotización",
    estimated: "Importe estimado recibido",
    poolFee: "Comisión del pool",
    ledgerFees: "Comisiones de los ledgers",
    ledgerFeesValue: (inFees: string, outFee: string) =>
      `${inFees} (autorización y depósito) + ${outFee} (retirada)`,
    minimumReceived: "Mínimo garantizado recibido",
    slippage: "Tolerancia de deslizamiento",
    slippageHint:
      "ICPSwap rechaza el intercambio si el importe obtenido es inferior al mínimo garantizado.",
    slippageInvalid: "Introduzca una tolerancia entre 0,01 % y 50 %.",
    amountInvalid: (symbol: string) =>
      `Introduzca un importe de ${symbol} válido.`,
    insufficient: (max: string, symbol: string) =>
      `Importe superior al saldo utilizable. Máximo: ${max} ${symbol} (saldo menos las comisiones de autorización y depósito).`,
    tooSmall: "El importe estimado no cubre la comisión de retirada.",
    connectHint: "Conecte un wallet para intercambiar.",
    review: "Revisar el intercambio",
    confirmTitle: "Lo que firma",
    confirmApproval: (amount: string, symbol: string, pool: string) =>
      `Una autorización ICRC-2 que permite al pool de ICPSwap ${pool} tomar exactamente ${amount} ${symbol} (importe intercambiado más una comisión de ledger) de su cuenta.`,
    confirmExpiry: (time: string) =>
      `La autorización caduca 15 minutos después de la firma (hacia las ${time}).`,
    confirmSteps: (symbolIn: string, symbolOut: string) =>
      `Después, el pool toma los ${symbolIn} (depósito), los intercambia y envía los ${symbolOut} a su wallet (retirada). Su wallet puede pedirle que confirme cada paso.`,
    confirmMinimum: (amount: string, symbol: string) =>
      `Mínimo recibido: ${amount} ${symbol}. Por debajo, el intercambio se rechaza.`,
    confirmSigner: (wallet: string) =>
      `Firmado por ${wallet}, que contiene esta cuenta.`,
    warning:
      "ICPSwap es una plataforma de intercambio de terceros. Los intercambios son definitivos y las comisiones de los ledgers no se reembolsan. Si un paso falla, el importe depositado queda en el pool hasta que lo retire.",
    confirmCheck: "He leído lo que firmo y confirmo este intercambio.",
    confirm: "Confirmar y firmar",
    back: "Volver",
    stepApprove: "Autorización en el wallet…",
    stepDeposit: "Depósito en el pool…",
    stepSwap: "Intercambio…",
    stepWithdraw: "Retirada a su wallet…",
    refused: "La firma fue rechazada. No se intercambió nada.",
    slippageError:
      "El pool rechazó el intercambio: el importe obtenido sería inferior al mínimo garantizado. Actualice la cotización o aumente la tolerancia.",
    failed: (detail: string) => `El intercambio no se completó: ${detail}`,
    success: (amount: string, symbol: string) =>
      `Intercambio completado. ${amount} ${symbol} recibidos en su wallet.`,
    newSwap: "Nuevo intercambio",
    unusedTitle: "Saldo restante en el pool de ICPSwap",
    unusedText:
      "El pool conserva este importe para su cuenta tras un intercambio incompleto.",
    withdrawUnused: "Retirar a mi wallet",
    withdrawing: "Retirando…",
    withdrawDone: "Saldo retirado a su wallet.",
    withdrawFailed: (detail: string) => `La retirada falló: ${detail}`,
    feeError:
      "No se pudo leer la comisión del ledger del token. Inténtelo de nuevo.",
    addToken: "Añadir un token",
    addTokenLabel: "Símbolo o ID del ledger",
    addTokenHint:
      "Busque un token listado en ICPSwap por su símbolo o pegue el ID de su ledger. Los tokens añadidos se guardan en este navegador y solo aparecen en este selector.",
    addTokenSubmit: "Añadir",
    addTokenReading: "Leyendo el ledger del token…",
    addTokenListLoading: "Leyendo la lista de tokens de ICPSwap…",
    addTokenListError:
      "No se pudo leer la lista de tokens de ICPSwap. Pegue el ID del ledger.",
    addTokenNoMatch:
      "Ningún token listado en ICPSwap coincide con este símbolo. Pegue el ID del ledger.",
    addTokenInvalidId: "ID de ledger no válido.",
    addTokenNotIcrc:
      "Este canister no devolvió metadatos de token ICRC-1. No se puede añadir.",
    addTokenAlready: (symbol: string) => `${symbol} ya está en la lista.`,
    addTokenDone: (symbol: string) => `${symbol} añadido.`,
    addedTokens: "Tokens añadidos",
    removeToken: (symbol: string) => `Quitar ${symbol}`,
    closeAddToken: "Cerrar",
  },
  "zh-Hans": {
    description:
      "通过 ICPSwap 资金池，从您自己的钱包兑换 ICP、TTTI-T、ckBTC、ckUSDC、ckUSDT 以及您添加的 ICPSwap 上架代币。",
    from: "从",
    to: "到",
    switchTokens: "互换两个代币",
    amount: "数量",
    balance: (amount: string, symbol: string) => `余额：${amount} ${symbol}`,
    sameToken: "请选择两个不同的代币。",
    poolLoading: "正在查找 ICPSwap 资金池…",
    poolError: "无法读取 ICPSwap 资金池。",
    noPool: (a: string, b: string) =>
      `ICPSwap 没有 ${a} 与 ${b} 的直接资金池。此交易对无法在此兑换。`,
    quoteLoading: "正在读取 ICPSwap 报价…",
    quoteError: "ICPSwap 资金池未返回报价。",
    quoteExpired: "报价已过期。兑换前请刷新。",
    refreshQuote: "刷新报价",
    estimated: "预计收到",
    poolFee: "资金池费用",
    ledgerFees: "账本费用",
    ledgerFeesValue: (inFees: string, outFee: string) =>
      `${inFees}（授权和存入）+ ${outFee}（提取）`,
    minimumReceived: "保证最低收到",
    slippage: "滑点容差",
    slippageHint: "如果兑换结果低于保证最低值，ICPSwap 将拒绝兑换。",
    slippageInvalid: "请输入 0.01 % 到 50 % 之间的容差。",
    amountInvalid: (symbol: string) => `请输入有效的 ${symbol} 数量。`,
    insufficient: (max: string, symbol: string) =>
      `数量超过可用余额。最大值：${max} ${symbol}（余额减去授权和存入费用）。`,
    tooSmall: "预计兑换结果不足以支付提取费用。",
    connectHint: "请连接钱包以进行兑换。",
    review: "检查兑换",
    confirmTitle: "您签署的内容",
    confirmApproval: (amount: string, symbol: string, pool: string) =>
      `一项 ICRC-2 授权，允许 ICPSwap 资金池 ${pool} 从您的账户中提取恰好 ${amount} ${symbol}（兑换数量加一笔账本费用）。`,
    confirmExpiry: (time: string) =>
      `该授权在签署 15 分钟后过期（约 ${time}）。`,
    confirmSteps: (symbolIn: string, symbolOut: string) =>
      `随后资金池提取 ${symbolIn}（存入），进行兑换，并将 ${symbolOut} 发送到您的钱包（提取）。您的钱包可能会要求确认每个步骤。`,
    confirmMinimum: (amount: string, symbol: string) =>
      `最低收到：${amount} ${symbol}。低于此值，兑换将被拒绝。`,
    confirmSigner: (wallet: string) => `由持有此账户的 ${wallet} 签署。`,
    warning:
      "ICPSwap 是第三方交易平台。兑换是最终的，账本费用不予退还。如果某个步骤失败，已存入的数量会留在资金池中，直到您将其提取。",
    confirmCheck: "我已阅读签署内容并确认此次兑换。",
    confirm: "确认并签署",
    back: "返回",
    stepApprove: "正在钱包中授权…",
    stepDeposit: "正在存入资金池…",
    stepSwap: "正在兑换…",
    stepWithdraw: "正在提取到您的钱包…",
    refused: "签名被拒绝。未进行任何兑换。",
    slippageError:
      "资金池拒绝了兑换：兑换结果将低于保证最低值。请刷新报价或提高容差。",
    failed: (detail: string) => `兑换未完成：${detail}`,
    success: (amount: string, symbol: string) =>
      `兑换完成。您的钱包已收到 ${amount} ${symbol}。`,
    newSwap: "新的兑换",
    unusedTitle: "留在 ICPSwap 资金池中的余额",
    unusedText: "兑换未完成后，资金池为您的账户保留此数量。",
    withdrawUnused: "提取到我的钱包",
    withdrawing: "正在提取…",
    withdrawDone: "余额已提取到您的钱包。",
    withdrawFailed: (detail: string) => `提取失败：${detail}`,
    feeError: "无法读取代币账本费用。请重试。",
    addToken: "添加代币",
    addTokenLabel: "符号或账本 ID",
    addTokenHint:
      "按符号搜索 ICPSwap 上架的代币，或粘贴其账本 ID。添加的代币保存在此浏览器中，仅显示在此选择器中。",
    addTokenSubmit: "添加",
    addTokenReading: "正在读取代币账本…",
    addTokenListLoading: "正在读取 ICPSwap 代币列表…",
    addTokenListError: "无法读取 ICPSwap 代币列表。请改为粘贴账本 ID。",
    addTokenNoMatch: "没有与此符号匹配的 ICPSwap 上架代币。请改为粘贴账本 ID。",
    addTokenInvalidId: "账本 ID 无效。",
    addTokenNotIcrc: "此 canister 未返回 ICRC-1 代币元数据，无法添加。",
    addTokenAlready: (symbol: string) => `${symbol} 已在列表中。`,
    addTokenDone: (symbol: string) => `已添加 ${symbol}。`,
    addedTokens: "已添加的代币",
    removeToken: (symbol: string) => `移除 ${symbol}`,
    closeAddToken: "关闭",
  },
  "pt-BR": {
    description:
      "Troque ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT e os tokens listados na ICPSwap que você adicionar, por meio de um pool da ICPSwap, a partir da sua própria carteira.",
    from: "De",
    to: "Para",
    switchTokens: "Inverter os dois tokens",
    amount: "Valor",
    balance: (amount: string, symbol: string) => `Saldo: ${amount} ${symbol}`,
    sameToken: "Escolha dois tokens diferentes.",
    poolLoading: "Procurando o pool da ICPSwap…",
    poolError: "Não foi possível ler o pool da ICPSwap.",
    noPool: (a: string, b: string) =>
      `A ICPSwap não tem pool direto para ${a} e ${b}. Este par não pode ser trocado aqui.`,
    quoteLoading: "Lendo a cotação da ICPSwap…",
    quoteError: "O pool da ICPSwap não retornou uma cotação.",
    quoteExpired: "A cotação expirou. Atualize-a antes de trocar.",
    refreshQuote: "Atualizar cotação",
    estimated: "Valor estimado recebido",
    poolFee: "Taxa do pool",
    ledgerFees: "Taxas dos ledgers",
    ledgerFeesValue: (inFees: string, outFee: string) =>
      `${inFees} (autorização e depósito) + ${outFee} (saque)`,
    minimumReceived: "Mínimo garantido recebido",
    slippage: "Tolerância de slippage",
    slippageHint:
      "A ICPSwap recusa a troca se o valor obtido for inferior ao mínimo garantido.",
    slippageInvalid: "Informe uma tolerância entre 0,01 % e 50 %.",
    amountInvalid: (symbol: string) => `Informe um valor de ${symbol} válido.`,
    insufficient: (max: string, symbol: string) =>
      `Valor acima do saldo utilizável. Máximo: ${max} ${symbol} (saldo menos as taxas de autorização e depósito).`,
    tooSmall: "O valor estimado não cobre a taxa de saque.",
    connectHint: "Conecte uma carteira para trocar.",
    review: "Revisar a troca",
    confirmTitle: "O que você assina",
    confirmApproval: (amount: string, symbol: string, pool: string) =>
      `Uma autorização ICRC-2 que permite ao pool da ICPSwap ${pool} retirar exatamente ${amount} ${symbol} (valor trocado mais uma taxa de ledger) da sua conta.`,
    confirmExpiry: (time: string) =>
      `A autorização expira 15 minutos após a assinatura (por volta de ${time}).`,
    confirmSteps: (symbolIn: string, symbolOut: string) =>
      `Em seguida, o pool retira os ${symbolIn} (depósito), faz a troca e envia os ${symbolOut} para a sua carteira (saque). Sua carteira pode pedir a confirmação de cada etapa.`,
    confirmMinimum: (amount: string, symbol: string) =>
      `Mínimo recebido: ${amount} ${symbol}. Abaixo disso, a troca é recusada.`,
    confirmSigner: (wallet: string) =>
      `Assinado por ${wallet}, que detém esta conta.`,
    warning:
      "A ICPSwap é uma plataforma de troca de terceiros. As trocas são definitivas e as taxas dos ledgers não são reembolsadas. Se uma etapa falhar, o valor depositado fica no pool até que você o retire.",
    confirmCheck: "Li o que assino e confirmo esta troca.",
    confirm: "Confirmar e assinar",
    back: "Voltar",
    stepApprove: "Autorização na carteira…",
    stepDeposit: "Depósito no pool…",
    stepSwap: "Troca…",
    stepWithdraw: "Saque para a sua carteira…",
    refused: "A assinatura foi recusada. Nada foi trocado.",
    slippageError:
      "O pool recusou a troca: o valor obtido seria inferior ao mínimo garantido. Atualize a cotação ou aumente a tolerância.",
    failed: (detail: string) => `A troca não foi concluída: ${detail}`,
    success: (amount: string, symbol: string) =>
      `Troca concluída. ${amount} ${symbol} recebidos na sua carteira.`,
    newSwap: "Nova troca",
    unusedTitle: "Saldo restante no pool da ICPSwap",
    unusedText:
      "O pool mantém este valor para a sua conta após uma troca incompleta.",
    withdrawUnused: "Sacar para minha carteira",
    withdrawing: "Sacando…",
    withdrawDone: "Saldo sacado para a sua carteira.",
    withdrawFailed: (detail: string) => `O saque falhou: ${detail}`,
    feeError:
      "Não foi possível ler a taxa do ledger do token. Tente novamente.",
    addToken: "Adicionar um token",
    addTokenLabel: "Símbolo ou ID do ledger",
    addTokenHint:
      "Pesquise um token listado na ICPSwap pelo símbolo ou cole o ID do ledger. Os tokens adicionados ficam salvos neste navegador e aparecem apenas neste seletor.",
    addTokenSubmit: "Adicionar",
    addTokenReading: "Lendo o ledger do token…",
    addTokenListLoading: "Lendo a lista de tokens da ICPSwap…",
    addTokenListError:
      "Não foi possível ler a lista de tokens da ICPSwap. Cole o ID do ledger.",
    addTokenNoMatch:
      "Nenhum token listado na ICPSwap corresponde a este símbolo. Cole o ID do ledger.",
    addTokenInvalidId: "ID de ledger inválido.",
    addTokenNotIcrc:
      "Este canister não retornou metadados de token ICRC-1. Ele não pode ser adicionado.",
    addTokenAlready: (symbol: string) => `${symbol} já está na lista.`,
    addTokenDone: (symbol: string) => `${symbol} adicionado.`,
    addedTokens: "Tokens adicionados",
    removeToken: (symbol: string) => `Remover ${symbol}`,
    closeAddToken: "Fechar",
  },
  ko: {
    description:
      "본인 지갑에서 ICPSwap 풀을 통해 ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT 및 추가한 ICPSwap 상장 토큰을 스왑합니다.",
    from: "보내는 토큰",
    to: "받는 토큰",
    switchTokens: "두 토큰 바꾸기",
    amount: "수량",
    balance: (amount: string, symbol: string) => `잔액: ${amount} ${symbol}`,
    sameToken: "서로 다른 두 토큰을 선택하세요.",
    poolLoading: "ICPSwap 풀을 찾는 중…",
    poolError: "ICPSwap 풀을 읽을 수 없습니다.",
    noPool: (a: string, b: string) =>
      `ICPSwap에 ${a}와 ${b}의 직접 풀이 없습니다. 이 쌍은 여기에서 스왑할 수 없습니다.`,
    quoteLoading: "ICPSwap 견적을 읽는 중…",
    quoteError: "ICPSwap 풀이 견적을 반환하지 않았습니다.",
    quoteExpired: "견적이 만료되었습니다. 스왑 전에 새로 고치세요.",
    refreshQuote: "견적 새로 고침",
    estimated: "예상 수령액",
    poolFee: "풀 수수료",
    ledgerFees: "원장 수수료",
    ledgerFeesValue: (inFees: string, outFee: string) =>
      `${inFees}(승인 및 입금) + ${outFee}(출금)`,
    minimumReceived: "보장 최소 수령액",
    slippage: "슬리피지 허용 범위",
    slippageHint: "결과가 보장 최소액보다 적으면 ICPSwap이 스왑을 거부합니다.",
    slippageInvalid: "0.01 %에서 50 % 사이의 허용 범위를 입력하세요.",
    amountInvalid: (symbol: string) => `유효한 ${symbol} 수량을 입력하세요.`,
    insufficient: (max: string, symbol: string) =>
      `사용 가능한 잔액을 초과했습니다. 최대: ${max} ${symbol}(잔액에서 승인 및 입금 수수료를 뺀 값).`,
    tooSmall: "예상 결과가 출금 수수료를 충당하지 못합니다.",
    connectHint: "스왑하려면 지갑을 연결하세요.",
    review: "스왑 검토",
    confirmTitle: "서명하는 내용",
    confirmApproval: (amount: string, symbol: string, pool: string) =>
      `ICPSwap 풀 ${pool}이 귀하의 계정에서 정확히 ${amount} ${symbol}(스왑 수량과 원장 수수료 1회분)을 가져갈 수 있도록 허용하는 ICRC-2 승인입니다.`,
    confirmExpiry: (time: string) =>
      `승인은 서명 후 15분 뒤(약 ${time})에 만료됩니다.`,
    confirmSteps: (symbolIn: string, symbolOut: string) =>
      `그런 다음 풀이 ${symbolIn}을 가져가고(입금), 스왑한 뒤 ${symbolOut}을 귀하의 지갑으로 보냅니다(출금). 지갑에서 각 단계의 확인을 요청할 수 있습니다.`,
    confirmMinimum: (amount: string, symbol: string) =>
      `최소 수령액: ${amount} ${symbol}. 그보다 적으면 스왑이 거부됩니다.`,
    confirmSigner: (wallet: string) =>
      `이 계정을 보유한 ${wallet}이 서명합니다.`,
    warning:
      "ICPSwap은 제3자 거래소입니다. 스왑은 최종적이며 원장 수수료는 환불되지 않습니다. 한 단계가 실패하면 입금된 금액은 출금할 때까지 풀에 남습니다.",
    confirmCheck: "서명 내용을 읽었으며 이 스왑을 확인합니다.",
    confirm: "확인 및 서명",
    back: "뒤로",
    stepApprove: "지갑에서 승인 중…",
    stepDeposit: "풀에 입금 중…",
    stepSwap: "스왑 중…",
    stepWithdraw: "지갑으로 출금 중…",
    refused: "서명이 거부되었습니다. 아무것도 스왑되지 않았습니다.",
    slippageError:
      "풀이 스왑을 거부했습니다: 결과가 보장 최소액보다 적습니다. 견적을 새로 고치거나 허용 범위를 높이세요.",
    failed: (detail: string) => `스왑이 완료되지 않았습니다: ${detail}`,
    success: (amount: string, symbol: string) =>
      `스왑 완료. 지갑에 ${amount} ${symbol}을 받았습니다.`,
    newSwap: "새 스왑",
    unusedTitle: "ICPSwap 풀에 남은 잔액",
    unusedText:
      "스왑이 완료되지 않아 풀이 귀하의 계정을 위해 이 금액을 보관합니다.",
    withdrawUnused: "내 지갑으로 출금",
    withdrawing: "출금 중…",
    withdrawDone: "잔액이 지갑으로 출금되었습니다.",
    withdrawFailed: (detail: string) => `출금에 실패했습니다: ${detail}`,
    feeError: "토큰 원장 수수료를 읽을 수 없습니다. 다시 시도하세요.",
    addToken: "토큰 추가",
    addTokenLabel: "심볼 또는 원장 ID",
    addTokenHint:
      "ICPSwap에 상장된 토큰을 심볼로 검색하거나 원장 ID를 붙여넣으세요. 추가한 토큰은 이 브라우저에 저장되며 이 선택기에만 표시됩니다.",
    addTokenSubmit: "추가",
    addTokenReading: "토큰 원장을 읽는 중…",
    addTokenListLoading: "ICPSwap 토큰 목록을 읽는 중…",
    addTokenListError:
      "ICPSwap 토큰 목록을 읽을 수 없습니다. 대신 원장 ID를 붙여넣으세요.",
    addTokenNoMatch:
      "이 심볼과 일치하는 ICPSwap 상장 토큰이 없습니다. 대신 원장 ID를 붙여넣으세요.",
    addTokenInvalidId: "유효하지 않은 원장 ID입니다.",
    addTokenNotIcrc:
      "이 canister가 ICRC-1 토큰 메타데이터를 반환하지 않았습니다. 추가할 수 없습니다.",
    addTokenAlready: (symbol: string) => `${symbol}은 이미 목록에 있습니다.`,
    addTokenDone: (symbol: string) => `${symbol}을 추가했습니다.`,
    addedTokens: "추가한 토큰",
    removeToken: (symbol: string) => `${symbol} 제거`,
    closeAddToken: "닫기",
  },
  "pa-Guru": {
    description:
      "ਆਪਣੇ ਵਾਲਿਟ ਤੋਂ ICPSwap ਪੂਲ ਰਾਹੀਂ ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT ਅਤੇ ਤੁਹਾਡੇ ਵੱਲੋਂ ਜੋੜੇ ICPSwap-ਸੂਚੀਬੱਧ ਟੋਕਨ ਸਵੈਪ ਕਰੋ।",
    from: "ਤੋਂ",
    to: "ਨੂੰ",
    switchTokens: "ਦੋਵੇਂ ਟੋਕਨ ਬਦਲੋ",
    amount: "ਰਕਮ",
    balance: (amount: string, symbol: string) => `ਬਕਾਇਆ: ${amount} ${symbol}`,
    sameToken: "ਦੋ ਵੱਖਰੇ ਟੋਕਨ ਚੁਣੋ।",
    poolLoading: "ICPSwap ਪੂਲ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
    poolError: "ICPSwap ਪੂਲ ਪੜ੍ਹਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ।",
    noPool: (a: string, b: string) =>
      `ICPSwap ਕੋਲ ${a} ਅਤੇ ${b} ਲਈ ਕੋਈ ਸਿੱਧਾ ਪੂਲ ਨਹੀਂ ਹੈ। ਇਹ ਜੋੜਾ ਇੱਥੇ ਸਵੈਪ ਨਹੀਂ ਹੋ ਸਕਦਾ।`,
    quoteLoading: "ICPSwap ਕੋਟ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
    quoteError: "ICPSwap ਪੂਲ ਨੇ ਕੋਈ ਕੋਟ ਨਹੀਂ ਦਿੱਤਾ।",
    quoteExpired: "ਕੋਟ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਗਈ ਹੈ। ਸਵੈਪ ਤੋਂ ਪਹਿਲਾਂ ਇਸਨੂੰ ਤਾਜ਼ਾ ਕਰੋ।",
    refreshQuote: "ਕੋਟ ਤਾਜ਼ਾ ਕਰੋ",
    estimated: "ਅਨੁਮਾਨਿਤ ਪ੍ਰਾਪਤ ਰਕਮ",
    poolFee: "ਪੂਲ ਫੀਸ",
    ledgerFees: "ਲੈਜਰ ਫੀਸਾਂ",
    ledgerFeesValue: (inFees: string, outFee: string) =>
      `${inFees} (ਮਨਜ਼ੂਰੀ ਅਤੇ ਜਮ੍ਹਾਂ) + ${outFee} (ਕਢਵਾਉਣਾ)`,
    minimumReceived: "ਗਾਰੰਟੀਸ਼ੁਦਾ ਘੱਟੋ-ਘੱਟ ਪ੍ਰਾਪਤੀ",
    slippage: "ਸਲਿੱਪੇਜ ਸਹਿਣਸ਼ੀਲਤਾ",
    slippageHint:
      "ਜੇ ਨਤੀਜਾ ਗਾਰੰਟੀਸ਼ੁਦਾ ਘੱਟੋ-ਘੱਟ ਤੋਂ ਘੱਟ ਹੋਵੇ ਤਾਂ ICPSwap ਸਵੈਪ ਨੂੰ ਇਨਕਾਰ ਕਰਦਾ ਹੈ।",
    slippageInvalid: "0.01 % ਅਤੇ 50 % ਵਿਚਕਾਰ ਸਹਿਣਸ਼ੀਲਤਾ ਦਰਜ ਕਰੋ।",
    amountInvalid: (symbol: string) => `ਇੱਕ ਵੈਧ ${symbol} ਰਕਮ ਦਰਜ ਕਰੋ।`,
    insufficient: (max: string, symbol: string) =>
      `ਰਕਮ ਵਰਤਣਯੋਗ ਬਕਾਏ ਤੋਂ ਵੱਧ ਹੈ। ਵੱਧ ਤੋਂ ਵੱਧ: ${max} ${symbol} (ਬਕਾਇਆ ਘਟਾਓ ਮਨਜ਼ੂਰੀ ਅਤੇ ਜਮ੍ਹਾਂ ਫੀਸਾਂ)।`,
    tooSmall: "ਅਨੁਮਾਨਿਤ ਨਤੀਜਾ ਕਢਵਾਉਣ ਦੀ ਫੀਸ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ।",
    connectHint: "ਸਵੈਪ ਕਰਨ ਲਈ ਇੱਕ ਵਾਲਿਟ ਕਨੈਕਟ ਕਰੋ।",
    review: "ਸਵੈਪ ਦੀ ਸਮੀਖਿਆ ਕਰੋ",
    confirmTitle: "ਤੁਸੀਂ ਕੀ ਸਾਈਨ ਕਰਦੇ ਹੋ",
    confirmApproval: (amount: string, symbol: string, pool: string) =>
      `ਇੱਕ ICRC-2 ਮਨਜ਼ੂਰੀ ਜੋ ICPSwap ਪੂਲ ${pool} ਨੂੰ ਤੁਹਾਡੇ ਖਾਤੇ ਤੋਂ ਬਿਲਕੁਲ ${amount} ${symbol} (ਸਵੈਪ ਰਕਮ ਅਤੇ ਇੱਕ ਲੈਜਰ ਫੀਸ) ਲੈਣ ਦੀ ਆਗਿਆ ਦਿੰਦੀ ਹੈ।`,
    confirmExpiry: (time: string) =>
      `ਮਨਜ਼ੂਰੀ ਸਾਈਨ ਕਰਨ ਤੋਂ 15 ਮਿੰਟ ਬਾਅਦ (ਲਗਭਗ ${time}) ਖਤਮ ਹੋ ਜਾਂਦੀ ਹੈ।`,
    confirmSteps: (symbolIn: string, symbolOut: string) =>
      `ਫਿਰ ਪੂਲ ${symbolIn} ਲੈਂਦਾ ਹੈ (ਜਮ੍ਹਾਂ), ਉਹਨਾਂ ਨੂੰ ਸਵੈਪ ਕਰਦਾ ਹੈ ਅਤੇ ${symbolOut} ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਭੇਜਦਾ ਹੈ (ਕਢਵਾਉਣਾ)। ਤੁਹਾਡਾ ਵਾਲਿਟ ਹਰ ਕਦਮ ਦੀ ਪੁਸ਼ਟੀ ਮੰਗ ਸਕਦਾ ਹੈ।`,
    confirmMinimum: (amount: string, symbol: string) =>
      `ਘੱਟੋ-ਘੱਟ ਪ੍ਰਾਪਤੀ: ${amount} ${symbol}। ਇਸ ਤੋਂ ਘੱਟ ਹੋਣ 'ਤੇ ਸਵੈਪ ਇਨਕਾਰ ਹੁੰਦਾ ਹੈ।`,
    confirmSigner: (wallet: string) =>
      `${wallet} ਦੁਆਰਾ ਸਾਈਨ ਕੀਤਾ ਗਿਆ, ਜਿਸ ਕੋਲ ਇਹ ਖਾਤਾ ਹੈ।`,
    warning:
      "ICPSwap ਇੱਕ ਤੀਜੀ-ਧਿਰ ਐਕਸਚੇਂਜ ਹੈ। ਸਵੈਪ ਅੰਤਿਮ ਹਨ ਅਤੇ ਲੈਜਰ ਫੀਸਾਂ ਵਾਪਸ ਨਹੀਂ ਹੁੰਦੀਆਂ। ਜੇ ਕੋਈ ਕਦਮ ਅਸਫਲ ਹੁੰਦਾ ਹੈ, ਤਾਂ ਜਮ੍ਹਾਂ ਰਕਮ ਪੂਲ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਇਸਨੂੰ ਕਢਵਾ ਨਹੀਂ ਲੈਂਦੇ।",
    confirmCheck: "ਮੈਂ ਪੜ੍ਹ ਲਿਆ ਹੈ ਕਿ ਮੈਂ ਕੀ ਸਾਈਨ ਕਰਦਾ ਹਾਂ ਅਤੇ ਇਸ ਸਵੈਪ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦਾ ਹਾਂ।",
    confirm: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਸਾਈਨ ਕਰੋ",
    back: "ਵਾਪਸ",
    stepApprove: "ਵਾਲਿਟ ਵਿੱਚ ਮਨਜ਼ੂਰੀ…",
    stepDeposit: "ਪੂਲ ਵਿੱਚ ਜਮ੍ਹਾਂ…",
    stepSwap: "ਸਵੈਪ…",
    stepWithdraw: "ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਕਢਵਾਉਣਾ…",
    refused: "ਦਸਤਖਤ ਇਨਕਾਰ ਕੀਤੇ ਗਏ। ਕੁਝ ਵੀ ਸਵੈਪ ਨਹੀਂ ਹੋਇਆ।",
    slippageError:
      "ਪੂਲ ਨੇ ਸਵੈਪ ਇਨਕਾਰ ਕੀਤਾ: ਨਤੀਜਾ ਗਾਰੰਟੀਸ਼ੁਦਾ ਘੱਟੋ-ਘੱਟ ਤੋਂ ਘੱਟ ਹੋਵੇਗਾ। ਕੋਟ ਤਾਜ਼ਾ ਕਰੋ ਜਾਂ ਸਹਿਣਸ਼ੀਲਤਾ ਵਧਾਓ।",
    failed: (detail: string) => `ਸਵੈਪ ਪੂਰਾ ਨਹੀਂ ਹੋਇਆ: ${detail}`,
    success: (amount: string, symbol: string) =>
      `ਸਵੈਪ ਪੂਰਾ ਹੋਇਆ। ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ${amount} ${symbol} ਪ੍ਰਾਪਤ ਹੋਏ।`,
    newSwap: "ਨਵਾਂ ਸਵੈਪ",
    unusedTitle: "ICPSwap ਪੂਲ ਵਿੱਚ ਬਾਕੀ ਬਕਾਇਆ",
    unusedText: "ਅਧੂਰੇ ਸਵੈਪ ਤੋਂ ਬਾਅਦ ਪੂਲ ਤੁਹਾਡੇ ਖਾਤੇ ਲਈ ਇਹ ਰਕਮ ਰੱਖਦਾ ਹੈ।",
    withdrawUnused: "ਮੇਰੇ ਵਾਲਿਟ ਵਿੱਚ ਕਢਵਾਓ",
    withdrawing: "ਕਢਵਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
    withdrawDone: "ਬਕਾਇਆ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਕਢਵਾਇਆ ਗਿਆ।",
    withdrawFailed: (detail: string) => `ਕਢਵਾਉਣਾ ਅਸਫਲ ਰਿਹਾ: ${detail}`,
    feeError: "ਟੋਕਨ ਲੈਜਰ ਦੀ ਫੀਸ ਪੜ੍ਹੀ ਨਹੀਂ ਜਾ ਸਕੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    addToken: "ਟੋਕਨ ਜੋੜੋ",
    addTokenLabel: "ਚਿੰਨ੍ਹ ਜਾਂ ਲੈਜਰ ID",
    addTokenHint:
      "ICPSwap 'ਤੇ ਸੂਚੀਬੱਧ ਟੋਕਨ ਨੂੰ ਚਿੰਨ੍ਹ ਨਾਲ ਖੋਜੋ, ਜਾਂ ਉਸਦੀ ਲੈਜਰ ID ਪੇਸਟ ਕਰੋ। ਜੋੜੇ ਟੋਕਨ ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਰੱਖੇ ਜਾਂਦੇ ਹਨ ਅਤੇ ਸਿਰਫ਼ ਇਸ ਚੋਣਕਾਰ ਵਿੱਚ ਦਿਖਦੇ ਹਨ।",
    addTokenSubmit: "ਜੋੜੋ",
    addTokenReading: "ਟੋਕਨ ਲੈਜਰ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
    addTokenListLoading: "ICPSwap ਟੋਕਨ ਸੂਚੀ ਪੜ੍ਹੀ ਜਾ ਰਹੀ ਹੈ…",
    addTokenListError:
      "ICPSwap ਟੋਕਨ ਸੂਚੀ ਪੜ੍ਹੀ ਨਹੀਂ ਜਾ ਸਕੀ। ਇਸਦੀ ਥਾਂ ਲੈਜਰ ID ਪੇਸਟ ਕਰੋ।",
    addTokenNoMatch:
      "ਕੋਈ ICPSwap-ਸੂਚੀਬੱਧ ਟੋਕਨ ਇਸ ਚਿੰਨ੍ਹ ਨਾਲ ਮੇਲ ਨਹੀਂ ਖਾਂਦਾ। ਇਸਦੀ ਥਾਂ ਲੈਜਰ ID ਪੇਸਟ ਕਰੋ।",
    addTokenInvalidId: "ਅਵੈਧ ਲੈਜਰ ID।",
    addTokenNotIcrc:
      "ਇਸ canister ਨੇ ICRC-1 ਟੋਕਨ ਮੈਟਾਡੇਟਾ ਨਹੀਂ ਦਿੱਤਾ। ਇਸਨੂੰ ਜੋੜਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।",
    addTokenAlready: (symbol: string) => `${symbol} ਪਹਿਲਾਂ ਹੀ ਸੂਚੀ ਵਿੱਚ ਹੈ।`,
    addTokenDone: (symbol: string) => `${symbol} ਜੋੜਿਆ ਗਿਆ।`,
    addedTokens: "ਜੋੜੇ ਟੋਕਨ",
    removeToken: (symbol: string) => `${symbol} ਹਟਾਓ`,
    closeAddToken: "ਬੰਦ ਕਰੋ",
  },
});

/** Mint TTTI-T header button and the Onramper Buy notes of the token rows. */
export const WALLET_BUY_TEXT = defineDict({
  en: {
    mint: "Mint TTTI-T",
    btcCopied: "BTC address copied — paste it in Onramper",
    btcPending:
      "Your BTC address is being created in the BTC → ckBTC panel. Copy it from there into Onramper.",
    stableNote: (symbol: string) =>
      `Onramper sells ICP to this address. Once the ICP has arrived, swap it for ${symbol}.`,
    stableNoteLink: (symbol: string) => `Swap ICP → ${symbol}`,
    close: "Close",
  },
  fr: {
    mint: "Frapper du TTTI-T",
    btcCopied: "Adresse BTC copiée — collez-la dans Onramper",
    btcPending:
      "Votre adresse BTC est en cours de création dans le panneau BTC → ckBTC. Copiez-la depuis ce panneau dans Onramper.",
    stableNote: (symbol: string) =>
      `Onramper vend de l'ICP vers cette adresse. Une fois l'ICP arrivé, échangez-le contre du ${symbol}.`,
    stableNoteLink: (symbol: string) => `Échanger ICP → ${symbol}`,
    close: "Fermer",
  },
  es: {
    mint: "Acuñar TTTI-T",
    btcCopied: "Dirección BTC copiada: pégala en Onramper",
    btcPending:
      "Su dirección BTC se está creando en el panel BTC → ckBTC. Cópiela desde allí en Onramper.",
    stableNote: (symbol: string) =>
      `Onramper vende ICP a esta dirección. Cuando el ICP haya llegado, intercámbielo por ${symbol}.`,
    stableNoteLink: (symbol: string) => `Intercambiar ICP → ${symbol}`,
    close: "Cerrar",
  },
  "zh-Hans": {
    mint: "铸造 TTTI-T",
    btcCopied: "BTC 地址已复制——请粘贴到 Onramper 中",
    btcPending:
      "您的 BTC 地址正在 BTC → ckBTC 面板中创建。请从该面板复制到 Onramper。",
    stableNote: (symbol: string) =>
      `Onramper 向此地址出售 ICP。ICP 到账后，将其兑换为 ${symbol}。`,
    stableNoteLink: (symbol: string) => `兑换 ICP → ${symbol}`,
    close: "关闭",
  },
  "pt-BR": {
    mint: "Cunhar TTTI-T",
    btcCopied: "Endereço BTC copiado — cole no Onramper",
    btcPending:
      "Seu endereço BTC está sendo criado no painel BTC → ckBTC. Copie-o de lá para o Onramper.",
    stableNote: (symbol: string) =>
      `O Onramper vende ICP para este endereço. Quando o ICP chegar, troque-o por ${symbol}.`,
    stableNoteLink: (symbol: string) => `Trocar ICP → ${symbol}`,
    close: "Fechar",
  },
  ko: {
    mint: "TTTI-T 발행",
    btcCopied: "BTC 주소가 복사되었습니다 — Onramper에 붙여넣으세요",
    btcPending:
      "BTC → ckBTC 패널에서 BTC 주소를 생성하는 중입니다. 그곳에서 복사해 Onramper에 붙여넣으세요.",
    stableNote: (symbol: string) =>
      `Onramper는 이 주소로 ICP를 판매합니다. ICP가 도착하면 ${symbol}으로 스왑하세요.`,
    stableNoteLink: (symbol: string) => `ICP → ${symbol} 스왑`,
    close: "닫기",
  },
  "pa-Guru": {
    mint: "TTTI-T ਮਿੰਟ ਕਰੋ",
    btcCopied: "BTC ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ — ਇਸਨੂੰ Onramper ਵਿੱਚ ਪੇਸਟ ਕਰੋ",
    btcPending:
      "ਤੁਹਾਡਾ BTC ਪਤਾ BTC → ckBTC ਪੈਨਲ ਵਿੱਚ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ। ਉੱਥੋਂ ਕਾਪੀ ਕਰਕੇ Onramper ਵਿੱਚ ਪੇਸਟ ਕਰੋ।",
    stableNote: (symbol: string) =>
      `Onramper ਇਸ ਪਤੇ 'ਤੇ ICP ਵੇਚਦਾ ਹੈ। ICP ਪਹੁੰਚਣ ਤੋਂ ਬਾਅਦ, ਇਸਨੂੰ ${symbol} ਲਈ ਸਵੈਪ ਕਰੋ।`,
    stableNoteLink: (symbol: string) => `ICP → ${symbol} ਸਵੈਪ ਕਰੋ`,
    close: "ਬੰਦ ਕਰੋ",
  },
});
