import { defineDict } from "../core/dict";

/**
 * User-facing error and toast messages raised by shared hooks and lib helpers
 * (lib/token.ts, lib/icpLedger.ts, hooks/useQueries.ts, hooks/useIcpApprove.ts,
 * hooks/usePlug.ts, hooks/usePlugPurchase.ts, hooks/useBuyFunnel.ts). Read
 * them at throw time with pickDict(MESSAGES_TEXT). Amounts, symbols, block
 * indexes and ledger messages are passed in unchanged.
 */
export const MESSAGES_TEXT = defineDict({
  en: {
    deliveryEmpty: "Paste your Principal ID.",
    deliveryAccountIdentifier:
      "This is an account ID; please paste your Principal ID instead",
    deliveryInvalidPrincipal:
      "This is not a valid Principal ID. Check it and try again.",
    deliveryAnonymousPrincipal:
      "The anonymous principal cannot receive tokens. Paste your own Principal ID.",
    deliveryAnonymousCaller: "Sign in before saving a delivery address.",
    ackSignInFirst: "Sign in before accepting the purchase acknowledgements",
    ackConnectPlugFirst:
      "Connect Plug before accepting the purchase acknowledgements",
    ackNotRecorded: "Could not record the acknowledgements",
    btcAnonymousCaller: "Sign in to use a Bitcoin deposit address.",
    btcAcknowledgementRequired:
      "Accept the purchase acknowledgements before your first purchase.",
    btcPurchaseInProgress:
      "A purchase is already in progress. Try again shortly.",
    btcNoAddressYet: "No Bitcoin address yet. Get an address first.",
    btcMinterUnavailable: "The ckBTC minter is unavailable. Try again later.",
    priceSourceNone: "No live source",
    rateLine: (symbol: string, rate: string, source: string, until: string) =>
      `Rate for this hour: 1 ${symbol} = ${rate} USD (${source}) · valid until ${until}`,
    plugNotDetected:
      "Plug wallet extension not detected. Install Plug to continue.",
    enterAmount: "Enter an amount to pay.",
    setupNotSaved: "Could not save your setup",
    approveAmountZero: (symbol: string) =>
      `Enter a ${symbol} amount greater than zero.`,
    approveSpenderLoading:
      "The token canister is still loading. Try again shortly.",
    approveInsufficient: (
      symbol: string,
      required: string,
      fee: string,
      balance: string,
    ) =>
      `Insufficient ${symbol}. You need ${required} (purchase plus 2 × ${fee} fees) but have ${balance}.`,
    approveConnectPlug: (symbol: string) =>
      `Connect Plug to approve ${symbol}.`,
    approveConnectWallet: (symbol: string) =>
      `Connect Internet Identity or Plug to approve ${symbol}.`,
    approveErrInsufficientFunds: (
      symbol: string,
      balance: string,
      fee: string,
    ) =>
      `Not enough ${symbol} to approve this purchase. Your balance is ${balance}; the approval fee is ${fee}.`,
    approveErrBadFee: (symbol: string, expected: string) =>
      `The ${symbol} ledger expects a fee of ${expected}. Please try again.`,
    approveErrAllowanceChanged: (symbol: string, current: string) =>
      `Your existing ${symbol} allowance changed to ${current} while approving. Please try again.`,
    approveErrExpired:
      "The approval expired before the ledger processed it. Please approve again.",
    approveErrTooOld:
      "The approval request is too old. Check your device clock and try again.",
    approveErrCreatedInFuture:
      "The approval timestamp is ahead of the ledger clock. Check your device clock and try again.",
    approveErrDuplicate: (block: string) =>
      `This approval was already submitted (block ${block}). You can continue with the purchase.`,
    approveErrUnavailable: (symbol: string) =>
      `The ${symbol} ledger is temporarily unavailable. Please try again in a moment.`,
    approveErrGeneric: (symbol: string, message: string) =>
      `The ${symbol} ledger rejected the approval: ${message}`,
    approveCancelled: "The approval was cancelled in your wallet.",
    approveNetwork: (symbol: string) =>
      `Could not reach the ${symbol} ledger. Check your connection and try again.`,
    approveFailed: (symbol: string) =>
      `The ${symbol} approval could not be completed. Please try again.`,
  },
  fr: {
    deliveryEmpty: "Collez votre Principal ID.",
    deliveryAccountIdentifier:
      "Ceci est un account ID ; veuillez plutôt coller votre Principal ID",
    deliveryInvalidPrincipal:
      "Ce Principal ID n'est pas valide. Vérifiez-le et réessayez.",
    deliveryAnonymousPrincipal:
      "Le principal anonyme ne peut pas recevoir de jetons. Collez votre propre Principal ID.",
    deliveryAnonymousCaller:
      "Connectez-vous avant d'enregistrer une adresse de livraison.",
    ackSignInFirst: "Connectez-vous avant d'accepter les confirmations d'achat",
    ackConnectPlugFirst:
      "Connectez Plug avant d'accepter les confirmations d'achat",
    ackNotRecorded: "Impossible d'enregistrer les confirmations",
    btcAnonymousCaller:
      "Connectez-vous pour utiliser une adresse de dépôt Bitcoin.",
    btcAcknowledgementRequired:
      "Acceptez les confirmations d'achat avant votre premier achat.",
    btcPurchaseInProgress:
      "Un achat est déjà en cours. Réessayez dans un instant.",
    btcNoAddressYet:
      "Pas encore d'adresse Bitcoin. Obtenez d'abord une adresse.",
    btcMinterUnavailable:
      "Le minter ckBTC est indisponible. Réessayez plus tard.",
    priceSourceNone: "Aucune source active",
    rateLine: (symbol: string, rate: string, source: string, until: string) =>
      `Taux de cette heure : 1 ${symbol} = ${rate} USD (${source}) · valable jusqu'à ${until}`,
    plugNotDetected:
      "Extension du wallet Plug non détectée. Installez Plug pour continuer.",
    enterAmount: "Saisissez un montant à payer.",
    setupNotSaved: "Impossible d'enregistrer votre configuration",
    approveAmountZero: (symbol: string) =>
      `Saisissez un montant en ${symbol} supérieur à zéro.`,
    approveSpenderLoading:
      "Le canister du jeton est encore en cours de chargement. Réessayez dans un instant.",
    approveInsufficient: (
      symbol: string,
      required: string,
      fee: string,
      balance: string,
    ) =>
      `${symbol} insuffisant. Il vous faut ${required} (achat plus 2 × ${fee} de frais) mais vous avez ${balance}.`,
    approveConnectPlug: (symbol: string) =>
      `Connectez Plug pour approuver le ${symbol}.`,
    approveConnectWallet: (symbol: string) =>
      `Connectez Internet Identity ou Plug pour approuver le ${symbol}.`,
    approveErrInsufficientFunds: (
      symbol: string,
      balance: string,
      fee: string,
    ) =>
      `Pas assez de ${symbol} pour approuver cet achat. Votre solde est de ${balance} ; les frais d'approbation sont de ${fee}.`,
    approveErrBadFee: (symbol: string, expected: string) =>
      `Le ledger ${symbol} attend des frais de ${expected}. Veuillez réessayer.`,
    approveErrAllowanceChanged: (symbol: string, current: string) =>
      `Votre autorisation ${symbol} existante est passée à ${current} pendant l'approbation. Veuillez réessayer.`,
    approveErrExpired:
      "L'approbation a expiré avant que le ledger ne la traite. Veuillez approuver à nouveau.",
    approveErrTooOld:
      "La demande d'approbation est trop ancienne. Vérifiez l'horloge de votre appareil et réessayez.",
    approveErrCreatedInFuture:
      "L'horodatage de l'approbation est en avance sur l'horloge du ledger. Vérifiez l'horloge de votre appareil et réessayez.",
    approveErrDuplicate: (block: string) =>
      `Cette approbation a déjà été soumise (bloc ${block}). Vous pouvez poursuivre l'achat.`,
    approveErrUnavailable: (symbol: string) =>
      `Le ledger ${symbol} est temporairement indisponible. Veuillez réessayer dans un instant.`,
    approveErrGeneric: (symbol: string, message: string) =>
      `Le ledger ${symbol} a refusé l'approbation : ${message}`,
    approveCancelled: "L'approbation a été annulée dans votre wallet.",
    approveNetwork: (symbol: string) =>
      `Impossible de joindre le ledger ${symbol}. Vérifiez votre connexion et réessayez.`,
    approveFailed: (symbol: string) =>
      `L'approbation ${symbol} n'a pas pu être effectuée. Veuillez réessayer.`,
  },
  es: {
    deliveryEmpty: "Pegue su Principal ID.",
    deliveryAccountIdentifier:
      "Esto es un account ID; pegue en su lugar su Principal ID",
    deliveryInvalidPrincipal:
      "Este Principal ID no es válido. Compruébelo e inténtelo de nuevo.",
    deliveryAnonymousPrincipal:
      "El principal anónimo no puede recibir tokens. Pegue su propio Principal ID.",
    deliveryAnonymousCaller:
      "Inicie sesión antes de guardar una dirección de entrega.",
    ackSignInFirst:
      "Inicie sesión antes de aceptar las confirmaciones de compra",
    ackConnectPlugFirst:
      "Conecte Plug antes de aceptar las confirmaciones de compra",
    ackNotRecorded: "No se pudieron registrar las confirmaciones",
    btcAnonymousCaller:
      "Inicie sesión para usar una dirección de depósito de Bitcoin.",
    btcAcknowledgementRequired:
      "Acepte las confirmaciones de compra antes de su primera compra.",
    btcPurchaseInProgress:
      "Ya hay una compra en curso. Inténtelo de nuevo en breve.",
    btcNoAddressYet:
      "Todavía no hay dirección de Bitcoin. Obtenga primero una dirección.",
    btcMinterUnavailable:
      "El minter de ckBTC no está disponible. Inténtelo más tarde.",
    priceSourceNone: "Ninguna fuente activa",
    rateLine: (symbol: string, rate: string, source: string, until: string) =>
      `Tipo de esta hora: 1 ${symbol} = ${rate} USD (${source}) · válido hasta las ${until}`,
    plugNotDetected:
      "No se detectó la extensión del wallet Plug. Instale Plug para continuar.",
    enterAmount: "Introduzca un importe a pagar.",
    setupNotSaved: "No se pudo guardar su configuración",
    approveAmountZero: (symbol: string) =>
      `Introduzca un importe en ${symbol} mayor que cero.`,
    approveSpenderLoading:
      "El canister del token todavía se está cargando. Inténtelo de nuevo en breve.",
    approveInsufficient: (
      symbol: string,
      required: string,
      fee: string,
      balance: string,
    ) =>
      `${symbol} insuficiente. Necesita ${required} (compra más 2 × ${fee} de comisiones) pero tiene ${balance}.`,
    approveConnectPlug: (symbol: string) =>
      `Conecte Plug para aprobar ${symbol}.`,
    approveConnectWallet: (symbol: string) =>
      `Conecte Internet Identity o Plug para aprobar ${symbol}.`,
    approveErrInsufficientFunds: (
      symbol: string,
      balance: string,
      fee: string,
    ) =>
      `No tiene suficiente ${symbol} para aprobar esta compra. Su saldo es ${balance}; la comisión de aprobación es ${fee}.`,
    approveErrBadFee: (symbol: string, expected: string) =>
      `El ledger de ${symbol} espera una comisión de ${expected}. Inténtelo de nuevo.`,
    approveErrAllowanceChanged: (symbol: string, current: string) =>
      `Su autorización de ${symbol} existente cambió a ${current} durante la aprobación. Inténtelo de nuevo.`,
    approveErrExpired:
      "La aprobación caducó antes de que el ledger la procesara. Apruebe de nuevo.",
    approveErrTooOld:
      "La solicitud de aprobación es demasiado antigua. Compruebe el reloj de su dispositivo e inténtelo de nuevo.",
    approveErrCreatedInFuture:
      "La marca de tiempo de la aprobación va por delante del reloj del ledger. Compruebe el reloj de su dispositivo e inténtelo de nuevo.",
    approveErrDuplicate: (block: string) =>
      `Esta aprobación ya se envió (bloque ${block}). Puede continuar con la compra.`,
    approveErrUnavailable: (symbol: string) =>
      `El ledger de ${symbol} no está disponible temporalmente. Inténtelo de nuevo en un momento.`,
    approveErrGeneric: (symbol: string, message: string) =>
      `El ledger de ${symbol} rechazó la aprobación: ${message}`,
    approveCancelled: "La aprobación se canceló en su wallet.",
    approveNetwork: (symbol: string) =>
      `No se pudo contactar con el ledger de ${symbol}. Compruebe su conexión e inténtelo de nuevo.`,
    approveFailed: (symbol: string) =>
      `No se pudo completar la aprobación de ${symbol}. Inténtelo de nuevo.`,
  },
  "zh-Hans": {
    deliveryEmpty: "请粘贴您的 Principal ID。",
    deliveryAccountIdentifier:
      "这是一个 account ID；请改为粘贴您的 Principal ID",
    deliveryInvalidPrincipal: "这不是有效的 Principal ID。请检查后重试。",
    deliveryAnonymousPrincipal:
      "匿名 principal 无法接收代币。请粘贴您自己的 Principal ID。",
    deliveryAnonymousCaller: "保存收货地址前请先登录。",
    ackSignInFirst: "接受购买确认事项前请先登录",
    ackConnectPlugFirst: "接受购买确认事项前请先连接 Plug",
    ackNotRecorded: "无法记录确认事项",
    btcAnonymousCaller: "请登录以使用 Bitcoin 存款地址。",
    btcAcknowledgementRequired: "首次购买前请接受购买确认事项。",
    btcPurchaseInProgress: "已有一笔购买正在进行中。请稍后重试。",
    btcNoAddressYet: "尚无 Bitcoin 地址。请先获取地址。",
    btcMinterUnavailable: "ckBTC minter 暂不可用。请稍后重试。",
    priceSourceNone: "无可用来源",
    rateLine: (symbol: string, rate: string, source: string, until: string) =>
      `本小时汇率：1 ${symbol} = ${rate} USD（${source}）· 有效至 ${until}`,
    plugNotDetected: "未检测到 Plug 钱包扩展。请安装 Plug 以继续。",
    enterAmount: "请输入支付金额。",
    setupNotSaved: "无法保存您的设置",
    approveAmountZero: (symbol: string) => `请输入大于零的 ${symbol} 金额。`,
    approveSpenderLoading: "代币 canister 仍在加载中。请稍后重试。",
    approveInsufficient: (
      symbol: string,
      required: string,
      fee: string,
      balance: string,
    ) =>
      `${symbol} 不足。您需要 ${required}（购买金额加 2 × ${fee} 费用），但您只有 ${balance}。`,
    approveConnectPlug: (symbol: string) => `请连接 Plug 以授权 ${symbol}。`,
    approveConnectWallet: (symbol: string) =>
      `请连接 Internet Identity 或 Plug 以授权 ${symbol}。`,
    approveErrInsufficientFunds: (
      symbol: string,
      balance: string,
      fee: string,
    ) =>
      `${symbol} 不足，无法授权此次购买。您的余额为 ${balance}；授权费用为 ${fee}。`,
    approveErrBadFee: (symbol: string, expected: string) =>
      `${symbol} ledger 要求的费用为 ${expected}。请重试。`,
    approveErrAllowanceChanged: (symbol: string, current: string) =>
      `授权过程中，您现有的 ${symbol} 授权额度已变为 ${current}。请重试。`,
    approveErrExpired: "授权在 ledger 处理之前已过期。请重新授权。",
    approveErrTooOld: "授权请求过旧。请检查您设备的时钟后重试。",
    approveErrCreatedInFuture:
      "授权时间戳超前于 ledger 时钟。请检查您设备的时钟后重试。",
    approveErrDuplicate: (block: string) =>
      `此授权已提交（区块 ${block}）。您可以继续购买。`,
    approveErrUnavailable: (symbol: string) =>
      `${symbol} ledger 暂时不可用。请稍后重试。`,
    approveErrGeneric: (symbol: string, message: string) =>
      `${symbol} ledger 拒绝了授权：${message}`,
    approveCancelled: "授权已在您的钱包中取消。",
    approveNetwork: (symbol: string) =>
      `无法连接 ${symbol} ledger。请检查您的网络连接后重试。`,
    approveFailed: (symbol: string) => `${symbol} 授权未能完成。请重试。`,
  },
  "pt-BR": {
    deliveryEmpty: "Cole o seu Principal ID.",
    deliveryAccountIdentifier:
      "Isto é um account ID; cole o seu Principal ID em vez disso",
    deliveryInvalidPrincipal:
      "Este não é um Principal ID válido. Verifique e tente novamente.",
    deliveryAnonymousPrincipal:
      "O principal anônimo não pode receber tokens. Cole o seu próprio Principal ID.",
    deliveryAnonymousCaller: "Entre antes de salvar um endereço de entrega.",
    ackSignInFirst: "Entre antes de aceitar as confirmações de compra",
    ackConnectPlugFirst:
      "Conecte o Plug antes de aceitar as confirmações de compra",
    ackNotRecorded: "Não foi possível registrar as confirmações",
    btcAnonymousCaller: "Entre para usar um endereço de depósito de Bitcoin.",
    btcAcknowledgementRequired:
      "Aceite as confirmações de compra antes da sua primeira compra.",
    btcPurchaseInProgress:
      "Já existe uma compra em andamento. Tente novamente em instantes.",
    btcNoAddressYet:
      "Ainda não há endereço de Bitcoin. Obtenha um endereço primeiro.",
    btcMinterUnavailable:
      "O minter de ckBTC está indisponível. Tente novamente mais tarde.",
    priceSourceNone: "Nenhuma fonte ativa",
    rateLine: (symbol: string, rate: string, source: string, until: string) =>
      `Taxa desta hora: 1 ${symbol} = ${rate} USD (${source}) · válida até ${until}`,
    plugNotDetected:
      "Extensão do wallet Plug não detectada. Instale o Plug para continuar.",
    enterAmount: "Informe um valor a pagar.",
    setupNotSaved: "Não foi possível salvar a sua configuração",
    approveAmountZero: (symbol: string) =>
      `Informe um valor em ${symbol} maior que zero.`,
    approveSpenderLoading:
      "O canister do token ainda está carregando. Tente novamente em instantes.",
    approveInsufficient: (
      symbol: string,
      required: string,
      fee: string,
      balance: string,
    ) =>
      `${symbol} insuficiente. Você precisa de ${required} (compra mais 2 × ${fee} de taxas), mas tem ${balance}.`,
    approveConnectPlug: (symbol: string) =>
      `Conecte o Plug para aprovar ${symbol}.`,
    approveConnectWallet: (symbol: string) =>
      `Conecte a Internet Identity ou o Plug para aprovar ${symbol}.`,
    approveErrInsufficientFunds: (
      symbol: string,
      balance: string,
      fee: string,
    ) =>
      `${symbol} insuficiente para aprovar esta compra. Seu saldo é ${balance}; a taxa de aprovação é ${fee}.`,
    approveErrBadFee: (symbol: string, expected: string) =>
      `O ledger de ${symbol} espera uma taxa de ${expected}. Tente novamente.`,
    approveErrAllowanceChanged: (symbol: string, current: string) =>
      `Sua autorização de ${symbol} existente mudou para ${current} durante a aprovação. Tente novamente.`,
    approveErrExpired:
      "A aprovação expirou antes de o ledger processá-la. Aprove novamente.",
    approveErrTooOld:
      "A solicitação de aprovação é antiga demais. Verifique o relógio do seu dispositivo e tente novamente.",
    approveErrCreatedInFuture:
      "O registro de data e hora da aprovação está adiantado em relação ao relógio do ledger. Verifique o relógio do seu dispositivo e tente novamente.",
    approveErrDuplicate: (block: string) =>
      `Esta aprovação já foi enviada (bloco ${block}). Você pode continuar com a compra.`,
    approveErrUnavailable: (symbol: string) =>
      `O ledger de ${symbol} está temporariamente indisponível. Tente novamente em instantes.`,
    approveErrGeneric: (symbol: string, message: string) =>
      `O ledger de ${symbol} recusou a aprovação: ${message}`,
    approveCancelled: "A aprovação foi cancelada no seu wallet.",
    approveNetwork: (symbol: string) =>
      `Não foi possível acessar o ledger de ${symbol}. Verifique sua conexão e tente novamente.`,
    approveFailed: (symbol: string) =>
      `Não foi possível concluir a aprovação de ${symbol}. Tente novamente.`,
  },
  ko: {
    deliveryEmpty: "Principal ID를 붙여 넣으십시오.",
    deliveryAccountIdentifier:
      "이것은 account ID입니다. 대신 Principal ID를 붙여 넣으십시오",
    deliveryInvalidPrincipal:
      "유효한 Principal ID가 아닙니다. 확인 후 다시 시도하십시오.",
    deliveryAnonymousPrincipal:
      "익명 principal은 토큰을 받을 수 없습니다. 본인의 Principal ID를 붙여 넣으십시오.",
    deliveryAnonymousCaller: "수령 주소를 저장하기 전에 로그인하십시오.",
    ackSignInFirst: "구매 확인 사항에 동의하기 전에 로그인하십시오",
    ackConnectPlugFirst: "구매 확인 사항에 동의하기 전에 Plug를 연결하십시오",
    ackNotRecorded: "확인 사항을 기록할 수 없습니다",
    btcAnonymousCaller: "Bitcoin 입금 주소를 사용하려면 로그인하십시오.",
    btcAcknowledgementRequired: "첫 구매 전에 구매 확인 사항에 동의하십시오.",
    btcPurchaseInProgress:
      "이미 진행 중인 구매가 있습니다. 잠시 후 다시 시도하십시오.",
    btcNoAddressYet: "아직 Bitcoin 주소가 없습니다. 먼저 주소를 받으십시오.",
    btcMinterUnavailable:
      "ckBTC minter를 사용할 수 없습니다. 나중에 다시 시도하십시오.",
    priceSourceNone: "사용 가능한 소스 없음",
    rateLine: (symbol: string, rate: string, source: string, until: string) =>
      `이번 시간 환율: 1 ${symbol} = ${rate} USD (${source}) · ${until}까지 유효`,
    plugNotDetected:
      "Plug 지갑 확장 프로그램이 감지되지 않았습니다. 계속하려면 Plug를 설치하십시오.",
    enterAmount: "지불할 금액을 입력하십시오.",
    setupNotSaved: "설정을 저장할 수 없습니다",
    approveAmountZero: (symbol: string) =>
      `0보다 큰 ${symbol} 금액을 입력하십시오.`,
    approveSpenderLoading:
      "토큰 canister를 아직 불러오는 중입니다. 잠시 후 다시 시도하십시오.",
    approveInsufficient: (
      symbol: string,
      required: string,
      fee: string,
      balance: string,
    ) =>
      `${symbol}이(가) 부족합니다. ${required}(구매 금액 + 수수료 2 × ${fee})이(가) 필요하지만 보유량은 ${balance}입니다.`,
    approveConnectPlug: (symbol: string) =>
      `${symbol}을(를) 승인하려면 Plug를 연결하십시오.`,
    approveConnectWallet: (symbol: string) =>
      `${symbol}을(를) 승인하려면 Internet Identity 또는 Plug를 연결하십시오.`,
    approveErrInsufficientFunds: (
      symbol: string,
      balance: string,
      fee: string,
    ) =>
      `이 구매를 승인하기에 ${symbol}이(가) 부족합니다. 잔액은 ${balance}이며 승인 수수료는 ${fee}입니다.`,
    approveErrBadFee: (symbol: string, expected: string) =>
      `${symbol} ledger가 요구하는 수수료는 ${expected}입니다. 다시 시도하십시오.`,
    approveErrAllowanceChanged: (symbol: string, current: string) =>
      `승인하는 동안 기존 ${symbol} 허용 한도가 ${current}(으)로 변경되었습니다. 다시 시도하십시오.`,
    approveErrExpired:
      "ledger가 처리하기 전에 승인이 만료되었습니다. 다시 승인하십시오.",
    approveErrTooOld:
      "승인 요청이 너무 오래되었습니다. 기기의 시계를 확인한 후 다시 시도하십시오.",
    approveErrCreatedInFuture:
      "승인 타임스탬프가 ledger 시계보다 앞서 있습니다. 기기의 시계를 확인한 후 다시 시도하십시오.",
    approveErrDuplicate: (block: string) =>
      `이 승인은 이미 제출되었습니다(블록 ${block}). 구매를 계속할 수 있습니다.`,
    approveErrUnavailable: (symbol: string) =>
      `${symbol} ledger를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하십시오.`,
    approveErrGeneric: (symbol: string, message: string) =>
      `${symbol} ledger가 승인을 거부했습니다: ${message}`,
    approveCancelled: "지갑에서 승인이 취소되었습니다.",
    approveNetwork: (symbol: string) =>
      `${symbol} ledger에 연결할 수 없습니다. 연결 상태를 확인한 후 다시 시도하십시오.`,
    approveFailed: (symbol: string) =>
      `${symbol} 승인을 완료할 수 없습니다. 다시 시도하십시오.`,
  },
  "pa-Guru": {
    deliveryEmpty: "ਆਪਣੀ Principal ID ਪੇਸਟ ਕਰੋ।",
    deliveryAccountIdentifier:
      "ਇਹ ਇੱਕ account ID ਹੈ; ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਦੀ ਬਜਾਏ ਆਪਣੀ Principal ID ਪੇਸਟ ਕਰੋ",
    deliveryInvalidPrincipal:
      "ਇਹ ਇੱਕ ਵੈਧ Principal ID ਨਹੀਂ ਹੈ। ਇਸ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    deliveryAnonymousPrincipal:
      "ਅਗਿਆਤ principal ਟੋਕਨ ਪ੍ਰਾਪਤ ਨਹੀਂ ਕਰ ਸਕਦਾ। ਆਪਣੀ ਖੁਦ ਦੀ Principal ID ਪੇਸਟ ਕਰੋ।",
    deliveryAnonymousCaller: "ਡਿਲੀਵਰੀ ਪਤਾ ਸੇਵ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਸਾਈਨ ਇਨ ਕਰੋ।",
    ackSignInFirst: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਸਵੀਕਾਰ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਸਾਈਨ ਇਨ ਕਰੋ",
    ackConnectPlugFirst: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਸਵੀਕਾਰ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ Plug ਕਨੈਕਟ ਕਰੋ",
    ackNotRecorded: "ਪੁਸ਼ਟੀਆਂ ਦਰਜ ਨਹੀਂ ਕੀਤੀਆਂ ਜਾ ਸਕੀਆਂ",
    btcAnonymousCaller: "Bitcoin ਜਮ੍ਹਾਂ ਪਤਾ ਵਰਤਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    btcAcknowledgementRequired: "ਆਪਣੀ ਪਹਿਲੀ ਖਰੀਦ ਤੋਂ ਪਹਿਲਾਂ ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਸਵੀਕਾਰ ਕਰੋ।",
    btcPurchaseInProgress:
      "ਇੱਕ ਖਰੀਦ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    btcNoAddressYet: "ਅਜੇ ਕੋਈ Bitcoin ਪਤਾ ਨਹੀਂ ਹੈ। ਪਹਿਲਾਂ ਇੱਕ ਪਤਾ ਪ੍ਰਾਪਤ ਕਰੋ।",
    btcMinterUnavailable: "ckBTC minter ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    priceSourceNone: "ਕੋਈ ਸਰਗਰਮ ਸਰੋਤ ਨਹੀਂ",
    rateLine: (symbol: string, rate: string, source: string, until: string) =>
      `ਇਸ ਘੰਟੇ ਦੀ ਦਰ: 1 ${symbol} = ${rate} USD (${source}) · ${until} ਤੱਕ ਵੈਧ`,
    plugNotDetected: "Plug ਵਾਲਿਟ ਐਕਸਟੈਂਸ਼ਨ ਨਹੀਂ ਮਿਲੀ। ਜਾਰੀ ਰੱਖਣ ਲਈ Plug ਇੰਸਟਾਲ ਕਰੋ।",
    enterAmount: "ਭੁਗਤਾਨ ਕਰਨ ਲਈ ਰਕਮ ਦਰਜ ਕਰੋ।",
    setupNotSaved: "ਤੁਹਾਡਾ ਸੈੱਟਅੱਪ ਸੇਵ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ",
    approveAmountZero: (symbol: string) => `ਸਿਫ਼ਰ ਤੋਂ ਵੱਧ ${symbol} ਰਕਮ ਦਰਜ ਕਰੋ।`,
    approveSpenderLoading:
      "ਟੋਕਨ canister ਅਜੇ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    approveInsufficient: (
      symbol: string,
      required: string,
      fee: string,
      balance: string,
    ) =>
      `${symbol} ਨਾਕਾਫ਼ੀ ਹੈ। ਤੁਹਾਨੂੰ ${required} (ਖਰੀਦ ਅਤੇ 2 × ${fee} ਫੀਸਾਂ) ਦੀ ਲੋੜ ਹੈ ਪਰ ਤੁਹਾਡੇ ਕੋਲ ${balance} ਹੈ।`,
    approveConnectPlug: (symbol: string) =>
      `${symbol} ਨੂੰ ਮਨਜ਼ੂਰੀ ਦੇਣ ਲਈ Plug ਕਨੈਕਟ ਕਰੋ।`,
    approveConnectWallet: (symbol: string) =>
      `${symbol} ਨੂੰ ਮਨਜ਼ੂਰੀ ਦੇਣ ਲਈ Internet Identity ਜਾਂ Plug ਕਨੈਕਟ ਕਰੋ।`,
    approveErrInsufficientFunds: (
      symbol: string,
      balance: string,
      fee: string,
    ) =>
      `ਇਸ ਖਰੀਦ ਨੂੰ ਮਨਜ਼ੂਰੀ ਦੇਣ ਲਈ ਲੋੜੀਂਦਾ ${symbol} ਨਹੀਂ ਹੈ। ਤੁਹਾਡਾ ਬਕਾਇਆ ${balance} ਹੈ; ਮਨਜ਼ੂਰੀ ਫੀਸ ${fee} ਹੈ।`,
    approveErrBadFee: (symbol: string, expected: string) =>
      `${symbol} ledger ${expected} ਦੀ ਫੀਸ ਦੀ ਉਮੀਦ ਕਰਦਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    approveErrAllowanceChanged: (symbol: string, current: string) =>
      `ਮਨਜ਼ੂਰੀ ਦੌਰਾਨ ਤੁਹਾਡੀ ਮੌਜੂਦਾ ${symbol} ਇਜਾਜ਼ਤ ਬਦਲ ਕੇ ${current} ਹੋ ਗਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    approveErrExpired:
      "ledger ਦੁਆਰਾ ਪ੍ਰਕਿਰਿਆ ਕੀਤੇ ਜਾਣ ਤੋਂ ਪਹਿਲਾਂ ਮਨਜ਼ੂਰੀ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਗਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਮਨਜ਼ੂਰੀ ਦਿਓ।",
    approveErrTooOld:
      "ਮਨਜ਼ੂਰੀ ਬੇਨਤੀ ਬਹੁਤ ਪੁਰਾਣੀ ਹੈ। ਆਪਣੇ ਡਿਵਾਈਸ ਦੀ ਘੜੀ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    approveErrCreatedInFuture:
      "ਮਨਜ਼ੂਰੀ ਦਾ ਟਾਈਮਸਟੈਂਪ ledger ਦੀ ਘੜੀ ਤੋਂ ਅੱਗੇ ਹੈ। ਆਪਣੇ ਡਿਵਾਈਸ ਦੀ ਘੜੀ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    approveErrDuplicate: (block: string) =>
      `ਇਹ ਮਨਜ਼ੂਰੀ ਪਹਿਲਾਂ ਹੀ ਜਮ੍ਹਾਂ ਕੀਤੀ ਜਾ ਚੁੱਕੀ ਹੈ (ਬਲੌਕ ${block})। ਤੁਸੀਂ ਖਰੀਦ ਜਾਰੀ ਰੱਖ ਸਕਦੇ ਹੋ।`,
    approveErrUnavailable: (symbol: string) =>
      `${symbol} ledger ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    approveErrGeneric: (symbol: string, message: string) =>
      `${symbol} ledger ਨੇ ਮਨਜ਼ੂਰੀ ਰੱਦ ਕਰ ਦਿੱਤੀ: ${message}`,
    approveCancelled: "ਮਨਜ਼ੂਰੀ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਰੱਦ ਕਰ ਦਿੱਤੀ ਗਈ।",
    approveNetwork: (symbol: string) =>
      `${symbol} ledger ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਹੋ ਸਕੀ। ਆਪਣਾ ਕਨੈਕਸ਼ਨ ਜਾਂਚੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    approveFailed: (symbol: string) =>
      `${symbol} ਮਨਜ਼ੂਰੀ ਪੂਰੀ ਨਹੀਂ ਹੋ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
  },
});
