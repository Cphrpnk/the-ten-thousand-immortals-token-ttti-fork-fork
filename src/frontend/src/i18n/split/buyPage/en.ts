const en = {
  title: (symbol: string) => `Mint ${symbol}`,
  noExtraTaken:
    "No amount of the paid token beyond the cost of what is delivered is taken.",
  shownAs: (symbol: string) => `Shown as ${symbol} in wallets.`,
  // Acknowledgements (legal text)
  ackReadFirst: 'I have read the "Read this first" section of the whitepaper.',
  ackNoRights:
    "I understand that TTTI has no use and no intrinsic value. The only right I hold is the redemption right: I can return TTTI-T to the contract and receive the lower of 10,000 USD per TTTI-T or the proportional share of the common reserve, with no promise of value.",
  ackPriceZero:
    "I understand that its price can fall to zero and that nothing promises it any value. 10,000 USD per TTTI-T minted is calculated in USD and held in the token paid (ICP, ckBTC, ckUSDC or ckUSDT) in a common reserve, without conversion, and any holder can return TTTI-T to the contract under the redemption rules. 1 TTTI-T is always redeemable for 10,000 USD, by any holder.",
  ackIcpCreator:
    "The mint costs (10,000 USD + the liquidity I contribute) × q divided by 0.99, in ICP, ckBTC, ckUSDC or ckUSDT. 10,000 USD × q goes to the common reserve, 1 % of the amount I pay goes to the creator, and the rest is the liquidity I contribute, which stays mine in my position.",
  ackNoProfit:
    "I am not relying on any promise of profit, from the creator or from anyone.",
  ackAffordLoss: "I am spending only what I can afford to lose entirely.",
  ackLegend: "Required before your first purchase.",
  // Wallet terms: one block, one checkbox, a dialog, a banner, a menu entry
  wtTitle: "Wallet terms",
  wtDescription:
    "Read the six points below, then tick the box and accept. This is requested once and is required to mint or redeem.",
  wtAcceptLabel: "I have read and accept these terms",
  wtAcceptButton: "Accept the terms",
  wtBannerText: "The wallet terms are not yet accepted.",
  wtBannerButton: "Review the terms",
  wtOpenRefusal: "Review and accept the wallet terms",
  wtPoint1Title: "Whitepaper",
  wtPoint2Title: "Rights",
  wtPoint3Title: "Price",
  wtPoint4Title: "Cost of the mint",
  wtPoint5Title: "No promise of profit",
  wtPoint6Title: "Risk of loss",
  ackWhitePaperLink: 'Open the "Read this first" section',
  ackStatusUnavailable: "Acknowledgement status unavailable",
  ackTickAll: "Tick all six statements to enable Mint.",
  retry: "Retry",
  // Validation
  invalidAmountTitle: "Invalid amount",
  invalidAmountMessage: (symbol: string, decimals: number) =>
    `Enter a ${symbol} amount greater than 0 with up to ${decimals} decimals.`,
  belowMinimumTitle: "Below the minimum purchase",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    about: string | null,
  ) =>
    `Minimum ${minimum} ${display} (${minimumUsd} in ${symbol})${about !== null ? `, about ${about}` : ""}.`,
  aboveRemainingTitle: "Above the remaining amount",
  aboveRemainingMessage: (remaining: string, display: string, max: string) =>
    `Only ${remaining} ${display} remain (${max}).`,
  insufficientTitle: (symbol: string, fee: string) =>
    `Insufficient ${symbol} (amount + ${fee} fees)`,
  insufficientMessage: (required: string) =>
    `You need ${required} including fees.`,
  useMaximum: "Use maximum",
  // Purchase errors raised on the page
  approvalFailed: (symbol: string) => `${symbol} approval failed`,
  purchaseNotCompleted: "Purchase not completed",
  purchaseNotSubmitted:
    "The purchase could not be submitted. Please try again.",
  // Mint button states
  recordingAcks: "Recording acknowledgements…",
  approving: (symbol: string) => `Approving ${symbol}…`,
  buying: "Minting…",
  saleComplete: "Sale complete",
  salesPaused: "Sales are paused",
  tokenUnavailable: (symbol: string) => `${symbol} unavailable`,
  buyWith: (symbol: string) => `Mint with ${symbol}`,
  // Success
  received: (amount: string, display: string) =>
    `You received ${amount} ${display}`,
  // Form card
  buyTtti: "Mint TTTI-T",
  buyHeading: "Mint",
  // Buy-to-mint explanation (also rendered in the white paper)
  mintInfoToggle: "What is buy-to-mint?",
  mintInfoBody1:
    "A TTTI-T is created only when someone pays in ICP, ckBTC, ckUSDC or ckUSDT at the displayed rate. The liquidity the minter contributes stays theirs, in their own pool position. No one, admin included, can create TTTI-T any other way.",
  mintInfoBody2:
    "A bitcoin comes into existence only when a miner spends a real resource: energy and hardware. A TTTI-T comes into existence only when someone brings a real token. On both sides, that is the skin in the game.",
  walletPlug: "Plug",
  walletBuiltIn: "Built-in wallet",
  balanceLabel: (symbol: string) => `${symbol} balance`,
  unavailable: "Unavailable",
  noTreasury: (symbol: string) =>
    `Minting with ${symbol} is not available at the moment.`,
  youPayIn: (symbol: string) => `You pay in ${symbol}`,
  youReceive: "You receive",
  withFees: (amount: string) => ` · ${amount} with fees`,
  totalDebited: "Total debited with network fees:",
  noRateTitle: (symbol: string) => `No valid ${symbol}/USD rate for this hour`,
  noRateBody: (symbol: string) =>
    `Purchases in ${symbol} are unavailable until a rate is set.`,
  // Final Mint button
  finalMint: (symbol: string) => `Mint ${symbol}`,
  finalMinting: "Minting…",
  finalConverting: "Converting held ckBTC…",
  finalMoving: "Moving DEX balance to wallet…",
  finalChecking: "Checking balances…",
  finalSourceLabel: "Balance used",
  finalSourceWallet: (amount: string) => `Wallet: ${amount}`,
  finalSourceDex: (amount: string) => `DEX internal balance: ${amount}`,
  finalSourceContract: (amount: string) => `Held by the contract: ${amount}`,
  finalPreview: (ttti: string, pay: string) => `${ttti} for ${pay}`,
  finalFundFirst: (symbol: string) =>
    `No ${symbol} in your wallet, in the DEX or held by the contract. Fund the account first.`,
  finalEnterAmount: "Enter an amount in the form above, then click Mint.",
  finalDexMoved: (amount: string) =>
    `Withdrawal of ${amount} from the DEX balance to your wallet completed. Enter an amount, then click Mint.`,
  finalDexFailed: (detail: string) =>
    detail
      ? `The DEX withdrawal failed. ${detail}`
      : "The DEX withdrawal failed.",
  finalDexWithdrawing: "Step 1 of 2: withdrawing from the DEX…",
  finalDexMinting: "Step 2 of 2: minting…",
  finalDexTooLow: (available: string, required: string) =>
    `The DEX balance after the ledger fee (${available}) is below the ${required} needed for this mint. Nothing was withdrawn.`,
  finalDexShort: (balance: string, required: string) =>
    `The withdrawal completed. The wallet balance of ${balance} is below the ${required} needed for this mint. The funds remain in your wallet.`,
  finalDexMintKept: (amount: string) =>
    `The mint did not complete. ${amount} remains in your wallet. Click Mint to retry from the wallet.`,
  finalUseTokenForm:
    "This balance is minted from the ckBTC payment form, which opens when you click Mint.",
};

export default en;
