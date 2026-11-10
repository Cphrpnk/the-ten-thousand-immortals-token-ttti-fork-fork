import type en from "./en";

const ko: typeof en = {
  percentConnect: "바를 사용하려면 지갑을 연결하세요.",
  percentLoading: "잔액을 불러오는 중…",
  percentBalanceUnavailable: "잔액을 확인할 수 없습니다.",
  percentNotCover: (fee: string) =>
    `잔액이 ${fee}의 네트워크 수수료에 미치지 못합니다.`,
  percentShare: (symbol: string) => `지갑 ${symbol} 잔액 비율`,
  percentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  percentComputedOn: (fee: string) =>
    `잔액에서 네트워크 수수료 ${fee}을(를) 뺀 금액 기준으로 계산됩니다.`,
};

export default ko;
