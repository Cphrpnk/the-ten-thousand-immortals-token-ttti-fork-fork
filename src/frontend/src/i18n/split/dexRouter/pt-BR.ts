import type en from "./en";

const ptBR: typeof en = {
  routeLabel: "Rota",
  routeNative: "Pool nativo",
  routeIcpswap: "ICPSwap",
  reasonBestAmount: "Escolhida: maior valor recebido, taxas incluídas.",
  reasonNativeUnavailable:
    "O pool nativo está vazio, em preenchimento ou raso demais para este valor.",
  reasonIcpswapUnavailable:
    "Nenhuma cotação da ICPSwap está disponível para este par.",
  icpswapFee: (pct: string) => `Taxa da ICPSwap (${pct})`,
  protocolFee: (pct: string) => `Taxa do protocolo (${pct})`,
  protocolSplit: (lp: string, permanent: string) =>
    `70 % aos LPs do pool nativo: ${lp} · 30 % à sua liquidez permanente: ${permanent}`,
  alternativeLabel: (route: string) => `Outra rota (${route})`,
  alternativeNone: "Outra rota",
  alternativeUnavailable: "Indisponível",
  routeRule:
    "Uma única rota por troca: o pool nativo (0,3 %) ou a ICPSwap (0,3 % mais uma taxa do protocolo de 0,1 %), a que der o maior valor recebido, taxas incluídas. A rota cotada é enviada com a troca.",
  fillingViaIcpswap: (gauge: string) =>
    `As trocas do pool nativo ficam fechadas enquanto ele é preenchido: ${gauge}. A troca pode passar pela ICPSwap.`,
  swapDoneRoute: (input: string, output: string, route: string) =>
    `${input} trocados por ${output} via ${route}.`,
  errSameToken: "Os dois tokens devem ser diferentes.",
  errPairNotFound: "Este par não está no registro.",
  errNoRoute: "Nenhuma rota está disponível para esta troca no momento.",
  errRouteMismatch: (route: string) =>
    `A rota agora é ${route}. Verifique a nova cotação e confirme novamente.`,
  errIcpswapReturned: (message: string) =>
    `A ICPSwap não concluiu a troca: ${message}. O valor enviado voltou ao seu saldo DEX.`,
  errIcpswapHeld: (id: string, message: string) =>
    `A ICPSwap não concluiu a troca roteada nº ${id}: ${message}. O valor enviado ainda não voltou; ele é acompanhado.`,
  errOutcomeUnknown: (id: string) =>
    `O resultado da troca roteada nº ${id} ainda não é conhecido. Ele é verificado pelo admin; seu saldo DEX é atualizado após a confirmação.`,
};

export default ptBR;
