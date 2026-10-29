import { defineDict } from "../core/dict";

/**
 * DEX lot 5: routed swap (native pool or ICPSwap) in the swap dialog.
 * English is authoritative. Amounts, percentages and routes are passed in
 * already formatted for the active language.
 */
export const ROUTER_TEXT = defineDict({
  en: {
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
  },
  fr: {
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
    errNoRoute:
      "Aucune route n'est disponible pour cet échange pour le moment.",
    errRouteMismatch: (route: string) =>
      `La route est maintenant ${route}. Vérifiez le nouveau devis et confirmez à nouveau.`,
    errIcpswapReturned: (message: string) =>
      `ICPSwap n'a pas effectué l'échange : ${message}. Le montant envoyé est revenu dans votre solde DEX.`,
    errIcpswapHeld: (id: string, message: string) =>
      `ICPSwap n'a pas effectué l'échange routé n° ${id} : ${message}. Le montant envoyé n'est pas encore revenu ; il est suivi.`,
    errOutcomeUnknown: (id: string) =>
      `L'issue de l'échange routé n° ${id} n'est pas encore connue. Elle est vérifiée par l'admin ; votre solde DEX est mis à jour une fois confirmée.`,
  },
  es: {
    routeLabel: "Ruta",
    routeNative: "Pool nativo",
    routeIcpswap: "ICPSwap",
    reasonBestAmount: "Elegida: mayor importe recibido, comisiones incluidas.",
    reasonNativeUnavailable:
      "El pool nativo está vacío, en llenado o es poco profundo para este importe.",
    reasonIcpswapUnavailable:
      "No hay cotización de ICPSwap disponible para este par.",
    icpswapFee: (pct: string) => `Comisión de ICPSwap (${pct})`,
    protocolFee: (pct: string) => `Comisión del protocolo (${pct})`,
    protocolSplit: (lp: string, permanent: string) =>
      `70 % a los LP del pool nativo: ${lp} · 30 % a su liquidez permanente: ${permanent}`,
    alternativeLabel: (route: string) => `Otra ruta (${route})`,
    alternativeNone: "Otra ruta",
    alternativeUnavailable: "No disponible",
    routeRule:
      "Una sola ruta por intercambio: el pool nativo (0,3 %) o ICPSwap (0,3 % más una comisión del protocolo del 0,1 %), la que dé el mayor importe recibido, comisiones incluidas. La ruta cotizada se envía con el intercambio.",
    fillingViaIcpswap: (gauge: string) =>
      `Los intercambios del pool nativo están cerrados mientras se llena: ${gauge}. El intercambio puede pasar por ICPSwap.`,
    swapDoneRoute: (input: string, output: string, route: string) =>
      `${input} intercambiados por ${output} vía ${route}.`,
    errSameToken: "Los dos tokens deben ser distintos.",
    errPairNotFound: "Este par no está en el registro.",
    errNoRoute: "No hay ninguna ruta disponible para este intercambio ahora.",
    errRouteMismatch: (route: string) =>
      `La ruta ahora es ${route}. Revise la nueva cotización y confirme de nuevo.`,
    errIcpswapReturned: (message: string) =>
      `ICPSwap no completó el intercambio: ${message}. El importe enviado volvió a su saldo DEX.`,
    errIcpswapHeld: (id: string, message: string) =>
      `ICPSwap no completó el intercambio enrutado n.º ${id}: ${message}. El importe enviado aún no ha vuelto; se le da seguimiento.`,
    errOutcomeUnknown: (id: string) =>
      `El resultado del intercambio enrutado n.º ${id} aún no se conoce. El admin lo verifica; su saldo DEX se actualiza una vez confirmado.`,
  },
  "zh-Hans": {
    routeLabel: "路由",
    routeNative: "原生池",
    routeIcpswap: "ICPSwap",
    reasonBestAmount: "已选择：含费用后收到的金额更高。",
    reasonNativeUnavailable: "原生池为空、正在注入中，或对该金额深度不足。",
    reasonIcpswapUnavailable: "该交易对没有可用的 ICPSwap 报价。",
    icpswapFee: (pct: string) => `ICPSwap 费用（${pct}）`,
    protocolFee: (pct: string) => `协议费用（${pct}）`,
    protocolSplit: (lp: string, permanent: string) =>
      `70 % 给原生池的 LP：${lp} · 30 % 计入其永久流动性：${permanent}`,
    alternativeLabel: (route: string) => `另一路由（${route}）`,
    alternativeNone: "另一路由",
    alternativeUnavailable: "不可用",
    routeRule:
      "每次兑换只走一条路由：原生池（0.3 %）或 ICPSwap（0.3 % 加 0.1 % 协议费用），取含费用后收到金额更高者。报价中的路由随兑换一并发送。",
    fillingViaIcpswap: (gauge: string) =>
      `原生池注入期间其兑换关闭：${gauge}。兑换可经由 ICPSwap 进行。`,
    swapDoneRoute: (input: string, output: string, route: string) =>
      `已经由 ${route} 用 ${input} 兑换 ${output}。`,
    errSameToken: "两个代币必须不同。",
    errPairNotFound: "该交易对不在登记册中。",
    errNoRoute: "目前该兑换没有可用的路由。",
    errRouteMismatch: (route: string) =>
      `路由现为 ${route}。请查看新报价并重新确认。`,
    errIcpswapReturned: (message: string) =>
      `ICPSwap 未完成兑换：${message}。投入金额已退回您的 DEX 余额。`,
    errIcpswapHeld: (id: string, message: string) =>
      `ICPSwap 未完成路由兑换 #${id}：${message}。投入金额尚未退回；正在跟进。`,
    errOutcomeUnknown: (id: string) =>
      `路由兑换 #${id} 的结果尚未确定。由管理员核实；确认后您的 DEX 余额将更新。`,
  },
  "pt-BR": {
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
  },
  ko: {
    routeLabel: "경로",
    routeNative: "네이티브 풀",
    routeIcpswap: "ICPSwap",
    reasonBestAmount: "선택됨: 수수료 포함 받는 금액이 더 많습니다.",
    reasonNativeUnavailable:
      "네이티브 풀이 비어 있거나 채우는 중이거나 이 금액에 비해 깊이가 부족합니다.",
    reasonIcpswapUnavailable:
      "이 페어에 사용할 수 있는 ICPSwap 견적이 없습니다.",
    icpswapFee: (pct: string) => `ICPSwap 수수료 (${pct})`,
    protocolFee: (pct: string) => `프로토콜 수수료 (${pct})`,
    protocolSplit: (lp: string, permanent: string) =>
      `70 % 네이티브 풀 LP에게: ${lp} · 30 % 영구 유동성으로: ${permanent}`,
    alternativeLabel: (route: string) => `다른 경로 (${route})`,
    alternativeNone: "다른 경로",
    alternativeUnavailable: "사용 불가",
    routeRule:
      "스왑마다 경로는 하나입니다: 네이티브 풀(0.3 %) 또는 ICPSwap(0.3 % + 프로토콜 수수료 0.1 %) 중 수수료 포함 받는 금액이 더 많은 쪽입니다. 견적의 경로가 스왑과 함께 전송됩니다.",
    fillingViaIcpswap: (gauge: string) =>
      `네이티브 풀은 채우는 동안 스왑이 닫혀 있습니다: ${gauge}. 스왑은 ICPSwap을 통해 진행될 수 있습니다.`,
    swapDoneRoute: (input: string, output: string, route: string) =>
      `${route}을(를) 통해 ${input}을(를) ${output}(으)로 스왑했습니다.`,
    errSameToken: "두 토큰은 서로 달라야 합니다.",
    errPairNotFound: "이 페어는 레지스트리에 없습니다.",
    errNoRoute: "현재 이 스왑에 사용할 수 있는 경로가 없습니다.",
    errRouteMismatch: (route: string) =>
      `경로가 이제 ${route}입니다. 새 견적을 확인하고 다시 확인하세요.`,
    errIcpswapReturned: (message: string) =>
      `ICPSwap이 스왑을 완료하지 않았습니다: ${message}. 보낸 금액은 DEX 잔액으로 돌아왔습니다.`,
    errIcpswapHeld: (id: string, message: string) =>
      `ICPSwap이 라우팅 스왑 #${id}을(를) 완료하지 않았습니다: ${message}. 보낸 금액은 아직 돌아오지 않았으며 추적 중입니다.`,
    errOutcomeUnknown: (id: string) =>
      `라우팅 스왑 #${id}의 결과는 아직 알 수 없습니다. 관리자가 확인하며, 확인되면 DEX 잔액이 업데이트됩니다.`,
  },
  "pa-Guru": {
    routeLabel: "ਰੂਟ",
    routeNative: "ਨੇਟਿਵ ਪੂਲ",
    routeIcpswap: "ICPSwap",
    reasonBestAmount: "ਚੁਣਿਆ ਗਿਆ: ਫੀਸਾਂ ਸਮੇਤ ਵੱਧ ਮਿਲਣ ਵਾਲੀ ਰਕਮ।",
    reasonNativeUnavailable:
      "ਨੇਟਿਵ ਪੂਲ ਖਾਲੀ ਹੈ, ਭਰਿਆ ਜਾ ਰਿਹਾ ਹੈ ਜਾਂ ਇਸ ਰਕਮ ਲਈ ਬਹੁਤ ਘੱਟ ਡੂੰਘਾ ਹੈ।",
    reasonIcpswapUnavailable: "ਇਸ ਜੋੜੀ ਲਈ ਕੋਈ ICPSwap ਕੋਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    icpswapFee: (pct: string) => `ICPSwap ਫੀਸ (${pct})`,
    protocolFee: (pct: string) => `ਪ੍ਰੋਟੋਕੋਲ ਫੀਸ (${pct})`,
    protocolSplit: (lp: string, permanent: string) =>
      `70 % ਨੇਟਿਵ ਪੂਲ ਦੇ LP ਨੂੰ: ${lp} · 30 % ਇਸ ਦੀ ਸਥਾਈ ਤਰਲਤਾ ਨੂੰ: ${permanent}`,
    alternativeLabel: (route: string) => `ਦੂਜਾ ਰੂਟ (${route})`,
    alternativeNone: "ਦੂਜਾ ਰੂਟ",
    alternativeUnavailable: "ਉਪਲਬਧ ਨਹੀਂ",
    routeRule:
      "ਹਰ ਸਵੈਪ ਲਈ ਇੱਕ ਰੂਟ: ਨੇਟਿਵ ਪੂਲ (0.3 %) ਜਾਂ ICPSwap (0.3 % ਨਾਲ 0.1 % ਪ੍ਰੋਟੋਕੋਲ ਫੀਸ), ਜੋ ਵੀ ਫੀਸਾਂ ਸਮੇਤ ਵੱਧ ਰਕਮ ਦੇਵੇ। ਕੋਟ ਵਾਲਾ ਰੂਟ ਸਵੈਪ ਨਾਲ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ।",
    fillingViaIcpswap: (gauge: string) =>
      `ਨੇਟਿਵ ਪੂਲ ਭਰੇ ਜਾਣ ਦੌਰਾਨ ਉਸ ਦੇ ਸਵੈਪ ਬੰਦ ਹਨ: ${gauge}। ਸਵੈਪ ICPSwap ਰਾਹੀਂ ਹੋ ਸਕਦਾ ਹੈ।`,
    swapDoneRoute: (input: string, output: string, route: string) =>
      `${route} ਰਾਹੀਂ ${input} ਨੂੰ ${output} ਨਾਲ ਸਵੈਪ ਕੀਤਾ ਗਿਆ।`,
    errSameToken: "ਦੋਵੇਂ ਟੋਕਨ ਵੱਖਰੇ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।",
    errPairNotFound: "ਇਹ ਜੋੜੀ ਰਜਿਸਟਰੀ ਵਿੱਚ ਨਹੀਂ ਹੈ।",
    errNoRoute: "ਇਸ ਵੇਲੇ ਇਸ ਸਵੈਪ ਲਈ ਕੋਈ ਰੂਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    errRouteMismatch: (route: string) =>
      `ਰੂਟ ਹੁਣ ${route} ਹੈ। ਨਵਾਂ ਕੋਟ ਵੇਖੋ ਅਤੇ ਦੁਬਾਰਾ ਪੁਸ਼ਟੀ ਕਰੋ।`,
    errIcpswapReturned: (message: string) =>
      `ICPSwap ਨੇ ਸਵੈਪ ਪੂਰਾ ਨਹੀਂ ਕੀਤਾ: ${message}। ਭੇਜੀ ਰਕਮ ਤੁਹਾਡੇ DEX ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਆ ਗਈ ਹੈ।`,
    errIcpswapHeld: (id: string, message: string) =>
      `ICPSwap ਨੇ ਰੂਟ ਕੀਤਾ ਸਵੈਪ #${id} ਪੂਰਾ ਨਹੀਂ ਕੀਤਾ: ${message}। ਭੇਜੀ ਰਕਮ ਅਜੇ ਵਾਪਸ ਨਹੀਂ ਆਈ; ਇਸ ਦੀ ਨਿਗਰਾਨੀ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।`,
    errOutcomeUnknown: (id: string) =>
      `ਰੂਟ ਕੀਤੇ ਸਵੈਪ #${id} ਦਾ ਨਤੀਜਾ ਅਜੇ ਪਤਾ ਨਹੀਂ ਹੈ। ਐਡਮਿਨ ਇਸ ਦੀ ਜਾਂਚ ਕਰਦਾ ਹੈ; ਪੁਸ਼ਟੀ ਹੋਣ 'ਤੇ ਤੁਹਾਡਾ DEX ਬਕਾਇਆ ਅੱਪਡੇਟ ਹੁੰਦਾ ਹੈ।`,
  },
});
