import type en from "./en";

const ko: typeof en = {
  title: "풀 가치와 시가총액",
  loading: "불러오는 중…",
  loadError: "수치를 불러오지 못했습니다.",
  retry: "다시 시도",
  notAvailable: "사용할 수 없음",
  poolsValue: "풀 가치",
  capitalisation: "시가총액",
  currentRatio: "현재 비율",
  averageRatio: "24시간 평균 비율",
  targetRatio: "목표 비율",
  lockedShare: "잠금 비중 m",
  samples: (count: string) => `샘플 ${count}개`,
  computedAt: (date: string) => `계산 시각: ${date}`,
  noteNoPoolsValue:
    "풀 가치 없음: 열린 TTTI-T 풀이 없거나 유효한 환율이 없습니다.",
  noteNoCapitalisation: "사용할 수 있는 시가총액이 없습니다.",
  referencePrice: "시가총액 기준 가격, TTTI-T당 (목표)",
  referencePriceNote:
    "시가총액과 풀 가치는 TTTI-T당 10,000 USD의 목표로 측정합니다.",
  consolidatedInfo: "TTTI-T당 통합 가격 (참고용)",
  noteNoRatio: "풀 가치와 시가총액이 모두 필요합니다.",
  noteNoAverage: "기록된 비율 샘플이 아직 없습니다.",
  noteLockedDefault: "적용된 비율이 아직 없어 잠금 비중은 최대값 50%입니다.",
  definitionsToggle: "정의",
  defPoolsValue:
    "풀 가치: 각 TTTI-T 풀의 상대 자산 준비금의 2배, 오라클 환율 기준. 풀 가치는 TTTI-T당 10,000 USD의 목표로 측정합니다.",
  defCapitalisation:
    "시가총액: 유통 중인 TTTI-T에 TTTI-T당 10,000 USD의 목표를 곱한 값으로, 풀 가치와 같은 시점에 측정됩니다. 통합 가격은 참고용으로만 표시됩니다.",
  defRatio: "비율: 풀 가치를 시가총액으로 나눈 값.",
  defLockedShare:
    "잠금 비중 m: 적용된 비율에서 도출되며, 현재 비율과 24시간 평균 중 낮은 값입니다.",
};

export default ko;
