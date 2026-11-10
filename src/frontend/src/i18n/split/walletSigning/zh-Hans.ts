import type en from "./en";

const zhHans: typeof en = {
  refused: "请求已在钱包中被拒绝。未做任何更改。",
  closed: "钱包窗口已关闭或未响应。未做任何更改。",
  wrongAccount: "钱包登录的是另一个账户。未做任何更改。",
  failed: "钱包无法签署该请求。未做任何更改。",
  noSigner: "此设备上没有持有该账户的可用钱包。",
  fundingHelp:
    "资金账户可由 Internet Identity、OISY、NFID Wallet 或 Plug 持有。每项授权由持有已登记账户（相同 principal、默认子账户）的钱包签名。",
  fundingSignedWith: (wallet: string) =>
    `授权由持有已登记账户的 ${wallet} 签名。`,
  fundingNoMatch:
    "此设备上没有已知钱包持有已登记账户。请连接持有该账户的钱包。",
  fundingSubaccount: "此处仅能为使用默认子账户的账户签署授权。",
  fundingExpected: "预期账户",
  fundingConnected: "已连接账户",
  fundingNone: "无",
  fundingConnect: (wallet: string) => `连接 ${wallet}`,
  fundingMismatch: "已连接账户不是已登记的资金账户。",
};

export default zhHans;
