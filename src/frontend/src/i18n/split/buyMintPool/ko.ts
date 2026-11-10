import type en from "./en";

const ko: typeof en = {
  heading: "풀",
  legend: "유동성을 받는 풀",
  recommended: "추천",
  feeTier: "수수료 등급",
  depth: "깊이",
  price: "가격",
  gap: "통합 가격과의 차이",
  selectedPool: "선택한 풀",
  poolLabel: (id: string) => `풀 #${id}`,
  single: (fee: string) => `단일 풀, 수수료 등급 ${fee}`,
  selectPrompt: "계속하려면 풀을 선택하세요.",
  noPool: "이 토큰에 사용할 수 있는 풀이 없습니다. 발행할 수 없습니다.",
  loading: "풀을 불러오는 중…",
  loadError: "풀을 불러오지 못했습니다.",
  retry: "다시 시도",
  fallbackNotice:
    "선택한 풀을 더 이상 사용할 수 없습니다. 추천 풀이 대신 선택되었습니다.",
  errUnknownPool: "선택한 풀이 존재하지 않습니다. 풀을 다시 선택하세요.",
  errOtherPair: "선택한 풀은 이 토큰의 풀이 아닙니다. 풀을 다시 선택하세요.",
  errPoolRemoved: "선택한 풀이 제거되었습니다. 풀을 다시 선택하세요.",
  errPoolRemovalAnnounced: (date: string) =>
    `선택한 풀의 제거가 ${date}에 예정되어 있습니다. 풀을 다시 선택하세요.`,
};

export default ko;
