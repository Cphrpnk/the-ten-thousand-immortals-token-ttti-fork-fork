const en = {
  noReward:
    "No reward is created. Everything paid out was first paid by someone (minters, traders, transfers), and anyone can verify it.",
  observedYield:
    "TTTI-T generates nothing by itself. Swap fees pay the liquidity provided. Only the fees actually paid over the last 30 days are shown, for example: this pool paid X in fees over the last 30 days.",
  permanentDepth:
    "Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price.",
  ilTitle: "Impermanent loss",
  il: "A liquidity position holds a share of the pool, not a fixed amount of each token. When the pool price moves, the position can be worth less than the same tokens held outside the pool, whatever fees were collected.",
  exposureTitle: "Exposure to BTC and ICP",
  exposure:
    "Through its pools, TTTI-T is exposed to BTC and ICP: the TTTI-T side of a position is paired with ICP, ckBTC, ckUSDC or ckUSDT, so its value in those tokens follows the pool.",
  zapTitle: "Mint zap",
  zap: "The zap is an automatic swap made with the minter's own money at the moment of the mint, so that the rest can be deposited at the pool ratio.",
  guaranteeTitle: "Common reserve and redemption",
  guarantee:
    "Redemption from the common reserve: 1 TTTI-T redeems for at most 10,000 USD, with no fee. For x TTTI-T returned to the contract, the payout is the lower of 10,000 USD × x and (the reserve ÷ the TTTI-T in circulation outside the contract) × x, paid pro rata to the composition of the reserve, in ICP, ckBTC, ckUSDC and ckUSDT. Minting q TTTI-T costs (10,000 USD + the liquidity contributed) × q ÷ 0.99, of which 10,000 USD × q goes to the common reserve and 1 % of the amount paid goes to the creator; the rest is the liquidity contributed, which stays in the minter's position.",
  refusedDeposits:
    "A refused pair-request deposit, in any token (TTTI-T included), goes to the permanent liquidity set aside; the router rebalances it and injects it at the pool ratio.",
  chance:
    "At the mint every minter has an equal chance. At auctions the highest bids win, in price order, until the lot is sold.",
  auctionRules:
    "Auctions are sealed-bid: each bidder pays their own bid. The reserve price is the highest of 10,000 USD per TTTI-T, the 24-hour average of the consolidated price and the current consolidated price. Nothing is reissued below 10,000 USD.",
};

export default en;
