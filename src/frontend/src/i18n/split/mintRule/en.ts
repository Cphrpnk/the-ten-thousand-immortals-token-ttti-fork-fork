const share =
  "At each mint, a locked share m of the minted TTTI-T is pooled together with its counterpart dollars and locked in the minter's name. m is computed at payment time from the ratio of the value of the pools to the capitalisation, between 0 % and 50 %, and is recorded with the position. The relay releases this lock at the latest after 3 months.";
const remainder =
  "The remainder (1 − m) is chosen by the minter before paying. Choice A: it is pooled too, without lock; the position can be withdrawn at any time or locked voluntarily from 3 months to 5 years. Choice B: the minter keeps that TTTI-T in the wallet and does not pay the matching liquidity.";
const payment =
  "The payment is (10,000 USD + the liquidity contributed per TTTI-T) × q ÷ 0.99, where the liquidity contributed per TTTI-T is 10,000 USD under choice A and m × 10,000 USD under choice B. 10,000 USD × q always goes to the common reserve; 1 % of the amount paid goes to the creator, after the cycles reserve. TTTI-T never enters a pool without its counterpart dollars. At auction settlement the same rule applies, with the winner's price B in place of 10,000 USD for the position part.";
const redemption =
  "Redemption from the common reserve: 1 TTTI-T redeems for at most 10,000 USD, with no fee. For x TTTI-T returned to the contract, the payout is the lower of 10,000 USD × x and (the reserve ÷ the TTTI-T in circulation outside the contract) × x, paid pro rata to the composition of the reserve, in ICP, ckBTC, ckUSDC and ckUSDT.";

/** The four parts and their joined form. */
const en = {
  share,
  remainder,
  payment,
  redemption,
  all: `${share} ${remainder} ${payment} ${redemption}`,
};

export default en;
