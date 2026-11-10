import type en from "./en";

const ko: typeof en = {
  routeLabel: "경로",
  routeNative: "네이티브 풀",
  routeIcpswap: "ICPSwap",
  reasonBestAmount: "선택됨: 수수료 포함 받는 금액이 더 많습니다.",
  reasonNativeUnavailable:
    "네이티브 풀이 비어 있거나 채우는 중이거나 이 금액에 비해 깊이가 부족합니다.",
  reasonIcpswapUnavailable: "이 페어에 사용할 수 있는 ICPSwap 견적이 없습니다.",
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
};

export default ko;
