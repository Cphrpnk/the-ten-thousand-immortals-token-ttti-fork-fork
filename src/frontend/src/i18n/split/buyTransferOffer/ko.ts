import type en from "./en";

const ko: typeof en = {
  aria: (symbol: string) => `이 지갑으로 ${symbol} 전송`,
  zeroBalance: (symbol: string) => `${symbol} 잔액이 0입니다.`,
  transferTo: (symbol: string) =>
    `발행하려면 이 지갑 주소로 ${symbol}을(를) 전송하세요.`,
  transferOrBuy: (symbol: string) =>
    `아래 지갑 주소로 ${symbol}을(를) 전송하거나 ${symbol}을(를) 구매하세요.`,
  copyAria: "지갑 주소 복사",
  copied: "주소가 복사되었습니다",
  copyFailed: "복사에 실패했습니다. 주소를 선택해 복사하세요.",
};

export default ko;
