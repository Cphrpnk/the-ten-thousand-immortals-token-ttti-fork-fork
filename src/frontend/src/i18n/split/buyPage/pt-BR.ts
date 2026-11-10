import type en from "./en";

const ptBR: typeof en = {
  title: (symbol: string) => `Cunhar ${symbol}`,
  noExtraTaken:
    "Nenhum valor do token pago é cobrado além do custo do que é entregue.",
  shownAs: (symbol: string) => `Exibido como ${symbol} nas carteiras.`,
  ackReadFirst: "Li a seção “Leia isto primeiro” do whitepaper.",
  ackNoRights:
    "Entendo que o TTTI não tem nenhum uso nem valor intrínseco. O único direito que tenho é o direito de resgate: posso devolver TTTI-T ao contrato e receber o menor valor entre 10.000 USD por TTTI-T e a parte proporcional da reserva comum, sem promessa de valor.",
  ackPriceZero:
    "Entendo que seu preço pode cair a zero e que nada lhe promete um valor. 10.000 USD por TTTI-T mintado são calculados em USD e ficam no token pago (ICP, ckBTC, ckUSDC ou ckUSDT) em uma reserva comum, sem conversão, e qualquer detentor pode devolver TTTI-T ao contrato conforme as regras de resgate. 1 TTTI-T sempre pode ser resgatado por 10.000 USD, por qualquer detentor.",
  ackIcpCreator:
    "A cunhagem custa (10.000 USD + a liquidez que aporto) × q dividido por 0,99, em ICP, ckBTC, ckUSDC ou ckUSDT. 10.000 USD × q vão para a reserva comum, 1 % do valor que pago vai para o criador, e o restante é a liquidez que aporto, que continua sendo minha na minha posição.",
  ackNoProfit:
    "Não estou me baseando em nenhuma promessa de lucro, nem do criador nem de qualquer outra pessoa.",
  ackAffordLoss:
    "Estou gastando apenas o que posso me permitir perder por completo.",
  ackLegend: "Exigido antes da sua primeira compra.",
  wtTitle: "Termos da carteira",
  wtDescription:
    "Leia os seis pontos abaixo, marque a caixa e aceite. Isto é solicitado uma única vez e é necessário para fazer um mint ou um resgate.",
  wtAcceptLabel: "Li e aceito estes termos",
  wtAcceptButton: "Aceitar os termos",
  wtBannerText: "Os termos da carteira ainda não foram aceitos.",
  wtBannerButton: "Ler os termos",
  wtOpenRefusal: "Revisar e aceitar os termos da carteira",
  wtPoint1Title: "White paper",
  wtPoint2Title: "Direitos",
  wtPoint3Title: "Preço",
  wtPoint4Title: "Custo do mint",
  wtPoint5Title: "Sem promessa de lucro",
  wtPoint6Title: "Risco de perda",
  ackWhitePaperLink: "Abrir a seção “Leia isto primeiro”",
  ackStatusUnavailable: "Status das confirmações de compra indisponível",
  ackTickAll: "Marque as seis declarações para habilitar a cunhagem.",
  retry: "Tentar novamente",
  invalidAmountTitle: "Valor inválido",
  invalidAmountMessage: (symbol: string, decimals: number) =>
    `Insira um valor em ${symbol} maior que 0 com até ${decimals} casas decimais.`,
  belowMinimumTitle: "Abaixo da compra mínima",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    about: string | null,
  ) =>
    `Mínimo de ${minimum} ${display} (${minimumUsd} em ${symbol})${about !== null ? `, cerca de ${about}` : ""}.`,
  aboveRemainingTitle: "Acima do valor restante",
  aboveRemainingMessage: (remaining: string, display: string, max: string) =>
    `Restam apenas ${remaining} ${display} (${max}).`,
  insufficientTitle: (symbol: string, fee: string) =>
    `${symbol} insuficiente (valor + ${fee} de taxas)`,
  insufficientMessage: (required: string) =>
    `Você precisa de ${required}, taxas incluídas.`,
  useMaximum: "Usar o máximo",
  approvalFailed: (symbol: string) => `Falha na aprovação de ${symbol}`,
  purchaseNotCompleted: "Compra não concluída",
  purchaseNotSubmitted: "Não foi possível enviar a compra. Tente novamente.",
  recordingAcks: "Registrando as confirmações de compra…",
  approving: (symbol: string) => `Aprovando ${symbol}…`,
  buying: "Cunhando…",
  saleComplete: "Venda encerrada",
  salesPaused: "As vendas estão pausadas",
  tokenUnavailable: (symbol: string) => `${symbol} indisponível`,
  buyWith: (symbol: string) => `Cunhar com ${symbol}`,
  received: (amount: string, display: string) =>
    `Você recebeu ${amount} ${display}`,
  buyTtti: "Cunhar TTTI-T",
  buyHeading: "Cunhar",
  mintInfoToggle: "O que é buy-to-mint?",
  mintInfoBody1:
    "Um TTTI-T só é criado quando alguém paga em ICP, ckBTC, ckUSDC ou ckUSDT pela cotação exibida. A liquidez que quem cunha aporta continua sendo sua, na sua própria posição do pool. Ninguém, nem mesmo o administrador, pode criar TTTI-T de outra forma.",
  mintInfoBody2:
    "Um bitcoin só passa a existir quando um minerador gasta um recurso real: energia e hardware. Um TTTI-T só passa a existir quando alguém traz um token real. Dos dois lados, esse é o compromisso real (skin in the game).",
  walletPlug: "Plug",
  walletBuiltIn: "Carteira integrada",
  balanceLabel: (symbol: string) => `Saldo de ${symbol}`,
  unavailable: "Indisponível",
  noTreasury: (symbol: string) =>
    `A cunhagem com ${symbol} não está disponível no momento.`,
  youPayIn: (symbol: string) => `Você paga em ${symbol}`,
  youReceive: "Você recebe",
  withFees: (amount: string) => ` · ${amount} com taxas`,
  totalDebited: "Total debitado com as taxas de rede:",
  noRateTitle: (symbol: string) =>
    `Nenhuma cotação ${symbol}/USD válida para esta hora`,
  noRateBody: (symbol: string) =>
    `As compras em ${symbol} ficam indisponíveis até que uma cotação seja definida.`,
  finalMint: (symbol: string) => `Mint ${symbol}`,
  finalMinting: "Executando o mint…",
  finalConverting: "Convertendo o ckBTC mantido…",
  finalMoving: "Movendo o saldo da DEX para a carteira…",
  finalChecking: "Verificando saldos…",
  finalSourceLabel: "Saldo utilizado",
  finalSourceWallet: (amount: string) => `Carteira: ${amount}`,
  finalSourceDex: (amount: string) => `Saldo interno da DEX: ${amount}`,
  finalSourceContract: (amount: string) => `Mantido pelo contrato: ${amount}`,
  finalPreview: (ttti: string, pay: string) => `${ttti} por ${pay}`,
  finalFundFirst: (symbol: string) =>
    `Não há ${symbol} na sua carteira, na DEX nem mantido pelo contrato. Primeiro adicione fundos à conta.`,
  finalEnterAmount: "Informe um valor no formulário acima e clique em Mint.",
  finalDexMoved: (amount: string) =>
    `Saque de ${amount} do saldo da DEX para a sua carteira concluído. Informe um valor e clique em Mint.`,
  finalDexFailed: (detail: string) =>
    detail ? `O saque da DEX falhou. ${detail}` : "O saque da DEX falhou.",
  finalDexWithdrawing: "Etapa 1 de 2: sacando da DEX…",
  finalDexMinting: "Etapa 2 de 2: fazendo o mint…",
  finalDexTooLow: (available: string, required: string) =>
    `O saldo da DEX após a taxa do ledger (${available}) é menor que os ${required} necessários para este mint. Nada foi sacado.`,
  finalDexShort: (balance: string, required: string) =>
    `O saque foi concluído. O saldo da carteira (${balance}) é menor que os ${required} necessários para este mint. Os fundos permanecem na sua carteira.`,
  finalDexMintKept: (amount: string) =>
    `O mint não foi concluído. ${amount} permanece na sua carteira. Clique em Mint para tentar novamente a partir da carteira.`,
  finalUseTokenForm:
    "Este saldo é usado no formulário de pagamento em ckBTC, que abre ao clicar em Mint.",
};

export default ptBR;
