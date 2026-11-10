import type en from "./en";

const ko: typeof en = {
  saved: "전달 주소가 저장되었습니다.",
  saveFailed: "주소를 저장하지 못했습니다. 다시 시도하세요.",
  removed: "전달 주소가 삭제되었습니다.",
  removeFailed: "주소를 삭제하지 못했습니다. 다시 시도하세요.",
  title: "전달 지갑 주소",
  optional: "선택 사항",
  recommended: "권장",
  descPlug: (symbol: string) =>
    `연결된 Plug의 principal로 자동 입력되었습니다. ${symbol}은(는) 여기에 입금됩니다.`,
  descIi: (symbol: string) =>
    `회원님의 principal로 자동 입력되었습니다. ${symbol}은(는) 여기에 입금됩니다.`,
  descNone: (symbol: string) =>
    `발행에 필수는 아닙니다. 직접 관리하는 지갑의 Principal ID를 추가하면 출시 시 ${symbol}이(가) 해당 지갑으로 자동 전달됩니다.`,
  principalId: "Principal ID",
  placeholder: "예: abcde-fghij-…-cai",
  save: "주소 저장",
  clear: "지우기",
  savedAddress: "저장된 주소",
  loadFailed:
    "저장된 주소를 불러올 수 없습니다. 위에 주소를 직접 입력할 수 있습니다.",
  retry: "다시 시도",
  noneSaved:
    "저장된 주소 없음 — 구매한 토큰은 구매에 사용한 principal로 입금됩니다.",
};

export default ko;
