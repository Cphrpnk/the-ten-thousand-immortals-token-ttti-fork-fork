import mintRule from "../mintRule/en";

const en = {
  label: "Test release",
  intro:
    "This is a test release: one token, TTTI-T, 10,000 USD in total, from 1 USD. Same price as any future TTTI: no discount, no bonus, no advantage. If a full release ever happens, TTTI-T converts 1:1 into TTTI. There may never be a full release.",
  errorText: "Live allocation figures are temporarily unavailable.",
  retry: "Try again",
  statusComplete: "Allocation complete",
  statusPaused: "Purchases paused",
  statusCurrent: "Current allocation",
  pricePerToken: "Price per TTTI-T (before the fee)",
  totalSupply: "Total supply",
  remaining: "Remaining",
  progressAria: (percent: string) =>
    `Total supply: ${percent}% of the maximum supply`,
  totalSupplyLine: (
    total: string,
    max: string,
    symbol: string,
    percent: string,
  ) => `Total supply: ${total} / ${max} ${symbol} (${percent}%)`,
  disclosuresTitle: "Creator disclosures",
  disclosure1: `${mintRule.all} A refused pair-request deposit, in any token (TTTI-T included), goes to the permanent liquidity set aside. The creator's holdings are declared and public: the amounts held for the creator, per token, are listed on the Pools page. The creator does not defend a price or trade to create volume. Anyone, the creator included, may provide liquidity at their discretion and withdraw it under the lock rules. Trust only what you can verify.`,
  disclosure2:
    "TTTI and THAT have the same creator. TTTI has no link to THAT: it cannot be exchanged for THAT, used inside THAT, or converted into anything else.",
};

export default en;
