import type en from "./en";

const ko: typeof en = {
  mint: "TTTI-T 발행",
  btcCopied: "BTC 주소가 복사되었습니다 — Onramper에 붙여넣으세요",
  btcPending:
    "BTC → ckBTC 패널에서 BTC 주소를 생성하는 중입니다. 그곳에서 복사해 Onramper에 붙여넣으세요.",
  stableNote: (symbol: string) =>
    `Onramper는 이 주소로 ICP를 판매합니다. ICP가 도착하면 ${symbol}으로 스왑하세요.`,
  stableNoteLink: (symbol: string) => `ICP → ${symbol} 스왑`,
  close: "닫기",
};

export default ko;
