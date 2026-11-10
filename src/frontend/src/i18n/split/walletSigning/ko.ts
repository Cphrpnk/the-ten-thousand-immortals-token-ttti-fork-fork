import type en from "./en";

const ko: typeof en = {
  refused: "지갑에서 요청이 거부되었습니다. 변경된 내용은 없습니다.",
  closed: "지갑 창이 닫혔거나 응답하지 않았습니다. 변경된 내용은 없습니다.",
  wrongAccount:
    "지갑이 다른 계정으로 로그인되어 있습니다. 변경된 내용은 없습니다.",
  failed: "지갑이 요청에 서명하지 못했습니다. 변경된 내용은 없습니다.",
  noSigner: "이 기기에서 이 계정을 보유한 지갑을 사용할 수 없습니다.",
  fundingHelp:
    "자금 계정은 Internet Identity, OISY, NFID Wallet 또는 Plug로 보유할 수 있습니다. 각 승인은 등록된 계정(같은 principal, 기본 하위 계정)을 보유한 지갑으로 서명합니다.",
  fundingSignedWith: (wallet: string) =>
    `승인은 등록된 계정을 보유한 ${wallet}(으)로 서명합니다.`,
  fundingNoMatch:
    "이 기기에서 등록된 계정을 보유한 알려진 지갑이 없습니다. 이 계정을 보유한 지갑을 연결하세요.",
  fundingSubaccount:
    "여기서는 기본 하위 계정을 사용하는 계정에 대해서만 승인에 서명할 수 있습니다.",
  fundingExpected: "예상 계정",
  fundingConnected: "연결된 계정",
  fundingNone: "없음",
  fundingConnect: (wallet: string) => `${wallet} 연결`,
  fundingMismatch: "연결된 계정이 등록된 자금 계정이 아닙니다.",
};

export default ko;
