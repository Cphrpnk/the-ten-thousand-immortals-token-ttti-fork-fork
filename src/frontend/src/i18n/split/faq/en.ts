const en = {
  label: "Questions",
  title: "Before you mint",
  intro: "Clear answers on the token, the wallets and how minting works.",
  whatQ: "What is TTTI-T?",
  whatA:
    "TTTI-T is the test release of TTTI, an exchange currency on the Internet Computer. The ledger uses 8 decimals, and this test release contains one token. Payment is made in ICP, ckBTC, ckUSDC or ckUSDT, following the mint rule explained in the next question.",
  mintRuleQ: "How is the payment for a mint calculated?",
  noReturns: "There is no promise of returns of any kind.",
  icpQ: "How do I get ICP?",
  icpBefore: "TTTI-T is minted with ICP. If you do not hold any yet, visit ",
  icpLink: "Get ICP first",
  icpAfter:
    " for trusted ways to buy ICP and send it to your wallet, then come back to mint.",
  btcQ: "Can I pay in BTC?",
  rateQ: "How is the USD rate set?",
  walletsQ: "Which wallets are supported?",
  walletsA:
    "You can sign in with Internet Identity or with the Plug wallet. Both keep you in control: the app reads your balances and you sign every transfer yourself.",
  whereQ: "Where do my minted tokens appear?",
  whereBefore:
    "Your minted TTTI-T is delivered to the account you signed in with. It appears under TTTI-T on the ",
  whereLink: "Wallet page",
  whereAfter:
    ". If you prefer, you can add an optional delivery address (a Principal ID) before minting — it is never required.",
  supplyQ: "How many tokens can exist?",
  supplyIntro: "TTTI is the future version; TTTI-T is the live test.",
  liquidityQ: "How do liquidity pools work?",
  liquidityA:
    "Anyone may provide liquidity and withdraw it. Liquidity positions are public and linked to the identifier on TTTI. The protocol never places a price-linked order and creates no TTTI-T. Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price. Only observed yield, meaning fees actually paid over the past 30 days, is shown. There is no promise of returns.",
  privacyQ: "What is public, and what does the app keep?",
  privacyA:
    "Every purchase and transfer is recorded publicly and permanently on the ledger of the token used: ICP, ckBTC, ckUSDC, ckUSDT or TTTI-T. Anyone can see the amounts, the accounts and the times. Bitcoin transfers are public on the Bitcoin chain: anyone can see their transaction IDs (txids), addresses and amounts. Beyond that, the app keeps only your purchase records with their amounts and block numbers, your delivery address, the date you accepted the purchase terms and your BTC deposit trackings (deposit address, txids and the status of each deposit).",
};

export default en;
