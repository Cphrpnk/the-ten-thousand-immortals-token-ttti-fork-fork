const en = {
  refused: "The request was refused in the wallet. Nothing was changed.",
  closed:
    "The wallet window was closed or did not respond. Nothing was changed.",
  wrongAccount:
    "The wallet is signed in with another account. Nothing was changed.",
  failed: "The wallet could not sign the request. Nothing was changed.",
  noSigner: "No wallet holding this account is available on this device.",
  fundingHelp:
    "The funding account can be held with Internet Identity, OISY, NFID Wallet or Plug. Each approval is signed with the wallet that holds the registered account (same principal, default subaccount).",
  fundingSignedWith: (wallet: string) =>
    `Approvals are signed with ${wallet}, which holds the registered account.`,
  fundingNoMatch:
    "No known wallet holds the registered account on this device. Connect the wallet that holds it.",
  fundingSubaccount:
    "Approvals can be signed here only for an account with the default subaccount.",
  fundingExpected: "Expected account",
  fundingConnected: "Connected account",
  fundingNone: "None",
  fundingConnect: (wallet: string) => `Connect ${wallet}`,
  fundingMismatch:
    "The connected account is not the registered funding account.",
};

export default en;
