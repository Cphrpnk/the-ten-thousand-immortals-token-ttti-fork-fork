mixin () {
  public query func getApiDoc() : async Text {
    "# TTTI-T Backend API\n\n" #
    "## Purpose\n\n" #
    "This canister is the TTTI-T (test version) token ledger and its buy-to-mint\n" #
    "sale. TTTI-T is an ICRC-1 / ICRC-2 / ICRC-3 / ICRC-10 token with 8 decimals\n" #
    "and a maximum supply of 1 TTTI-T (100_000_000 base units). Tokens cannot be\n" #
    "burned, so total supply never decreases and never exceeds the cap. Base\n" #
    "price: 1 TTTI-T = 10 000 USD. TTTI-T is minted with ICP, ckBTC, ckUSDC or\n" #
    "ckUSDT through the liquidity mint (see Liquidity mint). Of the amount paid,\n" #
    "1% is the creator share, taken after the cycles reserve share; the rest forms\n" #
    "the minter's position in the TTTI-T pool of the paid token and 10 000 USD per\n" #
    "TTTI-T goes to the common reserve (held in the paid token, ICP, ckBTC, ckUSDC or ckUSDT, valued in USD, never converted, see Common\n" #
    "reserve and redemption). Nothing accumulates in the contract and there is no\n" #
    "withdraw endpoint for mint revenue. The records of earlier mints remain\n" #
    "readable as history (see Mint revenue).\n" #
    "New TTTI-T is\n" #
    "created only by the purchase logic. The backend keeps only the core\n" #
    "contract: buying, balances, transfers, history and the token standards, plus\n" #
    "a few admin controls (pause sales, refresh rates, the test transfer fee,\n" #
    "the balance snapshot export).\n\n" #
    "Nobody, admin included, can mint outside the purchase logic, freeze\n" #
    "transfers, move other holders' tokens, or withdraw the TTTI-T\n" #
    "transfer-fee collector. Nobody can burn tokens. ICP, ckBTC, ckUSDC and\n" #
    "ckUSDT move only by the automatic rules below. There is no withdrawal\n" #
    "from the legacy mint fee account, the cycles reserve, the protocol fee account\n" #
    "or protocol liquidity; the admin only chooses the receiving wallet of\n" #
    "each pay token.\n\n" #
    "This canister can be upgraded by its controllers. `getTechnicalDetails`\n" #
    "publishes the current controllers and module hash (see Canister info), so\n" #
    "the guarantees above describe the code identified by that module hash.\n\n" #

    "## Authentication and identity\n\n" #
    "- Users sign in through the app frontend with Internet Identity or the Plug\n" #
    "  wallet. Every call is identified only by its caller principal. An Internet\n" #
    "  Identity principal and a Plug principal are different principals: balances,\n" #
    "  delivery addresses, acknowledgements and roles never carry over.\n" #
    "- The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "  `/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
    "  the user's Internet Identity authorization derives the correct per-app\n" #
    "  principal against that origin (for example\n" #
    "  `icp identity link web <name> --app <host>`). Warning: such a delegation acts\n" #
    "  with the user's full authority in this app (it can spend the user's TTTI-T\n" #
    "  and buy with their ICP approval) until it expires.\n" #
    "- Signed (non-anonymous) caller required: `icrc1_transfer`, `icrc2_approve`,\n" #
    "  `icrc2_transfer_from` (they act on the caller's own accounts),\n" #
    "  `convertDeposit` and `convertDepositWith` (anonymous -> `#Err` code\n" #
    "  `#anonymousCaller`), `acceptPurchaseAcknowledgements` (anonymous ->\n" #
    "  `#err(#anonymousCaller)`), `setDeliveryAddress` (anonymous -> `#Err` code\n" #
    "  `#anonymousCaller`), `getBtcPurchaseAddress`, `checkBtcPurchaseDeposit`,\n" #
    "  `convertMyHeldBtc`,\n" #
    "  `getBtcWalletAddress` and `checkBtcWalletDeposit` (anonymous -> `#Err` code\n" #
    "  `#anonymousCaller`).\n" #
    "- No signature needed: `getBtcWalletAddressFor(owner)`,\n" #
    "  `checkBtcWalletDepositFor(owner)` and `getBtcWalletDepositsFor(owner)`\n" #
    "  accept any caller, anonymous included (see Native BTC deposits).\n" #
    "- None of these need registration. A role matters only for admin endpoints.\n\n" #

    "### Registration and roles\n\n" #
    "- Roles are `#admin` or `#user`. Registration happens only when a caller signs\n" #
    "  in through this app's own frontend (the frontend calls the authorization\n" #
    "  library's sign-in hooks). A principal that never did so is unregistered even\n" #
    "  when it belongs to the app's owner, and a caller derived against a different\n" #
    "  origin is a different principal than the one the frontend registered.\n" #
    "- A direct API caller registers by calling `_initialize_access_control` once\n" #
    "  as a signed-in caller. It grants `#admin` only while no admin has been\n" #
    "  assigned yet; every later caller becomes `#user`. Anonymous calls register\n" #
    "  nothing.\n" #
    "- `getCallerUserRole`, `isCallerAdmin`, `assignCallerUserRole` come from the\n" #
    "  authorization library. `getCallerUserRole` and `isCallerAdmin` trap with\n" #
    "  `User is not registered` for an unregistered signed-in caller.\n" #
    "- Admin-only endpoints trap for any other caller. A registered non-admin gets\n" #
    "  `Unauthorized: only admins ...` (the exact message is listed per endpoint).\n" #
    "  An unregistered caller may get the library trap `User is not registered`\n" #
    "  instead. Treat any trap from an admin endpoint as \"not authorized\".\n\n" #

    "### Public vs caller-scoped vs admin\n\n" #
    "- Public (anyone, including anonymous): all ICRC-1/2/3/10 queries, the\n" #
    "  index-ng queries (`get_account_transactions`, `list_subaccounts`,\n" #
    "  `status`, `ledger_id`),\n" #
    "  `getFeeCollector`, `getBurnAccount`, `getLegacyBlockInfo`, `get_fee`,\n" #
    "  `get_fee_bounds`, `get_max_supply`, `getSaleStatus`, `getTechnicalDetails`,\n" #
    "  `getPublicBoard`, `getCreatorHoldings`, `topUpCycles`,\n" #
    "  `listPermanentLiquidityLog`, `getPermanentLiquiditySummary`,\n" #
    "  `getIcpPrice`, `getTokenPrices`, `getBtcUsdRate`, `getPublicTreasuryInfo`,\n" #
    "  `getCanisterPrincipal`,\n" #
    "  `getCyclesStatus`, `getBtcDepositInfo`, `getBtcWalletAddressFor`,\n" #
    "  `checkBtcWalletDepositFor`, `getBtcWalletDepositsFor`, `schema`, `execute`\n" #
    "  and `getApiDoc`.\n" #
    "- Caller-scoped: `getMyPurchaseAcknowledgement`,\n" #
    "  `acceptPurchaseAcknowledgements`, `getDeliveryAddress`,\n" #
    "  `setDeliveryAddress`, `clearDeliveryAddress`, `convertDeposit`,\n" #
    "  `convertDepositWith`, `getBtcPurchaseAddress`, `checkBtcPurchaseDeposit`,\n" #
    "  `getBtcWalletAddress`, `checkBtcWalletDeposit`, `getMyBtcDeposits`,\n" #
    "  `getMyConversions`, `listMyContacts`, `addContact`, `updateContact`,\n" #
    "  `deleteContact`.\n" #
    "  Only the three wallet-path `*For(owner)` endpoints read or trigger another\n" #
    "  principal's BTC deposits; none touches purchase-path data.\n" #
    "- Admin-only reads: `getTreasuryConfig`, `getConversions`,\n" #
    "  `exportBalanceSnapshot`, `getCyclesAutonomy`, `getCyclesShare`,\n" #
    "  `getCyclesShareHistory`, `getMintTreasuryAccounts`,\n" #
    "  `getLastWeeklyAllocation`, `listWeeklyAllocations`, `listDcBatches`,\n" #
    "  `getReceivingWallets`, `getSettlementStatus`, `getMintFeeAccount`,\n" #
    "  `listAdminHistory`, `listTransfersToReview`, `diagnoseBtcMint` and\n" #
    "  `finishBtcMint` (admin updates),\n" #
    "  `listTransfersToReviewFiltered`, `listCyclesFeeSettlements`,\n" #
    "  `listCyclesFeeSplits`, `listCyclesFeeSettlementsToReview`,\n" #
    "  `listCreatorPayoutsToReview`, and the history reads\n" #
    "  `listTreasuryWithdrawals`, `listOwnerSends`, `getOwnerAccumulated`,\n" #
    "  `getTreasurySweepStatus`.\n" #
    "- Public (lot 4): `getProtocolLiquidity`. Caller-scoped (lot 4):\n" #
    "  `getMyLpBonus`, `claimLpBonus`.\n" #
    "- Admin-only writes: `setSalesPaused`, `refreshIcpPrice`,\n" #
    "  `refreshTokenPrice`, `setReceivingWallet`, `payCreatorFees`,\n" #
    "  `markCreatorPayoutArrived`, `markCreatorPayoutNotArrived`,\n" #
    "  `markCyclesFeeSettlementArrived`, `markCyclesFeeSettlementNotArrived`.\n" #
    "  `set_fee` no longer exists: the transfer fee is fixed.\n" #
    "  `withdrawTreasury` and `getTreasuryBalances` no longer exist.\n" #
    "  `setTreasuryConfig`, `setPayTokenAccount` and `withdrawReserveExcess`\n" #
    "  were removed in DEX lot 4 and no longer exist. There is no admin mint,\n" #
    "  no burn endpoint, no transfer freeze and no withdrawal of the TTTI-T fee\n" #
    "  collector, the cycles reserve, the mint treasuries or protocol liquidity.\n\n" #

    "## Units and encodings\n\n" #
    "- TTTI-T amounts are base units, 8 decimals (1 TTTI-T = 100_000_000; the\n" #
    "  minimum purchase 0.0001 TTTI-T = 10_000). Amounts are rounded down to\n" #
    "  1 base unit. Exception: legacy blocks below the legacy boundary (see\n" #
    "  ICRC-3) use 4 decimals.\n" #
    "- ICP amounts are e8s (1 ICP = 100_000_000). ICP ledger fee: 10_000 e8s.\n" #
    "- Pay-token amounts (`payAmount`, `allowance`, `balance`,\n" #
    "  `maximumPayAmount`) are always in that token's base units:\n" #
    "  - `#icp`: ledger `ryjl3-tyaaa-aaaaa-aaaba-cai`, 8 decimals, fee 10_000.\n" #
    "  - `#ckbtc`: ledger `mxzaz-hqaaa-aaaar-qaada-cai`, 8 decimals, fee 10.\n" #
    "  - `#ckusdc`: ledger `xevnm-gaaaa-aaaar-qafnq-cai`, 6 decimals, fee 10_000.\n" #
    "  - `#ckusdt`: ledger `cngnf-vqaaa-aaaar-qag4q-cai`, 6 decimals, fee 10_000.\n" #
    "- Prices: `usdE8` / `priceUsdE8` = USD per whole pay token * 10^8;\n" #
    "  `usdMicro` = USD * 10^6. `liveRate` is TTTI-T base units per whole pay\n" #
    "  token at the stored hourly rate (fee included; null when no rate).\n" #
    "  `cyclesFeeBps` / `feeBps` are basis points (100 = 1%).\n" #
    "- Timestamps: nanoseconds since the Unix epoch. Conversion and snapshot\n" #
    "  timestamps are Candid `nat64`; rate timestamps of every pay token\n" #
    "  (`fetchedAt`,\n" #
    "  `validUntil`, `lastError.at`, `lastSuccessAt`, `priceFetchedAt`,\n" #
    "  `priceValidUntil`) and acknowledgement `acceptedAt` are Candid `int`;\n" #
    "  cycles reserve timestamps are Candid `int`; ICRC-3 block `ts` is `Nat`. 0 means\n" #
    "  never.\n" #
    "- Accounts: ICRC-1 `{ owner : Principal; subaccount : ?Blob }` (32-byte\n" #
    "  subaccount). An all-zero subaccount is treated as `null`.\n" #
    "- Optional values are Candid `opt`; variants are Candid variants.\n\n" #

    "## Special accounts\n\n" #
    "- Fee collector: `{ owner = <this canister>; subaccount = <fixed 32-byte\n" #
    "  ASCII identifier> }`, unchanged since launch; read it from\n" #
    "  `getFeeCollector() : { account; balance }`. Every charged transfer /\n" #
    "  transfer_from / approve fee is credited here. No caller, admin included,\n" #
    "  can transfer or approve from it; its tokens are sold again against ICP,\n" #
    "  only once fresh minting reached the cap.\n" #
    "- Minting account (contract address): `{ owner = <this canister>;\n" #
    "  subaccount = null }`, returned by `icrc1_minting_account()` and\n" #
    "  `getBurnAccount()` (name kept for compatibility). Tokens cannot be burned:\n" #
    "  `icrc1_transfer` and `icrc2_transfer_from` to it return\n" #
    "  `#GenericError { error_code = 8; message = \"Tokens cannot be burned;\n" #
    "  transfers to the contract address are refused.\" }` before any debit, fee,\n" #
    "  allowance change, dedup entry or block. Transfers and approvals from it are\n" #
    "  refused too.\n\n" #

    "## ICRC-1 / ICRC-2\n\n" #
    "- Metadata: `icrc1_name` = \"The Ten Thousand Immortals\", `icrc1_symbol` =\n" #
    "  \"TTTI-T\", `icrc1_decimals` = 8, `icrc1_fee`, `icrc1_total_supply`,\n" #
    "  `icrc1_balance_of`, `icrc1_metadata` (`icrc1:name`, `icrc1:symbol`,\n" #
    "  `icrc1:decimals`, `icrc1:fee`, `icrc1:max_memo_length` = 32,\n" #
    "  `icrc1:max_supply`, `icrc1:logo` = PNG data URI).\n" #
    "- `icrc1_supported_standards` and `icrc10_supported_standards` both return\n" #
    "  ICRC-1, ICRC-2, ICRC-3 and ICRC-10 as `{ name; url }`.\n" #
    "- `icrc1_transfer`, `icrc2_approve`, `icrc2_allowance`, `icrc2_transfer_from`.\n\n" #
    "Rules (checked in this order: memo, created_at_time, then the rest):\n\n" #
    "- `memo` is at most 32 bytes, else `#GenericError { error_code = 4 }`.\n" #
    "- Transfer and transfer_from with `amount = 0` return\n" #
    "  `#GenericError { error_code = 5 }`. `icrc2_approve` with `amount = 0` is\n" #
    "  accepted: it charges the fee, writes a block and removes the allowance.\n" #
    "- `fee`: pass `null` or exactly the current fee, else\n" #
    "  `#BadFee { expected_fee }`.\n" #
    "- To the minting account -> `#GenericError { error_code = 8 }` (checked\n" #
    "  right after memo and created_at_time, before amount and fee).\n" #
    "- From the minting account -> `#GenericError { error_code = 6 }`. Approving\n" #
    "  a spender with the same owner principal -> `#GenericError { error_code = 7 }`.\n" #
    "  From the fee collector -> `#GenericError { error_code = 2 }`.\n" #
    "- Insufficient balance -> `#InsufficientFunds { balance }` (amount + fee for\n" #
    "  transfers; only the fee for approve).\n\n" #
    "Deduplication (only when `created_at_time` is set):\n\n" #
    "- Window 24 h, permitted drift 2 min. Too old -> `#TooOld`; more than 2 min\n" #
    "  ahead -> `#CreatedInFuture { ledger_time }`.\n" #
    "- An identical request inside the window returns\n" #
    "  `#Duplicate { duplicate_of = <original block index> }` and changes nothing.\n" #
    "  Set `created_at_time` to make retries of a transfer/approve safe. Without it\n" #
    "  every call is a new transaction.\n\n" #
    "Approvals (ICRC-2):\n\n" #
    "- `expires_at <= now` -> `#Expired { ledger_time }`. A mismatching\n" #
    "  `expected_allowance` -> `#AllowanceChanged { current_allowance }`. A new\n" #
    "  approve replaces the amount and the expiry.\n" #
    "- `icrc2_allowance` reports `{ allowance = 0; expires_at = null }` for a\n" #
    "  missing or expired approval.\n" #
    "- `icrc2_transfer_from` needs allowance >= amount + fee (else\n" #
    "  `#InsufficientAllowance { allowance }`). The remaining allowance keeps its\n" #
    "  original `expires_at` and is removed when it reaches 0.\n\n" #

    "## ICRC-3 block log\n\n" #
    "- `icrc3_get_blocks(vec { record { start; length } })` ->\n" #
    "  `{ log_length; blocks = vec { record { id; block } }; archived_blocks }`.\n" #
    "  Ranges are served in request order, each ascending and clipped to\n" #
    "  `log_length`, with at most 100 blocks in total per call. Blocks beyond the\n" #
    "  cap are omitted, so request again from the last returned `id + 1`.\n" #
    "- No archives: `archived_blocks = []`, `icrc3_get_archives` returns `[]`. The\n" #
    "  log is append-only and stays in this canister.\n" #
    "- `icrc3_supported_block_types` -> `1xfer`, `2approve`, `1mint`, `1burn`.\n" #
    "  No new `1burn` block can be written; the type stays listed so blocks\n" #
    "  written by earlier test versions still decode.\n" #
    "- Standard blocks are ICRC-3 `Value` maps: `btype`, `ts` (ns), optional `fee`\n" #
    "  (present only when the caller omitted `tx.fee`), optional `fee_col`,\n" #
    "  `phash`, and `tx` (`from`, `to`, `spender` as `Array [Blob owner, Blob\n" #
    "  subaccount?]`, `amt`, optional `fee`, `memo`, `created_at_time`,\n" #
    "  `expires_at`, `expected_allowance`).\n" #
    "- Sale deliveries are `1mint` blocks while fresh minting is below the cap;\n" #
    "  after the cap, deliveries from the fee collector are `1xfer` blocks with\n" #
    "  top-level `fee = 0` and no `fee_col`.\n" #
    "- Legacy history written before the ICRC-3 upgrade is preserved at the same\n" #
    "  indexes as colon-separated `Text` values. `getLegacyBlockInfo() : {\n" #
    "  boundaryIndex; legacyDecimals = 4; currentDecimals = 8 }`: blocks with\n" #
    "  index < `boundaryIndex` use 4 decimals. Decode by index, not by shape.\n" #
    "- Hashes use the ICRC-3 representation-independent hash. The first standard\n" #
    "  block chains to the SHA-256 of the last legacy text block.\n" #
    "- `icrc3_get_tip_certificate()` -> `opt { certificate; hash_tree }` with\n" #
    "  `last_block_hash` and `last_block_index`; `null` for an empty log or when\n" #
    "  called as an update. Verify it against the IC root key.\n\n" #

    "## ICRC index-ng\n\n" #
    "This canister is also its own ICRC index (index-ng interface, official\n" #
    "Candid shapes). The index is derived on the fly from the full ICRC-3 block\n" #
    "log, so it is always in sync and stores nothing extra. All are public\n" #
    "queries (anonymous allowed) and never change state.\n\n" #
    "- `ledger_id() : principal` returns this canister's own principal (the\n" #
    "  ledger and the index are the same canister).\n" #
    "- `status() : { num_blocks_synced : nat }` equals the ledger block count\n" #
    "  (`icrc3_get_blocks` `log_length`).\n" #
    "- `icrc1_balance_of(account)` is the ledger's own balance query.\n" #
    "- `get_account_transactions({ account; start : opt nat; max_results : nat })`\n" #
    "  -> `variant { Ok : { balance; transactions : vec { id; transaction };\n" #
    "  oldest_tx_id : opt nat }; Err : { message } }`. Transactions involving the\n" #
    "  account (as from, to or spender) are returned newest first. `start` is an\n" #
    "  exclusive upper bound: only ids strictly below it are returned. Page with\n" #
    "  `start = <last returned id>` until the last id equals `oldest_tx_id` or a\n" #
    "  page is empty. `max_results` is capped at 500. `balance` equals\n" #
    "  `icrc1_balance_of`. `Err` is not produced today.\n" #
    "- `Transaction` = `{ kind (\"transfer\" | \"approve\" | \"mint\" | \"burn\");\n" #
    "  timestamp : nat64 (ns); transfer; approve; mint; burn; fee_collector;\n" #
    "  authorized_mint; authorized_burn }` with exactly one of the first four set;\n" #
    "  the last three are always null. Transfer `{ from; to; spender; amount; fee;\n" #
    "  memo; created_at_time }`, Approve adds `expected_allowance` and\n" #
    "  `expires_at`, Burn has optional `spender` (`burn` appears only for blocks\n" #
    "  written by earlier test versions). `fee` is the caller's `tx.fee`,\n" #
    "  else the block's top-level fee.\n" #
    "- `list_subaccounts({ owner; start : opt blob })` -> subaccounts the owner\n" #
    "  used in any block, ascending, strictly after `start`, at most 500 per call.\n" #
    "  The default account is reported as 32 zero bytes.\n" #
    "- Legacy text blocks are included. Amounts and fees of legacy blocks below\n" #
    "  `boundaryIndex` (4 decimals) are converted to current 8-decimal units\n" #
    "  (multiplied by 10_000). Legacy `legacy:index:amount` records carry no\n" #
    "  account and therefore appear in no account's history.\n" #
    "- An all-zero subaccount is the same account as `null`.\n" #
    "- Not provided: `get_blocks`, `get_fee_collectors_ranges` (use\n" #
    "  `icrc3_get_blocks` and `getFeeCollector`).\n\n" #

    "## Supply and fee\n\n" #
    "- There is no mint endpoint and no burn endpoint. `get_max_supply()` and\n" #
    "  `icrc1:max_supply` are 100_000_000 (1 TTTI-T).\n" #
    "  `mintableRemaining = max(0, maxSupply - icrc1_total_supply)`. The TTTI-T\n" #
    "  available at the mint is `mintableRemaining - reserved` only: transfer\n" #
    "  fees never count in it and the mint only mints new tokens, up to the cap.\n" #
    "  The mint is over when what remains to mint is below the minimum of one\n" #
    "  mint; that remainder joins the first auction lot and is minted only at\n" #
    "  settlement, for the winner, pooled with the winner's mass. Every purchase\n" #
    "  mint is refused if `totalSupply + minted` would exceed the max supply.\n" #
    "  Tokens cannot be burned, so once 1 TTTI-T has been minted\n" #
    "  `mintableRemaining` is 0 and stays 0.\n" #
    "- The TTTI-T transfer fee is fixed at 0.000001 TTTI-T (100 base units) per\n" #
    "  transfer and cannot be changed: there is no `set_fee` endpoint. It is paid\n" #
    "  into the fee collector account, which belongs to the creator: the\n" #
    "  collected fees are really paid to the creator (moved to the TTTI-T DEX\n" #
    "  custody and credited with source `transferFee`, see\n" #
    "  Creator fees and the public board). `get_fee()` returns 100 and\n" #
    "  `get_fee_bounds()` returns `{ min = 100; max = 100 }`; a transfer with\n" #
    "  another fee fails with `BadFee { expected_fee = 100 }`. Public queries,\n" #
    "  no authentication. `get_max_supply()` is unchanged.\n\n" #

    "## Creator fees, permanent liquidity, cycles fees and the public board (PTM-4)\n\n" #
    "The creator is never named in the API: it is only called the creator.\n" #
    "All amounts are base units of the token (ICP e8s, TTTI-T e8s, ckBTC sats,\n" #
    "ckUSDC / ckUSDT 6 decimals); timestamps are nanoseconds (Candid `int`).\n\n" #
    "### Where the fees go\n\n" #
    "- Protocol share (30 % of the native swap fee and 30 % of the 0.1 % routed\n" #
    "  through ICPSwap): two thirds are credited to the creator holdings, one\n" #
    "  third goes to permanent liquidity.\n" #
    "- 1 % mint fee: the part received in ICP first fills the\n" #
    "  cycles reserve, until it holds one year of measured consumption (the\n" #
    "  2 ICP floor while no consumption is measured or the top-up rate is\n" #
    "  unknown); the rest is credited to the creator. Fees in another token go to the creator\n" #
    "  entirely. The split is recorded with each fee entry; entries from before\n" #
    "  PTM-4 keep their previous meaning. A redemption against the common reserve\n" #
    "  has no fee.\n" #
    "- TTTI-T transfer fee: fixed 100 base units (0.000001 TTTI-T) per transfer,\n" #
    "  held in the fee collector account for the creator.\n\n" #
    "### Cycles reserve fee routing\n\n" #
    "- `topUpCycles() : TopUpResult` (public update, any caller, anonymous\n" #
    "  included): runs the same top-up pass as the 6-hour timer, with the same\n" #
    "  lock and the same 20 T threshold. When no top-up is needed (cycles balance\n" #
    "  at or above the threshold and no top-up transfer or notify pending), the\n" #
    "  canister's ingress check rejects the call before it runs, so the caller\n" #
    "  gets an error and no cycles are consumed. `TopUpResult = #notNeeded\n" #
    "  { cyclesBalance; threshold } | #busy | #ran { cyclesBalance;\n" #
    "  reserveBalanceE8s; lastTopUp; attemptOpen }`. It only converts reserve ICP\n" #
    "  to cycles for this canister;\n" #
    "  nothing leaves it. Retry safe: a repeat while a pass runs returns\n" #
    "  `#busy`, and an open top-up attempt is resumed, not duplicated. The\n" #
    "  reserve balance floor (2 ICP) still applies.\n" #
    "- The ICP cycles share of the 1 % fees stays in the contract's ICP DEX\n" #
    "  balance until a settlement (memo `TTTI-CY-<n>`, every 10 minutes, at\n" #
    "  least the minimum amount) sends it to the reserve account. The identical\n" #
    "  request is resent for 23 h, then it needs admin review.\n" #
    "- Admin only (trap `Unauthorized: ...` otherwise):\n" #
    "  `listCyclesFeeSettlements(offset, limit) : [CyclesFeeSettlement]` (newest\n" #
    "  first; `{ n; grossE8s; netE8s; createdAt; attempt; status }`),\n" #
    "  `listCyclesFeeSplits(source : #mint | #buyback, offset, limit) :\n" #
    "  [{ id; source; split : { cyclesE8s; creator } }]`,\n" #
    "  `listCyclesFeeSettlementsToReview() : [CyclesFeeSettlement]`,\n" #
    "  `markCyclesFeeSettlementArrived(n, block) : { #ok; #err : Text }` and\n" #
    "  `markCyclesFeeSettlementNotArrived(n) : { #ok; #err : Text }`. `#err`\n" #
    "  when the settlement is unknown or not waiting for review. Check the ICP\n" #
    "  ledger for the `TTTI-CY-<n>` memo before marking: a wrong \"Not arrived\"\n" #
    "  sends the amount again. Marking the same settlement twice returns `#err`.\n\n" #
    "### Creator fees\n\n" #
    "- `getCreatorHoldings() : CreatorHoldingsView` (public query): `{ tokens :\n" #
    "  [{ token; symbol; held; paidOut; inFlight; swapFeeShare; routerShare;\n" #
    "  mintFee; buybackFee; transferFee; lastCreditAt : ?Int }];\n" #
    "  transferFeeCollectorE8s; payouts : [CreatorPayoutView] }` (one row per DEX\n" #
    "  token; latest 20 payouts, newest first). `held` = credited - paidOut -\n" #
    "  inFlight. `transferFeeCollectorE8s` is the read-only TTTI-T balance of the\n" #
    "  fee collector account (the transfer fees received and not yet moved); it\n" #
    "  is not part of the `transferFee` credit and is never counted twice. The\n" #
    "  `transferFee` column is the sum of the real credits with source\n" #
    "  `transferFee`, made when the collector balance is moved to the creator.\n" #
    "- `payCreatorFees(token : DexToken) : PayoutResult` (admin, update; trap\n" #
    "  `Unauthorized: only admins can manage the creator fees`): sends the whole\n" #
    "  held amount of the token, minus the ledger fee, to the receiving wallet\n" #
    "  configured for the token (TTTI-T goes to the ICP wallet). Memo\n" #
    "  `TTTI-CF-<n>`; the request is recorded before the first await. `#ok\n" #
    "  CreatorPayoutView | #err (#paused | #noWallet | #nothingToPay |\n" #
    "  #belowFee { held; fee } | #payoutInProgress)`. Retry safety: one open\n" #
    "  payout per token; an unknown outcome is resent identically for 23 h\n" #
    "  (a ledger duplicate counts as arrived), then needs review. Never pays\n" #
    "  twice.\n" #
    "- `listCreatorPayoutsToReview() : [CreatorPayoutView]` (admin query),\n" #
    "  `markCreatorPayoutArrived(n, block)` and `markCreatorPayoutNotArrived(n)`\n" #
    "  (admin updates, `{ #ok; #err : Text }`). Verify the ledger memo\n" #
    "  `TTTI-CF-<n>` first; \"Not arrived\" makes the amount held again.\n\n" #
    "### Permanent liquidity\n\n" #
    "- The one third of each protocol share is set aside per token. A 10-minute\n" #
    "  pass rebalances it on the best route (native pool or ICPSwap, at most\n" #
    "  2 % below the average of the last hour) once the set-aside is worth at\n" #
    "  least 1 ICP, then injects it into the least liquid TTTI-T pool as shares\n" #
    "  locked by the contract. They are never withdrawable. Every operation is\n" #
    "  written to a public journal. The DEX pause stops the pass.\n" #
    "- `listPermanentLiquidityLog(offset, limit) : { total; entries }` (public\n" #
    "  query, newest first, limit capped at 100). Entry: `{ id; at; kind\n" #
    "  (#accrued | #rebalanced | #injected | #waiting | #failed); token; amount;\n" #
    "  otherToken : ?DexToken; otherAmount; route : ?(#native poolId |\n" #
    "  #icpswap principal); poolId : ?Nat; shares; reason : ?Text }`. A waiting\n" #
    "  or failed reason is logged once, not repeated.\n" #
    "- `getPermanentLiquiditySummary() : PermanentSummary` (public query):\n" #
    "  `{ pools : [{ poolId; token0Symbol; token1Symbol; lockedShares;\n" #
    "  totalShares; amount0; amount1; valueUsdE8 : ?Nat }]; totalLockedShares;\n" #
    "  setAside : [{ token; symbol; amount; valueIcpE8s : ?Nat }];\n" #
    "  setAsideValueIcpE8s; thresholdIcpE8s; maxDeviationBps; targetPoolId :\n" #
    "  ?Nat }`.\n\n" #
    "### Public board\n\n" #
    "- `getPublicBoard() : PublicBoard` (public query, anonymous allowed, no\n" #
    "  state of its own): `{ cycles : { cyclesBalance; reserveBalanceE8s;\n" #
    "  pendingFeeShareE8s; coverage : ?ReserveCoverage }; permanentLiquidity :\n" #
    "  { summary : PermanentSummary; journalEntries; latestEntries (newest\n" #
    "  first, at most 10) }; creator : { tokens : [CreatorTokenView];\n" #
    "  transferFeeCollectorE8s } }`. `coverage` is null while no consumption can\n" #
    "  be measured; otherwise `monthsCoveredX100` is the reserve in months of\n" #
    "  consumption times 100, `yearTargetCycles` / `yearTargetE8s` the one-year\n" #
    "  target and `fillBps` the fill in basis points (10_000 = 100 %). Polling:\n" #
    "  values change at most every 10 minutes; once a minute is plenty.\n" #
    "- OQL tables (PTM-4): `creatorFeeTotal`, `permanentLiquidityLog` and\n" #
    "  `permanentSetAside` (public); `creatorPayout`, `cyclesFeeSettlement` and\n" #
    "  `cyclesFeeSplit` (admin only).\n\n" #
    "## USD rates (ICP, BTC, USDC, USDT)\n\n" #
    "The USD rate of each pay token (pairs ICP-USD, BTC-USD, USDC-USD, USDT-USD)\n" #
    "is set once an hour from Coinbase, or from CoinGecko if Coinbase is\n" #
    "unavailable, and applies to every purchase in that token in that hour. If\n" #
    "no valid rate exists for the paid token, the purchase is refused and\n" #
    "nothing is taken. Each token has its own stored rate; ckUSDC and ckUSDT use\n" #
    "their own fetched rate, never an assumed 1 USD.\n\n" #
    "- Only the canister fetches prices: from its own timers, or from the guarded\n" #
    "  admin refreshes. No purchase and no query ever fetches a price.\n" #
    "- Timers: armed on every install and upgrade (one for ICP, one for the three\n" #
    "  ck tokens). Each checks immediately, then every\n" #
    "  5 minutes, and fetches when no rate exists or less than 5 minutes of\n" #
    "  validity remain. A successful rate is therefore refetched once an hour; if\n" #
    "  both sources fail, the fetch is retried every 5 minutes until one succeeds.\n" #
    "- Order: Coinbase spot `<PAIR>`, then CoinGecko simple price\n" #
    "  (`internet-computer`, `bitcoin`, `usd-coin`, `tether`) if Coinbase fails.\n" #
    "  On success: `usdE8`, `source` (#coinbase/#coingecko), `fetchedAt` = now,\n" #
    "  `validUntil` = fetchedAt + 1 hour, `lastSuccessAt` = now. On a source\n" #
    "  failure `lastError = { message; at }` stores the exact error text and its\n" #
    "  date (`Coinbase: <text>`, or `Coinbase: <text>; CoinGecko: <text>` when both\n" #
    "  fail); the previous rate is kept but follows the validity window.\n" #
    "- Validity: a rate is usable while now <= validUntil + 5 minutes; after that\n" #
    "  it is never used. There is no fallback rate and no margin.\n" #
    "- `getIcpPrice() : IcpPrice` (public query, never an outcall): `{ usdE8;\n" #
    "  source (#none/#coinbase/#coingecko); fetchedAt; validUntil; usable;\n" #
    "  lastError : ?{ message; at }; lastSuccessAt : ?Int }`. 0 / #none = no rate.\n" #
    "- `getTokenPrices() : [TokenPrice]` (public query, never an outcall): one\n" #
    "  entry per pay token in the order #icp, #ckbtc, #ckusdc, #ckusdt, each\n" #
    "  `{ token; pair; usdE8; source; fetchedAt; validUntil; usable; lastError;\n" #
    "  lastSuccessAt }`.\n" #
    "- `getBtcUsdRate() : ?{ usdE8; source; fetchedAt; validUntil }` (public\n" #
    "  query, no authentication, anonymous allowed, never an outcall): the stored\n" #
    "  hourly BTC/USD rate, the same value as the `#ckbtc` entry of\n" #
    "  `getTokenPrices`. `usdE8` = USD per whole BTC * 10^8; `source` is\n" #
    "  `#coinbase` or `#coingecko`; `fetchedAt` and `validUntil` (= fetchedAt +\n" #
    "  1 hour) are nanoseconds since the Unix epoch (Candid `int`). `null` before\n" #
    "  the first successful fetch. Display-only (wallet USD value of ckBTC): it is\n" #
    "  never used for purchases, conversions or balances. Polling: the rate\n" #
    "  changes at most once an hour; polling more than every few minutes gains\n" #
    "  nothing.\n" #
    "- `refreshIcpPrice() : PriceResult` (admin; trap `Unauthorized: only admins\n" #
    "  can refresh the ICP price`). While the current rate exists and now <=\n" #
    "  validUntil it returns `#Err(\"Refresh refused: the current ICP/USD rate is\n" #
    "  still valid until <ns> ...; no fetch was made\")` and makes no outcall.\n" #
    "  Otherwise it runs the same fetch as the timer: `#Ok(IcpPrice)` or\n" #
    "  `#Err(<combined error text>)`.\n" #
    "- `refreshTokenPrice(token) : { #Ok : TokenPrice; #Err : Text }` (admin;\n" #
    "  trap `Unauthorized: only admins can refresh token prices`). Same rule:\n" #
    "  refused with `#Err(\"Refresh refused: the current <PAIR> rate is still\n" #
    "  valid until ...\")` and no outcall while that token's rate is valid.\n" #
    "- `transform` is the outcall transform callback and is not for clients. It\n" #
    "  drops all headers and replaces the body with only the extracted price,\n" #
    "  rounded to 0.001 USD (for example `3.125`), so every node sees an identical\n" #
    "  response; an unparsable or non-200 response gets an empty body.\n\n" #

    "## Sale status and details\n\n" #
    "- `getSaleStatus() : SaleStatus` returns `{ maxSupply; totalSupply;\n" #
    "  mintableRemaining (max(0, maxSupply - totalSupply)); feeAccountBalance;\n" #
    "  sold; reserved; available\n" #
    "  (mintableRemaining - reserved); complete; minPurchase\n" #
    "  (10_000); tokenPriceUsd (10_000); cyclesFeeBps (100);\n" #
    "  salesPaused; priceUsdE8 (the stored\n" #
    "  ICP rate, exactly the one an ICP purchase applies); priceSource;\n" #
    "  priceFetchedAt; priceValidUntil;\n" #
    "  priceUsable (now <= priceValidUntil + 5 minutes); liveRate; payTokens }`.\n" #
    "- `payTokens : [PayTokenStatus]` (order #icp, #ckbtc, #ckusdc, #ckusdt):\n" #
    "  `{ token; symbol; ledgerCanisterId; decimals; ledgerFee; feeBps (100\n" #
    "  for every token); minimumUsdE8 (101_000_000 for every token);\n" #
    "  fundsCycles (true only for ICP);\n" #
    "  treasuryConfigured; priceUsdE8; priceSource; priceFetchedAt;\n" #
    "  priceValidUntil; priceUsable; liveRate }`.\n" #
    "- `maxRateAgeSeconds` in `getTechnicalDetails` is 3_900 (1 h + 5 min).\n" #
    "- `getTechnicalDetails() : TechnicalDetails` (public) returns the ledger\n" #
    "  canister ID, token name and symbol, decimals, standards, the ICP ledger\n" #
    "  canister ID, oracle sources, refresh policy, max rate age, price, fee\n" #
    "  (`tokenPriceUsd` 10_000 and `cyclesFeeBps` 100),\n" #
    "  minimum purchase, smallest unit, rounding rule, excess payment handling,\n" #
    "  delivery order, current transfer fee, max and total supply, the fee account\n" #
    "  and its balance, `cyclesReserveAccount`, `reserveFloorE8s` (200_000_000)\n" #
    "  and `reserveRule` (the reserve rule text), plus `controllers`,\n" #
    "  `moduleHash`, `canisterInfoFetchedAt`, `legacyBlockBoundary` (see\n" #
    "  Canister info) and `payTokens` (as above). `excessPaymentHandling` states\n" #
    "  that payment beyond the cost of what is delivered is never taken.\n" #
    "- `setSalesPaused(Bool)` (admin; trap `Unauthorized: only admins can manage\n" #
    "  the TTTI-T sale`). Idempotent.\n" #
    "- Pause scope: while sales are paused, purchases, mints, guarantee\n" #
    "  redemptions (`redeemGuarantee`) are refused with `#salesPaused`; the\n" #
    "  automatic redemption payout retries, the FW/SH/RF transfer retries and all\n" #
    "  BTC refunds (BR) are not sent. Recorded attempts are kept and sent after\n" #
    "  the pause. The cycles top-up continues during the pause.\n" #
    "- The price and the 1% fee (every pay token) are code constants; nobody\n" #
    "  can change them.\n\n" #

    "## Purchase acknowledgement (versioned, per principal)\n\n" #
    "- Each principal has at most one stored record `{ acceptedAt : Int; version :\n" #
    "  Nat }` (`acceptedAt` in nanoseconds). The acceptance is one-time: a record\n" #
    "  of any version counts as accepted. The `version` field records which text\n" #
    "  of the wallet terms was shown at acceptance (new acceptances store the\n" #
    "  latest version); a later version bump does not require anyone to accept\n" #
    "  again.\n" #
    "- `acceptPurchaseAcknowledgements() : { #ok : PurchaseAcknowledgement; #err :\n" #
    "  #anonymousCaller }` records that the caller accepted the wallet terms.\n" #
    "  Idempotent for anyone who already has a record, whatever its version: a\n" #
    "  repeat call keeps the existing record with its first `acceptedAt` and its\n" #
    "  version as the proof. A caller without a record gets\n" #
    "  `{ acceptedAt = now; version = <latest> }`.\n" #
    "- `getMyPurchaseAcknowledgement() : { accepted : Bool; acceptedAt : ?Int }`\n" #
    "  (query, never traps): `accepted = true` and `acceptedAt` set for a stored\n" #
    "  record of any version; anonymous or no record -> `{ accepted = false;\n" #
    "  acceptedAt = null }`.\n" #
    "- These controls refuse a caller without a stored record (anonymous\n" #
    "  included) with `#acknowledgementRequired` before any token is taken or any\n" #
    "  lock set: `mintLiquidity`, the deposit-mint (`mintFromDeposit` path), the\n" #
    "  BTC purchase conversion and gates (`getBtcPurchaseAddress`,\n" #
    "  `checkBtcPurchaseDeposit` without a stored tracking), and `redeemGuarantee`\n" #
    "  (error `GuaranteeError.#acknowledgementRequired`). Quotes and reads are not\n" #
    "  gated.\n\n" #

    "## Pools, yield and rules in plain words (lot PTM-7)\n\n" #
    "Rules only; no text describes an expected price or effect.\n\n" #
    "- The protocol never places a price-linked order. Permanent liquidity is\n" #
    "  depth management: a mechanical, public rebalancing of the protocol share,\n" #
    "  never conditioned on price (journal: `listLiquidityInjections`).\n" #
    "- No reward is created. Everything paid out was first paid by someone\n" #
    "  (minters, traders, transfers), and anyone can verify it on the ledgers and\n" #
    "  in the public records.\n" #
    "- TTTI-T generates nothing by itself; swap fees pay the liquidity provided,\n" #
    "  and only the fees actually paid over the past 30 days are shown, as a\n" #
    "  recorded fact. No projection is computed.\n" #
    "- No text here promises or aims at a price rise (protocol statement, as\n" #
    "  returned by the DEX: \"The protocol never places a price-linked order.\n" #
    "  Permanent liquidity is depth management: a mechanical, public rebalancing\n" #
    "  of the protocol share, never conditioned on price. No reward is created:\n" #
    "  everything paid out was first paid by someone (minters, traders,\n" #
    "  transfers), and anyone can verify it. TTTI-T generates nothing by itself;\n" #
    "  swap fees pay the liquidity provided, and only the fees actually paid\n" #
    "  over the past 30 days are shown. No text here promises or aims at a price\n" #
    "  rise.\")\n" #
    "- Wallet total: valued at the consolidated price (the hourly average of the\n" #
    "  5-minute samples), not at a fixed 10_000 USD; the common reserve is\n" #
    "  shown separately and is not added into the total.\n" #
    "- Impermanent loss: a liquidity position holds a share of the pool, not a\n" #
    "  fixed amount of each token. When the pool price moves, the position can\n" #
    "  be worth less than the same tokens held outside the pool, whatever the\n" #
    "  fees collected.\n" #
    "- Exposure: through its pools (TTTI-T/ICP, TTTI-T/ckBTC, TTTI-T/ckUSDC,\n" #
    "  TTTI-T/ckUSDT) the TTTI-T side of a position is exposed to the value of\n" #
    "  BTC and ICP.\n" #
    "- Mint zap: an automatic swap in the target pool, made with the minter's\n" #
    "  own money at the moment of the mint, at the pool's market price and fee,\n" #
    "  so that the rest can be deposited at the pool ratio.\n" #
    "- Common reserve: 10 000 USD per TTTI-T minted is held in the token the\n" #
    "  minter paid in (ICP, ckBTC, ckUSDC or ckUSDT), without conversion, in the\n" #
    "  guarantee accounts of the contract, and valued in USD at the oracle rates. Any holder can redeem TTTI-T\n" #
    "  against it at the lower of 10 000 USD x x and (reserve / circulation) x x,\n" #
    "  with no fee; the reserve is public and can be short (see `getReserveView`),\n" #
    "  so the payout is not a promise of value.\n" #
    "- Chance: at the mint every minter has an equal chance (same price, no bid,\n" #
    "  no priority). At auctions the highest bids win, in price order, until the\n" #
    "  lot is sold.\n" #
    "- Lock (relay): optional, 3 months to 5 years of remaining time. A third of the weight of\n" #
    "  each new commitment relieves the other locked positions of the pool\n" #
    "  (relief of a third party); an owner can extend. A relieved or expired\n" #
    "  position is unlocked without eviction: it stays in the pool as free\n" #
    "  liquidity.\n" #
    "- LP fees: half stays in the reserves pro rata to shares; half is set aside\n" #
    "  and shared among locked positions by capital x sqrt(remaining time / 5\n" #
    "  years), only fees actually paid.\n" #
    "- Auctions: sealed bids; each bidder pays their own bid; the reserve is the\n" #
    "  highest of 10_000 USD, the 24 h average of the consolidated price and the\n" #
    "  current consolidated price; nothing is reissued below 10_000 USD.\n" #
    "- The creator's holdings are declared and public (`getCreatorHoldings`);\n" #
    "  the creator is not named.\n\n" #

    "## Liquidity mint (lot PTM-1) — replaces the purchase for every new mint\n" #
    "\n" #
    "`convertDeposit` and `convertDepositWith` no longer sell anything: they return\n" #
    "`#Err` with code `#replacedByLiquidityMint` before any lock or external call\n" #
    "(nothing is taken). TTTI-T already sold, balances and\n" #
    "blocks are untouched. New TTTI-T are minted only through `mintLiquidity` (and\n" #
    "the BTC deposit path below). Total supply grows by exactly q per mint; nothing\n" #
    "is burned; nothing is minted outside the mint.\n" #
    "\n" #
    "Units: TTTI-T amounts are Nat in 8-decimal base units (1 TTTI-T = 100_000_000).\n" #
    "USD amounts are Nat in USD e8 (1 USD = 100_000_000). Token amounts are Nat in\n" #
    "the paid token's own base units. Timestamps are Int nanoseconds.\n" #
    "\n" #
    "Rules for q TTTI-T (PTM-10b): price 10 000 USD per TTTI-T for everyone, redeemable\n" #
    "10 000 USD at any time; pay token ICP, ckBTC, ckUSDC or ckUSDT at the stored hourly\n" #
    "rate. Locked share m (scale 10^6, 500_000 = 50 %, from the pool/capitalisation\n" #
    "ratio of `getPoolCapRatio`, between 0 and 50 %) is read at the moment of payment:\n" #
    "if it differs from the quote or the preview, the mint uses the value at payment\n" #
    "time (a `maxPayAmount` below the payment at that m is refused before funds move).\n" #
    "m x q TTTI-T with m x 10 000 USD x q of the paid token (rounded up) are pooled in\n" #
    "the pool TTTI-T/<paid token> and locked 3 months in the minter's name (the lock is\n" #
    "released by the relay of newer locks at the latest after 3 months); m is recorded\n" #
    "with that position (`mintShareE6`). With m = 0 no locked position is created.\n" #
    "The remainder (1 - m) is chosen BEFORE paying, with the required `choice` field:\n" #
    "`#pool` (A) pools also (1 - m) x q TTTI-T and (1 - m) x 10 000 USD x q, with no lock\n" #
    "(withdrawable at any time, or lockable voluntarily from 3 months to 5 years);\n" #
    "`#wallet` (B) keeps (1 - m) x q TTTI-T out of the pool: they are delivered to the\n" #
    "minter's DEX balance (wallet) and the minter does not pay the matching liquidity.\n" #
    "TTTI-T never enters a pool without its counterpart dollars. Payment:\n" #
    "payAmount = (10 000 USD + L) x q / 0.99 in the paid token (rounded up), with\n" #
    "L = 10 000 USD (choice #pool) or m x 10 000 USD (choice #wallet). Position (pooled\n" #
    "counterpart) = L x q (rounded down for the free part, up for the locked part);\n" #
    "reserve part = 10 000 USD x q, always paid into the common reserve (held in the paid token, ICP, ckBTC,\n" #
    "ckUSDC or ckUSDT, without conversion, see Common reserve and redemption); creator set-aside = 1 % of\n" #
    "payAmount (rounded down), taken after the cycles reserve share. Balance sheet:\n" #
    "payAmount = reserve + L x q + creator + rounding dust, and q minted (+ TTTI-T bought\n" #
    "by the zap) = pooled + in hand (+ sold by the zap). For 1 TTTI-T at m = 50 %: choice\n" #
    "#pool costs 20 202,02 USD (20 000 / 0,99), choice #wallet 15 151,52 USD (15 000 /\n" #
    "0,99) and leaves 0,5 TTTI-T in the wallet; at m = 0 choice #wallet costs 10 101,01 USD,\n" #
    "pools nothing and leaves the whole TTTI-T in the wallet. The creator fee is taken at\n" #
    "the mint only, a redemption has no fee. Rounding dust stays on the pool side of the deposit.\n" #
    "Records (after the PTM-10b upgrade): stored mints, DEX positions, auction bids and\n" #
    "settlements carry the new fields `mShareE6`, `choice`, `lockedPositionId`, `lockedTokenAmount`,\n" #
    "`lockedTttiAmount`, `handTttiAmount` (bids: `choice`; settlements: `mShareE6`, `lockedAmount`,\n" #
    "`handE8s`). Records created before the upgrade read m = 0 and choice #pool; no balance or block\n" #
    "is rewritten. The OQL tables `liquidityMint`, `auctionBid`, `bidSettlement` and `dexPosition`\n" #
    "expose these fields.\n" #
    "Reserve part, no conversion: whatever the paid token (ICP, ckBTC, ckUSDC or\n" #
    "ckUSDT), the reserve part (10 000 USD x q) is credited as is, in the paid token,\n" #
    "to the common reserve, with no pool and no swap. `conversionCost` is always 0,\n" #
    "so `totalPayAmount` = `payAmount`. `reserve.applies` is always false. The errors\n" #
    "`#reserveConversionFailed` and `#reserveConversionDeviation` stay in the type for\n" #
    "compatibility and are no longer returned.\n" #
    "Minimum 1 USD = 0.0001 TTTI-T (10_000 base units); granularity 1 base unit; more than 8\n" #
    "decimals is refused (`#tooManyDecimals`), never rounded; total cap 1 TTTI-T\n" #
    "counting TTTI-T already sold and TTTI-T that will be returned to the contract\n" #
    "(`#aboveCap`).\n" #
    "\n" #
    "Zap: the side of the pair (q TTTI-T, 10 000 USD x q of the token) that does not\n" #
    "fit the pool ratio is swapped in that same pool at the market price (the pool's\n" #
    "swap rules and fee), then the rest is deposited at the pool ratio, all in one\n" #
    "operation with the minter's money. The first deposit of an empty pool is a 1:1\n" #
    "mint at 10 000 USD per TTTI-T; there is no first-deposit minimum (any mint\n" #
    "at or above the mint minimum succeeds and gives the minter non-zero shares;\n" #
    "`#firstDepositBelowMinimum` stays in the type for compatibility but is never\n" #
    "returned). If the pool\n" #
    "cannot be balanced by a swap, the pool being closed to swaps (below the\n" #
    "10 USD threshold), the mint is never refused for that reason: no zap swap is made, the\n" #
    "deposit is made at the pool ratio and the unmatched side stays on the\n" #
    "minter's DEX balance. The 10 USD swap-opening threshold applies to swaps\n" #
    "only. The minimum mint is 1 USD (0.0001 TTTI-T). Other pool errors are\n" #
    "`#poolUnavailable { message }`.\n" #
    "\n" #
    "- `quoteLiquidityMint(args : { token; amount : #ttti(#baseUnits n | #decimal\n" #
    "  \"0.0001\") | #usd e8; choice : #pool | #wallet; targetPoolId : ?PoolId })` (query, anonymous allowed) returns\n" #
    "  `#ok(quote)` with mShareE6 (m now), choice, `choices : { pool; wallet }` (both\n" #
    "  choices for the same q, each with payAmount, payUsdE8, totalPayAmount, conversionCost,\n" #
    "  liquidityUsdE8, pooledTokenAmount, pooledTttiAmount, lockedTokenAmount, lockedTttiAmount,\n" #
    "  freeTokenAmount, freeTttiAmount, handTttiAmount, creatorAmount, dustAmount),\n" #
    "  handTttiAmount, lockedTokenAmount and lockedTttiAmount of the selected choice, then\n" #
    "  (selected choice) payAmount, payUsdE8, positionTokenAmount, positionTttiAmount, guaranteeAmount,\n" #
    "  reserve { applies; reserveToken; reserveAmount; conversionInput;\n" #
    "  conversionCost; route; maxDeviationBps } (reserve share; applies false, conversionCost 0, route null, maxDeviationBps 0),\n" #
    "  totalPayAmount (payAmount + conversionCost, what `maxPayAmount` is compared to),\n" #
    "  creatorAmount, dustAmount, ledgerFee, poolId, firstDeposit, priceBefore,\n" #
    "  priceAfter (pool price before the zap and after zap + deposit; detail of the\n" #
    "  target pool only), consolidatedPriceBefore and consolidatedPriceAfter\n" #
    "  (`#available(usdE8)` | `#unavailable(#noOpenPool | #noValidRate)`: the\n" #
    "  reference price in USD x 1e8: the consolidated TTTI-T price of the open\n" #
    "  native pools OTHER than the target pool, depth-weighted, at the current\n" #
    "  oracle rates; it excludes the target pool, so it is the same before and\n" #
    "  after the zap and the pool reserves after the zap do not influence it;\n" #
    "  never a trap, an unusable price is `#unavailable`), noIndependentReference\n" #
    "  (true when no other pool is open: both prices are `#unavailable` and the\n" #
    "  gap is absent, not 0), zap, shares,\n" #
    "  rateUsdE8, rateValidUntil. A query cannot read ledgers: wallet balance and\n" #
    "  allowance errors come only from `mintLiquidity`. `#usd e8` gives q =\n" #
    "  floor(e8 x 99 / (10^6 + c)) base units, c = 10^6 for #pool and m for #wallet\n" #
    "  (scale 10^6), rounded down; the screen shows: price 10 000 USD per TTTI-T redeemable\n" #
    "  10 000 USD at any time, liquidity contributed (stays the minter's, in the position),\n" #
    "  fee 1 %, total.\n" #
    "- Choice of the target pool (`targetPoolId : ?PoolId`, in `quoteLiquidityMint`,\n" #
    "  `getMintPoolPreview`, `getMintAmountForPayment`, `getPayAmountForTtti` and\n" #
    "  `mintLiquidity`). null = the backend recommendation: the eligible TTTI-T pool of the\n" #
    "  paid token with the lowest liquidity (lowest pool id on a tie). `?id` = that exact pool,\n" #
    "  which then receives the zap and the deposit; the user has the last word. A chosen pool\n" #
    "  must exist, be a TTTI-T pool of the paid token, not be removed and have no removal\n" #
    "  announced or running; otherwise `#invalidTargetPool { poolId; reason }` with reason\n" #
    "  `#unknownPool | #otherPair | #removed | #removalAnnounced { effectiveAt }` (ns), returned\n" #
    "  before anything is taken. Fee tiers differ per pool: two pools of the same pair can exist.\n" #
    "  `mintLiquidity` checks the chosen pool again inside the isolated mint; if it became\n" #
    "  ineligible meanwhile, the mint is refused and the payment refunded like any refused\n" #
    "  core. `poolId` in the quote, the mint record and the result is the chosen pool. All the\n" #
    "  existing controls (cap, slippage, balances, rate check within 2 percent between\n" #
    "  sources, reserve checks) apply to the chosen pool. The choice at the settlement of\n" #
    "  auctions is not affected (they keep the recommendation).\n" #
    "- `listMintPools(token : #icp | #ckbtc | #ckusdc | #ckusdt)` (query, anonymous allowed)\n" #
    "  returns `{ token; pools; recommendedPoolId : ?PoolId; consolidatedPrice; computedAt }`.\n" #
    "  pools = every eligible TTTI-T pool of the pair, the recommended one first, then the\n" #
    "  rest by pool id; each `{ poolId; feeBps; depthUsdE8 : ?Nat; price : { reserveTtti;\n" #
    "  reserveToken; tokenPerTtti : ?Nat; usdPerTtti : ?Nat }; gapBps : ?Int;\n" #
    "  referencePrice : #available(usdE8) | #unavailable(...); noIndependentReference : Bool;\n" #
    "  recommended }`. referencePrice is the consolidated price of the other open pools (without\n" #
    "  this pool); the top-level consolidatedPrice stays the global one.\n" #
    "  gapBps = (pool USD per TTTI-T - referencePrice) x 10000 / referencePrice, signed (positive:\n" #
    "  the pool is above the reference), null when the pool price or the reference is unavailable\n" #
    "  (noIndependentReference true when no other pool is open: absent, not 0). pools is empty and recommendedPoolId null when none\n" #
    "  is eligible. Prices are USD x 1e8 per whole TTTI-T. Never a trap.\n" #
    "- `getMintPoolPreview(args : same as quoteLiquidityMint)` (query, anonymous allowed)\n" #
    "  returns `#ok { token; poolId; feeBps; isRecommended; recommendedPoolId; tttiAmount;\n" #
    "  priceBefore; priceAfter; consolidatedPriceBefore; consolidatedPriceAfter;\n" #
    "  noIndependentReference; gapBeforeBps : ?Int; gapAfterBps : ?Int; zap; firstDeposit;\n" #
    "  quotedAt }` for the chosen pool (the recommendation when targetPoolId is null): the pool\n" #
    "  price before and after the zap and the deposit, and the signed gaps against the reference,\n" #
    "  i.e. the consolidated price without the target pool (equal before and after; absent, not\n" #
    "  0, when no other pool is open). Amounts, split and mint rules are unchanged. Same errors\n" #
    "  as `quoteLiquidityMint`, including `#invalidTargetPool`. Preview only: it moves nothing.\n" #
    "- `getMintPricePreview()` (query, anonymous allowed) returns the mint price figures\n" #
    "  computed by the backend; a client never recomputes them. Fields:\n" #
    "  mintCostPer100UsdE8 and prepaidRedemptionCostPer100UsdE8 (what 100 USD of\n" #
    "  value costs at the mint: 100 USD / 0.99 = 101.01 USD, USD x 1e8, rounded up),\n" #
    "  mShareE6 (locked share m now), pricePerTttiUsdE8 (choice #pool: one whole\n" #
    "  TTTI-T, 20 000 USD / 0.99, USD x 1e8, rounded up), pricePerTttiWalletUsdE8 and\n" #
    "  minimumMintWalletUsdE8 (choice #wallet at the current m), minimumTtti (base units), minimumMintUsdE8, computedAt (ns) and `tokens`,\n" #
    "  one entry per pay token (icp, ckbtc, ckusdc, ckusdt) with: token; rateUsdE8 and\n" #
    "  rateValidUntil (ns); payAmountPerTtti, conversionCostPerTtti and\n" #
    "  totalPayAmountPerTtti for one whole TTTI-T; minimumPayAmount,\n" #
    "  minimumConversionCost and minimumTotalPayAmount for the minimum mint (token\n" #
    "  base units), and for choice #wallet walletPayAmountPerTtti,\n" #
    "  walletTotalPayAmountPerTtti, walletMinimumPayAmount, walletMinimumTotalPayAmount.\n" #
    "  (The fields without \"wallet\" are choice #pool.) Every per-token optional is null when the stored rate is absent,\n" #
    "  expired, or its two sources disagree: never a fallback rate. The conversion\n" #
    "  cost fields are always 0 (the reserve is not converted, whatever the token).\n" #
    "  totalPayAmount = payAmount + conversionCost, the same as\n" #
    "  `quoteLiquidityMint`.\n" #
    "- `getMintAmountForPayment(args : { token; payAmount; choice; targetPoolId : ?PoolId })` (query, anonymous allowed;\n" #
    "  payAmount = the total the payer gives, token base units) returns `#ok` with\n" #
    "  token, payAmountGiven, tttiAmount (base units, the largest amount whose total\n" #
    "  fits the payment, rounded down, for the given choice), choice, mShareE6, payAmount (paid for tttiAmount, rounded up\n" #
    "  in favour of the pool), payUsdE8, conversionCost, totalPayAmount (<=\n" #
    "  payAmountGiven), rateUsdE8, rateValidUntil. tttiAmount is bounded by the 1\n" #
    "  TTTI-T cap and what remains to mint. Errors (`#err`, the existing\n" #
    "  LiquidityMintError): rateUnavailable (rate absent or expired),\n" #
    "  rateSourcesDiverge, belowMinimum (payment under the 0.0001 TTTI-T minimum),\n" #
    "  salesPaused, dexPaused, mintEnded (reserveConversionFailed and\n" #
    "  reserveConversionDeviation remain in the type, never returned).\n" #
    "- `getPayAmountForTtti(args : { token; tttiAmount; choice; targetPoolId : ?PoolId })` (query, anonymous allowed;\n" #
    "  tttiAmount in base units) returns `#ok` with token, tttiAmount, payAmount\n" #
    "  ((10 000 USD + L) x q / 0.99 in the token, rounded up; also choice and mShareE6), payUsdE8, conversionCost,\n" #
    "  totalPayAmount (what the mint charges), rateUsdE8, rateValidUntil. Errors as\n" #
    "  above, plus aboveCap (over 1 TTTI-T or what remains). Both queries read the\n" #
    "  stored rates only and move nothing.\n" #
    "- `mintLiquidity(args : { token; quantity : #baseUnits | #decimal; choice : #pool | #wallet; maxPayAmount;\n" #
    "  targetPoolId : ?PoolId; slippageBps : ?Nat (default 50); deadline : Int ns; recipient : ?Principal })`\n" #
    "  (signed-in, acknowledgements accepted). The caller first calls icrc2_approve\n" #
    "  on the paid token's ledger for `totalPayAmount` + ledger fee with this canister as\n" #
    "  spender. Everything is checked before any funds are taken: rate present and\n" #
    "  valid, minimum, decimals, cap, sales and DEX not paused, acknowledgement,\n" #
    "  maxPayAmount, slippage, deadline and the target pool. Then the payment is\n" #
    "  collected by ICRC-2 transfer_from (memo `TTTI-DD-<n>`, created_at_time) into\n" #
    "  the caller's internal DEX balance (committed, never undone by a later\n" #
    "  failure), then the isolated mint runs (see Atomic mint below): q\n" #
    "  TTTI-T are minted, the pool is balanced and the positions are created: the\n" #
    "  locked position (m x q, 3 months, `lockedPositionId`, null when m = 0) and, with\n" #
    "  choice #pool, the free position (`freePositionId`), both belonging to `recipient`\n" #
    "  or the caller. The free position is removed at any time with\n" #
    "  `removeLiquidity(positionId)` (or locked voluntarily with `extendLock`); the locked\n" #
    "  one once its lock is over or released by the relay. The reserve part belongs to\n" #
    "  the common reserve, not to the minter. `choice` is required and decided before\n" #
    "  paying; the same call twice is two mints. Returns `#ok` with\n" #
    "  mintId, paymentBlock, poolId, positionId (the free position, else the locked\n" #
    "  one), lockedPositionId, freePositionId, mShareE6 (m used, read at payment\n" #
    "  time), choice, lockedTokenAmount, lockedTttiAmount, handTttiAmount (TTTI-T left\n" #
    "  in the minter's DEX balance), shares, amounts (guaranteeAmount, reserveToken,\n" #
    "  reserveAmount, conversionCost (0), totalPaid) and prices. A refused core refunds\n" #
    "  the payment and takes nothing.\n" #
    "- Errors (`#err`): anonymousCaller, purchaseInProgress (one purchase in flight\n" #
    "  per principal, shared with the BTC finalization), acknowledgementRequired,\n" #
    "  salesPaused, dexPaused, rateUnavailable, rateSourcesDiverge { token;\n" #
    "  coinbaseUsdE8 : ?Nat; coingeckoUsdE8 : ?Nat; differenceBps : ?Nat;\n" #
    "  maximumBps } (see Balance guard-rails), belowMinimum, tooManyDecimals,\n" #
    "  invalidAmount, aboveCap, poolNotFound, poolRemoved, removalAnnounced,\n" #
    "  invalidTargetPool { poolId; reason } (chosen pool unknown, of another pair, removed or\n" #
    "  removal announced), minimumsNotSet, poolUnavailable, firstDepositBelowMinimum, insufficientBalance,\n" #
    "  insufficientAllowance, maxPayExceeded { payAmount (the total charged, conversion cost\n" #
    "  included, always without conversion cost); maxPayAmount }, reserveConversionFailed { message } and\n" #
    "  reserveConversionDeviation { deviationBps; maximumBps } (kept in the type, never returned), invalidSlippage, slippageExceeded,\n" #
    "  deadlineExpired, ledgerError, depositFailedRefunded { mintId }\n" #
    "  (the isolated mint was refused, nothing was minted and the payment went back\n" #
    "  to the caller), depositFailedRefunding { mintId } (refused; the refund\n" #
    "  withdrawal is not settled yet and is resent by the timer until it settles;\n" #
    "  the mint status follows it), depositFailedRefundFailed { mintId } (refused;\n" #
    "  the refund failed and the payment stays in the caller's internal DEX balance,\n" #
    "  where it can be withdrawn). Never both TTTI-T and the payment.\n" #
    "- Atomic mint (all or nothing): after the payment is credited, the whole\n" #
    "  synchronous core (mint of TTTI-T, credit, balancing swap, liquidity deposit,\n" #
    "  credit of the common reserve in the paid token, creator set-aside, fee split and fee credits) runs\n" #
    "  as one isolated self-call of the canister, `liquidityMintCore`, which only the\n" #
    "  canister itself may call (any other caller traps with \"Unauthorized: reserved\n" #
    "  to the canister itself\"; do not call it). It re-checks everything itself\n" #
    "  (sales and DEX not paused, deadline, the 1 TTTI-T cap, slippage on shares, the\n" #
    "  payer's internal balance, the pool), because other messages may run between\n" #
    "  the payment credit and the call. Every refusal inside is a trap, so the state\n" #
    "  of that message is rolled back as a whole: nothing is minted, no pool, balance,\n" #
    "  reserve or fee changes. The payment is then refunded from the payer's\n" #
    "  internal balance by a DW withdrawal. The cause of the refusal (short text,\n" #
    "  at most 300 characters, from the trap message) is kept in the mint's\n" #
    "  `refusalCause`. The mint record has `refundWithdrawalN : ?Nat` (the DW\n" #
    "  withdrawal of the refund) and `refusalCause : ?Text`, both null for mints\n" #
    "  that were not refused.\n" #
    "- Locks: one mint in flight per principal (the purchase lock and the DEX lock\n" #
    "  keys of the payer). They are released on every exit and also release\n" #
    "  themselves 10 minutes after they were taken if a cleanup was missed, so a\n" #
    "  missed cleanup never blocks minting.\n" #
    "- Retry safety: the payment and any refund use the DEX retry rules (same memo and\n" #
    "  created_at_time resent identically for 23 h; a Duplicate counts as success), so\n" #
    "  a transfer is never applied twice. Calling `mintLiquidity` again after\n" #
    "  `#err` before payment is safe (nothing taken). After a timeout or reject, read\n" #
    "  `getMyLiquidityMints` before retrying: a second call is a second mint.\n" #
    "- `getMyLiquidityMints()` (signed-in; anonymous gets []) returns the caller's\n" #
    "  mints (as payer or owner), newest first, each with positionId, lockedPositionId, mShareE6, choice, lockedTokenAmount,\n" #
    "  lockedTttiAmount, handTttiAmount (zero and #pool for mints made before PTM-10b), status\n" #
    "  (`#inProgress`, `#completed`, `#refunding` (refused, refund withdrawal in\n" #
    "  progress), `#refunded`, `#refundFailed`), paymentBlock, refundWithdrawalN and\n" #
    "  refusalCause. `#refunding` becomes `#refunded` when the DW withdrawal\n" #
    "  succeeds and `#refundFailed` when it fails (or the admin review says Not\n" #
    "  arrived); with Arrived the mint becomes `#refunded`.\n" #
    "- Mint history (read-only): `getMyGuarantees()` (signed-in) returns the caller's\n" #
    "  guarantees { mintId, owner, token, amount, createdAt } recorded by mints made\n" #
    "  before the common reserve. No new guarantee record is written: a mint now\n" #
    "  credits the common reserve directly (see Common reserve and redemption). A\n" #
    "  record is readable only by its owner and an admin. `listGuarantees(offset,\n" #
    "  limit)` and `listCreatorSetAsides(offset, limit)` are admin only and trap with\n" #
    "  \"Unauthorized: only admins can list these records\" otherwise. Creator\n" #
    "  amounts are kept in the paid token in the contract's DEX custody (internal\n" #
    "  balance of the canister); the creator split (PTM-4) is not part of this API.\n" #
    "- BTC deposit path: `checkBtcPurchaseDeposit` now continues into the same mint\n" #
    "  with ckBTC: the largest q whose payAmount + ledger fee fits the deposited\n" #
    "  ckBTC (minimum 0.0001 TTTI-T) is minted into a position owned by the\n" #
    "  depositor; the rest is refunded as an excess to the caller's own account. If\n" #
    "  the move of ckBTC into the custody has an unknown outcome it is resent\n" #
    "  identically and, when it arrives, credited to the depositor's DEX balance.\n" #
    "  It uses the same isolated mint and refund (BTC slippage tolerance 100 bps).\n" #
    "  If the isolated mint is refused the ckBTC is refunded from the DEX balance:\n" #
    "  `depositFailedRefunded` -> deposit entry stage `#refunded`; refund still in\n" #
    "  progress -> stage `#error` (kind `#other`, never delivered, never converted\n" #
    "  again) until the withdrawal settles, with the mint status as the outcome;\n" #
    "  `depositFailedRefundFailed` -> stage `#error` kind `#unrecoverable`, the\n" #
    "  ckBTC stays withdrawable in the depositor's DEX balance.\n" #
    "- OQL tables `liquidityMint` (with status, refundWithdrawalN and refusalCause) and `guarantee` are scoped to their owner (and\n" #
    "  admin); `creatorSetAside` is admin only.\n" #
    "\n" #
    "(Historical, replaced by the liquidity mint above — both calls now return `#replacedByLiquidityMint`.)\n\n" #
    "## Purchase: `convertDepositWith(token, recipient, payAmount, tttiTarget)` and\n" #
    "## `convertDeposit(recipient, icpAmount)`\n\n" #
    "`convertDepositWith(token : PayToken, recipient : ?Account, payAmount : Nat,\n" #
    "tttiTarget : ?Nat)` buys TTTI-T with `#icp`, `#ckbtc`, `#ckusdc` or `#ckusdt`;\n" #
    "`payAmount` is in that token's base units. `tttiTarget = null` buys what\n" #
    "`payAmount` pays for. `tttiTarget = ?n` delivers exactly `n` TTTI-T base units:\n" #
    "`payAmount` is then the approved maximum and only the rounded-up cost of `n`\n" #
    "is collected; the conversion's `tttiAmount` is `n`. When that cost exceeds\n" #
    "`payAmount` the call is refused with `#invalidAmount` before any ledger call;\n" #
    "when `n` exceeds `available` it is refused with `#aboveRemaining { token;\n" #
    "maximumTtti = available; maximumPayAmount; requestedTtti = n }` (never cut\n" #
    "down). `convertDeposit(recipient, icpAmount)` is exactly\n" #
    "`convertDepositWith(#icp, recipient, icpAmount, null)`.\n\n" #
    "1. On the pay token's ledger call `icrc2_approve` with spender\n" #
    "   `{ owner = getCanisterPrincipal(); subaccount = null }` for at least\n" #
    "   `payAmount` + that ledger's fee (10_000 for ICP, ckUSDC, ckUSDT; 10 for\n" #
    "   ckBTC). Clients are expected to set `expires_at` to now + 15 minutes\n" #
    "   (nanoseconds) so an unused approval lapses quickly.\n" #
    "2. Call `convertDepositWith` (or `convertDeposit`) as the signed-in buyer.\n" #
    "   The token is pulled from the caller's default account on that ledger.\n" #
    "3. Refusals before anything is taken (`conversion = null`), in order:\n" #
    "   `#purchaseInProgress` (the same principal already has a purchase in\n" #
    "   flight through either endpoint; one lock covers both; refused\n" #
    "   immediately with no ledger call; the lock is released when the first\n" #
    "   call ends, whatever its outcome), `#anonymousCaller`,\n" #
    "   `#acknowledgementRequired`, `#notConfigured` (no stored legacy treasury\n" #
    "   configuration), `#tokenNotConfigured { token }` (kept in the type; no\n" #
    "  longer returned since DEX lot 4), `#invalidAmount` (0), `#salesPaused`, `#saleComplete`,\n" #
    "   `#receivingWalletNotConfigured { token }` (no receiving wallet for the\n" #
    "   paid token; message \"Minting with <SYM> is not available yet: no\n" #
    "   receiving wallet is configured for <SYM>; no <SYM> was taken\"); then\n" #
    "   the stored hourly rate of the paid token is read (no price fetch):\n" #
    "   absent or past validUntil + 5 minutes -> `#priceUnavailable { token }`\n" #
    "   before any ledger call. Then the pay ledger's `icrc1_decimals` and\n" #
    "   `icrc1_fee` are read: values different from the table in Units ->\n" #
    "   `#ledgerMismatch { token; expectedDecimals; actualDecimals; expectedFee;\n" #
    "   actualFee }`; an unreachable ledger -> `#ledgerError { token }`. The\n" #
    "   checks above are repeated after that read, then `#belowMinimum {\n" #
    "   minimumTtti; requestedTtti }` and `#aboveRemaining { token; maximumTtti =\n" #
    "   0; maximumPayAmount = 0; requestedTtti }` (everything left is reserved by\n" #
    "   in-flight purchases). A delivery account equal to the fee account or the\n" #
    "   minting account is refused with `#invalidAmount`.\n" #
    "4. Price (with `tttiTarget = null`): TTTI-T = floor(payAmount * usdE8 / (10^decimals * (10_000 +\n" #
    "   feeBps))) base units, with feeBps 100 for ICP, ckBTC, ckUSDC and\n" #
    "   ckUSDT (10_100 USD per TTTI-T), capped at\n" #
    "   `available`. The minimum is 0.0001 TTTI-T (10_000 base units), that is\n" #
    "   1.01 USD in every pay token, fee included. A\n" #
    "   buyer may take the whole remainder when it is below the minimum. Only\n" #
    "   the cost of the delivered TTTI-T (rounded up, in pay-token base units)\n" #
    "   is collected; any excess is never pulled.\n" #
    "5. Before the first ledger transfer a purchase trace is written: global\n" #
    "   number `n`, buyer, token, amount, the reserved TTTI-T amount,\n" #
    "   `created_at_time` and memo `TTTI-PC-<n>`. It reserves the TTTI-T (no\n" #
    "   overselling). The token is collected with `icrc2_transfer_from` into the\n" #
    "   canister's own account on that ledger, always with that memo and\n" #
    "   `created_at_time` (the BTC path payment send uses them too). The\n" #
    "   reservation belongs to the trace and is released in one single place,\n" #
    "   when the trace is removed; no trace, nothing released, never twice.\n" #
    "   Purchase recorded: trace removed. Ledger refusals (trace removed) return\n" #
    "   `#approvalMissing { token; allowance }`, `#insufficientBalance { token;\n" #
    "   balance }` or `#ledgerError { token }`, and nothing is taken. Unknown\n" #
    "   outcome (rejected call) or a trap after the debit: the trace becomes a\n" #
    "   payment to refund (collect `#confirmed` with its block, or `#unknown`),\n" #
    "   reservation released, `#Err #ledgerError` with `conversion = null`. A\n" #
    "   trace left by a crash or upgrade is handled the same way by the retry timer.\n" #
    "6. Delivery goes to `recipient`, else the stored delivery address, else\n" #
    "   `{ owner = caller; subaccount = null }`: freshly minted first, from the fee\n" #
    "   account only once minting reached the cap. No TTTI-T fee is charged.\n" #
    "7. Refund: if delivery fails, the record is written as `#refundFailed`\n" #
    "   with a refund attempt (RF, memo `TTTI-RF-<n>`, recorded\n" #
    "   `created_at_time`) of the collected amount minus that ledger's fee to the\n" #
    "   buyer's default account on the same ledger, sent once by the call:\n" #
    "   `#Err` code `#deliveryFailedRefunded` (record `#refunded`) or\n" #
    "   `#deliveryFailedRefundFailed` (record `#refundFailed`, retried by the\n" #
    "   timer, or `#refundReview` for admin review), both with\n" #
    "   `conversion = ?<record>`. BTC path: no automatic refund, the record is\n" #
    "   `#refundReview` with `#deliveryFailedRefundFailed`.\n" #
    "8. Success records a `#completed` conversion and returns `#Ok(Conversion)`.\n" #
    "\n" #
    "`PurchaseResult` is `#Ok(Conversion)` or `#Err({ code; message; conversion })`.\n" #
    "`Conversion` is `{ id; depositor; recipient; payToken; payAmount (pay-token\n" #
    "base units collected); feeBps (the fee applied when the purchase was made:\n" #
    "100 for new purchases; earlier ICP records keep their recorded value); icpAmount (e8s collected; equals payAmount for ICP,\n" #
    "0 for ck tokens); tttiAmount; status; timestamp; priceUsdE8 (USD rate of the\n" #
    "paid token at purchase time, USD per whole pay token * 10^8; audit data\n" #
    "only, not the purchase basis); usedFallback (true only on historical\n" #
    "records); minted; fromCollector; forward; message; feeAmount; netAmount;\n" #
    "paymentBlock; mintBlock }`. Purchases never trap; `message` is\n" #
    "user-facing English text.\n\n" #
    "Exact purchase quantities (Candid `opt nat`, `null` on every record created\n" #
    "before they were kept; never recomputed afterwards):\n\n" #
    "- `feeAmount`: the 1% sale fee, in pay-token base units,\n" #
    "  `floor(payAmount * feeBps / (10_000 + feeBps))`. Never refundable. It is\n" #
    "  recorded for purchases made before the liquidity mint (see Mint revenue).\n" #
    "- `netAmount`: the net pay-token base units converted, fee excluded;\n" #
    "  `payAmount = netAmount + feeAmount`. The only refundable basis.\n" #
    "- `paymentBlock`: block index on the pay-token ledger of the payment\n" #
    "  collection (`icrc2_transfer_from`, or the BTC deposit subaccount\n" #
    "  transfer to this canister's default ckBTC account).\n" #
    "- `mintBlock`: block index on this TTTI-T ledger of the delivery: the\n" #
    "  `1mint` block, or the fee-collector `1xfer` block when the delivery came\n" #
    "  only from the fee account; `null` when no TTTI-T was delivered.\n" #
    "- The paid-to-received ratio is `payAmount` (or `netAmount`) per\n" #
    "  `tttiAmount`, both in base units.\n\n" #
    "### Purchase retry safety\n\n" #
    "Purchases are NOT idempotent: every successful call is a new purchase, up to\n" #
    "the remaining approval. After a timeout or lost response do not blindly\n" #
    "retry; first check `icrc1_balance_of` of the delivery account or recent\n" #
    "`icrc3_get_blocks` entries crediting it. Refusals with `conversion = null`\n" #
    "(including `#purchaseInProgress`, `#acknowledgementRequired`,\n" #
    "`#tokenNotConfigured`, `#ledgerMismatch` and `#priceUnavailable`) took\n" #
    "nothing and are safe to retry once the cause is fixed; retry\n" #
    "`#purchaseInProgress` only after the earlier call has replied.\n\n" #

    "## Delivery address (optional)\n\n" #
    "- `setDeliveryAddress(principalText) : DeliveryAddressResult` stores\n" #
    "  `{ owner; subaccount = null }` for the caller, replacing any previous one.\n" #
    "  Error codes: `#anonymousCaller`, `#empty`, `#accountIdentifier` (a 64-hex\n" #
    "  account ID was pasted), `#invalidPrincipal`, `#anonymousPrincipal`.\n" #
    "- `getDeliveryAddress() : ?Account`. `clearDeliveryAddress() : Bool` returns\n" #
    "  true when an address was removed. All three are safe to repeat.\n\n" #

    "## Receiving accounts (internal mint treasuries, history)\n\n" #
    "- Since the mint revenue correction, new mints no longer forward to the\n" #
    "  internal mint treasuries (no FW, no SH reserve share): see Mint revenue\n" #
    "  below. The internal accounts of this canister, one per pay token, are\n" #
    "  `{ owner = <this canister>; subaccount = <32 ASCII bytes> }` with\n" #
    "  subaccounts \"MINT-TREASURY-ICP-TTTI-T-0000001\",\n" #
    "  \"MINT-TREASURY-CKBTC-TTTI-T-00001\", \"MINT-TREASURY-CKUSDC-TTTI-T-0001\"\n" #
    "  and \"MINT-TREASURY-CKUSDT-TTTI-T-0001\" (on each token's own ledger).\n" #
    "  No endpoint withdraws from them; their balances are emptied once by the\n" #
    "  one-time settlement of each token (see Mint revenue).\n" #
    "- Funds already sent to the old external receiving accounts stay where\n" #
    "  they are; nothing is moved back. The old accounts remain readable as\n" #
    "  `legacyExternalAccount` and are no longer settable: `setTreasuryConfig`\n" #
    "  and `setPayTokenAccount` no longer exist.\n" #
    "- `getMintTreasuryAccounts() : [MintTreasuryAccount]` (admin; trap\n" #
    "  `Unauthorized: only admins can manage the treasury`): `{ token; account;\n" #
    "  balance : ?Nat (cached at the last weekly run before the correction, base\n" #
    "  units; null before);\n" #
    "  legacyExternalAccount : ?Account }` in the order #icp, #ckbtc, #ckusdc,\n" #
    "  #ckusdt. Read the live balance with `icrc1_balance_of(account)`.\n" #
    "- `getTreasuryConfig() : ?TreasuryConfig` (admin, same trap): the stored\n" #
    "  legacy configuration. Purchases are refused with `#notConfigured` while\n" #
    "  it is absent.\n" #
    "- `getPublicTreasuryInfo() : ?{ icpAccount; tokenAccounts : [{ token;\n" #
    "  account : ?Account }] }` (public query) still returns the legacy external\n" #
    "  accounts (null when no legacy config); new payments do not go there.\n" #
    "- Earlier purchases (before the mint revenue correction) keep their\n" #
    "  recorded FW forward and ICP reserve share (SH) unchanged; open ones are\n" #
    "  still finished by the retry timer. New mints record `forward =\n" #
    "  #notRequired` and send no SH.\n" #
    "- `forward` is `#notRequired` (zero amount, or a mint made after the\n" #
    "  correction),\n" #
    "  `#pending` (an attempt is open, sent or resent by the 10-minute timer),\n" #
    "  `#forwarded(blockIndex on the pay-token ledger)`, `#needsReview` (unknown\n" #
    "  outcome after 23 h, admin verification required) or `#failed(reason)`\n" #
    "  (legacy records only). A forward or reserve transfer never undoes the\n" #
    "  buyer's credit. Forwards (FW) and ICP reserve shares (SH) follow the\n" #
    "  transfer retry rule below. There is no manual forward endpoint.\n" #
    "- `getConversions() : [Conversion]` (admin): the purchase history.\n" #
    "- `getMyConversions() : [Conversion]` (query, any caller, never traps):\n" #
    "  only the conversions where the caller is the `depositor` or the\n" #
    "  `recipient.owner`, sorted by `id` descending (newest first). An anonymous\n" #
    "  caller gets `[]`. No registration needed. Safe to poll; it changes only\n" #
    "  when a purchase is recorded or its `forward` status is updated.\n" #
    "- `getCanisterPrincipal()` (public): the ICRC-2 spender to approve on every\n" #
    "  pay-token ledger. Read balances directly on each ledger (`icrc1_balance_of`\n" #
    "  query).\n\n" #

    "## Transfer retry (forwards FW, reserve shares SH, refunds RF, traces PC)\n\n" #
    "Outgoing ledger transfers go through one shared retry module.\n\n" #
    "- Before the first await, each attempt is recorded: global number `n`,\n" #
    "  attempt number `m`, `memo`, `created_at_time` and the full request\n" #
    "  (source subaccount, full destination account, amount, fee). Every send\n" #
    "  uses the recorded request unchanged; `created_at_time` is always set.\n" #
    "- Memo: ASCII text `TTTI-<prefix>-<n>` (first attempt) or\n" #
    "  `TTTI-<prefix>-<n>-<m>` (later attempts), at most 32 bytes, never a\n" #
    "  principal. `n` is one global counter shared by all prefixes. Prefixes:\n" #
    "  PC, RF, FW, SH, GR, BR, DD, DW, DQ, DC, DL, OW, SR, MF; PC (purchase\n" #
    "  collect), RF (purchase refund), FW (legacy treasury forward), SH (legacy\n" #
    "  ICP reserve share), DC (history only), DL (LP bonus claim), OW (owner\n" #
    "  send), SR (one-time reserve top-up of the sweep) and MF (mint-fee claim)\n" #
    "  are among the ones in use.\n" #
    "- Outcomes: `Ok` or `#Duplicate` = succeeded, block index recorded. Any other\n" #
    "  ledger `Err` = known failure: a new attempt is allowed. A rejected call or\n" #
    "  trap = unknown outcome; it stays unknown until an `Ok`, a `#Duplicate` or\n" #
    "  the admin verification, even if a resend receives an `Err`.\n" #
    "- For 23 h after its `created_at_time`, a pending or unknown attempt is\n" #
    "  resent identically (same memo, same `created_at_time`, same request), so\n" #
    "  the ledger deduplicates it. After 23 h an unknown outcome becomes\n" #
    "  `#needsReview` (\"to review\").\n" #
    "- Only a new attempt may change the destination, amount or fee, and it\n" #
    "  always gets a new memo (`m + 1`) and a new `created_at_time`.\n" #
    "- One lock per transfer (type + purchase id), released in a `finally`; a\n" #
    "  transfer already in flight is skipped.\n" #
    "- FW and SH are history: purchases made before the mint revenue correction\n" #
    "  sent them once each; new mints create neither. A 10-minute timer, re-armed\n" #
    "  on every install and upgrade, applies the rule to every remaining\n" #
    "  `#pending` FW/SH (resend, new attempt, or `#needsReview`); funds already\n" #
    "  at old external accounts stay there.\n" #
    "  A zero-amount forward is `#notRequired`.\n" #
    "- Reserve share `transfer` is `#pending`, `#transferred(icpBlockIndex)`,\n" #
    "  `#needsReview` or `#failed(reason)` (legacy only).\n" #
    "- Records from before this rule: old `#pending` -> `#needsReview`; old\n" #
    "  `#failed` carrying a ledger `Err` -> `#pending` with no recorded attempt\n" #
    "  (the timer opens and sends a new attempt); every other old `#failed` ->\n" #
    "  `#needsReview`; a forward whose amount does not cover the ledger fee ->\n" #
    "  `#notRequired`. Balances and blocks are unchanged.\n" #
    "- Refunds (RF, conversion `#refundFailed`): the timer resends a pending RF\n" #
    "  only when the canister's balance on that ledger covers amount plus fee;\n" #
    "  otherwise it waits without sending. `Ok` or `#Duplicate` -> `#refunded`;\n" #
    "  known `Err` -> new attempt; unknown outcome past 23 h -> `#refundReview`.\n" #
    "  Old `#refundFailed` records: with a ledger `Err` they became pending RF\n" #
    "  attempts; all others (including the BTC path, never refunded) became\n" #
    "  `#refundReview`.\n" #
    "- Payments to refund (PC): purchase traces whose collect outcome is unknown\n" #
    "  or confirmed without a recorded purchase. Never sent automatically; the\n" #
    "  admin reviews them.\n\n" #
    "Admin review endpoints (admin = `#admin` role of the access control):\n\n" #
    "- `listTransfersToReview() : [TransferReview]` (query; non-admins trap with\n" #
    "  `Unauthorized: only admins can review transfers`). Each row: `{ kind\n" #
    "  (#FW | #SH | #RF | #PC); purchaseId (conversion id; trace number `n` for\n" #
    "  #PC); token; memoText : ?Text; memoHex :\n" #
    "  ?Text (lowercase); createdAtTimeNs : ?nat64 (ns); amount; fee : ?Nat;\n" #
    "  destination : ?Account; sends (number of sends of the attempt);\n" #
    "  lastError : ?Text; block : ?Nat; collect : ?(#confirmed | #unknown) }`.\n" #
    "  Rows: FW/SH `#needsReview`, RF `#refundReview`, every PC payment to\n" #
    "  refund; `block` and `collect` are set only on PC rows. Memo and\n" #
    "  `created_at_time` are null for a legacy\n" #
    "  transfer sent without them. Read-only, safe to poll.\n" #
    "- `markTransferArrived(kind, purchaseId, block) : Result<(), ReviewError>`:\n" #
    "  the admin checked the ledger and the transfer arrived in `block`; the\n" #
    "  status becomes `#forwarded(block)` / `#transferred(block)` / `#refunded`\n" #
    "  (RF). `#PC` returns `#notApplicable`.\n" #
    "- `markTransferNotArrived(kind, purchaseId) : Result<(), ReviewError>`: it\n" #
    "  did not arrive; a new attempt is opened (new memo, new `created_at_time`,\n" #
    "  status `#pending`, RF: `#refundFailed`) and sent by the next timer run,\n" #
    "  not by this call. `#PC`: the payment never happened; it is removed.\n" #
    "- `markRefundedManually(kind, purchaseId, block) : Result<(), ReviewError>`:\n" #
    "  the admin refunded by hand in `block`. RF: record `#refunded` with that\n" #
    "  block; PC: the payment to refund is removed. Both leave the list. FW/SH\n" #
    "  return `#notApplicable`.\n" #
    "- BTC review kinds. `#BR` (id = BR attempt `n`): a BTC refund with an\n" #
    "  unknown outcome after 23 h; Arrived(block) records it refunded, Not\n" #
    "  arrived opens a new attempt (new memo and `created_at_time`) sent by\n" #
    "  the timer. `#BC` (id = trace `n`): a BTC cost send with an unknown\n" #
    "  outcome after 23 h; Arrived(block) confirms the payment to refund with\n" #
    "  that block; Not arrived removes the send and its payment to refund, and\n" #
    "  the deposit is converted again later. `#BM` (id = conversion id): the\n" #
    "  ckBTC cost of a delivery failure, to refund by hand;\n" #
    "  `markRefundedManually(#BM, id, block)` records the block and removes the\n" #
    "  row; Arrived / Not arrived return `#notApplicable`. BR/BC rows carry\n" #
    "  `buyer`, `depositIndex`, `conversionId`, `refundPurpose` (BR) and\n" #
    "  `outcome`; BM rows carry `buyer`, `depositIndex`, `conversionId`. These\n" #
    "  fields are null on FW/SH/RF/PC rows. BC sends are also exposed to OQL as\n" #
    "  the admin-only `btcCostSend` entity.\n" #
    "- DEX lot 4 review kinds (id = the global `n` of the send). `#DC`: a DC\n" #
    "  send recorded before the mint revenue correction (history; no new DC\n" #
    "  sends are created) with an unknown outcome after 23 h; Arrived(block) records it completed;\n" #
    "  Not arrived opens a new attempt to the same destination (new memo and\n" #
    "  `created_at_time`), sent by the 10-minute retry timer. `#DL`: an LP bonus\n" #
    "  claim with an unknown outcome after 23 h; Arrived(block) records it\n" #
    "  claimed; Not arrived closes the claim and returns its amount to the\n" #
    "  owner's claimable bonus. `markRefundedManually` on DC/DL returns\n" #
    "  `#notApplicable`.\n" #
    "- Mint revenue review kinds. `#OW` (id = owner send id): an owner send\n" #
    "  with an unknown outcome after 23 h; Arrived(block) records it `#sent`;\n" #
    "  Not arrived opens a new attempt to the same destination (new memo and\n" #
    "  `created_at_time`), sent by the 10-minute retry timer.\n" #
    "  `#SR` (id = attempt `n`): the one-time sweep reserve top-up; Arrived\n" #
    "  records it and the sweep continues; Not arrived opens a new attempt.\n" #
    "  `#MF` (id = claim `n`): a mint-fee claim; Arrived(block) records it\n" #
    "  claimed; Not arrived closes the claim and returns its amount to the\n" #
    "  owner's claimable mint-fee balance. `#ST` (id = fee move `n`): a move\n" #
    "  into the mint fee account (mint fee or settlement leg) with an unknown\n" #
    "  outcome after 23 h; Arrived(block) records it `#sent` and refreshes the\n" #
    "  settlement; Not arrived opens a new attempt (new memo and\n" #
    "  `created_at_time`) sent by the 10-minute retry timer.\n" #
    "  `markRefundedManually` on OW/SR/MF/ST returns `#notApplicable`.\n" #
    "- `listTransfersToReviewFiltered({ kinds : [TransferKind]; token :\n" #
    "  ?DexToken }) : [TransferReview]` (admin query, same trap): the same rows\n" #
    "  as `listTransfersToReview`, keeping only the listed kinds (empty = every\n" #
    "  kind) and the given token (null = every token). Read-only, safe to poll.\n" #
    "- `ReviewError`: `#notAdmin`, `#notFound` (no such purchase, share or\n" #
    "  payment to refund), `#notApplicable` (action not valid for that kind),\n" #
    "  `#notUnderReview` (the transfer is not under review). All mark calls\n" #
    "  are allowed only on a transfer to review, so a repeated call returns\n" #
    "  `#notUnderReview` and changes nothing. Check the ledger (memo and\n" #
    "  `created_at_time`) before marking: a wrong \"Not arrived\" sends again.\n\n" #

    "## Cycles reserve\n\n" #
    "The 1% fee on every mint follows the creator-fee rule (see Creator fees):\n" #
    "the part received in ICP first fills this reserve, the rest is the creator\n" #
    "share. Earlier ICP purchases (before the liquidity mint) sent a share of their\n" #
    "cost there (history). The\n" #
    "reserve ICP is converted to cycles automatically when the cycles balance\n" #
    "is below 20 T cycles. The one-time treasury sweep tops the reserve up once\n" #
    "to 2 ICP from MINT-TREASURY-ICP (`#SR`). DC sends and weekly treasury ICP\n" #
    "no longer happen (history only). There is no withdrawal from the\n" #
    "reserve: `withdrawReserveExcess` was removed in DEX lot 4; the reserve ICP\n" #
    "is used only for cycles top-ups; the 2 ICP floor stays available for cycles.\n\n" #
    "- Reserve account (ICP ledger): `{ owner = <this canister>; subaccount =\n" #
    "  \"CYCLES-RESERVE-TTTI-T-0000000001\" }` (32 ASCII bytes, fixed). Also in\n" #
    "  `getCyclesStatus().reserveAccount` and `getTechnicalDetails()`.\n" #
    "- Constants: floor `RESERVE_FLOOR_E8S` = 200_000_000 e8s (2 ICP); top-up\n" #
    "  threshold 20_000_000_000_000 cycles (20 T); each top-up targets about\n" #
    "  2_000_000_000_000 cycles; minimum top-up 100_000 e8s.\n" #
    "- Automatic top-up: a timer, re-armed on every install and upgrade, runs\n" #
    "  immediately and then every 6 hours (21_600 s). If the cycles balance is\n" #
    "  below the threshold it reads `get_icp_xdr_conversion_rate` from the CMC\n" #
    "  (`rkp4c-7iaaa-aaaaa-aaaca-cai`), computes `icpE8s = 2_000_000_000_000 *\n" #
    "  10_000 * 10^8 / (xdr_permyriad_per_icp * 10^12)` (1 XDR = 10^12 cycles),\n" #
    "  capped at the\n" #
    "  reserve balance minus 10_000 e8s. The top-up may go below the floor\n" #
    "  (`reserveFloorE8s` is kept for display only). It sends\n" #
    "  `icrc1_transfer` from the reserve subaccount to the CMC account `{ owner =\n" #
    "  CMC; subaccount = [principal length, principal bytes, zero padding] }` of\n" #
    "  this canister, with memo `TPUP` = 1347768404 as 8 little-endian bytes and\n" #
    "  `created_at_time` set. The block index is stored (status `#transferred`)\n" #
    "  BEFORE `notify_top_up { block_index; canister_id = this canister }`.\n" #
    "- Notify outcome: `#Ok cycles` -> `#notified { cycles }`. `#Processing`, a\n" #
    "  CMC `#Other` error or a failed call keep `#transferred` with `lastError`;\n" #
    "  the next run retries notify with the same block index and never makes a\n" #
    "  second transfer while one awaits notification. `#Refunded`,\n" #
    "  `#InvalidTransaction` or `#TransactionTooOld` -> `#failed(reason)`, after\n" #
    "  which a later run may make a new transfer. The timer never traps.\n" #
    "- Stored attempt (shared retry rule): the top-up transfer is recorded in\n" #
    "  stable state before the first await (amount, TPUP memo, fixed\n" #
    "  `created_at_time`, full request) and survives upgrades. A rejected or\n" #
    "  trapped send is an unknown outcome: the same request is resent unchanged\n" #
    "  for 23 h (`#Duplicate` counts as arrived), then the attempt needs admin\n" #
    "  review and is no longer resent. A known ledger Err allows a new attempt.\n" #
    "  Once the block is known, `notify_top_up` is retried with that block and\n" #
    "  no second transfer is made.\n" #
    "- `getCyclesStatus() : CyclesStatus` (public query): `{ cyclesBalance;\n" #
    "  topUpThreshold; reserveAccount; reserveBalanceE8s; reserveFloorE8s;\n" #
    "  lastTopUp : ?{ timestamp; icpE8s; blockIndex; status\n" #
    "  (#transferred | #notified { cycles } | #failed : Text); lastError };\n" #
    "  withdrawals : [{ timestamp; amountE8s; blockIndex }];\n" #
    "  pendingFeeShareE8s : Nat; coverage : ?ReserveCoverage }`.\n" #
    "  `pendingFeeShareE8s` = ICP e8s of the 1 % mint fees (and former buyback fees) recorded\n" #
    "  for the reserve and not yet received by the reserve account (waiting or\n" #
    "  being sent). `coverage` = `{ dailyConsumptionCycles; monthlyConsumptionCycles;\n" #
    "  totalCycles; monthsCoveredX100; yearTargetCycles; yearTargetE8s : ?Nat;\n" #
    "  fillBps; rateKnown }`, or null while no consumption can be measured.\n" #
    "  `monthsCoveredX100` is the coverage in months times 100 (1250 = 12.5\n" #
    "  months; month = 30 days) and `fillBps` = totalCycles / one-year target\n" #
    "  in basis points, capped at 10_000. `withdrawals` is\n" #
    "  the history of withdrawals made before DEX lot 4; no new entry is added.\n" #
    "  `reserveBalanceE8s`\n" #
    "  is a cache refreshed from the ICP ledger by the timer and after each\n" #
    "  reserve movement; read `icrc1_balance_of(reserveAccount)` on the ICP ledger\n" #
    "  for the live value. Timestamps are nanoseconds (Candid `int`), ICP in\n" #
    "  e8s, cycles as plain Nat.\n" #
    "- Polling: the cycles status changes at most every 6 hours (plus purchases\n" #
    "  and DC sends); polling `getCyclesStatus` more than once a minute gains\n" #
    "  nothing.\n\n" #
    "## Canister info\n\n" #
    "- The canister reads its own `canister_info` from the management canister\n" #
    "  right after every install and upgrade, then once a day (86_400 s), and\n" #
    "  caches the result. `getTechnicalDetails` serves the cache (no call):\n" #
    "  `controllers : ?vec principal` and `moduleHash : ?text` (lowercase hex\n" #
    "  SHA-256 of the installed Wasm module), both null until the first\n" #
    "  successful read; `canisterInfoFetchedAt : ?int` (ns) of the last success.\n" #
    "  A failed read keeps the previous values.\n" #
    "- `legacyBlockBoundary : nat`: blocks with index below it come from earlier\n" #
    "  test versions of the contract and use 4 decimals; the earliest record\n" #
    "  amounts without accounts. Same value as `getLegacyBlockInfo().boundaryIndex`.\n" #
    "- Polling: these values change only on upgrade or controller change; reading\n" #
    "  them more than once an hour gains nothing.\n\n" #
    "## Native BTC deposits (ckBTC minter)\n\n" #
    "Two flows use the ckBTC minter `mqygn-kiaaa-aaaar-qaadq-cai` and the ckBTC\n" #
    "ledger `mxzaz-hqaaa-aaaar-qaada-cai`. BTC and ckBTC amounts are satoshis\n" #
    "(8 decimals); TTTI-T amounts are base units (e8). Timestamps are ns.\n\n" #
    "- Purchase (BTC -> ckBTC -> TTTI-T): `getBtcPurchaseAddress() :\n" #
    "  BtcDepositResult` (signed caller with accepted wallet terms)\n" #
    "  returns tracking whose `btcAddress` is the minter address for owner = this\n" #
    "  canister and a 32-byte subaccount derived from the caller principal\n" #
    "  ([0xBD, principal length, principal bytes, zero padding]); it is stable\n" #
    "  per buyer and differs from the fee collector and cycles reserve accounts.\n" #
    "  `checkBtcPurchaseDeposit()` calls the minter `update_balance` for that\n" #
    "  subaccount, then converts each minted entry for its own amount\n" #
    "  (`ckbtcPendingSats`, else its `ckbtcMintedSats`; capped by the\n" #
    "  subaccount balance), oldest first, one at a time, into TTTI-T at the\n" #
    "  stored hourly BTC\n" #
    "  rate with the 1% fee, under the ckBTC purchase rules (minimum, remaining\n" #
    "  supply, sales paused, treasury configured). TTTI-T goes to the caller's\n" #
    "  current delivery address (else the caller's own account). The ckBTC cost\n" #
    "  moves from the subaccount to this canister's default ckBTC account (then\n" #
    "  routed as Mint revenue); ckBTC beyond the\n" #
    "  remaining supply is refunded to the caller's own ckBTC account minus the\n" #
    "  10 sat ledger fee. A Conversion is recorded as for other purchases.\n" #
    "- Wallet (BTC -> ckBTC only): `getBtcWalletAddress()` returns the minter\n" #
    "  address for owner = caller, no subaccount. `checkBtcWalletDeposit()` calls\n" #
    "  `update_balance` for the caller; ckBTC is minted directly to the caller's\n" #
    "  own account. No TTTI-T and no app fee.\n" #
    "- Wallet path for a given owner (for Plug, OISY or NFID principals known to\n" #
    "  the frontend): `getBtcWalletAddressFor(owner : Principal) :\n" #
    "  BtcDepositResult`, `checkBtcWalletDepositFor(owner : Principal) :\n" #
    "  BtcDepositResult` and `getBtcWalletDepositsFor(owner : Principal) :\n" #
    "  ?DepositTracking` (query). They act exactly like `getBtcWalletAddress`,\n" #
    "  `checkBtcWalletDeposit` and the `wallet` field of `getMyBtcDeposits` called\n" #
    "  by `owner`: same minter account (owner = `owner`, no subaccount), same\n" #
    "  stored tracking and same Bitcoin address as `owner`'s own wallet path.\n" #
    "  No signature is needed: ckBTC is minted only to `owner`'s own account, so a\n" #
    "  caller can only trigger a conversion that credits `owner`. They never read\n" #
    "  or create purchase-path data. `owner` equal to the anonymous principal or\n" #
    "  to this canister is refused with `#Err` code `#anonymousCaller` (message\n" #
    "  \"The anonymous principal and this canister cannot own a Bitcoin wallet\n" #
    "  deposit address\"); the query returns null for them and for an owner\n" #
    "  without a stored wallet tracking. Trackings created this way are\n" #
    "  watched by the background timer like any other. The BTC purchase path\n" #
    "  (`getBtcPurchaseAddress`, `checkBtcPurchaseDeposit`) stays caller-signed\n" #
    "  and requires the caller's accepted wallet terms.\n" #
    "- Stable address: exactly one Bitcoin address per principal per flow,\n" #
    "  derived deterministically by the minter. The address endpoints\n" #
    "  (`getBtcPurchaseAddress`, `getBtcWalletAddress`, `getBtcWalletAddressFor`)\n" #
    "  return it without storing anything: with a stored tracking they return\n" #
    "  it; otherwise they ask the minter and return an unsaved tracking\n" #
    "  (`stage = #addressShown`, `deposits = []`, `lastCheckedAt = null`). The\n" #
    "  address is never rotated, before or after its deposits are spent, and\n" #
    "  can be reused for any number of deposits.\n" #
    "- Tracking creation: a tracking is stored only when a check\n" #
    "  (`checkBtcPurchaseDeposit`, `checkBtcWalletDeposit`,\n" #
    "  `checkBtcWalletDepositFor`) detects a deposit (`update_balance` returns\n" #
    "  UTXO statuses, or `NoNewUtxos` with pending UTXOs or current\n" #
    "  confirmations). Without a stored tracking the check derives the address\n" #
    "  (purchase: accepted wallet terms required), calls `update_balance` and, when\n" #
    "  nothing is detected, stores nothing and returns \"no deposit yet\":\n" #
    "  `#Ok` with an unsaved tracking (`stage = #addressShown`, `deposits = []`,\n" #
    "  `lastCheckedAt` set). Later checks update the stored tracking. The\n" #
    "  lot 7 upgrade removed every stored tracking without a deposit.\n" #
    "- `getMyBtcDeposits() : { purchase : ?DepositTracking; wallet : ?DepositTracking }`\n" #
    "  (query) returns only the caller's stored trackings (null until a check\n" #
    "  detected a deposit).\n" #
    "- `getBtcDepositInfo()` (public query): minter id, ckBTC ledger id,\n" #
    "  `minConfirmations`, `depositMinSats`, `checkFeeSats`, `purchaseFeeBps`\n" #
    "  (100), `suggestedPollSeconds` (60), `infoFetchedAt` (null = defaults\n" #
    "  6 / 10_000 / 100 until `get_minter_info` is read; refreshed by the timer).\n" #
    "- `DepositTracking`: `{ kind (#purchase | #wallet); btcAddress; stage;\n" #
    "  deposits : [DepositEntry]; createdAt; lastCheckedAt; errorKind;\n" #
    "  errorMessage }`. `stage` is the newest entry's stage, or `#addressShown`\n" #
    "  when no deposit was seen. `errorKind` / `errorMessage` describe the last\n" #
    "  check (for example the minter unreachable) and are cleared by the next\n" #
    "  successful check.\n" #
    "- `deposits` is newest first. Each `DepositEntry` is one Bitcoin transfer\n" #
    "  (transaction) to the address: `{ index; stage; btcDetectedSats; ckbtcMintedSats (after the\n" #
    "  minter check fee); ckbtcPendingSats (purchase: this entry's ckBTC still in the\n" #
    "  subaccount); tttiDelivered; refundedSats; conversionId; btcTxids;\n" #
    "  ckbtcMintBlockIndex; detectedAt; updatedAt; errorKind; errorMessage;\n" #
    "  btcRefund; costToRefund; conversionCause : ?Text; causePermanent : Bool }`.\n" #
    "  `conversionCause` is the real cause text of the last failed or skipped\n" #
    "  ckBTC -> TTTI-T conversion (null = none recorded, cleared on success).\n" #
    "  `causePermanent` = true when the cause cannot fix itself (mint ended,\n" #
    "  cap reached, amount invalid or below the minimum, acknowledgements\n" #
    "  missing): the 10-minute timer then stops retrying that entry, and it\n" #
    "  appears in the admin \"To review\" list (`listTransfersToReview`, kind\n" #
    "  `#PC`, `lastError` = the cause) until an admin finishes or refunds it.\n" #
    "  Transient causes (rate unavailable or unconfirmed, sales or DEX paused,\n" #
    "  pool unavailable, purchase in progress, ledger error) keep retrying with\n" #
    "  the cause recorded.\n" #
    "  `index` is 0-based and increases per address (the oldest entry is 0).\n" #
    "  UTXOs are attributed to entries by Bitcoin txid: a UTXO of a new\n" #
    "  transaction always opens a new entry, even while an earlier entry is\n" #
    "  confirming, minted or in error, and it confirms, mints and converts\n" #
    "  independently of the others. Final entries: purchase `#delivered`,\n" #
    "  `#refunded` or `#error`; wallet `#minted` or `#error`. Trackings created\n" #
    "  before entries existed carry their earlier content as entry 0.\n" #
    "- `btcTxids : [Text]` (per entry): Bitcoin transaction ids of that\n" #
    "  deposit's UTXOs reported by the minter (`update_balance` results and\n" #
    "  pending UTXOs), lowercase hex in standard display order (the minter\n" #
    "  outpoint txid bytes reversed), usable directly in Bitcoin explorers;\n" #
    "  added as soon as the deposit is seen, deduplicated, in detection order.\n" #
    "- `ckbtcMintBlockIndex : ?Nat` (per entry): ckBTC ledger\n" #
    "  (`mxzaz-hqaaa-aaaar-qaada-cai`) block index of that deposit's latest mint\n" #
    "  (`#Minted` `block_index`); null until a mint is reported.\n" #
    "- Stages (per entry): `#depositDetected` -> `#confirming { current;\n" #
    "  required }` -> `#minted` (wallet: final) -> `#delivered` or `#refunded`\n" #
    "  (purchase). `#pendingRate`: ckBTC is in the subaccount but no valid hourly\n" #
    "  BTC rate exists; nothing is transferred and no fallback rate is used.\n" #
    "  `#error` with `errorKind` `#valueTooSmall` or `#tainted` (no ckBTC\n" #
    "  minted), or `#unrecoverable` (purchase: the full refund is not confirmed,\n" #
    "  or delivery failed after the ckBTC cost was sent; `ckbtcPendingSats` is\n" #
    "  the ckBTC still held); older records may show `#other` with the same\n" #
    "  meaning. Refund failure on a delivered purchase: stage `#delivered`,\n" #
    "  `errorKind` `#refundFailed`, `errorMessage` the reason and\n" #
    "  `ckbtcPendingSats` the ckBTC still held on that entry.\n" #
    "- BTC refunds (BR) go through the shared retry rule (see Transfer retry):\n" #
    "  R1 the excess after a purchase, R2 the full refund (`#saleComplete`,\n" #
    "  `#belowMinimum`), and the excess of a delivery failure. The attempt\n" #
    "  (memo `TTTI-BR-<n>-<m>`, `created_at_time`, full request) is stored on\n" #
    "  the deposit entry before the send. Destination: the default ckBTC\n" #
    "  account of the principal who created the tracking; amount = held - 10\n" #
    "  sat fee; 10 sat or less is never refunded; a send happens only when the\n" #
    "  deposit subaccount balance covers amount plus fee. `checkBtcPurchaseDeposit`\n" #
    "  and the 600 s timer resend the same request for 23 h (also while sales\n" #
    "  are paused), then the refund is listed to review. Success: R2 sets\n" #
    "  `#refunded`; the excess clears `errorKind`/`ckbtcPendingSats`.\n" #
    "- Entries from before this rule (no `created_at_time`): a failure that\n" #
    "  is a ledger `Err` gets a new BR attempt; a reject, trap or ambiguous\n" #
    "  message (e.g. `could not be reached`) is an unknown outcome listed to\n" #
    "  review without a resend. A legacy delivery failure's excess gets a new\n" #
    "  attempt; its ckBTC cost becomes a BM cost to refund by hand.\n" #
    "- BTC cost send (BC): the purchase cost moves to this canister's default ckBTC account with\n" #
    "  memo `TTTI-PC-<n>` and its `created_at_time`, stored in the retry state.\n" #
    "  `Ok`/`#Duplicate` -> purchase recorded; ledger `Err` -> nothing taken,\n" #
    "  trace closed; unknown -> payment to refund (PC, unknown) and the 600 s\n" #
    "  timer resends the identical request for 23 h; on success the payment is\n" #
    "  confirmed with its block; after 23 h it is listed to review (BC). The\n" #
    "  entry is not converted again while its BC send is unsettled.\n" #
    "  `#addressShown` appears only at tracking level; tracking-level\n" #
    "  `errorKind` may be `#minterUnavailable` or `#other`.\n" #
    "- Errors (`#Err { code; message }`): `#anonymousCaller`,\n" #
    "  `#acknowledgementRequired`, `#purchaseInProgress` (one purchase per\n" #
    "  principal, shared with `convertDeposit*` and the background timer),\n" #
    "  `#minterUnavailable` (minter unreachable and no further stage reached).\n" #
    "  `#noAddressYet` is returned only by `convertMyHeldBtc` (no tracked deposit).\n" #
    "- Background watch: a canister timer runs right after every install and\n" #
    "  upgrade, then every 600 s. Each tick watches only stored trackings (all\n" #
    "  have at least one deposit): it calls the minter `update_balance` for\n" #
    "  purchase trackings first, then wallet trackings, each group from the\n" #
    "  most recently active (latest deposit `updatedAt` / `detectedAt` or\n" #
    "  `lastCheckedAt`) to the least; purchase ckBTC is then converted into\n" #
    "  TTTI-T exactly as by `checkBtcPurchaseDeposit`, and `#pendingRate` is\n" #
    "  finalized once a valid rate exists. Trackings checked in the last 5\n" #
    "  minutes are skipped, at most 25 minter calls are made per tick, and a\n" #
    "  principal with a purchase in progress is skipped. A first deposit to an\n" #
    "  address without a stored tracking is detected only by a check call; a\n" #
    "  later deposit may appear up to about 10 minutes (longer with many\n" #
    "  trackings) after its confirmations without any client call.\n" #
    "- Polling: BTC needs about 6 confirmations (about one hour). While the\n" #
    "  widget is open, call the check endpoint every `suggestedPollSeconds` (60 s)\n" #
    "  at most until a deposit is detected; after that, the check endpoint or\n" #
    "  `getMyBtcDeposits` / `getBtcWalletDepositsFor` (queries) with the timer\n" #
    "  progressing the\n" #
    "  deposit. An entry is done once final (see above); the address stays in\n" #
    "  use, so keep watching it (the timer does) for a new transfer, which\n" #
    "  appears as a new entry.\n" #
    "- Retry safety: all check calls (including `checkBtcWalletDepositFor`) are\n" #
    "  idempotent and safe to repeat; repeated or concurrent calls (yours, other\n" #
    "  callers' for the same owner and the timer's) never mint or deliver twice\n" #
    "  for the same UTXO or ckBTC: the minter answers a concurrent\n" #
    "  `update_balance` for the same account with `AlreadyProcessing`, which\n" #
    "  leaves the tracking unchanged. `#purchaseInProgress` means the\n" #
    "  timer or another call is finishing that purchase; retry a few seconds\n" #
    "  later. The address endpoints are safe to repeat and return the same\n" #
    "  address.\n" #
    "- Retry and lock behaviour: the per-principal purchase lock is shared by\n" #
    "  `checkBtcPurchaseDeposit`, the timer, `mintLiquidity` and the admin\n" #
    "  recovery. Every lock is stamped when taken and expires by itself after\n" #
    "  10 minutes; a lock found without a stamp is stamped at once so it\n" #
    "  expires instead of blocking retries forever. In the timer, an error for\n" #
    "  one buyer is recorded on that buyer's newest entry (`conversionCause`)\n" #
    "  and never stops the tick for the other buyers.\n\n" #
    "## Automatic refund and `convertMyHeldBtc` (BTC -> ckBTC -> TTTI-T)\n\n" #
    "A purchase deposit never stays held in the contract subaccount for good:\n" #
    "every minted entry ends `#delivered` (TTTI-T) or `#refunded` (ckBTC sent to\n" #
    "the buyer's own default account `{ owner = buyer; subaccount = null }`,\n" #
    "minus the 10 sat ledger fee; a remainder of 10 sat or less is ignored). No\n" #
    "admin action is needed in the normal path.\n\n" #
    "- Permanent cause (mint ended, amount below the minimum or above the cap,\n" #
    "  sales paused, DEX paused, pool unavailable, acknowledgements missing, any\n" #
    "  other non-temporary refusal): the conversion refunds the full held\n" #
    "  amount at once through the BR mechanism (memo `TTTI-BR-<n>-<index>`,\n" #
    "  `created_at_time`, same request resent identically for 23 hours, then\n" #
    "  `To review`). Entry: `stage = #error`, `btcRefund` set, `conversionCause`\n" #
    "  = the real cause, `ckbtcPendingSats` = refunded debit; `#refunded` once the\n" #
    "  ledger confirms. A deposit refund is sent even while sales are paused.\n" #
    "- Temporary cause (no fresh rate, two rate sources disagree, purchase in\n" #
    "  progress, ledger error): the entry stays `#minted` or `#pendingRate` with\n" #
    "  `ckbtcPendingSats` = the held amount and is retried every 10 minutes by\n" #
    "  the timer. When the cause lasts more than 24 hours after the deposit was\n" #
    "  first detected (`detectedAt`), it is refunded like a permanent one.\n" #
    "- Deposits already held with a recorded cause are picked up by the same\n" #
    "  timer: the real ledger balance of the subaccount is read first; the\n" #
    "  timer does not convert, it only refunds under the rules above.\n" #
    "  No balance or block is ever rewritten.\n" #
    "- `convertMyHeldBtc(params : DepositMintParams) : BtcDepositResult` (update\n" #
    "  call, signed caller only): acts only on the caller's own purchase\n" #
    "  tracking, under the purchase lock, without calling the minter. It is the\n" #
    "  only way to mint TTTI-T from held ckBTC. `DepositMintParams` has five\n" #
    "  required fields, the same choices as `mintLiquidity`:\n" #
    "  `targetPoolId : Nat` (the pool you choose; an unknown pool, a pool of\n" #
    "  another pair, a removed pool or a pool with an announced removal gives\n" #
    "  the invalid target pool cause, never a silent fallback to the\n" #
    "  recommendation), `choice : RemainderChoice` (`#pool` = A, the remainder is\n" #
    "  pooled without lock; `#wallet` = B, the remainder stays in your wallet),\n" #
    "  `slippageBps : Nat` (tolerance on the balancing swap and the deposit\n" #
    "  ratio; above 10000 is refused), `maxPayAmount : Nat` (payment cap in ckBTC\n" #
    "  base units, conversion cost included; a higher total payment is refused)\n" #
    "  and `deadline : Int` (nanoseconds since the epoch, supplied by the caller,\n" #
    "  normally now + 5 minutes; checked before anything moves and again by the\n" #
    "  isolated mint core).\n" #
    "  The conversion mints for the largest amount that fits the held ckBTC under\n" #
    "  your choice, with the isolated mint core (any failure rolls back, nothing\n" #
    "  is minted). When a rule refuses (price outside tolerance, cap exceeded,\n" #
    "  deadline passed, invalid pool, mint ceiling), nothing is taken: the ckBTC\n" #
    "  stays held and the cause is written to `conversionCause` (read it in\n" #
    "  `deposits[].conversionCause` and `errorMessage`); call again with new\n" #
    "  parameters, no admin needed. Refusals caused by your own parameters are\n" #
    "  temporary: the ckBTC is refunded to your wallet only after 24 hours from\n" #
    "  the first detection. A permanent system cause opens the automatic refund.\n" #
    "  If the isolated core refuses after the payment moved, the payment is\n" #
    "  returned through the existing refund path (mint status in\n" #
    "  `getMyLiquidityMints`). Returns `#Ok(tracking)` (read `deposits[].stage`,\n" #
    "  `ckbtcPendingSats`, `conversionCause`, `btcRefund`),\n" #
    "  `#Err(#anonymousCaller)` for the anonymous principal,\n" #
    "  `#Err(#noAddressYet)` without any tracked deposit, or\n" #
    "  `#Err(#purchaseInProgress)` when the lock is held (retry in a few\n" #
    "  seconds). Safe to repeat: a delivered or already refunding entry is never\n" #
    "  converted or refunded twice. The amount held for the button is the sum of\n" #
    "  `ckbtcPendingSats` of entries in stage `#minted` or `#pendingRate`.\n" #
    "- The timer, the background deposit check (`checkBtcPurchaseDeposit`) and\n" #
    "  the admin finish pass no user parameters: they mint nothing. The ckBTC\n" #
    "  stays held and mintable by you with `convertMyHeldBtc`; only the refund\n" #
    "  rules above (permanent cause recorded earlier, or 24 hours) can return it\n" #
    "  to your wallet.\n\n" #
    "## Admin recovery of a stuck ckBTC -> TTTI-T mint\n\n" #
    "Both endpoints are admin only: an anonymous or non-admin caller traps with\n" #
    "`Unauthorized: only admins can ...`. `input` is either the buyer principal\n" #
    "text or the 64-hex-character deposit subaccount of the contract (byte 0xbd,\n" #
    "a length byte, the principal bytes, zero padding to 32 bytes); both give the\n" #
    "same buyer. An invalid input traps in `diagnoseBtcMint` and returns\n" #
    "`#refused(message)` in `finishBtcMint`, with a plain English message.\n\n" #
    "- `diagnoseBtcMint(input : Text) : BtcMintDiagnosis` (update call, because\n" #
    "  it reads the real ckBTC ledger balance of the deposit subaccount; it\n" #
    "  changes no state and is safe to repeat). Fields: `buyer`,\n" #
    "  `depositSubaccountHex`, `trackingStage`, `lastErrorKind`, `lastErrorText`,\n" #
    "  `conversionCause`, `causePermanent`, `pendingCkbtcSats`,\n" #
    "  `subaccountBalanceSats`, `purchaseLockHeld`, `costAttemptOpen`,\n" #
    "  `mintableRemaining` (TTTI-T base units), `minimumMint` (10_000 base\n" #
    "  units), `salesPaused`, `dexPaused`, `validRateAvailable`, `verdictCode`,\n" #
    "  `verdictText` and `recommendedAction` (`#finishMint | #refund | #none`).\n" #
    "  It looks at the newest entry that still has ckBTC to convert, else the\n" #
    "  newest entry. Verdict codes: `noDeposit`, `waitingForBtc`,\n" #
    "  `alreadyDone`, `terminalStage`, `balanceAtFee` (balance at or below the\n" #
    "  10 sat fee), `balanceUnreadable`, `mintEnded` (remaining supply below the\n" #
    "  minimum mint; refund), `capReached` (sellable supply below the minimum;\n" #
    "  refund), `salesPaused`, `dexPaused`, `noRate`, `rateSourcesDiverge`,\n" #
    "  `acknowledgementRequired`, `costOpen` (an unsettled ckBTC cost or refund\n" #
    "  send), `lockHeld`, `lockUnstamped`, `lockExpired` (stale lock, no purchase\n" #
    "  running; finishMint), `previousCause` (an earlier attempt recorded a\n" #
    "  cause and nothing blocks now; finishMint) and `ok` (nothing blocking;\n" #
    "  finishMint).\n" #
    "- `finishBtcMint(input : Text, refund : Bool) : FinishMintResult` with\n" #
    "  `#minted { tttiOut; conversionId } | #alreadyDone Text | #refundOpened\n" #
    "  { refundSats } | #refused Text`. With `refund = false` it checks\n" #
    "  everything without any external call (mint ended, cap, sales and DEX\n" #
    "  pause, rate and its two-source confirmation, acknowledgements, open cost\n" #
    "  attempt, lock); a failed check returns `#refused` with the exact reason\n" #
    "  and records it as `conversionCause` on the entry. A lock without stamp or\n" #
    "  past its 10-minute expiry is released only when no purchase is actually\n" #
    "  running (no open cost attempt, no DEX lock). It then runs the same\n" #
    "  finalize and mint path as the automatic conversion under the normal rate,\n" #
    "  minimum, cap and pool rules; ignoring the timer's \"permanent cause\" stop.\n" #
    "  If nothing is left to convert it answers `#alreadyDone` and mints nothing\n" #
    "  (no duplicate mint). With `refund = true` (explicit confirmation) and a\n" #
    "  permanent cause (recorded, or found live: mint ended, cap reached,\n" #
    "  acknowledgements missing) it opens the full ckBTC refund to the buyer\n" #
    "  principal (balance minus the 10 sat fee) through the existing BR refund\n" #
    "  mechanism and returns `#refundOpened`; a second call finds the refund\n" #
    "  and returns `#alreadyDone`, so a refund is never sent twice. Both modes\n" #
    "  are safe to repeat. They never change `sale.reserved`, balances or blocks.\n" #
    "  `refund = false` only records the cause; the timer then converts the\n" #
    "  ckBTC or refunds it to the buyer's wallet on its next pass.\n\n" #
    "- Identity gotcha: the address is derived from the caller principal. The\n" #
    "  draft and live domains of the app give different Internet Identity\n" #
    "  principals, hence different trackings and different Bitcoin addresses;\n" #
    "  a deposit sent to one domain's address is visible only when signed in on\n" #
    "  that domain. The same applies to Internet Identity versus Plug.\n\n" #
    "## Address book\n\n" #
    "Private list of saved recipients, one list per caller principal. It only\n" #
    "stores contacts; it sends nothing and holds no tokens.\n\n" #
    "- Types: `Contact = { id : Nat; nickname : Text; principal : Principal;\n" #
    "  memo : ?Blob; createdAt : Int; updatedAt : Int }`,\n" #
    "  `ContactInput = { nickname : Text; principal : Principal; memo : ?Blob }`.\n" #
    "  Timestamps are nanoseconds since the Unix epoch. `memo` is raw bytes (at\n" #
    "  most 32), meant as the default ICRC-1 `memo` of a transfer to the contact.\n" #
    "- `listMyContacts() : Result<[Contact], AddressBookError>` (query): the\n" #
    "  caller's contacts sorted by nickname (case-insensitive).\n" #
    "- `addContact(input) : Result<Contact, AddressBookError>`: creates a contact\n" #
    "  with `createdAt = updatedAt = now`.\n" #
    "- `updateContact(id, input) : Result<Contact, AddressBookError>`: replaces\n" #
    "  nickname, principal and memo; keeps `createdAt`, sets `updatedAt = now`.\n" #
    "- `deleteContact(id) : Result<(), AddressBookError>`.\n" #
    "- Authentication: a signed (non-anonymous) caller, Internet Identity or\n" #
    "  Plug. Anonymous callers get `#err(#anonymous)` on all four methods. No\n" #
    "  registration is needed.\n" #
    "- Authorization: the owner is always the caller principal; no argument\n" #
    "  selects another owner. A contact id of another principal returns\n" #
    "  `#err(#notFound)`.\n" #
    "- Validation (add and update): the nickname is trimmed, must be non-empty\n" #
    "  (`#invalidInput(#nicknameEmpty)`), at most 64 characters\n" #
    "  (`#invalidInput(#nicknameTooLong { maxChars = 64 })`) and unique per owner\n" #
    "  ignoring case (`#duplicateNickname`; on update the edited contact is\n" #
    "  excluded). A memo over 32 bytes gives `#invalidInput(#memoTooLong\n" #
    "  { maxBytes = 32 })`. The principal must not be anonymous, the caller or\n" #
    "  the TTTI-T minting account (this canister):\n" #
    "  `#invalidInput(#principalNotAllowed)`.\n" #
    "- Limit: 200 contacts per owner; `addContact` beyond it gives\n" #
    "  `#err(#limitReached { max = 200 })`.\n" #
    "- Retry safety: `addContact` is not idempotent; a retry after an unknown\n" #
    "  outcome may return `#duplicateNickname` because the first call succeeded.\n" #
    "  Re-read with `listMyContacts`. `updateContact` with the same input is safe\n" #
    "  to repeat. `deleteContact` is destructive; a repeat returns `#notFound`.\n" #
    "- ICRC-2 approvals: this canister does not create, store or revoke\n" #
    "  approvals for contacts. The user sends `icrc2_approve` directly to each\n" #
    "  token ledger (ICP, ckBTC, ckUSDC, ckUSDT, TTTI-T) with the contact as\n" #
    "  spender. An approval lets the spender move up to the approved amount from\n" #
    "  the user's account until it expires or is replaced by an approval of 0.\n\n" #
    "## Common reserve and redemption\n" #
    "\n" #
    "Common reserve: 10 000 USD per TTTI-T minted is held, calculated in USD at the\n" #
    "oracle rates, in the token the minter paid in (ICP, ckBTC, ckUSDC or ckUSDT)\n" #
    "in the dedicated internal reserve accounts of the contract (one per token, in\n" #
    "the common custody). Every liquidity mint and every auction settlement pays\n" #
    "10 000 USD x q into it in the paid token, as is, with no conversion (see\n" #
    "Liquidity mint and Auctions). Guarantees already converted to ckUSDC stay as\n" #
    "they are; any ICP or ckBTC in the accounts counts in the reserve.\n" #
    "The reserve is common and public: it is not tied to a person. Any holder of\n" #
    "TTTI-T, minter or not, redeems TTTI-T against it. Each TTTI-T is redeemable at\n" #
    "up to 10 000 USD; a redemption costs no fee. The guarantee records of mints\n" #
    "made before the common reserve stay readable as history only (see Liquidity\n" #
    "mint); nothing is written to them any more and no balance or block is rewritten.\n" #
    "\n" #
    "Redeeming x TTTI-T pays the holder, in the reserve tokens, the lower of:\n" #
    "- parity: 10 000 USD x x; and\n" #
    "- reserve share: (reserve USD / circulation outside the contract) x x.\n" #
    "So the payout is min(10 000 USD x x, reserve / circulation outside the contract\n" #
    "x x). Circulation outside the contract = TTTI-T total supply minus the balance of\n" #
    "the contract's returned-TTTI-T account (the TTTI-T already returned). The payout\n" #
    "is split pro rata between ckUSDC and ckUSDT in proportion to the reserve\n" #
    "composition, valued at the stored hourly rates. The ledger fee of each payout\n" #
    "is borne by the creator share, so the holder receives the full quoted amount.\n" #
    "A redemption is refused only when x exceeds the circulation outside the\n" #
    "contract (`#amountExceedsCirculation`), apart from the technical refusals below.\n" #
    "While the reserve is at least 10 000 USD x circulation the payout is the parity\n" #
    "amount; when the reserve is short (shortfall > 0) every holder shares the\n" #
    "shortfall in proportion and the payout is the reserve share. Nothing in this\n" #
    "API promises a value.\n" #
    "\n" #
    "Wallet terms: `redeemGuarantee` requires the caller's stored acceptance of the\n" #
    "wallet terms (a record of any version, see Purchase acknowledgement). Otherwise it\n" #
    "returns `#err #acknowledgementRequired` before any lock, transfer or ledger\n" #
    "call. `quoteGuaranteeRedeem` is not gated.\n" #
    "\n" #
    "The TTTI-T pulled equals the redeemed amount. They move to a dedicated\n" #
    "contract-held account on the TTTI-T ledger, `{ owner = this canister;\n" #
    "subaccount = \"RETURNED-TTTI-T-OUT-OF-CIRC-0001\" (32 bytes) }`, distinct from\n" #
    "the minting account and the fee collector, and are not counted as available\n" #
    "to mint. They stay out of circulation until the auctions. Nothing is burned\n" #
    "and the total supply is unchanged.\n" #
    "\n" #
    "- Units: TTTI-T 8 decimals; token amounts in base units of each token (ICP,\n" #
    "  ckBTC 8 decimals; ckUSDC, ckUSDT 6); USD values are USD e8 (1 USD =\n" #
    "  100_000_000); rates are USD e8 per whole token; timestamps are nanoseconds\n" #
    "  (Int); ids and amounts are Nat. A value without a usable stored rate is null\n" #
    "  or 0 in the views, never invented.\n" #
    "- Authentication: `getReserveView`, `quoteGuaranteeRedeem` and\n" #
    "  `getGuaranteeAccounts` are public (anonymous allowed). `redeemGuarantee` and\n" #
    "  `listMyRedemptions` require a signed (non-anonymous) caller (`#anonymous`\n" #
    "  otherwise) and act on the caller's own account only. Use the principal\n" #
    "  derived against the app's Internet Identity derivation origin (see above).\n" #
    "  `convertLegacyGuarantees` is admin only and converts nothing any more.\n" #
    "\n" #
    "Endpoints:\n" #
    "- `getReserveView() : ReserveView` (public query): `perToken` (for #icp, #ckbtc,\n" #
    "  #ckusdc and #ckusdt: `balance` of the reserve account in base units,\n" #
    "  `rateUsdE8 : ?Nat` null when absent or expired, `valueUsdE8`, the balance in\n" #
    "  USD at that rate), `reserveUsdE8` (sum of the values, in USD),\n" #
    "  `circulationOutside` (TTTI-T base units), `reservePerTtti : ?Nat` (USD e8 per\n" #
    "  whole TTTI-T, null when the circulation is zero), `requiredUsdE8` (10 000 USD\n" #
    "  x circulation), `invariantHolds` (reserveUsdE8 >= requiredUsdE8),\n" #
    "  `shortfallUsdE8` (requiredUsdE8 - reserveUsdE8, 0 when none) and\n" #
    "  `legacyPending` (always empty: ICP and ckBTC are counted in `perToken`).\n" #
    "- `quoteGuaranteeRedeem(tttiAmount : Nat)` (public query) : `#ok RedeemQuote`\n" #
    "  or `#err GuaranteeError`. Read-only, from the stored rates; no external call.\n" #
    "  `RedeemQuote` carries `tttiAmount`, `rule` (`#parity` or `#reserveShare`, the\n" #
    "  lower one), `parityUsdE8`, `proportionalUsdE8`, `payoutUsdE8`,\n" #
    "  `reserveUsdE8`, `reservePerTtti`, `circulationOutside`, `payouts` (one line\n" #
    "  per reserve token with a non-zero amount: `token`, `amount` paid to the\n" #
    "  holder in base units, `ledgerFee` borne by the creator share (or, when it\n" #
    "  cannot, by the contract balance outside the reserve), `valueUsdE8`,\n" #
    "  `rateUsdE8`), `tttiTransferFee` and `tttiAllowanceRequired` (= `tttiAmount` +\n" #
    "  `tttiTransferFee`). Errors: `#amountTooSmall` (zero, or a payout line would\n" #
    "  not cover its ledger fee), `#amountExceedsCirculation { requested;\n" #
    "  circulation }`, `#reserveEmpty`, `#rateUnavailable(token)`.\n" #
    "- `redeemGuarantee(tttiAmount : Nat, expectedPayoutUsdE8 : Nat)` : returns\n" #
    "  `#ok [Redemption]` (one per reserve token paid) or `#err GuaranteeError`.\n" #
    "  Prerequisites: the caller accepted the wallet terms (any version)\n" #
    "  (`acceptPurchaseAcknowledgements`), and called `icrc2_approve` on the TTTI-T\n" #
    "  ledger with this canister as spender, amount >= `tttiAllowanceRequired`, with\n" #
    "  an `expires_at`. TTTI-T are pulled from the caller's default account and the\n" #
    "  payouts are sent to it. Refused with `#acknowledgementRequired` (terms not\n" #
    "  accepted), `#slippage { expectedPayoutUsdE8;\n" #
    "  payoutUsdE8 }` when the payout is lower than `expectedPayoutUsdE8` (pass the\n" #
    "  quote's `payoutUsdE8`, or 0 to accept any amount), and with the quote errors,\n" #
    "  `#salesPaused`, `#redemptionInProgress` (one redemption at a time per caller),\n" #
    "  `#ledgerFeeNotCovered { token; fee }` (neither the creator share nor the\n" #
    "  contract balance held outside the reserve can bear the ledger fee; it is\n" #
    "  never taken from the holder's payout), `#tttiBalanceInsufficient`,\n" #
    "  `#allowanceInsufficient`,\n" #
    "  `#pullFailed(text)` (nothing recorded, may be requested again) or\n" #
    "  `#callFailed(text)`. In one synchronous step before the first await, the\n" #
    "  payouts are reserved, the reserve accounts debited, the TTTI-T pulled and\n" #
    "  the payouts recorded (memo `TTTI-GR-<n>`, `created_at_time`, request), so the\n" #
    "  holder never holds both the TTTI-T and the payout. Each payout is then sent\n" #
    "  from the contract's custody. A successful send (Ok or `#Duplicate`) completes\n" #
    "  the redemption (`#completed`, block set). A ledger Err or an unknown outcome\n" #
    "  leaves it `#inProgress`: a 10-minute timer resends the same attempt\n" #
    "  identically for 23 hours, creates the next attempt (memo `TTTI-GR-<n>-<m>`,\n" #
    "  new `created_at_time`) after a known Err, and shows the payout under review\n" #
    "  (`#needsReview`) after 23 hours of unknown outcome. A `Redemption` record is\n" #
    "  `{ id; owner; account; token; tttiAmount; tttiPullBlock; rateUsdE8;\n" #
    "  thirdPartyFee; netAmount; createdAt; payout; status }`. The returned records\n" #
    "  show the outcome at the time of the reply; `tttiAmount` and `tttiPullBlock`\n" #
    "  are set on the first record, the other records carry `tttiAmount = 0`,\n" #
    "  `netAmount` is the amount paid to the holder in the token's base units and\n" #
    "  `thirdPartyFee` the ledger fee borne by the creator share.\n" #
    "- `listMyRedemptions()` (query, signed-in) : the caller's redemptions, newest\n" #
    "  first, with status, amounts, `tttiPullBlock` and the payout attempt\n" #
    "  (`outcome`, `sends`, `lastError`).\n" #
    "- `convertLegacyGuarantees()` : ADMIN ONLY (trap `Unauthorized: admin only`).\n" #
    "  Kept for compatibility: the reserve is held in the paid token (ICP and ckBTC\n" #
    "  included) and nothing is converted any more. It moves nothing and always\n" #
    "  returns `#err(#nothingToConvert)`. Guarantees already converted to ckUSDC\n" #
    "  stay in place; no balance or block is changed.\n" #
    "- `getGuaranteeAccounts() : [GuaranteeAccountView]` (public query): for each\n" #
    "  token `{ token; accountBalance }`. `accountBalance` is the balance of the\n" #
    "  dedicated reserve account (the common reserve, for every token).\n" #
    "- Admin \"To review\": `listTransfersToReview` includes kind `#GR` rows\n" #
    "  (`purchaseId` = redemption id) for payouts of unknown outcome after 23\n" #
    "  hours. `markTransferArrived(#GR, id, block)` completes the redemption;\n" #
    "  `markTransferNotArrived(#GR, id)` puts it back in progress and the timer\n" #
    "  opens a new attempt.\n" #
    "\n" #
    "Lifecycle: `#inProgress` -> `#completed` (payout block set) or\n" #
    "`#needsReview` -> `#completed` / back to `#inProgress`. Calls return after\n" #
    "the first sends; poll `listMyRedemptions` after a lost reply or while a\n" #
    "redemption is `#inProgress`. Retry safety: `redeemGuarantee` is not\n" #
    "idempotent (each success is a new redemption and pulls TTTI-T again; re-read\n" #
    "`listMyRedemptions` before repeating after an unknown outcome). A resend uses\n" #
    "the attempt's own memo and `created_at_time`, so a duplicate is detected by the\n" #
    "ledger and recorded as arrived. Pause: while sales are paused,\n" #
    "`redeemGuarantee` returns `#salesPaused` before any lock or ledger call and the\n" #
    "automatic payout retry waits; the cycles top-up continues.\n" #
    "Gotchas: the TTTI-T allowance must cover the amount plus the TTTI-T ledger\n" #
    "fee, and the holder must hold at least that balance; the quote and the\n" #
    "redemption use the rates stored at the time, so pass `expectedPayoutUsdE8`\n" #
    "to guard against a move between the two calls; a quote is not a reservation.\n\n" #

    "## Upgrade readiness (admin)\n\n" #
    "- `getUpgradeReadiness() : UpgradeReadiness` (admin query; others trap\n" #
    "  `Unauthorized: admin only`): `{ salesPaused; purchasesInFlightCount;\n" #
    "  purchasesInFlight : [Principal]; btcLockHeld (the BTC finalization uses\n" #
    "  the same purchase lock, true when it is not empty); redemptionsInFlightCount;\n" #
    "  redemptionsInFlight : [Text] (guarantee redemption lock keys); reserveLockBusy;\n" #
    "  pendingTopUp : ?TopUpAttempt (stored cycles top-up attempt);\n" #
    "  openTraceCount; openTraces : [PurchaseTrace]; reserved (current\n" #
    "  sale.reserved, TTTI-T base units); lastReconciliation;\n" #
    "  protocolFeeLocks : [Text] (DEX lot 4 locks held: `DC-<n>`, `DL-<principal>`,\n" #
    "  `WEEKLY`); dcSendsInFlight : [Nat] (DC sends in progress, by `n`);\n" #
    "  bonusClaimsInFlight : [Nat] (DL claims in progress, by `n`) }`. In-flight\n" #
    "  sets and locks\n" #
    "  are transient and empty right after an upgrade; DC/DL sends in progress\n" #
    "  are stored and resent by the retry timer. Before an upgrade, pause\n" #
    "  sales and wait until the counts are 0, `reserveLockBusy` is false and\n" #
    "  the three lot 4 lists are empty.\n" #
    "- `reconcileReserved() : Result<ReservedReconciliation, ReconcileError>`\n" #
    "  (admin): sets `sale.reserved` to 0 and records `{ previousReserved;\n" #
    "  reconciledAt (ns); by }` as the last reconciliation and in the history,\n" #
    "  so the previous value stays visible. Refusals, nothing changed:\n" #
    "  `#notAdmin`, `#notPaused` (sales not paused), `#purchaseInFlight`\n" #
    "  (a purchase or BTC finalization holds the lock), `#openTraces` (open\n" #
    "  purchase traces). A repeat records a new entry with `previousReserved` 0.\n\n" #
    "## Other endpoints\n\n" #
    "- `exportBalanceSnapshot() : { exportedAt; totalSupply; decimals; holders }`\n" #
    "  (admin query; trap `Unauthorized: only admins can manage the TTTI-T sale`).\n" #
    "  Each holder is `{ account; balance; deliveryAddress; needsMigration; kind\n" #
    "  (#holder/#feeCollector) }`; zero balances are excluded.\n" #
    "- Data intelligence (OQL): `schema()` and `execute(qJson)` expose four\n" #
    "  tables. `conversion` (primary key `id`; columns id, depositor,\n" #
    "  recipientOwner, payToken, payAmount, feeAmount, netAmount, feeBps,\n" #
    "  icpAmount, tttiAmount, status, timestamp, priceUsdE8, usedFallback,\n" #
    "  minted, fromCollector, forward, message, paymentBlock, mintBlock).\n" #
    "  `btcDepositTracking` (primary key `key` = \"<principal>:<kind>\"; columns\n" #
    "  key, principal, kind, btcAddress, stage, depositCount, btcDetectedSats,\n" #
    "  ckbtcMintedSats, ckbtcPendingSats, tttiDelivered, refundedSats (sums over\n" #
    "  all deposit entries), createdAt, lastCheckedAt, errorKind, errorMessage,\n" #
    "  conversionCause (newest recorded cause text), causePermanent (any entry)).\n" #
    "  `addressBookContact` (primary key `id`; columns id, owner, nickname,\n" #
    "  principal, memoBytes, createdAt, updatedAt).\n" #
    "  `redemption` (primary key `id`; columns id, owner, token, tttiAmount,\n" #
    "  tttiPullBlock, rateUsdE8, thirdPartyFee, netAmount, createdAt, status\n" #
    "  (inProgress, needsReview, completed, failed)). `redemption` is read by\n" #
    "  controllers, app admins and the signed-in owner of each row; one row per\n" #
    "  reserve token paid. The public\n" #
    "  table `guaranteeAccount` (primary key `symbol`; columns symbol,\n" #
    "  accountBalance) exposes the balance of each reserve account, that\n" #
    "  is the reserve held in the paid token (ICP, ckBTC, ckUSDC or ckUSDT), without\n" #
    "  conversion; `getReserveView` gives the\n" #
    "  invariant and shortfall.\n" #
    "  `reservedReconciliation` (primary key `reconciledAt`; columns\n" #
    "  reconciledAt, previousReserved, by) and `cyclesTopUpAttempt` (primary key\n" #
    "  `createdAtTime`; at most one row, the stored top-up attempt; columns\n" #
    "  createdAtTime, memo, amount, fee, toOwner, blockIndex, createdAt, sends,\n" #
    "  lastError, outcome, needsReview): controllers and app admins only.\n" #
    "  DEX lot 4 tables. Controllers and app admins only: `cyclesSample` (key\n" #
    "  `at`; cyclesBalance, toppedUpCycles), `cyclesShareChange` (key `at`;\n" #
    "  oldShareBps, newShareBps, autonomyDays), `weeklyAllocation` (key `id`;\n" #
    "  at, autonomyDays, treasury*/stockCap*/liquidity*/waiting* per token,\n" #
    "  toCyclesReserveE8s, surplusE8s, toBonusE8s, poolAddCount, skippedCount,\n" #
    "  note), `mintTreasuryBalance` (key `token`; balance cached at the last\n" #
    "  weekly run, lastRunAt), `dcBatch` (key `id`; at, trigger, legCount,\n" #
    "  convertedLegs, toCyclesE8s, toBonusE8s, status, block), `dcSend` (key\n" #
    "  `n`; batchId (0 = weekly send), token, toOwner, amount, fee, attempt,\n" #
    "  memo, createdAtTime, sends, lastError, outcome, status, block),\n" #
    "  `lpBonusDistribution` (key `id`; at, source fees|treasury, totalE8s,\n" #
    "  totalWeight, positions), `protocolFeeBucket` (key `poolId`; cycles0/1,\n" #
    "  bonus0/1, recycle0/1). Owner (signed-in) or app admin: `lpBonusClaim`\n" #
    "  (key `n`; owner, amountE8s, createdAt, attempt, memo, createdAtTime,\n" #
    "  sends, lastError, outcome, status, block) and `lpBonusBalance` (key\n" #
    "  `owner`; claimableE8s, claimedE8s). Public: `protocolLiquidity` (key\n" #
    "  `poolId`; shares, fromFees0/1, fromTreasury0/1, lastAddedAt) and\n" #
    "  `poolPriceSample` (key `<poolId>/<at>`; poolId, at, reserve0, reserve1)\n" #
    "  and `consolidatedPriceSample` (key `at`; at, priceUsdE8).\n" #
    "  Mint revenue routing tables, controllers and app admins only:\n" #
    "  `receivingWallet` (key `token`; token, owner, accountText, setAt, setBy),\n" #
    "  `walletChange` (key `id`; token, oldAccountText (null = first\n" #
    "  configuration), newOwner, newAccountText, at, by), `revenueSettlement`\n" #
    "  (key `token`; status pendingWallet|sending|sent|failed|toReview,\n" #
    "  destinationText, legCount, ownerAmount, feeAmount, startedAt,\n" #
    "  completedAt, lastError) and `feeMove` (key `n`; token, purpose\n" #
    "  mintFee|settlement:feePending|settlement:feeLegacy, conversionId, amount,\n" #
    "  fee, attempt, memo, createdAtTime, sends, lastError, outcome, status,\n" #
    "  block, createdAt, updatedAt). Other tables are listed in their sections.\n" #
    "  Variants appear as their tag text, null optional values as null. Only\n" #
    "  canister controllers and app admins read conversion and BTC tracking\n" #
    "  rows. Address book rows are read only by their signed-in owner (and\n" #
    "  canister controllers); app admins do not see them. Any other\n" #
    "  signed-in caller sees no rows and anonymous callers are refused. No other\n" #
    "  app data is exposed.\n\n" #
    "## DEX pair registry (lot 1)\n\n" #
    "Purpose: a registry of v2 constant-product pools and of public pair\n" #
    "requests. This lot creates no liquidity, no LP shares and no swaps. The\n" #
    "protocol places no price-linked order and creates no TTTI-T; permanent\n" #
    "liquidity is injected at the pool ratio without any price condition (see\n" #
    "Permanent liquidity).\n\n" #
    "Units and encodings: amounts are token base units (TTTI-T in e8s, so\n" #
    "50_000 = 0.0005 TTTI-T and 10_000 = 0.0001 TTTI-T); fees are basis points\n" #
    "(`FeeTier` `#bps5` = 5, `#bps30` = 30, `#bps100` = 100); timestamps are\n" #
    "Int nanoseconds since the epoch. Pool accounts are `{ owner = this\n" #
    "canister; subaccount }` where the subaccount is the 32-byte ASCII text\n" #
    "`DEX-POOL-` followed by the pool id zero-padded to 23 digits (pool 1 =\n" #
    "`DEX-POOL-00000000000000000000001`). Request deposits are held in one\n" #
    "subaccount of this canister per token, on that token's ledger (32 ASCII\n" #
    "bytes, listed in `getDexConfig().requestDepositAccounts`): ICP, ckBTC,\n" #
    "ckUSDC and ckUSDT for new requests; `DEX-REQUEST-DEPOSIT-TTTI-T-00001`\n" #
    "on the TTTI-T ledger for earlier requests. `#internal` token ledger = this canister's\n" #
    "TTTI-T ledger; `#external(p)` = ledger canister p.\n\n" #
    "Authentication and authorization: queries are open to everyone,\n" #
    "anonymous included. `requestPair` needs a signed-in caller; anonymous\n" #
    "callers get `#anonymous`. `approvePair`, `refusePair`, `removePair`,\n" #
    "`cancelPairRemoval` and `setUtilityPairMinimums` are admin-only and return `#notAuthorized` to\n" #
    "any other caller, with nothing changed. The caller principal is the one\n" #
    "derived against the app's Internet Identity derivation origin (see\n" #
    "above); a principal derived elsewhere is a different requester.\n\n" #
    "Queries:\n" #
    "- `listDexPools() : [PoolView]`, `getDexPool(poolId) : ?PoolView`. A\n" #
    "  `PoolView` carries tokens (ledgerId, symbol, decimals, isTttiT), feeTier,\n" #
    "  feeBps, kind (`#tttiPair` / `#utilityPair`), status\n" #
    "  (`#filling` / `#active` / `#removed`; a stored lifecycle label only: swap\n" #
    "  opening is decided by `swapState`, never by this label), subaccount and\n" #
    "  subaccountText, poolAccount, minimumLocked (per token, null = not set),\n" #
    "  firstDepositMinimum (no longer enforced: 0 once the minimum is set, null\n" #
    "  otherwise; kept for compatibility), minimumsSet,\n" #
    "  lockedSharesStatement (\"The minimum locked shares √(A×B) belong to\n" #
    "  the contract forever.\"), newPairBadgeUntil / newPairBadgeActive (30\n" #
    "  days after approval), approvalStatement (\"Approval of a pair is not a\n" #
    "  recommendation.\", only on pools created from a request), requestId,\n" #
    "  removedAt and the flags acceptsSwaps (= swapState.open), acceptsDeposits\n" #
    "  (false when the pool is removed, when minimums are not set, or while a\n" #
    "  pair removal is announced or executing; `addLiquidity` then refuses with\n" #
    "  `#removalAnnounced`) and acceptsWithdrawals (stays true: voluntary\n" #
    "  withdrawals remain allowed, subject to position locks `unlockAt`).\n" #
    "  DEX-2 fields, all public and computed\n" #
    "  at read time: `depth { usdE8 : ?Nat; basis : #twiceNonTttiSide |\n" #
    "  #sumOfSides; missingRate { token0; token1 } }`, `swapThresholdUsdE8`\n" #
    "  (1_000_000_000 = 10 USD, swaps only), `thresholdBasis`\n" #
    "  (`#tttiSideAtPoolPrice` for TTTI-T pairs, `#sumOfSides` for utility\n" #
    "  pairs), `thresholdMeasuredUsdE8 : ?Nat` (the current value compared with\n" #
    "  the threshold; null when a rate is missing or expired),\n" #
    "  `swapState { open; reason }` with reason\n" #
    "  `#open`, `#belowThreshold { depthUsdE8; thresholdUsdE8 }` (depthUsdE8 =\n" #
    "  the threshold measure, not the displayed depth),\n" #
    "  `#rateUnavailable`, `#removalAnnounced { effectiveAt }`,\n" #
    "  `#removalExecuting` or `#removed`, and `removal` (`#none`, `#announced`,\n" #
    "  `#cancelled`, `#executing`, `#completed`, each with reason, announcedAt\n" #
    "  and effectiveAt, plus cancelledAt / startedAt / completedAt). The old\n" #
    "  `launchMinimumTotalUsdE8` field is kept for compatibility and is always 0:\n" #
    "  there is no USD threshold at the first deposit.\n" #
    "- The 7 starting pools (ids 1-7, fee tier `#bps30`, status\n" #
    "  `#filling`): TTTI-T/ICP, TTTI-T/ckBTC, TTTI-T/ckUSDC,\n" #
    "  TTTI-T/ckUSDT (TTTI-T pairs, TTTI-T side minimum 10_000) and ckBTC/ICP,\n" #
    "  ckUSDC/ICP, ckUSDT/ICP (utility pairs; minimums null until the admin sets\n" #
    "  them with `setUtilityPairMinimums`).\n" #
    "- `getDexConfig() : DexConfig`: requestDeposit (50_000 = 0.0005 TTTI-T,\n" #
    "  the value the deposit stands for), depositAccount (the TTTI-T account\n" #
    "  of earlier requests), requestDepositUsdE8 (500_000_000 = 5 USD, which is\n" #
    "  0.0005 TTTI-T at the mint price of 10,000 USD), requestDepositAccounts\n" #
    "  (one account per paid token),\n" #
    "  maxPendingPerUser (2), refusalCooldownNs (7 days), messageMaxChars and\n" #
    "  reasonMaxChars (280), newPairBadgeNs (30 days), tttiMinimumLocked\n" #
    "  (10_000), firstDepositMultiplier (0: no longer enforced, kept for\n" #
    "  compatibility), feeTiers and the three statements,\n" #
    "  plus: usdRateScale (100_000_000: USD values are USD x 1e8, like the\n" #
    "  stored usdE8 rates), rateValidForNs (1 hour), rateGraceNs (5 minutes),\n" #
    "  minLockNs (3 months = 7_862_400_000_000_000 ns; 0 = no lock is also\n" #
    "  accepted), maxLockNs (5 years = 157_766_400_000_000_000 ns),\n" #
    "  relayDivisor (3), lockedFeeSharePercent (50),\n" #
    "  swapThresholdUsdE8 (1_000_000_000), defaultSlippageBps (50),\n" #
    "  referenceToleranceBps (200), removalNoticeNs (5 days) and\n" #
    "  launchDepthStatement. launchMinimumTotalUsdE8 and tttiTUsdE8 are\n" #
    "  deprecated and always 0 (TTTI-T has no fixed USD value). All are\n" #
    "  computed constants, not stored state.\n" #
    "- `listPairRequests() : [PairRequestView]` (all requests, ascending id)\n" #
    "  and `getMyPairRequests()` (the caller's). Each view shows the token\n" #
    "  metadata read from its ledger, the counter token, fee tier, message,\n" #
    "  checks `{ icrc1; icrc2; metadataRead; pairUnique; copiedSymbolOf }`,\n" #
    "  copiedSymbol (true when the symbol copies a known token: flagged, not\n" #
    "  rejected), depositToken (the token the deposit was paid in: ICP, ckBTC,\n" #
    "  ckUSDC or ckUSDT; TTTI-T for requests made before the deposit moved to\n" #
    "  accepted tokens), depositAmount and depositBlock (in that token), status\n" #
    "  and refundBlock.\n\n" #
    "Request lifecycle: `#pending` -> `#approved { poolId; at }` or\n" #
    "`#refused { reason; at }` (the reason is public). Both are final.\n\n" #
    "- `requestPair({ ledgerId; counter; feeTier; message; payToken }) :\n" #
    "  Result<PairRequestView, RequestPairError>`. `counter` is `#icp`,\n" #
    "  `#ckbtc`, `#ckusdc`, `#ckusdt`, `#tttiT` or `#poolToken(ledger)` (a\n" #
    "  token of a non-removed pool). `payToken` is `#icp`, `#ckbtc`, `#ckusdc`\n" #
    "  or `#ckusdt`; `#tttiT` is refused with `#payTokenNotAccepted(text)`. The\n" #
    "  deposit is the value of 0.0005 TTTI-T at the mint price, 5 USD, converted\n" #
    "  at the current hourly rate of that token and rounded up to base units.\n" #
    "  Before calling, the caller must `icrc2_approve` this canister on the\n" #
    "  ledger of `payToken` for at least the deposit plus one transfer fee of\n" #
    "  that token; the `depositAmount` of the answer is the amount taken. Checks,\n" #
    "  in order, all before any deposit is taken: anonymous, pay token, message length, pending\n" #
    "  limit (2), refusal cooldown (7 days after the caller's last refusal),\n" #
    "  ledger validity, counter token, pair uniqueness (same two ledgers in\n" #
    "  either order with the same fee tier, among pools and non-refused\n" #
    "  requests), ICRC-1 and ICRC-2 in `icrc1_supported_standards` (or\n" #
    "  `icrc10_supported_standards`), metadata (name, symbol, decimals, fee);\n" #
    "  limits and uniqueness are checked again after the ledger reads, under a\n" #
    "  lock per caller and per requested ledger, together with the rate (absent\n" #
    "  or expired: `#rateUnavailable(text)`, nothing taken). Then the deposit is\n" #
    "  taken with icrc2 transfer_from (memo `TTTI-PQ-<request number>`) into the\n" #
    "  request deposit account of `payToken` and the request is recorded\n" #
    "  `#pending` with the token, amount and block. Errors:\n" #
    "  `#anonymous`, `#messageTooLong { max }`, `#tooManyPending { max }`,\n" #
    "  `#cooldown { until }`, `#invalidToken(text)` (TTTI-T itself, anonymous\n" #
    "  or same ledger on both sides), `#unknownCounterToken`,\n" #
    "  `#pairExists { poolId; requestId }`, `#ledgerUnreachable(text)`,\n" #
    "  `#missingStandards { icrc1; icrc2 }`, `#metadataUnavailable(text)`,\n" #
    "  `#insufficientAllowance { allowance; required }`,\n" #
    "  `#insufficientFunds { balance }`, `#depositFailed(text)`,\n" #
    "  `#payTokenNotAccepted(text)`, `#rateUnavailable(text)` and\n" #
    "  `#requestInProgress` (another request of the caller, or for the same\n" #
    "  ledger, is being recorded). Retry safety:\n" #
    "  not idempotent. Every error leaves nothing taken and nothing recorded,\n" #
    "  so it can be retried; a successful call followed by a repeat returns\n" #
    "  `#pairExists` (the pending request) instead of a second deposit.\n" #
    "- `approvePair(requestId, minimums : ?{ token0; token1 }) :\n" #
    "  Result<PoolView, ApprovePairError>` (admin). TTTI-T pairs take null\n" #
    "  (TTTI-T side minimum 10_000; TTTI-T is token0); utility pairs require\n" #
    "  both minimums > 0 (token0 = the requested token, token1 = the counter\n" #
    "  token). The pool is created `#filling` with the new-pair\n" #
    "  badge for 30 days and the request becomes `#approved` with\n" #
    "  refundStatus `#inProgress`. Then the deposit minus one transfer fee of\n" #
    "  the token it was paid in (TTTI-T for earlier requests) is refunded (DQ,\n" #
    "  see lot 2) from the request deposit account of that token to the\n" #
    "  requester's default account; approval and the pool do not depend on the\n" #
    "  refund outcome. Errors: `#notAuthorized`, `#requestNotFound`,\n" #
    "  `#notPending`, `#minimumsRequired`, `#minimumsNotAllowed`,\n" #
    "  `#invalidMinimums`, `#pairExists { poolId }`. Retry safety: a repeat\n" #
    "  after success returns `#notPending`; no second refund or pool.\n" #
    "- `refusePair(requestId, reason) : Result<PairRequestView,\n" #
    "  RefusePairError>` (admin): the deposit stays in the deposit\n" #
    "  subaccount as protocol TTTI-T stock, the reason is public and the\n" #
    "  requester's cooldown starts. Errors: `#notAuthorized`,\n" #
    "  `#requestNotFound`, `#notPending`, `#reasonRequired`,\n" #
    "  `#reasonTooLong { max }`.\n" #
    "- `removePair(poolId, reason : Text) : Result<PoolView, RemovePairError>`\n" #
    "  (admin). It no longer removes a pair at once: it publicly announces the\n" #
    "  removal with the admin's reason (trimmed, 1 to 280 characters) and an\n" #
    "  effective date `announcedAt + 5 days`. From the announcement swaps and\n" #
    "  liquidity adds are suspended in that pool; voluntary `removeLiquidity`\n" #
    "  stays allowed subject to each position's lock. Errors: `#notAuthorized`,\n" #
    "  `#poolNotFound`, `#alreadyRemoved`, `#alreadyAnnounced { effectiveAt }`,\n" #
    "  `#reasonEmpty`, `#reasonTooLong { maximumChars }`. Retry safety: a repeat\n" #
    "  returns `#alreadyAnnounced`; the date and reason do not change.\n" #
    "- `cancelPairRemoval(poolId) : Result<PoolView, CancelRemovalError>` (admin).\n" #
    "  Cancels an announced removal before its effective date; the pool resumes\n" #
    "  normally and the cancellation stays visible in `removal` (`#cancelled`).\n" #
    "  Errors: `#notAuthorized`, `#poolNotFound`, `#noAnnouncement`,\n" #
    "  `#alreadyCancelled`, `#alreadyExecuting`, `#alreadyCompleted`. Retry\n" #
    "  safety: a repeat returns `#alreadyCancelled`.\n" #
    "- Effective date: at `effectiveAt` the 10-minute retry timer liquidates every\n" #
    "  remaining position of the pool, locked or not (shares burned, reserves\n" #
    "  debited, the owner credited once), and sends both tokens to each owner's\n" #
    "  wallet (the owner principal's default account on each ledger) as\n" #
    "  liquidation payouts (LQ, memo `TTTI-LQ-<n>`, `created_at_time` set, retry\n" #
    "  rules of lib/retry.mo: Ok or `#Duplicate` = sent; a known Err opens a new\n" #
    "  attempt; an unknown outcome is resent identically for 23 h). A payout\n" #
    "  that still fails goes to the admin \"To review\" list as kind `LQ` with\n" #
    "  `conversionId` = the pool id and `depositIndex` = the position id (the\n" #
    "  review record has no pool or position field). When no position remains\n" #
    "  the pool becomes `#removed` (`removedAt` set, `removal` = `#completed`).\n" #
    "  At finishRemoval of a TTTI-T pair, the reserves of the contract-held\n" #
    "  shares (permanent liquidity) are reinjected with injectPermanent into the\n" #
    "  least liquid TTTI-T pool, right after the removal finishes (the router run\n" #
    "  is the retry path), with a line in the public permanent liquidity log\n" #
    "  (`listPermanentLiquidityLog`). They never go to a wallet and never stay\n" #
    "  locked in the removed pool.\n" #
    "  Nothing runs while the DEX is paused; the work resumes afterwards and\n" #
    "  after an upgrade. No admin function shortens or cancels a lock.\n" #
    "- `getReferencePrice(poolId) : ?ReferencePrice` (public query): see the\n" #
    "  reference price rule below. `refreshReferenceSources() : Nat` (admin\n" #
    "  update; others trap `Unauthorized: only an admin can refresh the\n" #
    "  reference sources`): reads the ICPSwap TTTI-T pairs now and returns how\n" #
    "  many were readable. The same read runs from a timer at least hourly. It\n" #
    "  only reads; it places no order and creates no TTTI-T.\n" #
    "- `getReferenceReadings() : [ReferenceReadingEntry]` (admin query; others\n" #
    "  trap `Unauthorized: only an admin can read the reference readings`): the\n" #
    "  last ICPSwap reading of each pair (ICP, ckBTC, ckUSDC, ckUSDT, in that\n" #
    "  order). `#notReadYet { counter }` until a refresh has run; otherwise\n" #
    "  `#read { counter; poolCanister : ?Principal; readAt : Int (ns); outcome }`\n" #
    "  where `outcome` is `#ok { counterPerTttiE8; method : #spot | #quote }`\n" #
    "  (counter whole tokens x 1e8 per whole TTTI-T) or `#failed { step; detail :\n" #
    "  ?Text }` with `step` one of `#poolLookup`, `#metadata`, `#spotPrice`,\n" #
    "  `#quote`, `#reserve`. Every refresh updates every pair, also when a call\n" #
    "  rejects or traps; a failed reading keeps the previous price sample. The\n" #
    "  readings are also queryable through OQL as `dexReferenceReading`\n" #
    "  (controller only).\n" #
    "- Consolidated TTTI-T price and pool spread (PTM-5). Public queries, no\n" #
    "  sign-in; the identity is only read by `getMyPoolSpreadAlerts`. All\n" #
    "  amounts are USD x 1e8 (`priceUsdE8`: USD per one whole TTTI-T) and all\n" #
    "  spreads are signed basis points (10_000 = 100 %); timestamps are\n" #
    "  nanoseconds (Int). Nothing is stored by these calls and they are safe to\n" #
    "  repeat or poll (the price changes with the reserves and the hourly\n" #
    "  rates; polling about once a minute is enough).\n" #
    "  `getConsolidatedTttiPrice() : ConsolidatedPrice { computedAt; price :\n" #
    "  #available(Nat) | #unavailable(#noOpenPool | #noValidRate);\n" #
    "  hourlyAverageUsdE8 : ?Nat; hourlySamples; dailyAverageUsdE8 : ?Nat;\n" #
    "  dailySamples; sources }`. The price is the average of the USD prices of\n" #
    "  all open native TTTI-T pools (ICP, ckBTC, ckUSDC, ckUSDT), weighted by\n" #
    "  their depth. A pool USD price comes from its reserves (counter-token\n" #
    "  reserve x current oracle rate / TTTI-T reserve); depth is 2 x the USD\n" #
    "  value of the counter side. An empty pool, a pool not open for swaps\n" #
    "  (below the 10 USD swap-opening threshold, removal announced or executing) and a pool whose\n" #
    "  rate is absent or expired are left out. `sources` lists the pools used\n" #
    "  (poolId, counterSymbol, priceUsdE8, depthUsdE8, weightBps summing to\n" #
    "  10_000). With no usable pool the price is `#unavailable` (`#noOpenPool`\n" #
    "  or `#noValidRate`) and no price is invented. The averages are the mean\n" #
    "  of the 5-minute consolidated samples of the last hour and of the last\n" #
    "  24 h, with their sample counts; null while no sample is in the window\n" #
    "  (no sample is taken while the price is unavailable; samples older than\n" #
    "  24 h are dropped). Every reader of a TTTI-T price in the protocol (the\n" #
    "  rebalance swap guard of the permanent liquidity, the valuation of TTTI-T\n" #
    "  in ICP) uses the consolidated hourly average; without it they wait. The\n" #
    "  guard accepts the consolidated hourly average only when the samples of\n" #
    "  the last hour reach back at least 30 minutes (oldest sample at least 30\n" #
    "  minutes old), the same rule as the pool average used by `referenceOut`;\n" #
    "  before that it treats the price as absent and waits. The\n" #
    "  `hourlyAverageUsdE8` field of `getConsolidatedTttiPrice` is shown as soon\n" #
    "  as one sample is in the hour, without that coverage requirement.\n" #
    "  `getPoolSpreads() : PoolSpreadReport { computedAt;\n" #
    "  consolidatedPriceUsdE8 : ?Nat; thresholdBps = 200; pools }`: for each\n" #
    "  native TTTI-T pool (removed pools excluded) `PoolSpread { poolId;\n" #
    "  counterSymbol; status : #ok | #empty | #notOpen | #noRate |\n" #
    "  #noIndependentReference | #noConsolidatedPrice (no longer produced);\n" #
    "  priceUsdE8 : ?Nat; referencePriceUsdE8 : ?Nat; spreadBps : ?Int;\n" #
    "  exceedsThreshold }`. The spread of a pool is measured against an\n" #
    "  independent reference: the consolidated price of the OTHER open native\n" #
    "  TTTI-T pools (leave-one-out, depth-weighted, current oracle rates), given\n" #
    "  as `referencePriceUsdE8`, so the pool never sets its own reference.\n" #
    "  spreadBps = (pool price - reference) x 10_000 / reference, rounded toward\n" #
    "  zero; negative = the pool is cheaper. With no other open pool the status\n" #
    "  is `#noIndependentReference`, spreadBps and referencePriceUsdE8 are null\n" #
    "  and exceedsThreshold is false: this is not a spread of 0 bps. spreadBps is\n" #
    "  null unless status is `#ok`. exceedsThreshold is true when |spreadBps| is\n" #
    "  strictly above 200. The `consolidatedPriceUsdE8` of the report and\n" #
    "  `getConsolidatedTttiPrice` stay the global consolidated price, unchanged.\n" #
    "  `PoolView.spread : ?PoolSpread` (in `listDexPools`, `getDexPool` and every\n" #
    "  returned PoolView) carries the same value as `getPoolSpreads`; it is null\n" #
    "  for utility pairs and removed pools.\n" #
    "  `getMyPoolSpreadAlerts() : [PoolSpreadAlert { poolId; counterSymbol;\n" #
    "  positionIds; spreadBps; poolPriceUsdE8; consolidatedPriceUsdE8;\n" #
    "  thresholdBps; computedAt }]`: the native TTTI-T pools where the caller\n" #
    "  holds a liquidity position and whose independent spread exceeds 200 bps\n" #
    "  now (`consolidatedPriceUsdE8` of an alert is the independent reference of\n" #
    "  that pool; no alert is raised without an independent reference). The\n" #
    "  caller is the signed-in principal (derived from the Internet Identity\n" #
    "  delegation); an anonymous caller gets an empty array. The alert is\n" #
    "  computed on each call and stored nowhere, so it disappears once the\n" #
    "  spread is back to 200 bps or less. No call here can trap on its own.\n" #
    "- `getPoolCapRatio() : PoolCapRatioView` (query, no sign-in; computed on\n" #
    "  each call, the call stores nothing; the mint and the auction settlement read m from it).\n" #
    "  `PoolCapRatioView { computedAt : Int (ns); poolsValueUsdE8 : ?Nat;\n" #
    "  poolCount : Nat; circulatingTttiT : Nat; consolidatedPriceUsdE8 : ?Nat;\n" #
    "  capitalisationReferenceUsdE8 : Nat; capitalisationReference : #targetPrice;\n" #
    "  capitalisationUsdE8 : ?Nat; currentRatio : ?Nat; averageRatio24h : ?Nat;\n" #
    "  samples : Nat; retainedRatio : ?Nat; targetRatio : Nat; lockedShare :\n" #
    "  Nat; ratioScale : Nat; lockedShareScale : Nat }`. Units: amounts in USD\n" #
    "  x 1e8; `circulatingTttiT` in base units (8 decimals); ratios are fixed\n" #
    "  point with `ratioScale` = 10^12 (10^12 = 100 %; `targetRatio` =\n" #
    "  500_000_000_000 = 50 %); `lockedShare` (m) has `lockedShareScale` =\n" #
    "  10^6 (10^6 = 100 %, so 500_000 = 50 %). Pools value: for each native\n" #
    "  TTTI-T pool that is not removed and holds a counterpart reserve (ICP,\n" #
    "  ckBTC, ckUSDC or ckUSDT), 2 x the counterpart reserve at the oracle\n" #
    "  rate of that token, summed; every share counts (free, locked and\n" #
    "  permanent liquidity are all in the reserves). `poolsValueUsdE8` is null\n" #
    "  when a needed rate is absent or expired (no fallback rate); `poolCount`\n" #
    "  counts the pools used. Capitalisation: circulating TTTI-T (total\n" #
    "  supply minus the TTTI-T the contract keeps for auctions) x the target\n" #
    "  price of 10_000 USD per TTTI-T (`capitalisationReferenceUsdE8` =\n" #
    "  10_000 x 10^8, `capitalisationReference` = `#targetPrice`), a reference\n" #
    "  that does not depend on the pool reserves. The pools value uses oracle\n" #
    "  rates of the counterpart tokens only, so neither side of the ratio is\n" #
    "  derived from a price set by the same reserves. `consolidatedPriceUsdE8`\n" #
    "  is shown for information and is not used in the ratio.\n" #
    "  `currentRatio` = pools value / capitalisation (exact integer arithmetic,\n" #
    "  rounded down), null when either is unavailable or the capitalisation is\n" #
    "  zero. Sampling: the 5-minute price sampling timer (`recordPriceSamples`)\n" #
    "  appends one ratio sample when the ratio is available and drops samples\n" #
    "  older than 24 h; `averageRatio24h` is their mean (null without sample)\n" #
    "  and `samples` their number. `retainedRatio` is the lower of\n" #
    "  `currentRatio` and `averageRatio24h` (the current ratio alone without\n" #
    "  sample; null without a current ratio). Locked share m = 50 % x (50 % -\n" #
    "  retainedRatio) / 50 %, clamped between 0 and 50 % and rounded upward at\n" #
    "  1e-6: 50 %, 30 %, 10 % and 0 % at a ratio of 0 %, 20 %, 40 % and 50 %\n" #
    "  or more. m is 50 % without circulating TTTI-T, without any pool, and\n" #
    "  when the pools value, the capitalisation or the retained ratio is\n" #
    "  unavailable. The samples are also queryable as the public OQL entity\n" #
    "  `poolCapRatioSample` (key, at, ratio).\n" #
    "- `setUtilityPairMinimums(poolId, { token0; token1 }) : Result<PoolView,\n" #
    "  SetMinimumsError>` (admin, utility pairs before any liquidity: refused\n" #
    "  with `#liquidityAlreadyAdded` once totalShares > 0 or the pool is open). Errors:\n" #
    "  `#notAuthorized`, `#poolNotFound`, `#notUtilityPair`, `#poolRemoved`,\n" #
    "  `#liquidityAlreadyAdded`, `#invalidMinimums` (a zero minimum).\n\n" #
    "Reference price and first deposit (DEX-2). There is no minimum and no USD\n" #
    "threshold on pool creation, first deposit, adding or removing liquidity,\n" #
    "buying or the mint (the 10 USD threshold applies to swaps only); every\n" #
    "deposit grows the pool capitalisation. The first deposit receives\n" #
    "sqrt(A x B) shares, of which the minimum locked shares stay with the\n" #
    "contract, never more than half of them. The first deposit into an empty pool\n" #
    "must have its ratio (amount1 per amount0) within 2 % (200 bps) of the\n" #
    "pool's reference ratio, otherwise `addLiquidity` returns\n" #
    "`#referenceOutOfBand { deviationBps; toleranceBps; expected }` and nothing\n" #
    "changes.\n" #
    "- ICPSwap reading rule: the price of a pair is the spot price from the\n" #
    "  pool's `sqrtPriceX96` ((sqrtPriceX96 / 2^96)^2, converted with the token\n" #
    "  order and decimals of the pair). When `sqrtPriceX96` is absent or\n" #
    "  unusable, the price is a quote on 1 % of the pool's TTTI-T reserve (never\n" #
    "  below 100 e8s) with the pool fee added back. There is no fixed probe\n" #
    "  amount. The counter-side reserve still gives the depth.\n" #
    "- TTTI-T pairs: the reference TTTI-T price is the average, weighted by\n" #
    "  depth, of the TTTI-T prices of the ICPSwap TTTI-T pairs last read (at most\n" #
    "  6 hours old) plus the already open native TTTI-T pools other than this one,\n" #
    "  each converted to USD at the hourly rate. `getReferencePrice(poolId)`\n" #
    "  shows publicly `tttiPriceUsdE8`, the expected ratio, `toleranceBps` and\n" #
    "  every source (kind `#icpswap` or `#native`, label, tttiPriceUsdE8,\n" #
    "  depthUsdE8 = 2 x the USD value of the non-TTTI-T side, weightBps summing\n" #
    "  to 10_000, readAt). With no readable source the first deposit is refused\n" #
    "  with `#referenceUnavailable(#noReadableSource)`.\n" #
    "- Utility pairs: the reference ratio is the ratio of the two hourly rates\n" #
    "  (no sources).\n" #
    "- An absent or expired hourly rate refuses the first deposit with\n" #
    "  `#referenceUnavailable(#rateUnavailable { token0; token1 })`. Hourly rates\n" #
    "  are valid 1 hour after the fetch plus 5 minutes of grace.\n\n" #
    "Depth and swap opening (DEX-2). Depth is measured at the pool's own price\n" #
    "from the current reserves: TTTI-T pairs = 2 x the USD value of the\n" #
    "non-TTTI-T side (TTTI-T is never counted at a fixed USD value); utility\n" #
    "pairs = the sum of both sides at the hourly rates. A side's USD value is\n" #
    "amount x usdE8 / 10^decimals, rounded down. This displayed depth is\n" #
    "unchanged. The 10 USD swap-opening threshold (`swapThresholdUsdE8`) uses\n" #
    "its own measure (`thresholdBasis`, `thresholdMeasuredUsdE8`): TTTI-T pairs =\n" #
    "10 USD of TTTI-T, i.e. the TTTI-T side valued at the pool price, which\n" #
    "equals the counterpart reserve at the oracle rate (half the displayed\n" #
    "depth); utility pairs = 10 USD of total depth (sum of both sides). A swap is\n" #
    "accepted only when that measure is at least 10 USD, the rate is\n" #
    "valid and the pool is neither removed nor in removal. The check runs at\n" #
    "every call: a pool below the threshold is refused with a clear message and\n" #
    "reopens as soon as the threshold is reached, and an active pool whose measure\n" #
    "falls back below it is closed again. A missing or expired rate refuses the\n" #
    "swap (`#rateUnavailable`). Adding liquidity is suspended while a pair\n" #
    "removal is announced or executing; voluntary withdrawals stay allowed,\n" #
    "subject to position locks.\n\n" #
    "Gotchas: a removed pool still reports acceptsWithdrawals = true, but each\n" #
    "position's unlockAt still applies (a pair removal pays the owners itself);\n" #
    "approval is not a recommendation; the copied-symbol flag does not block a request;\n" #
    "the protocol places no price-linked order and creates no TTTI-T; permanent\n" #
    "liquidity is injected at the pool ratio without any price condition (see\n" #
    "Permanent liquidity).\n" #
    "OQL tables `dexPool` (primary key `id`) and `dexPairRequest` (primary key\n" #
    "`id`; columns include status, reason, poolId, decidedAt, copiedSymbolOf)\n" #
    "are read by controllers and app admins; requesters read their own\n" #
    "request rows.\n\n" #
    "## DEX deposits, internal balances and withdrawals (lot 2)\n\n" #
    "Supported tokens: exactly TTTI-T (this canister's ledger), ICP, ckBTC,\n" #
    "ckUSDC, ckUSDT (`DexToken` `#tttiT`, `#icp`, `#ckbtc`, `#ckusdc`,\n" #
    "`#ckusdt`). Amounts are each token's smallest units (TTTI-T, ICP and\n" #
    "ckBTC 8 decimals; ckUSDC and ckUSDT 6). Timestamps (`createdAtTimeNs`)\n" #
    "are Nat64 nanoseconds since the epoch.\n\n" #
    "Deposit subaccount: each principal has one DEX deposit account `{ owner =\n" #
    "this canister; subaccount }` on every token's ledger. The 32-byte\n" #
    "subaccount is derived without any secret, so anyone can recompute it:\n" #
    "byte 0 = 0xDD, byte 1 = length of the principal's bytes, then the\n" #
    "principal's bytes, zero-padded to 32. The 0xDD tag differs from every\n" #
    "other subaccount of this canister and from the ASCII `DEX-POOL-<id>` and\n" #
    "`DEX-REQUEST-DEPOSIT-...` subaccounts. Deposits stay on the chain in that\n" #
    "account and are publicly visible.\n\n" #
    "Internal balances: per principal and token, `available` (usable) and\n" #
    "`reserved` (a withdrawal in flight). Balances and transfers are public:\n" #
    "liquidity positions are public and linked to the identifier on TTTI.\n" #
    "What is public for a position: the principal, the shares, the amounts, the\n" #
    "lock and the unlock date.\n\n" #
    "Queries (open to everyone, anonymous included):\n" #
    "- `getDexTokens() : [DexTokenInfo]`: token, symbol, ledgerId, decimals,\n" #
    "  fee (ledger fee), minimumDeposit and minimumWithdrawal (fee + 1).\n" #
    "- `getDexDepositAccount(owner) : DexAccount` for any principal.\n" #
    "- `getDexPoolAccount(poolId) : ?DexAccount` (null for an unknown pool).\n" #
    "- `getDexBalances(owner) : [DexBalanceView]`: one row per token (zero\n" #
    "  when nothing is held).\n" #
    "- `getDexTransfers(owner) : [DexTransferView]`: deposits and withdrawals,\n" #
    "  newest first, with n, direction, amount, ledgerAmount, fee, from, to,\n" #
    "  memoText, createdAtTimeNs, attempt, sends, status (`#inProgress`,\n" #
    "  `#needsReview`, `#completed(block)`, `#failed(text)`) and lastError.\n" #
    "  Not paged: kept for the existing frontend; prefer the paged query below.\n" #
    "- `getDexTransfersPage(owner, cursor : ?Nat, limit : Nat) :\n" #
    "  Page<DexTransferView>` (PTM-9f query, open to everyone, anonymous\n" #
    "  included): the same deposits and withdrawals as `getDexTransfers`\n" #
    "  (auction bid deposits left out), newest first, `{ items; nextCursor : ?Nat }`.\n" #
    "  The cursor is the transfer number `n`, global and unique across deposits\n" #
    "  and withdrawals: `cursor = null` returns the newest `limit` transfers,\n" #
    "  `cursor = ?c` those with `n` strictly below `c`. `limit` 0 means 50 and any\n" #
    "  `limit` above 100 is cut to 100. `nextCursor` is the `n` of the last returned\n" #
    "  transfer while older ones remain and null on the last page: pass it back\n" #
    "  unchanged. Each transfer appears exactly once across the pages, also when\n" #
    "  new ones are created between two calls. A query: no state change, safe to\n" #
    "  repeat.\n\n" #
    "Updates (signed-in caller; anonymous gets `#anonymous`):\n" #
    "- `depositToDex({ token; amount }) : Result<DexTransferView,\n" #
    "  DexDepositError>` (DD). First `icrc2_approve` this canister on the\n" #
    "  token's ledger for amount + one ledger fee. The canister calls\n" #
    "  `icrc2_transfer_from` from the caller's default account into the\n" #
    "  caller's deposit account with memo `TTTI-DD-<n>` (global n) and\n" #
    "  created_at_time set; the attempt is recorded before the call. Ok or\n" #
    "  `#Duplicate` credits `available` exactly once (`#completed(block)`); a\n" #
    "  ledger Err credits nothing. Errors: `#amountTooSmall { minimum }` (zero\n" #
    "  or not above the fee, no ledger call), `#transferInProgress`,\n" #
    "  `#insufficientAllowance { allowance; required }`,\n" #
    "  `#insufficientFunds { balance }`, `#ledgerError(text)`. An unreachable\n" #
    "  ledger returns `#ok` with status `#inProgress` (outcome unknown).\n" #
    "- `withdrawFromDex({ token; amount }) : Result<DexTransferView,\n" #
    "  DexWithdrawError>` (DW). Only the caller's own balance, always to the\n" #
    "  caller's default account, whatever the pool status. `amount` is reserved\n" #
    "  first; the ledger receives amount - fee with memo `TTTI-DW-<n>` and\n" #
    "  created_at_time set. Ok or `#Duplicate` is the final debit; a ledger Err\n" #
    "  gives the balance back. Errors (no ledger call): `#amountTooSmall\n" #
    "  { minimum }` (not above the fee), `#insufficientBalance { available }`,\n" #
    "  `#transferInProgress`; after the call `#ledgerError(text)`.\n" #
    "- One deposit or withdrawal in flight per principal and token; the lock\n" #
    "  is released on every exit.\n\n" #
    "Pair deposit refund (DQ): `approvePair` refunds the deposit minus one\n" #
    "ledger fee of the token it was paid in (ICP, ckBTC, ckUSDC or ckUSDT;\n" #
    "TTTI-T for requests made when the deposit was 50_000 TTTI-T) from the\n" #
    "request deposit account of that token with memo `TTTI-DQ-<n>`\n" #
    "(n = the pair request number, i.e. the PairRequest id, never the global\n" #
    "transfer counter) and created_at_time, under one lock per request. The request's refundStatus\n" #
    "is `#none` (refused or pending), `#inProgress`, `#needsReview` or\n" #
    "`#refunded(block)` (refundBlock filled). Never refunded twice.\n\n" #
    "Retry and dedup: ledgers deduplicate on (memo, created_at_time). An\n" #
    "unknown outcome (rejected call) is resent identically by a 10-minute\n" #
    "timer (re-armed on every install and upgrade) for 23 h, then becomes\n" #
    "`#needsReview`. A DQ ledger Err opens a new attempt (`TTTI-DQ-<n>-<m>`,\n" #
    "n = the pair request number, m = attempt number, new created_at_time;\n" #
    "attempts already recorded keep their memo). Admin \"To review\" (`listTransfersToReview`) lists\n" #
    "DD, DW and DQ rows (kind `#DD`/`#DW`/`#DQ`; purchaseId = n, or the\n" #
    "pair request number for DQ). `markTransferArrived`: DD credits the balance once,\n" #
    "DW finalizes the debit, DQ marks the request refunded.\n" #
    "`markTransferNotArrived`: DD becomes `#failed` with no credit, DW gives\n" #
    "the balance back, DQ opens a new attempt sent by the timer.\n\n" #
    "Polling: poll `getDexTransfersPage` (first page) and `getDexBalances` every 10-30 s while\n" #
    "a row is `#inProgress`; it changes at most every 10 minutes after an\n" #
    "unknown outcome. Retry safety: a new `depositToDex` or `withdrawFromDex`\n" #
    "call is a new transfer with a new memo; do not repeat a call whose row is\n" #
    "still `#inProgress`. OQL tables `dexBalance` (primary key `key` =\n" #
    "`<principal>/<symbol>`) and `dexTransfer` (primary key `key` = `DD-<n>`,\n" #
    "`DW-<n>` or `DQ-<request id>`; memo, createdAtTime, sends, outcome,\n" #
    "block, status) are public.\n\n" #
    "Refused pair-request deposits: a refused request keeps its deposit, in the\n" #
    "token it was paid in. The 10-minute pass moves it, minus one ledger fee,\n" #
    "from the request deposit account of that token to the DEX custody account\n" #
    "of the token (memo `TTTI-RD-<pair request number>`) and counts it in the\n" #
    "permanent liquidity set-aside of that token, with a public journal line\n" #
    "(`accrued`). The router then rebalances it like the rest of the set-aside\n" #
    "(best route, at most 2 % from the hourly average) and `injectPermanent`\n" #
    "adds it at the pool ratio, with its own journal line. Nothing is added to a\n" #
    "pool on one side only, so a refused deposit never changes the price of any\n" #
    "pool. The move and the set-aside credit are recorded in the same step, so\n" #
    "each refused deposit is counted once; an unknown outcome is resent\n" #
    "identically for 23 h, then waits for review (the amount stays in the request\n" #
    "deposit account and stays owed by the reserve check). Pending requests and\n" #
    "approved requests (deposit refunded) are not touched. A refused request\n" #
    "deposited in TTTI-T (request made in an earlier version) follows the same path: moved from `DEX-REQUEST-DEPOSIT-TTTI-T-00001`\n" #
    "to the TTTI-T custody (a record `PairPayDeposit` with token `#tttiT` is\n" #
    "created when its move starts), counted in the permanent liquidity set-aside\n" #
    "of TTTI-T, rebalanced by the router and injected at the pool ratio. The\n" #
    "protocol creates no TTTI-T and places no price-linked order. TTTI-T deposits\n" #
    "fed before this change stay as history in the OQL table `refusedDepositFeed` (primary key\n" #
    "`requestId`; poolId, amount, fee, block, at; admin only). OQL table\n" #
    "`pairPayDeposit` (primary key `requestId`; token, setAsideAmount, moveSends,\n" #
    "setAsideAt; admin only) lists deposits paid in accepted tokens and their\n" #
    "move to the set-aside; `dexPairRequest` shows depositToken.\n\n" #
    "## DEX liquidity, positions and swaps (lot 3)\n\n" #
    "Units: token amounts, reserves and shares are base units (TTTI-T, ICP,\n" #
    "ckBTC 8 decimals = e8; ckUSDC, ckUSDT 6). USD values are USD x 1e8.\n" #
    "Timestamps (`createdAt`, `unlockAt`, `deadline`, `newUnlockAt`) are Int\n" #
    "nanoseconds since the epoch; durations (`lockDurationNs`) are Nat ns.\n" #
    "Fees, price impact and slippage are basis points (1 bps = 0.01 %).\n\n" #
    "Pool lifecycle: an approved pool starts `#filling` and stays open to\n" #
    "liquidity adds. Swap opening is dynamic and depends only on the threshold\n" #
    "measure (see Depth and swap opening above): measure >= 10 USD, a valid rate and no\n" #
    "removal. The `gauge` (currentUsdE8 = threshold measure, targetUsdE8 = 1_000_000_000,\n" #
    "remainingUsdE8, valueAvailable, missingRate { token0; token1 }) is kept for\n" #
    "display. TTTI-T is never counted at a fixed USD value. `PoolView` adds\n" #
    "reserve0, reserve1, totalShares, lockedShares, protocolFee0, protocolFee1,\n" #
    "`gauge`, `depth`, `guaranteedDepth { lockedPositionShares;\n" #
    "permanentShares; amount0; amount1; depth }` (locked positions, unlockAt >\n" #
    "now, plus the contract-held permanent shares, with the same depth rule; the pool\n" #
    "returned by a swap reads no position: its locked-position shares come from\n" #
    "a per-pool figure refreshed when a position changes and by the daily\n" #
    "pass),\n" #
    "`lockedFeesPaid0` / `lockedFeesPaid1` (cumulative set-aside fees credited to\n" #
    "locked positions), `swapThresholdUsdE8`, `swapState` and `removal`.\n" #
    "`#removed` (after the effective date of an announced removal): no adds or\n" #
    "swaps; the positions have been paid out. No instantaneous pool price is\n" #
    "used as an oracle; the protocol places no price-based order and creates no\n" #
    "TTTI-T.\n\n" #
    "Authentication: queries are open to everyone (anonymous included);\n" #
    "updates need a signed-in caller (anonymous gets `#anonymous`). The owner\n" #
    "of a position or balance is the caller principal derived against the\n" #
    "app's Internet Identity derivation origin (see above). There is no admin\n" #
    "function on other users' positions. All amounts move between internal\n" #
    "DEX balances (lot 2); no ledger transfer happens in these calls.\n\n" #
    "Rounding always favors the pool: counter amounts and fees round up;\n" #
    "minted shares, withdrawals and amountOut round down.\n\n" #
    "- `quoteAddLiquidity({ poolId; side; amount; counterAmount; slippageBps }) :\n" #
    "  Result<AddLiquidityQuote, AddLiquidityError>` (query, no change):\n" #
    "  isFirstDeposit, amount0, amount1, shares, lockedShares, totalSharesAfter,\n" #
    "  gaugeAfter, opensPool, counterSide, counterAmount (the computed amount of\n" #
    "  the other side), slippageBps, depthAfterUsdE8 and referenceCheck (first\n" #
    "  deposit only). Same computation as `addLiquidity`.\n" #
    "- `addLiquidity({ poolId; side; amount; counterAmount; slippageBps;\n" #
    "  lockDurationNs }) : Result<AddLiquidityResult, AddLiquidityError>`.\n" #
    "  `side` and `amount` fix one side; the other side is computed at execution\n" #
    "  at the pool ratio (ceil(amount x reserveOther / reserveSide)), after the\n" #
    "  funds have arrived: any shortfall of either pool token is first pulled\n" #
    "  from the caller's wallet into the internal balance by ICRC-2\n" #
    "  transfer_from (the caller must have approved this canister), then the\n" #
    "  pool ratio is read again. `counterAmount` is the amount the caller\n" #
    "  expects (the quote); the add is refused with `#slippageExceeded {\n" #
    "  expectedCounterAmount; actualCounterAmount; toleranceBps }` when the\n" #
    "  computed amount is outside the tolerance `slippageBps` (null = 50 =\n" #
    "  0.5 %, at most 10_000, else `#invalidSlippage { maximumBps }`). On\n" #
    "  refusal nothing is added and the funds stay in the internal balance,\n" #
    "  where they remain available; likewise any surplus of either side stays\n" #
    "  there (`surplus0`, `surplus1` in the result). First add (totalShares =\n" #
    "  0): `counterAmount` is required and fixes the ratio, which must be\n" #
    "  within 2 % of the reference ratio; there is no minimum amount; it mints\n" #
    "  floor(sqrt(amount0 x amount1)) shares, of\n" #
    "  which lockedShares (the shares holding the minimum locked amounts,\n" #
    "  rounded up, capped at half of the shares created, at least 1 when 2 or\n" #
    "  more shares are created) belong to the contract forever and are never\n" #
    "  withdrawable; the depositor receives the rest, never zero. Later adds: shares =\n" #
    "  min(amount0 x total / reserve0, amount1 x total / reserve1), rounded\n" #
    "  down. Each add creates its own position with an optional lock:\n" #
    "  `lockDurationNs` null or 0 = no lock (free position, withdrawable at any\n" #
    "  time); otherwise at least 3 months (MIN_LOCK_NS = 7_862_400_000_000_000 ns) and at\n" #
    "  most 5 years (157_766_400_000_000_000 ns), else `#lockTooShort {\n" #
    "  minimumNs }` or `#lockTooLong { maximumNs }` before any funds move.\n" #
    "  unlockAt = lockStartedAt + lockDurationNs - relayReceivedNs, with\n" #
    "  lockStartedAt = now. Only the position owner (the caller) commits\n" #
    "  capital with a lock; no admin function opens, extends or shortens a lock\n" #
    "  (the only exception is the pair removal, announced 5 days ahead). The\n" #
    "  result carries `relay { weight; relayWeight; shortenedWeight;\n" #
    "  positionsShortened; positionsFreed }` and the updated `pool`. Relay: a\n" #
    "  lock adds the weight shares x lockDurationNs; one third of it\n" #
    "  (relayWeight) shortens the other locked positions of the same pool in\n" #
    "  proportion to shares x time already served (now - lockStartedAt); each\n" #
    "  reduction = allotted weight / shares, capped at the remaining time, and\n" #
    "  is added to relayReceivedNs. Nobody is lengthened; older and heavier\n" #
    "  positions are relieved most. A relieved or expired position is not\n" #
    "  expelled: it stays in the pool as free liquidity (its shares count pro\n" #
    "  rata like any free share) until its owner withdraws it. Positions made\n" #
    "  by `mintLiquidity` are free.\n" #
    "  isCreator = the caller had the admin role at add time. Suspended from\n" #
    "  the announcement of a pair removal (`#removalAnnounced { effectiveAt }`).\n" #
    "  Errors: `#anonymous`, `#poolNotFound`, `#poolRemoved`,\n" #
    "  `#removalAnnounced`, `#minimumsNotSet`, `#unsupportedToken`,\n" #
    "  `#zeroAmount`, `#counterAmountRequired`, `#insufficientBalance { token;\n" #
    "  available; required }`, `#belowMinimum` (kept in the type, never returned),\n" #
    "  `#slippageExceeded`, `#invalidSlippage`, `#referenceOutOfBand`,\n" #
    "  `#referenceUnavailable`, `#lockTooShort { minimumNs }`, `#lockTooLong {\n" #
    "  maximumNs }`, `#zeroShares`,\n" #
    "  `#operationInProgress`. Retry safety: not idempotent; each success is a\n" #
    "  new position. Errors change no pool state; funds already pulled stay in\n" #
    "  the internal balance and are not pulled twice.\n" #
    "- `removeLiquidity(positionId) : Result<RemoveLiquidityResult,\n" #
    "  RemoveLiquidityError>`. Owner only, at or after unlockAt, in every pool\n" #
    "  state (an announced removal and a removed pool included): the lock of a\n" #
    "  position always applies and no function shortens or cancels it. A\n" #
    "  position without a lock is withdrawable at any time. Burns the\n" #
    "  position's shares and credits shares x reserve / totalShares of each\n" #
    "  token (rounded down) to the owner's `available` balances; the position\n" #
    "  is deleted. Errors: `#anonymous`, `#positionNotFound`,\n" #
    "  `#notPositionOwner`, `#poolNotFound`, `#positionLocked { unlockAt }`,\n" #
    "  `#operationInProgress`. Retry safety: a repeat after success returns\n" #
    "  `#positionNotFound`; never paid twice.\n" #
    "- `extendLock(positionId, newUnlockAt : Int) : Result<ExtendLockResult,\n" #
    "  ExtendLockError>` with `ExtendLockResult { position : PositionView;\n" #
    "  relay : RelayOutcome; pool : PoolView }`. Owner only. In every case the\n" #
    "  remaining time after the extension (newUnlockAt - now) must be between\n" #
    "  3 months and 5 years, as for a new commitment (the only rule is the remaining time); this also applies to a\n" #
    "  short lock that is extended. A locked position (unlockAt > now) also\n" #
    "  needs newUnlockAt >= unlockAt; there is no cap of lockStartedAt + 5 years; it never\n" #
    "  shortens and only the duration added counts. A free or expired position\n" #
    "  is committed anew from now: lockStartedAt = now and\n" #
    "  relayReceivedNs = 0. The added duration times shares is the new weight\n" #
    "  and relieves the other locked positions of the pool as in `addLiquidity`\n" #
    "  (relay is all zero when nothing is added). No automatic extension\n" #
    "  exists. Errors: `#anonymous`, `#positionNotFound`, `#notPositionOwner`,\n" #
    "  `#cannotShortenLock { unlockAt }`, `#lockTooLong { maximumUnlockAt }`,\n" #
    "  `#lockTooShort { minimumNs }`, `#poolNotFound`, `#poolRemoved`,\n" #
    "  `#removalAnnounced { effectiveAt }`, `#operationInProgress`. Retry\n" #
    "  safety: a repeat with the same newUnlockAt on a locked position changes\n" #
    "  nothing (zero added weight, no relay); on a free position the first call\n" #
    "  locks it, so a repeat is the locked case.\n" #
    "- Positions are public: `getDexPosition(positionId) : ?PositionView`,\n" #
    "  `listPoolPositions(poolId)`, `listDexPositionsOf(owner)`. A PositionView\n" #
    "  has id, poolId, owner (principal), shares, amount0, amount1 (pro rata,\n" #
    "  rounded down), token symbols, createdAt, lockDurationNs, unlockAt,\n" #
    "  isCreator, unlocked (now >= unlockAt), withdrawable (= unlocked,\n" #
    "  whatever the pool state), lockStartedAt, remainingNs (0 when unlocked),\n" #
    "  locked (= not unlocked), relayReceivedNs (cumulative time removed by\n" #
    "  the relay) and feesCollected0 / feesCollected1 (set-aside LP fees\n" #
    "  credited to the position, per pool token). The contract-owned\n" #
    "  lockedShares have no position.\n" #
    "  A position is public and linked to the identifier on TTTI: principal,\n" #
    "  shares, amounts, lock and unlock date. Only observed yield is mentioned:\n" #
    "  the fees actually earned by a position, stated as a recorded fact (the\n" #
    "  LP part of each swap fee is shared as described in the swap fees below).\n" #
    "- Daily sharing of the LP fee pots. Queries (no caller needed except the\n" #
    "  last one):\n" #
    "  `getDexPendingPots() : [PendingPotView]` and `getDexPendingPot(poolId) :\n" #
    "  ?PendingPotView` (null when the pool does not exist): poolId, pending0 and\n" #
    "  pending1 (the pot of the next sharing, in the pool's two tokens, base\n" #
    "  units), dayStart, nextSharingAt (ns since epoch) and sharingRunning (true\n" #
    "  while the sharing of the previous pot has slices left).\n" #
    "  `getDexEstimatedShare(positionId) : ?EstimatedShareView` (null when the\n" #
    "  position does not exist) and `getMyDexEstimatedShares() :\n" #
    "  [EstimatedShareView]` (the caller's positions; empty for an anonymous\n" #
    "  caller): positionId, poolId, owner, weight, lockedNs (ns locked so far in\n" #
    "  the current day), dayFractionBps (lockedNs as basis points of one day),\n" #
    "  estimated0 and estimated1 (the share the position would receive if the\n" #
    "  pending pot were shared now; 0 for a free position) and nextSharingAt.\n" #
    "  Rule: once a day the day roll freezes the pending pot of every pool and\n" #
    "  starts its sharing, then each pool is shared in slices of at most 5 000\n" #
    "  positions per message (a first pass sums the products, a second pass\n" #
    "  credits them). The weight of a position is capital (its shares) x\n" #
    "  sqrt(remaining time / 5 years), taken at the start of the day or at the\n" #
    "  start of the lock when the lock begins during the day; a position's\n" #
    "  product is weight x the fraction of the day it was locked, and its share\n" #
    "  is floor(frozen pot x its product / sum of the products of the pool),\n" #
    "  credited to the owner's internal DEX balance in the pool's two tokens and\n" #
    "  added to feesCollected0/1 and to the pool lockedFeesPaid0/1. The total paid\n" #
    "  does not depend on the slice size. A position removed during the day keeps\n" #
    "  its product, and its share is paid to its owner at the next sharing. The\n" #
    "  rounding remainder goes to the pool reserves; when no position was locked\n" #
    "  during the day the whole pot goes to the pool reserves. The pot amounts\n" #
    "  are outside the pool reserves and are counted as owed by the reserve\n" #
    "  checks and the custody sweep. The day roll and the slices are run by a\n" #
    "  canister timer (checked hourly and one minute after every install and\n" #
    "  upgrade; the roll itself happens once a day, at the first check after\n" #
    "  nextSharingAt, which is anchored to the previous boundary). `startDexDayRoll() : DayRollReport`\n" #
    "  (rolled, dayStart, nextSharingAt, poolsStarted) and `runDexPotSlice(poolId)\n" #
    "  : PotSliceReport` (poolId, phase, processed, more, paid0, paid1) are\n" #
    "  callable from outside by an admin only; the first does nothing before\n" #
    "  nextSharingAt, the second does nothing when no sharing runs for the pool,\n" #
    "  so a repeated call has no extra effect. The OQL entities `dexPoolPot` and\n" #
    "  `dexPositionLock` are public; `dexUnpaidShare` (owner and pool) is\n" #
    "  readable only by its owner.\n" #
    "- `quoteSwap(poolId, tokenIn, amountIn, slippageBps) : Result<SwapQuote,\n" #
    "  SwapError>` (query): tokenOut, amountOut, fee, lpFee, protocolFee,\n" #
    "  feeBps, priceImpactBps (versus the reserve ratio, rounded up),\n" #
    "  slippageBps, minimumReceived = floor(amountOut x (10_000 - slippageBps)\n" #
    "  / 10_000) and maxDeadlineNs (now + 5 minutes). slippageBps <= 10_000.\n" #
    "- `swap(poolId, tokenIn, amountIn, minAmountOut, deadline : Int) :\n" #
    "  Result<SwapResult, SwapError>`. Exact input from the caller's internal\n" #
    "  balance, constant product v2: fee = ceil(amountIn x feeBps / 10_000),\n" #
    "  amountOut = floor(reserveOut x net / (reserveIn + net)) with net =\n" #
    "  amountIn - fee. Fee: 30 bps on the 7 starting pairs; added pairs use their\n" #
    "  tier (5, 30 or 100 bps). Of each fee, 70 % (lpFee) is for LPs: half\n" #
    "  (rounded up) stays in the pool reserves, pro rata to shares, free or\n" #
    "  locked alike; the other half (floor(lpFee x 50 / 100)) is added to the\n" #
    "  pending pot of the pool (see Daily sharing of the LP fee pots below).\n" #
    "  A swap no longer reads or changes any position: it only changes the pool\n" #
    "  reserves, the protocol fee and the pending pot. Only fees actually paid\n" #
    "  are shared. The same split applies to\n" #
    "  the LP share of routed (0.1 %) fees, whose unlocked half is credited pro\n" #
    "  rata to shares. 30 % (protocolFee = floor(fee x 30 / 100)) is added to\n" #
    "  protocolFee0 / protocolFee1, kept outside the reserves and not used in\n" #
    "  pricing until it is added as permanent liquidity (see Mint revenue). Refused with no state change when\n" #
    "  amountOut < minAmountOut (`#slippageExceeded { amountOut; minAmountOut\n" #
    "  }`), when now > deadline (`#deadlineExceeded { deadline; now }`) or when\n" #
    "  deadline > now + 5 minutes (`#deadlineTooFar { maximum }`). Other errors:\n" #
    "  `#anonymous`, `#poolNotFound`, `#depthBelowThreshold { depthUsdE8;\n" #
    "  thresholdUsdE8 }` (threshold measure under 10 USD: the swap reopens as soon as the\n" #
    "  threshold is reached), `#rateUnavailable` (a needed hourly rate is absent\n" #
    "  or expired), `#removalInProgress { effectiveAt }` (pair removal announced\n" #
    "  or running), `#poolRemoved`, `#unsupportedToken`, `#tokenNotInPool`,\n" #
    "  `#zeroAmount`,\n" #
    "  `#invalidSlippage { maximumBps }` (quote), `#insufficientBalance {\n" #
    "  available }`, `#insufficientLiquidity`, `#operationInProgress`. Retry\n" #
    "  safety: not idempotent; each success is a new swap, but the deadline\n" #
    "  bounds a late resend to 5 minutes and minAmountOut bounds its price.\n\n" #
    "Concurrency: one operation at a time per position and per owner token;\n" #
    "a concurrent call returns `#operationInProgress`. Polling: re-read\n" #
    "`getDexPool` / `quoteSwap` before each swap; reserves change with every\n" #
    "swap and add. OQL table `dexPool` adds reserve and share columns; table\n" #
    "`dexPosition` (primary key `id`; poolId, owner, shares, createdAt,\n" #
    "lockDurationNs, unlockAt, isCreator, lockStartedAt, relayReceivedNs,\n" #
    "feesCollected0, feesCollected1) is public; `dexPool` also has\n" #
    "lockedFeesPaid0 and lockedFeesPaid1.\n\n" #

    "## Mint revenue: current rule, earlier records (history) and liquidity injections\n\n" #
    "Current rule: 1% of the amount paid on a mint goes to the creator after the\n" #
    "cycles reserve share (see Liquidity mint and Creator fees); the rest forms\n" #
    "the minter's position and the common reserve part. Nothing accumulates in the contract\n" #
    "and no endpoint withdraws mint revenue. The sub-sections below describe the\n" #
    "earlier model of mints made before the liquidity mint (the amount paid was\n" #
    "split into a mint fee, `feeAmount`, and an owner share, `netAmount` = cost -\n" #
    "feeAmount) and the history, balances and endpoints\n" #
    "that remain from it. Both stayed in the paid token (BTC counts as ckBTC).\n" #
    "No TTTI-T was created for pools, no order depended on the TTTI-T price and\n" #
    "nothing was sent to the cycles\n" #
    "reserve. Token keys are \"icp\", \"ckbtc\", \"ckusdc\", \"ckusdt\".\n\n" #
    "### Receiving wallets (admin, one per pay token)\n\n" #
    "- The admin sets one receiving wallet per pay token (#icp, #ckbtc,\n" #
    "  #ckusdc, #ckusdt). BTC mints are ckBTC mints and use the ckBTC wallet.\n" #
    "  No wallet is derived from a login principal.\n" #
    "- `setReceivingWallet(token, account : Account) : Result<ReceivingWalletView,\n" #
    "  TreasuryError>` (admin update): validates and stores the wallet, records\n" #
    "  a wallet change (History filter Destination) and, on the first\n" #
    "  configuration of the token, starts its one-time settlement and sends its\n" #
    "  first legs in the same call. Errors, nothing stored: `#notAdmin`,\n" #
    "  `#anonymousOwner`, `#invalidSubaccount` (not 32 bytes), `#contractAccount`\n" #
    "  (any account of this canister, the fee account included). Retry safety:\n" #
    "  repeating the same call records another wallet change and changes\n" #
    "  nothing else; a later change only affects later sends, never a\n" #
    "  completed settlement or an attempt already recorded.\n" #
    "- `getReceivingWallets() : Result<[ReceivingWalletView], TreasuryError>`\n" #
    "  (admin query): every pay token `{ token; wallet : ?Account (null = not\n" #
    "  configured: mints in this token are refused); accountText : ?Text (ICRC-1\n" #
    "  textual account); setAt : ?Int (ns); setBy : ?Principal }`.\n\n" #
    "### Direct owner send at each mint (earlier model, history)\n\n" #
    "- These sends applied to mints made before the liquidity mint; new mints\n" #
    "  make none. The records and the endpoints below stay readable.\n" #
    "- Every mint path (`convertDeposit`, `convertDepositWith`, BTC purchase\n" #
    "  finalization) first checks the wallet of the paid token. Without one it\n" #
    "  returns `#receivingWalletNotConfigured { token }` before any ledger call:\n" #
    "  no funds taken, no reservation, no trace. A BTC deposit refused this way\n" #
    "  keeps its ckBTC in the deposit subaccount (`errorKind`\n" #
    "  `#receivingWalletNotConfigured`) and is converted by a later check once\n" #
    "  the ckBTC wallet exists.\n" #
    "- After delivery, the owner share `net` is recorded as an owner send (OW,\n" #
    "  source `#mint(conversionId)`, memo `TTTI-OW-<n>`, `created_at_time` set)\n" #
    "  before the first await and sent at once from the default account to the\n" #
    "  wallet: the wallet receives `net - ledger fee` (a share not above the\n" #
    "  ledger fee is not sent). Lib/retry.mo rules: Ok or `#Duplicate` =\n" #
    "  `#sent(block)`; a known Err opens a new attempt; an unknown outcome is\n" #
    "  resent identically by the 10-minute retry timer for 23 h, then goes to\n" #
    "  To review as `#OW`. The buyer's credit is never undone by these sends.\n" #
    "- Nothing accumulates in the contract: there is no withdraw endpoint\n" #
    "  (`withdrawTreasury` and `getTreasuryBalances` were removed).\n\n" #
    "### Dedicated mint fee account (legacy, never withdrawable)\n\n" #
    "- In the earlier model, the mint fee of each mint, minus the ledger fee, was moved from the\n" #
    "  default account to `{ owner = <this canister>; subaccount = <fixed\n" #
    "  32-byte fee subaccount> }` on the paid token's ledger (FeeMove, memo\n" #
    "  `TTTI-ST-<n>`, same retry rules, To review as `#ST`) and the moved amount\n" #
    "  is redistributed by the established rule (half A to the LPs of the\n" #
    "  least liquid TTTI-T pair of that token, half B set aside for permanent\n" #
    "  liquidity; see below). No endpoint, admin included, can withdraw it.\n" #
    "- `getMintFeeAccount() : Result<FeeAccountView, TreasuryError>` (admin\n" #
    "  update call, it reads the ledgers): `{ owner; subaccountHex; accountText;\n" #
    "  tokens : [{ token; balance : ?Nat (null = read failed); received (sent\n" #
    "  moves); setAside; redistributedToLps; injected }]; readAt }`. Read-only.\n\n" #
    "### One-time settlement (per token)\n\n" #
    "- Starts when the token's wallet is first configured (then continued by a\n" #
    "  10-minute settlement timer, lock `SETTLEMENT`, re-armed on every install\n" #
    "  and upgrade, waiting while sales are paused). Legs, each recorded before\n" #
    "  its send: `#ownerAccumulated` (earlier accumulated owner shares in the\n" #
    "  default account, counter cleared) and `#ownerMintTreasury` (legacy\n" #
    "  MINT-TREASURY balance minus unsettled withdrawals and minus its fee part)\n" #
    "  go to the wallet as OW sends with source `#settlement`; `#feePending`\n" #
    "  (set-aside and unclaimed LP mint-fee amounts) and `#feeLegacy` (fee part\n" #
    "  of the legacy MINT-TREASURY) go to the fee account as ST moves. Each\n" #
    "  leg's ledger fee is deducted from it (for `#feePending`, from the\n" #
    "  set-aside amount); a leg not above the ledger fee is not sent. LP\n" #
    "  credits are unchanged. A completed settlement is never sent again, even\n" #
    "  after a wallet change.\n" #
    "- `getSettlementStatus() : Result<[TokenSettlementView], TreasuryError>`\n" #
    "  (admin query): per token `{ token; status (#pendingWallet | #sending |\n" #
    "  #sent([blocks]) | #failed(text) | #toReview); destination; ownerAmount;\n" #
    "  feeAmount; legs : [{ purpose; amount; destination; status; block;\n" #
    "  memoText }]; startedAt; completedAt; lastError }`. Poll at most every\n" #
    "  30 s; it changes when a leg is sent or at the 10-minute pass.\n\n" #
    "### Revenue history reads (admin)\n\n" #
    "- `listOwnerSends(offset, limit) : { items; total; offset }` (admin query,\n" #
    "  newest first, limit capped at 100): every OW send. Item: `{ id; token;\n" #
    "  amount; fee; destination; source (#mint(conversionId) | #accumulated |\n" #
    "  #treasurySweep | #withdrawal { by; from } | #settlement { from });\n" #
    "  status (#pending | #sent(block) | #needsReview | #failed(text)); block;\n" #
    "  memoText; createdAtTimeNs : nat64; attempt; sends; lastError; createdAt;\n" #
    "  updatedAt }`.\n" #
    "- `listTreasuryWithdrawals(offset, limit)` (admin query, newest first,\n" #
    "  limit capped at 100): earlier admin withdrawals (history; no new entry).\n" #
    "- `getOwnerAccumulated() : [{ token; amount }]` (admin query): amounts\n" #
    "  still counted as accumulated (0 once settled).\n" #
    "- `getTreasurySweepStatus() : TreasurySweepView` (admin query): record of\n" #
    "  the earlier one-time sweep (history; it no longer starts).\n" #
    "- Owner sends and fee moves wait while sales are paused.\n\n" #
    "### Unified admin history\n\n" #
    "- `listAdminHistory(filter, token : ?HistoryToken, offset, limit) :\n" #
    "  Result<HistoryPage, HistoryError>` (admin query; `#err(#notAdmin)`\n" #
    "  otherwise). `filter`: `#all | #mintDeposit | #revenueSent | #refund |\n" #
    "  #redemption | #swap | #liquidity | #destination`; `token`: `#icp | #ckbtc |\n" #
    "  #ckusdc | #ckusdt | #tttiT` or null for every token. Rows are newest\n" #
    "  first; `limit` 0 means 25 and is capped at 100; page with `offset`.\n" #
    "  Page: `{ items; total (rows matching the filter); offset; limit }`. Row:\n" #
    "  `{ id (\"<prefix>-<id>\", unique across kinds; prefixes CV, RF, BD, BR,\n" #
    "  OW, GR, RS, LP, IN, RD, ST, WC, DH); kind; token; amount (base units);\n" #
    "  counterparty : ?Text; status; memo; block; timestamp (ns); detail }`.\n" #
    "  Swap rows are routed swaps only (native pool swaps have no per-swap\n" #
    "  record); liquidity removals have no stored record. Built from stored\n" #
    "  records at each call; read-only and safe to poll.\n\n" #

    "### Earlier mint fee: LP balances and set-aside amounts\n\n" #
    "- The mint fee routing no longer runs for new mints. Existing LP claimable\n" #
    "  balances, claims and set-aside amounts stay readable, and balances stay\n" #
    "  claimable. The routing below describes how that history was produced.\n" #
    "- The fee (minus the paid ledger's fee when it was moved first, as for\n" #
    "  BTC mints) is routed at delivery, in the paid token, to the TTTI-T pair\n" #
    "  of that token with the lowest USD liquidity: half A (floor(fee / 2)) to\n" #
    "  that pair's LP positions pro rata to their shares (to the set-aside\n" #
    "  amount when the pair has no LP, rounding remainders included), half B\n" #
    "  to the set-aside amount. The routing is accounting on the amount moved\n" #
    "  into the mint fee account (above).\n" #
    "- `getMyMintFees() : { balances : [{ token; claimable; claimed }]; claims :\n" #
    "  [{ n; token; amount; createdAt; memoText; status }] }` (query; anonymous\n" #
    "  gets empty lists).\n" #
    "- `claimMintFee(token) : #ok(MintFeeClaimView) | #err(ClaimMintFeeError)`\n" #
    "  (signed caller): claims the whole claimable balance of `token`; the\n" #
    "  caller receives amount - ledger fee at `{ owner = caller; subaccount =\n" #
    "  null }` on that token's ledger, memo `TTTI-MF-<n>`, `created_at_time`\n" #
    "  set, recorded before the first await. Errors: `#anonymous`,\n" #
    "  `#nothingToClaim`, `#belowLedgerFee { fee }`, `#claimInProgress` (one of\n" #
    "  the caller's claims of that token is in progress or to review). Unknown\n" #
    "  outcome: identical resend for 23 h, then To review (`#MF`); a known\n" #
    "  ledger Err returns the amount to the claimable balance. Retry safety: a\n" #
    "  repeat after success returns `#nothingToClaim`.\n" #
    "- `getSetAsideAmounts() : [SetAsideView]` (public query): `{ token; amount;\n" #
    "  valueUsdE8 : ?Nat (null = rate missing or expired); thresholdUsdE8\n" #
    "  (1_000_000_000 = 10 USD = 0.001 TTTI-T); totalReceived; totalInjected;\n" #
    "  lastInjectionAt; targetPoolId }`.\n\n" #
    "### Liquidity injections\n\n" #
    "- A 10-minute timer checks each set-aside amount. When it is worth at\n" #
    "  least 10 USD (0.001 TTTI-T) at a valid stored rate, 50 % is swapped into\n" #
    "  TTTI-T with bounded slippage (at most 100 bps below the quote) and the\n" #
    "  TTTI-T is paired with the other 50 % as permanent locked liquidity\n" #
    "  (contract-held shares, no position, never withdrawable) in the native\n" #
    "  TTTI-T pair. Venue: ICPSwap while the native pair is not open (TTTI-T\n" #
    "  withdrawn to subaccount \"DEX-INJECTION-TTTI-T-00000000001\"), else the\n" #
    "  native pool. A missing or expired rate means waiting; never conditioned\n" #
    "  on the TTTI-T price; one pass at a time.\n" #
    "- `listLiquidityInjections(offset, limit) : { items; total; offset }`\n" #
    "  (public query, newest first, limit capped at 100). Item: `{ id; token;\n" #
    "  poolId; amountIn; swapAmountIn; pairAmountIn; venue (#icpswap(pool) |\n" #
    "  #native(poolId)); minTttiOut; tttiReceived; liquidityShares; used0;\n" #
    "  used1; status (#swapping | #addingLiquidity | #completed | #needsReview\n" #
    "  | #failed(text)); error; startedAt; updatedAt }`. An injection\n" #
    "  interrupted by an upgrade becomes `#needsReview` with its amounts kept.\n\n" #
    "### Native swap fees\n\n" #
    "- 70 % of each native swap fee stays in the reserves for LPs; 30 % is the\n" #
    "  protocol share, split two thirds to the creator (credited to the creator\n" #
    "  holdings, see Creator fees) and one third to permanent liquidity (set\n" #
    "  aside per token and injected into the least liquid TTTI-T pool as\n" #
    "  contract-locked shares, see Permanent liquidity). Nothing is recycled\n" #
    "  into the same pool and nothing goes to cycles.\n" #
    "  `getProtocolLiquidity()` (public) shows the protocol-owned shares.\n\n" #
    "### Admin data, polling and gotchas\n\n" #
    "- `getUpgradeReadiness` adds `ownerSendsInFlight : [Nat]` (pending OW ids,\n" #
    "  every source), `revenueSendsInFlight : [Nat]` (pending OW ids with\n" #
    "  source `#mint` or `#settlement`), `settlementsInFlight : [Text]` (token\n" #
    "  keys whose settlement is `#sending`),\n" #
    "  `sweepStatus`, `mintFeeClaimsInFlight : [Nat]` (claims `#inProgress`) and\n" #
    "  `injectionsInFlight : [Nat]` (`#swapping` / `#addingLiquidity`). Before\n" #
    "  an upgrade wait until these lists are empty.\n" #
    "- OQL tables: `ownerSend` (settlement and legacy withdrawals included),\n" #
    "  `treasurySweep`, `receivingWallet`, `walletChange`, `revenueSettlement`,\n" #
    "  `feeMove`, `mintFeeRouting`, `routerRedirect` (admin only); `mintFeeBalance`, `mintFeeClaim` (owner\n" #
    "  or admin); `setAsideAmount`, `liquidityInjection` (public).\n" #
    "- Poll `getMyMintFees`, `listOwnerSends` and `getSetAsideAmounts` every\n" #
    "  10-30 s at most; they change at most every 10 minutes after a mint.\n" #
    "- Timers re-armed on every install and upgrade: retries (FW / SH / RF / OW\n" #
    "  / SR / ST) every 10 minutes, the settlement pass every 10 minutes, DL /\n" #
    "  MF retries, refused-deposit set-aside, pool fee splits and injections every 10\n" #
    "  minutes, price\n" #
    "  samples every 5 minutes.\n" #
    "- A wrong \"Not arrived\" on OW, ST or MF sends again: check the ledger for\n" #
    "  the memo first.\n" #
    "- Configure every receiving wallet before opening mints in that token:\n" #
    "  until then the mint is refused with `#receivingWalletNotConfigured`.\n\n" #
    "## DEX lot 4 history: DC, cycles share and weekly allocation (read-only)\n\n" #
    "DC batches, the dynamic cycles share, the DL bonus credited from swap\n" #
    "fees and the weekly allocation no longer run since the mint revenue\n" #
    "correction. Their records stay readable as history; bonuses already\n" #
    "earned stay claimable with `claimLpBonus`; ICP held for cycles stays\n" #
    "recorded. The descriptions below describe how that history was produced.\n" #
    "All constants below are fixed in the code; no endpoint changes them. The\n" #
    "protocol places no price-linked order and creates no TTTI-T, and permanent\n" #
    "liquidity is injected at the pool ratio without any price condition (see\n" #
    "Permanent liquidity). Figures are observed values only;\n" #
    "no yield projection is computed.\n\n" #
    "### Cycles autonomy (admin)\n\n" #
    "- Samples: the 6-hour cycles timer records `{ at; cyclesBalance;\n" #
    "  toppedUpCycles }` (also after each top-up). Consumption between two\n" #
    "  samples = previous balance + toppedUpCycles - balance. Samples are kept\n" #
    "  31 days (at most 500); an average needs a span of at least 6 hours.\n" #
    "- Autonomy (days) = (cycles balance + reserve ICP converted at the CMC\n" #
    "  rate) / max(7-day average, 30-day average) cycles per day. Null while no\n" #
    "  average exists. Target: 90 days.\n" #
    "- `getCyclesAutonomy() : AutonomyView` (admin; trap `Unauthorized: only the\n" #
    "  administrator can read the cycles autonomy`): computedAt, cyclesBalance,\n" #
    "  reserveBalanceE8s, reserveCyclesEstimate : ?Nat, totalCycles,\n" #
    "  avg7dCyclesPerDay : ?Nat, avg30dCyclesPerDay : ?Nat, autonomyDays : ?Nat,\n" #
    "  targetDays (90), sampleCount, oldestSampleAt : ?Int.\n" #
    "- Cycles share (history; swap fees no longer feed the cycles reserve; basis\n" #
    "  points of the former pool protocol share):\n" #
    "  between 500 (5 %) and 4000 (40 %); 4000 below 45 days of autonomy, 500\n" #
    "  above 180 days, linear in between. Adjusted at most once a day, by at\n" #
    "  most 1000 bps (10 percentage points) per adjustment; starts at 4000.\n" #
    "  `getCyclesShare() : CyclesShareView` (admin, same trap): shareBps,\n" #
    "  targetShareBps, minShareBps, maxShareBps, lowAutonomyDays,\n" #
    "  highAutonomyDays, maxStepBps, minAdjustIntervalNs, lastAdjustAt,\n" #
    "  nextAdjustAfter, autonomyDays. `getCyclesShareHistory() : [ShareChange]`\n" #
    "  (admin, same trap; newest first): `{ at; oldShareBps; newShareBps;\n" #
    "  autonomyDays }`.\n\n" #
    "### Split of the protocol share of each swap fee (history)\n\n" #
    "Until PTM-4, swaps kept the protocol share of each fee in\n" #
    "pool.protocolFee0/1 (lot 3). Every hour the\n" #
    "DC check moves them into per-pool buckets, in this order: 1) recycling\n" #
    "= ceil(amount x 10 %) (fixed, in favour of the pool); 2) cycles =\n" #
    "min(rest, floor(amount x cyclesShareBps / 10_000)); 3) bonus = the rest,\n" #
    "TTTI-T pairs only (utility pairs: cycles = rest, no bonus). Recycle\n" #
    "buckets are added as protocol liquidity at the pool ratio; the part beyond\n" #
    "the ratio waits in the bucket.\n\n" #
    "### DC batches (fee conversion to ICP)\n\n" #
    "- A batch runs when 1 day has passed since the last one (`#daily`) or when\n" #
    "  the ICP-equivalent waiting reaches 1 ICP (100_000_000 e8s,\n" #
    "  `#threshold`); checked every hour. Non-ICP cycles/bonus amounts are\n" #
    "  converted fee-free in the app's own pool with ICP. Reference price: the\n" #
    "  average of the pool reserve samples (taken every 5 minutes) of the last\n" #
    "  60 minutes, covering at least 30 minutes; no conversion before that.\n" #
    "- 2 % rule: a leg whose execution output deviates more than 200 bps from\n" #
    "  the reference output is not converted and waits for the next batch\n" #
    "  (status `#waitingPriceDeviation`).\n" #
    "- Every conversion moves on the ledgers (memo `TTTI-DC-<n>`): a fee token\n" #
    "  from another pool is sent from its `DEX-POOL-<id>` subaccount into the\n" #
    "  converting ICP pool subaccount (minus that ledger's fee), and the ICP\n" #
    "  output minus the 10_000 e8s ledger fee is sent from the converting pool\n" #
    "  subaccount to the protocol fee account `{ owner = <this canister>;\n" #
    "  subaccount = \"DEX-PROTOCOL-FEES-ICP-0000000001\" }`; ICP fees go there\n" #
    "  directly. Pool reserves change only by what enters or leaves their\n" #
    "  subaccount. When a leg arrives, its bonus ICP is credited to the DL bonus\n" #
    "  and its cycles ICP was held in the protocol fee account and later sent\n" #
    "  on (memo `TTTI-DC-<n>`); this no longer happens. Legs that get a known ledger Err get a new attempt from\n" #
    "  the retry timer. A cycles send that gets a known ledger Err is closed\n" #
    "  (`#failed`) and its ICP stays held for the next batch; a weekly send\n" #
    "  (batchId 0) gets a new attempt from the retry timer.\n" #
    "- `listDcBatches() : [DcBatch]` (admin; trap `Unauthorized: only admins can\n" #
    "  read the DC batches`; newest first): `{ id; at; trigger (#daily |\n" #
    "  #threshold); legs : [{ poolId; tokenSymbol; amountIn;\n" #
    "  referenceIcpOutE8s; executionIcpOutE8s; deviationBps; converted }];\n" #
    "  toCyclesE8s; toBonusE8s; status (#nothingToConvert |\n" #
    "  #waitingPriceDeviation | #sending | #sent(block) | #needsReview |\n" #
    "  #failed(reason)) }`.\n\n" #
    "### DL bonus of locked LPs (TTTI-T pairs)\n\n" #
    "- Eligible: locked positions of TTTI-T pairs. Weight = position value in\n" #
    "  ICP e8s (average price) x min(remaining lock, 5 years) / 5 years. Each\n" #
    "  credit is split by weight, rounded down; the remainder stays\n" #
    "  undistributed and is added to the next credit.\n" #
    "- `getMyLpBonus() : LpBonusView` (query; anonymous gets an all-zero view):\n" #
    "  `{ claimableE8s; claimedE8s; positions : [{ positionId; poolId;\n" #
    "  valueIcpE8s; remainingLockNs; weight }]; claims : [{ n; amountE8s;\n" #
    "  createdAt; memoText; status }] }`. Observed amounts only.\n" #
    "- `claimLpBonus() : ClaimBonusResult` (signed caller): claims the whole\n" #
    "  claimable amount; the caller receives it minus the 10_000 e8s ICP fee at\n" #
    "  `{ owner = caller; subaccount = null }`, memo `TTTI-DL-<n>`, from the\n" #
    "  protocol fee account. Minimum claim: 2 x ICP fee = 20_000 e8s. Errors:\n" #
    "  `#anonymous`, `#nothingToClaim`, `#belowMinimum { minimumE8s }`,\n" #
    "  `#claimInProgress` (a claim of the caller is in progress or to review).\n" #
    "  The claim is recorded before the first await; an unknown outcome is\n" #
    "  resent identically for 23 h, then goes to To review; a known ledger Err\n" #
    "  returns the amount to the claimable bonus. Retry safety: a repeated call\n" #
    "  while one is open returns `#claimInProgress`; after success\n" #
    "  `#nothingToClaim`.\n\n" #
    "### Protocol liquidity (locked forever)\n\n" #
    "- Recycled fees and weekly treasury amounts are added at the pool ratio,\n" #
    "  with no swap, never into an empty or not yet open pool. Shares rounded\n" #
    "  down, amounts used rounded up. The shares count in pool.totalShares with\n" #
    "  no position and have no withdrawal path.\n" #
    "- `getProtocolLiquidity() : [ProtocolLiquidityView]` (public query): `{\n" #
    "  poolId; token0Symbol; token1Symbol; shares; totalShares; amount0;\n" #
    "  amount1 (current pro-rata share of the reserves); fromFees0; fromFees1;\n" #
    "  fromTreasury0; fromTreasury1; lastAddedAt : ?Int }`.\n\n" #
    "### Weekly allocation of the mint treasuries (admin read, history)\n\n" #
    "- Checked daily, runs at most once per 7 days. It reads the live mint\n" #
    "  treasury balances, the autonomy, cycles per day = max(7-day, 30-day\n" #
    "  average) and the live CMC rate (else the last known estimate).\n" #
    "- Rules: the accumulated stock at the first run is paid out at most 1/12\n" #
    "  per week. Below 90 days of autonomy, treasury ICP was first set for\n" #
    "  cycles (memo TTTI-DC); this no longer runs. ICP beyond about 100 days is surplus:\n" #
    "  50 % to the DL bonus, 50 % fixed protocol liquidity at the pool ratio\n" #
    "  with no swap, preferably in the utility pairs (ckBTC/ICP, ckUSDC/ICP,\n" #
    "  ckUSDT/ICP). TTTI-T pairs receive fixed liquidity only from TTTI-T\n" #
    "  fees; no TTTI-T is created for them and no order depends on the price\n" #
    "  (the mint fee buys TTTI-T without any price condition, see Mint revenue).\n" #
    "  Amounts beyond the ratio\n" #
    "  or without an open pool wait for the next week.\n" #
    "- `getLastWeeklyAllocation() : ?WeeklyAllocation` and\n" #
    "  `listWeeklyAllocations() : [WeeklyAllocation]` (admin; trap\n" #
    "  `Unauthorized: only admins can manage the treasury`): `{ id; at;\n" #
    "  autonomyDays; treasuryBalances; stockPayoutCap; toCyclesReserveE8s;\n" #
    "  surplusE8s; toBonusE8s; toLiquidity; poolAdds : [{ poolId; amount0;\n" #
    "  amount1; shares }]; skipped : [{ poolId; reason }]; waiting; note }`.\n" #
    "  TokenAmounts are `{ icp; ckbtc; ckusdc; ckusdt }` in base units.\n\n" #
    "### Lot 4 transfers, retry and gotchas\n\n" #
    "- DC and DL sends use the shared retry rule (recorded before the first\n" #
    "  await, memo `TTTI-DC-<n>` / `TTTI-DL-<n>` with `-<m>` on later attempts,\n" #
    "  `created_at_time` always set, identical resend every 10 minutes for 23 h,\n" #
    "  then To review as `#DC` / `#DL`). One lock per send.\n" #
    "- Timers today (re-armed on every install and upgrade): price samples every\n" #
    "  5 minutes, DL / MF retries (and resends of recorded DC attempts) every 10\n" #
    "  minutes, cycles every 6 hours. No DC check and no weekly check run.\n" #
    "- Price samples, buckets, batches, claims and allocations are stable state\n" #
    "  and survive upgrades. A new pool has no average price for 30 minutes.\n" #
    "  With no autonomy value yet, the target cycles share is 4000 bps.\n\n" #

    "## DEX router: native pool or ICPSwap (lot 5)\n\n" #
    "- `quoteRoutedSwap({ tokenIn; tokenOut; amountIn; slippageBps })` (update\n" #
    "  call, signed-in callers only, changes no state) works on a registry pair. It\n" #
    "  compares the native pool (its fee tier, 0.3 % for the 7 starting pairs,\n" #
    "  internal balances, no ledger fee) with the ICPSwap pool of the same pair\n" #
    "  found through the ICPSwap factory (ICPSwap's own fee, plus a 0.1 % protocol\n" #
    "  fee taken from the input before the ICPSwap swap, plus the input and output\n" #
    "  ledger fees). It returns exactly one `route` (`#native { poolId }` or\n" #
    "  `#icpswap { poolCanisterId }`), the amount received net of every fee, the\n" #
    "  fees, `minimumReceived = amountOut x (10_000 - slippageBps) / 10_000`, the\n" #
    "  other route in `alternative` for information, `reason` and `maxDeadline`\n" #
    "  (now + 5 min, ns). On equal amounts the native route wins.\n" #
    "- A native pool that is empty, below the 10 USD swap-opening threshold or too shallow\n" #
    "  (`reason = #nativeUnavailable`) goes through ICPSwap. With no ICPSwap pool or\n" #
    "  quote only an open native pool is offered (`#icpswapUnavailable`). With\n" #
    "  neither: `#noRouteAvailable`. Not a registry pair: `#pairNotFound`; a pair\n" #
    "  removed by the admin is refused on both routes with `#pairRemoved`.\n" #
    "- `routedSwap({ tokenIn; tokenOut; amountIn; minAmountOut; deadline; route })`\n" #
    "  runs the whole order on the given route only (never split). It is refused\n" #
    "  with no change when `now > deadline` (`#deadlineExceeded`), when\n" #
    "  `deadline > now + 5 min` (`#deadlineTooFar`), when the expected amount is\n" #
    "  below `minAmountOut` (`#slippageExceeded`), on `#insufficientBalance`, and\n" #
    "  with `#routeMismatch { expected }` when the route is not the pair's native\n" #
    "  pool or the factory's ICPSwap pool of the pair. `#operationInProgress` while\n" #
    "  a deposit, withdrawal or swap of the caller holds either token.\n" #
    "- Both routes debit the caller's internal DEX balance of `tokenIn` and credit\n" #
    "  `tokenOut` to the internal balance. ICPSwap route steps: record and debit,\n" #
    "  IR transfer from the caller's DEX deposit subaccount to the ICPSwap pool's\n" #
    "  deposit subaccount of this canister, `deposit`, `swap` with\n" #
    "  `amountOutMinimum = minAmountOut + output ledger fee`, `withdrawToSubaccount`\n" #
    "  of the output to the caller's DEX deposit subaccount, then credit.\n" #
    "- Every ledger move of the ICPSwap route made by this canister carries memo\n" #
    "  `TTTI-IR-<n>` (global n) and `created_at_time`. An unknown outcome is resent\n" #
    "  once with the same memo and time (deduplicated by the ledger).\n" #
    "- Errors after the record: `#icpswapFailed { id; message; fundsReturned }`. A\n" #
    "  refused IR transfer or a failed ICPSwap swap returns the input to the\n" #
    "  internal balance (`fundsReturned = true`; after a deposit only what ICPSwap\n" #
    "  gives back net of ledger fees, plus the 0.1 %). `#outcomeUnknown { id }`: the\n" #
    "  swap is `#needsReview` and listed in To review as kind `#IR`\n" #
    "  (`purchaseId` = routed swap id). Arrived at the withdrawal stage credits\n" #
    "  the expected output; earlier, the input stayed on ICPSwap and only the 0.1 %\n" #
    "  is credited back. Not arrived (only for the IR transfer itself) credits the\n" #
    "  whole input back.\n" #
    "- The 0.1 % of a completed ICPSwap route goes to the pair's native pool: 70 %\n" #
    "  credited to its LPs' internal balances pro rata on their position shares,\n" #
    "  30 % (plus rounding dust) is the protocol share, split like the native\n" #
    "  swap fee protocol share: two thirds to the creator holdings, one third to\n" #
    "  permanent liquidity (set aside, rebalanced on the best route, then\n" #
    "  injected). With no LP in the native\n" #
    "  pool, the 70 % goes to the LPs of the least liquid TTTI-T pool (pro rata\n" #
    "  on their shares, recorded per pool in OQL table `routerRedirect`); if that\n" #
    "  pool has no LP either, the 70 % is set aside per pool and paid to the LPs\n" #
    "  once the first LP arrives (checked on every routed swap and every 10\n" #
    "  minutes).\n" #
    "- `getMyRoutedSwaps(cursor : ?Nat, limit : Nat) : Page<RoutedSwap>` lists the\n" #
    "  caller's own routed swaps (both routes), newest first, one page (see\n" #
    "  \"Pagination, batches and the in-flight index\"). Admin only\n" #
    "  (`#err(#notAuthorized)` otherwise): `adminListRoutedSwaps(cursor : ?Nat,\n" #
    "  limit : Nat) : Result<Page<RoutedSwap>, RouterAdminError>` (ICPSwap routed\n" #
    "  swaps with stage and status, newest first) and `adminGetRouterFees()`\n" #
    "  (0.1 % totals per native pool and the set-aside).\n" #
    "- Retry safety: `routedSwap` is not idempotent; each call is a new order. After\n" #
    "  an error or a timeout, read `getMyRoutedSwaps()` before calling again. The\n" #
    "  protocol never places an order by itself and never creates TTTI-T.\n\n" #

    "## DEX reserve check and pause (lot 6)\n\n" #
    "- Purpose: per DEX token (TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT) the backend\n" #
    "  compares the internal total the DEX owes (user balances available +\n" #
    "  reserved, pool reserves, protocol fees, router set-aside, pair request\n" #
    "  deposits, ICP held in the protocol fee account) with the real ledger\n" #
    "  balance summed over the DEX-controlled accounts (user deposit\n" #
    "  subaccounts, pool subaccounts, request deposit, injection and protocol\n" #
    "  fee accounts). Reserves are bookkeeping, so only the per-token sum is\n" #
    "  compared. Nothing is corrected automatically and `sale.reserved` is not\n" #
    "  touched. A confirmed shortfall records a mismatch (alert) and pauses the\n" #
    "  DEX (see below), which also refuses minting while it lasts\n" #
    "  (`#dexPaused`); the sales pause flag itself is not changed. Since PTM-10d\n" #
    "  the check also compares one balance sheet per token (see \"Per-token\n" #
    "  balance breakdown in the reserve check\").\n" #
    "- Statuses: `#ok` (equal), `#surplus` (ledger higher, reported only),\n" #
    "  `#shortfall` (ledger lower). A shortfall counts as a mismatch only after a\n" #
    "  second fresh ledger read confirms it. Amounts are base units of the token;\n" #
    "  `difference = ledgerTotal - internalTotal` (Int); timestamps are\n" #
    "  nanoseconds since the epoch.\n" #
    "- A ledger read failure is stored as `error : ?{ message (exact text); at }`\n" #
    "  and is never a mismatch and never pauses the DEX; the previous results\n" #
    "  and `lastSuccessAt` are kept. A token is skipped (previous result kept)\n" #
    "  while DD/DW/DQ transfers, router swaps, fee or injection processing that\n" #
    "  move its funds are in flight, so a transient difference is not reported.\n" #
    "- The check runs from a timer every hour (re-armed on every install and\n" #
    "  upgrade) and on demand. One check at a time (`#checkInProgress`). The\n" #
    "  last check, last successful check date and the mismatch history (the 50\n" #
    "  latest, oldest first) persist across upgrades.\n" #
    "- Admin endpoints (a non-admin caller gets `#err(#unauthorized)`):\n" #
    "  `runDexReserveCheck() : Result<ReserveCheck, DexReserveError>`;\n" #
    "  `getDexReserveStatus() : Result<DexReserveStatus, DexReserveError>`\n" #
    "  (query: last check, `unresolvedShortfallCount`, `checkInProgress`,\n" #
    "  pause view, history); `resumeDex() : Result<DexPauseView,\n" #
    "  DexReserveError>` runs a fresh check first and succeeds only when no\n" #
    "  shortfall remains, recording `{ by; at }`. Errors: `#unauthorized`,\n" #
    "  `#checkInProgress`, `#notPaused`, `#checkFailed(text)` (ledger read\n" #
    "  failure, shortfall remaining, or nothing could be re-checked now).\n" #
    "- Public: `getDexPauseStatus() : { paused; reasonToken : ?DexToken }`.\n" #
    "- A confirmed shortfall pauses the DEX and records the reason `{ token;\n" #
    "  internalTotal; ledgerTotal; at }`. While paused, `swap`, `routedSwap`,\n" #
    "  `depositToDex`, `addLiquidity`, `requestPair` and `approvePair` trap\n" #
    "  (reject) with `The DEX is paused after a reserve mismatch...`, and the\n" #
    "  refused-deposit set-aside, pool fee splits, liquidity injection and\n" #
    "  set-aside payout skip. `withdrawFromDex`, `removeLiquidity`, `extendLock`,\n" #
    "  refusals, quotes and the DD/DW/DQ transfer retries stay available.\n" #
    "- `getUpgradeReadiness` adds `dexPaused`, `dexPauseReason`,\n" #
    "  `lastReserveCheckAt`, `lastReserveCheckStatus` (worst status of the last\n" #
    "  check), `unresolvedShortfallCount`, `dexOperationsInFlight : [Text]`\n" #
    "  (held DD/DW/DQ and IR lock keys) and `dexReady`, false while the DEX is\n" #
    "  paused, a shortfall is unresolved or DEX operations are in flight.\n" #
    "- Per-account check (DEX-1): the same check also compares each account with its own obligations only: `#dexHoldings` (custody plus the legacy DEX accounts per token, against the DEX total owed), `#requestDeposits` (pair-request deposits, one account per token: TTTI-T for earlier requests, ICP, ckBTC, ckUSDC, ckUSDT), `#mintFee` (MINT_FEE account per paid token) and `#protocolFees` (PROTOCOL_FEES, ICP). `AccountResult = { kind; accountLabel; token; ledgerBalance; owed; difference; status; checkedAt }` with `difference = ledgerBalance - owed` (Int). The status fields are additive: `ReserveCheckView.accounts`, `DexReserveStatus.accounts` and `accountHistory` (confirmed account mismatches, oldest first), and `DexPauseView.account`. A confirmed shortfall (second fresh read) on any account pauses the DEX and names that account (`account : ?{ kind; accountLabel; token }`); `resumeDex` fails with `#checkFailed(\"Shortfall remains on <label> <token>: ledger ..., owed ...\")` until it is gone. Surplus is reported only. `claimLpBonus` pays from PROTOCOL_FEES and `claimMintFee` from MINT_FEE, both unchanged.\n" #
    "- OQL (admin only): `dexReserveResult`, `dexReserveMismatch`, `dexPause`, `dexReserveAccount`.\n\n" #

    "## DEX custody account and sweep (DEX-1)\n" #
    "\n" #
    "- Custody account: each DEX token (TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT) has one\n" #
    "  DEX custody account on its own ledger, owned by this canister. `getDexCustodyAccounts() : [{ token; account }]` (public query) returns the five accounts. Deposits, swap and addLiquidity inputs, withdrawals and ICPSwap router outputs all use it; the internal balances, positions and blocks are unchanged by this. `getDexDepositAccount(owner)` still returns the legacy per-user deposit account, not the custody account.\n" #
    "- Automatic deposit: `depositToDex`, and the shortfall of the input token in `swap` and of either pool token in `addLiquidity`, are pulled from the caller's default account into custody by ICRC-2 `transfer_from` (memo DD). The caller must first call `icrc2_approve` on that token's ledger to this canister for at least the amount plus the ledger fee. The internal balance is credited only after the ledger confirms the transfer.\n" #
    "- Without enough allowance or balance: `depositToDex` returns `#err(#insufficientAllowance({ allowance; required }))` or `#err(#insufficientFunds({ balance }))`; `swap` and `addLiquidity` return `#err(#insufficientBalance(...))`, where `available` is the internal balance plus what the allowance or balance would still allow (token and required in addLiquidity). Nothing is credited on a refusal. `withdrawFromDex` (memo DW) and router outputs are paid from the custody account.\n" #
    "- Retry safety: pulls carry `created_at_time` and are retried as recorded, so a duplicate answer from the ledger is not a second transfer. After an error or timeout read `getDexTransfers(owner)` before calling again; `#transferInProgress` / `#operationInProgress` mean a call for the same owner and token is running.\n" #
    "- Sweep: funds that arrived earlier on the legacy accounts (user deposit subaccounts, DEX-POOL-id subaccounts) are moved to custody by an admin sweep. It reads the real ledger balance and transfers balance minus the ledger fee with the memo `TTTI-SW-<n>`, recorded with `created_at_time` before the first ledger call. A balance not above the fee is skipped and noted. Running again moves nothing once the balances are swept, and moves new inflows (for example refused deposits set aside as permanent liquidity). The sweep never changes internal balances, positions, ledger blocks or `sale.reserved`, and is not blocked by the DEX pause.\n" #
    "- Admin endpoints (a non-admin caller traps with `Unauthorized: only admins can use the DEX sweep`, except where a typed error is shown): `runDexSweep() : Result<[TokenState], { #notAdmin; #alreadyRunning }>` (one run at a time; resends unsettled sweep transfers as recorded first, sweeps, then compares custody with the total owed); `resendDexSweepTransfers() : Result<[TokenState], { #notAdmin }>` (also run by a timer every 10 minutes, re-armed on every install and upgrade); `getDexSweepState() : [TokenState]` (query: per token legacy accounts found, amounts swept, pending and unknown-outcome transfers, notes, comparison); `getDexCustodyComparison() : [{ token; comparison : ?Comparison }]` (query; null before the first comparison); `listDexSweepTransfers(cursor : ?Nat, limit : Nat) : Page<SweepTransferView>` (query, newest first, one page; the cursor is the transfer number `n`); `getDexSweepProgress() : SweepProgress` (query: whether a run is active, run id, current token and account position, batches taken, batch size, last batch time and per-token progress: accounts listed, read, with balance, skipped, unreadable, in flight, excluded as zero, done). Amounts are base units; timestamps are nanoseconds since the epoch.\n" #
    "- Comparison: custody ledger balance versus the total owed (user balances, pool reserves, protocol fees, router set-aside). A surplus is credited to no one, has no automatic action and is listed in To review as a `CS` row (purchaseId = token index, amount = surplus). A shortfall is reported in the comparison only.\n" #
    "- Review: a sweep transfer with unknown outcome after 23 hours is listed in To review as an `SW` row. `markTransferArrived(SW, n, block)` closes it as completed; `markTransferNotArrived(SW, n)` closes it as failed, the legacy account keeps its balance and a later `runDexSweep` moves it with a new transfer. Check the custody ledger for the `TTTI-SW-<n>` memo first. `CS` rows accept neither action (`#err(#notApplicable)`).\n" #
    "- OQL (admin only): `dexSweepTransfer` (primary key `n`), `dexSweepReport` (primary key `token`), `dexReserveAccount` (primary key `key` = kind/token).\n\n" #

    "## DEX indicators (lot 7)\n\n" #
    "- Purpose: facts about the DEX pools, computed once per hour from the stored\n" #
    "  state and stored. No yield projection, no price-linked order.\n" #
    "- `getDexIndicators() : ?DexIndicatorsSnapshot` (public query) returns the\n" #
    "  stored snapshot only (null before the first computation). A read never\n" #
    "  recomputes. `computedAt` is the time of the computation (nanoseconds since\n" #
    "  the epoch); the data is as old as that time.\n" #
    "- `getDexIndicatorsStatus() : Result<IndicatorsStatus, DexIndicatorsError>`\n" #
    "  (admin only query, `#err(#unauthorized)` otherwise): `snapshotAt`,\n" #
    "  `lastComputedAt`, `lastResult : ?{ #ok; #failed }`, `lastError : ?{ message\n" #
    "  (exact text); at }` and `lastSuccessAt`.\n" #
    "- Timer: one computation per hour, re-armed on every install and upgrade,\n" #
    "  and one shortly after start when no snapshot exists. On failure the\n" #
    "  previous snapshot stays with its original `computedAt`; the error text and\n" #
    "  its date are stored and cleared by the next success.\n" #
    "- Units: percentages are basis points (10_000 = 100 %); token amounts are\n" #
    "  base units of the token concerned; `...UsdE8` values are USD with 8\n" #
    "  decimals. TTTI-T has no USD value (no fixed price; pool values are 2 x the\n" #
    "  non-TTTI-T side) and other tokens use the\n" #
    "  hourly stored rate within its validity (1 hour plus 5 minutes). A USD value\n" #
    "  is null when a needed rate is absent or expired; the other figures still\n" #
    "  compute.\n" #
    "- `proofs`: per token, `internalTotal`, `ledgerTotal`, `difference`\n" #
    "  (`ledgerTotal - internalTotal`) and `status` copied from the latest\n" #
    "  successful DEX reserve check (`reserveCheckedAt`); empty before a check.\n" #
    "- `pools` (one row per pool that is not removed): reserves, `valueUsdE8`,\n" #
    "  `isOpen` (true when swaps are open).\n" #
    "  - `depth`: at 1, 2 and 5 percent and per direction (`token0In`, `token1In`),\n" #
    "    the largest input `amountIn` (and the `amountOut` it buys) after which the\n" #
    "    constant-product price has moved by at most that percent, pool fee\n" #
    "    included, rounding in favour of the pool. 0 for an empty pool and for a\n" #
    "    pool that is not open.\n" #
    "  - `liquidity`: firm shares = frozen position shares + permanent protocol\n" #
    "    minimum shares + protocol liquidity shares; free shares = position\n" #
    "    shares whose lock has ended; firm + free = total shares. Amounts and\n" #
    "    `firmBps` / `freeBps` are given. Creator positions follow the same rules.\n" #
    "  - `unlock`: frozen shares grouped by days to unlock (`thisWeek` <= 7,\n" #
    "    `days30` <= 30, `days90` <= 90, `year1` <= 365, `overYear1`) plus\n" #
    "    `permanent`; the six buckets plus free shares equal the total shares.\n" #
    "  - `concentration`: `positionCount`, `largestPositionBps`, `topFiveBps`\n" #
    "    (shares of total shares) and `permanentProtocolBps`.\n" #
    "  - `activity`: swap count and volume (amount swapped in) per token over\n" #
    "    `last24h` and `last7d`, plus `volumeUsdE8` when the rates are available.\n" #
    "    Windows are the current hour plus the previous 23 (or 167) hourly\n" #
    "    buckets. Only native pool swaps are recorded, from the moment recording\n" #
    "    started (`fees.cumulativeSince`).\n" #
    "  - `fees`: fees collected per token over the last 7 days and cumulative\n" #
    "    since recording, with the 70 % LP part and the 30 % protocol part\n" #
    "    (two thirds creator, one third permanent liquidity) computed on the\n" #
    "    collected amount (rounded down), and\n" #
    "    `observed`: the fees of the period over the pool value in basis points,\n" #
    "    a plain figure for `periodDays` (7), null without USD values.\n" #
    "- Reading the indicators moves no balance and changes no pool or position.\n" #
    "- OQL (public): `dexIndicator`, one flat row per pool of the stored snapshot.\n" #
    "- OQL (public): `dexSwapActivity`, hourly swap-activity buckets per pool\n" #
    "  (`poolId`, `hour`, `swapCount`, `volume0`, `volume1`, `fee0`, `fee1`),\n" #
    "  kept for 7 days.\n\n" #

    "## Sealed-bid auction: offers and closing (lots PTM-6a and PTM-6b)\n\n" #
    "- Scope: offers (PTM-6a) and closing (PTM-6b). The withdrawal of the\n" #
    "  withdrawable balance, the settlement of the served deposits and the\n" #
    "  re-issuing of the returned TTTI-T are not part of this version: no\n" #
    "  endpoint pays out a balance, and no amount recorded at closing is sent\n" #
    "  anywhere. Nothing is burned or sent; total supply and the cap are\n" #
    "  unchanged, and no ledger balance or block is rewritten.\n" #
    "- Lot: all TTTI-T held on the returned account that is not committed to an\n" #
    "  earlier lot. An auction opens as soon as that amount is non-empty and no\n" #
    "  auction is open, and lasts 24 hours (`closesAt = openedAt + 24 h`). The\n" #
    "  lot size is fixed when the auction opens; TTTI-T returned while an auction\n" #
    "  is open forms the next lot. Opening comes from a canister timer (every\n" #
    "  minute, re-armed on every install and upgrade), from `openAuction` and\n" #
    "  lazily from `placeAuctionBid`. Opening is not done while the DEX is paused.\n" #
    "- First lot and end of mint (PTM-9b): the part of the mint left below the\n" #
    "  minimum of one mint joins the first auction lot (`remainderE8s`); it is\n" #
    "  minted only at settlement, for the winner, pooled with the winner's mass.\n" #
    "- Lot below the minimum of one bid (0.001 TTTI-T): it is sold as a block\n" #
    "  (`blockSale` true). Each bid is a price per TTTI-T for the whole lot; the\n" #
    "  quantity must equal the lot, else error `#wholeLotRequired { lotSizeE8s }`.\n" #
    "  The best bid wins the whole lot, same reserve, pooled like the others.\n" #
    "- Units: quantities in TTTI-T e8s (1 TTTI-T = 100_000_000); `priceB` in the\n" #
    "  smallest unit of the chosen token per whole TTTI-T; deposits in the\n" #
    "  token's smallest unit; the reserve fields in USD x 10^8 per whole TTTI-T;\n" #
    "  timestamps in nanoseconds since the epoch. Tokens: `#icp`, `#ckbtc`,\n" #
    "  `#ckusdc`, `#ckusdt`.\n" #
    "- `getAuctionView() : AuctionView` (query, public): `open`, `auctionId`,\n" #
    "  `lotSizeE8s`, `openedAt`, `closesAt`, `pendingLotE8s` (next lot),\n" #
    "  `reservePriceUsdE8` (the effective reserve, see below), `reserveFloorUsdE8`\n" #
    "  (10_000 USD x 10^8), `consolidatedPriceUsdE8` (`?Nat`, current consolidated\n" #
    "  price), `dailyAverageUsdE8` (`?Nat`, 24 h average of the consolidated\n" #
    "  price), `reserveBinding` (`#floor`, `#consolidated` or `#dailyAverage`:\n" #
    "  which of the three is the reserve now), `reservePrices` (per token, the\n" #
    "  effective reserve in the token at its current rate, `null` when that\n" #
    "  token's rate is absent or expired), `minQuantityE8s` (100_000),\n" #
    "  `maxBidsPerPerson` (10) and `guaranteeRecoverable` (true: any holder can\n" #
    "  redeem against the common reserve). It carries no\n" #
    "  bid, no number of bids, no deposit total and no participation.\n" #
    "- Reserve price: the highest of three values, computed on every read and\n" #
    "  stored nowhere: 10_000 USD per TTTI-T; the 24 h average of the\n" #
    "  consolidated TTTI-T price (`dailyAverageUsdE8` of\n" #
    "  `getConsolidatedTttiPrice`); and the current consolidated price. A\n" #
    "  component that is unavailable (no open pool, no valid rate, no samples) is\n" #
    "  ignored, so the reserve never falls below 10_000 USD. On a tie the order is\n" #
    "  floor, then current consolidated price, then 24 h average. When the market\n" #
    "  is under 10_000 USD the reserve stays at 10_000 USD: no offer below it\n" #
    "  passes and nothing is reissued below 10_000 USD (the lot stays in the\n" #
    "  contract). The per-token equivalent is\n" #
    "  `ceil(reserveUsdE8 x 10^decimals / rate)` at the stored hourly rate of\n" #
    "  each token; a token without a valid rate has `price = null`, never an\n" #
    "  invented value. While the winners of a closed auction are being pooled at\n" #
    "  settlement (from its closing until its last final settlement), samples taken\n" #
    "  in that period are left out of the 24 h average and the current price is the\n" #
    "  last sample taken before the settlement started (no sample before: unavailable,\n" #
    "  so the floor applies), so pooling the winners does not raise the market part.\n" #
    "  Afterwards the live price is read again. Nothing is stored for this. At the closing the reserve is the value\n" #
    "  computed at the closing time, not the value shown while bidding. The\n" #
    "  reserve does not change the bid rules or the deposit.\n" #
    "- `getMyAuctionBids() : [Bid]` (query, signed-in callers; empty for an\n" #
    "  anonymous caller): only the caller's own bids.\n" #
    "- Deposit formula: the winner at price B for q TTTI-T pays\n" #
    "  `payment = ceil((10 000 USD + L) x q / (10^8 x 0.99))`, in integers, in the\n" #
    "  chosen token, with L = B (choice #pool, A) or m x B (choice #wallet, B) per\n" #
    "  whole TTTI-T (B in the token's smallest unit, q in e8s, m the locked share\n" #
    "  of `getPoolCapRatio`, scale 10^6, read at settlement time). The bid carries\n" #
    "  its `choice`, stored with it and used at settlement; the deposit to send is\n" #
    "  always the choice #pool amount (the maximum), the excess of a #wallet bid\n" #
    "  returns to the withdrawable balance. `quoteAuctionDeposit(token, priceB,\n" #
    "  quantityE8s, choice) :\n" #
    "  Result<DepositQuote, BidError>` (query, public) returns `required` (the\n" #
    "  deposit to send: `payment`, since `conversionBuffer` is 0), `payment`,\n" #
    "  `positionAmount` (B x q), `reserveAmount` (10 000 USD x q, rounded down),\n" #
    "  `creatorAmount` (1 % of payment), `reserveToken` (the paid token),\n" #
    "  `conversionApplies` (always false), `conversionBuffer` (always 0) and `rateUsdE8`;\n" #
    "  and for the asked choice at the current m: mShareE6, choicePayment,\n" #
    "  choicePooledAmount, lockedAmount (m x B x q), handE8s ((1 - m) x q for #wallet).\n" #
    "  Errors: `#invalidPrice`, `#quantityBelowMinimum`, `#rateUnavailable { token }`\n" #
    "  (no usable rate: the 10 000 USD cannot be priced, nothing is taken).\n" #
    "  `placeAuctionBid` uses the same function: `depositAmount` must be at least\n" #
    "  `required`.\n" #
    "- `placeAuctionBid(token, quantityE8s, priceB, depositAmount, choice) :\n" #
    "  Result<Bid, BidError>` (signed-in callers only). Checked before any ledger\n" #
    "  call, so a refused bid takes no funds: anonymous, paused, no open auction\n" #
    "  or past `closesAt`, quantity under 0.001 TTTI-T, zero or oversized price\n" #
    "  or quantity, an 11th bid by the same principal in the auction,\n" #
    "  `depositAmount` below the required deposit, a bid price under 10_000 USD\n" #
    "  per whole TTTI-T at the current rate of the bid token (also refused when\n" #
    "  that token has no usable rate), a deposit below the ledger fee of the bid\n" #
    "  token. The caller must first approve\n" #
    "  the canister on the token ledger (ICRC-2) for `depositAmount` plus the\n" #
    "  ledger fee. The full `depositAmount` is then pulled with\n" #
    "  `icrc2_transfer_from` into the token's auction custody account, memo\n" #
    "  `TTTI-AB-<n>`. A deposit above the required amount hides the budget; the\n" #
    "  excess is credited to the withdrawable balance at the closing. Bids are firm:\n" #
    "  there is no withdrawal or change.\n" #
    "- `BidError`: `#anonymous`, `#paused`, `#noOpenAuction`,\n" #
    "  `#quantityBelowMinimum{minimum}`, `#invalidPrice`, `#tooManyBids{maximum}`,\n" #
    "  `#depositBelowRequired{required; deposited}`,\n" #
    "  `#allowanceInsufficient{allowance; required}`,\n" #
    "  `#insufficientFunds{balance; required}`, `#bidInProgress` (one bid at a\n" #
    "  time per caller), `#ledgerError(text)`, `#wholeLotRequired{lotSizeE8s}`,\n" #
    "  `#priceBelowMinimum{minimumUsdE8; bidUsdE8}` (minimumUsdE8 = 10_000 USD x\n" #
    "  10^8 per whole TTTI-T; bidUsdE8 is the converted bid price, null when the\n" #
    "  token has no usable rate) and `#depositBelowLedgerFee{fee; deposited}`.\n" #
    "  Both new refusals are decided before any ledger call: no funds are taken.\n" #
    "- Dust: a withdrawable auction balance not above the ledger fee of its\n" #
    "  token is dust. It stays in the balance (nothing is rewritten), is skipped\n" #
    "  by the return sweep (no lock, no move) and is added to the next return of\n" #
    "  the same person and token. The OQL entity `auctionDust` (owner, token,\n" #
    "  amount) mirrors it for reading, is owner-only and is not counted on top\n" #
    "  of the balance. Moves are indexed by bidder, finished moves leave the\n" #
    "  active list, and a fully settled auction is skipped by the settlement run.\n" #
    "- Retry safety: a known ledger error records nothing. An unknown outcome\n" #
    "  (`#ledgerError` saying the reply is unknown) keeps the deposit recorded;\n" #
    "  the same transfer is resent (same memo and created_at_time, so the ledger\n" #
    "  deduplicates it), and after 23 hours it appears in To review. The bid is\n" #
    "  recorded as soon as the deposit is confirmed; do not place it again. A\n" #
    "  repeated `placeAuctionBid` creates a new bid and a new deposit.\n" #
    "- `openAuction() : Result<Auction, OpenAuctionError>` (any caller):\n" #
    "  `#paused`, `#alreadyOpen`, `#emptyLot`.\n" #
    "- Privacy: bids of an open auction stay hidden until the closing. No\n" #
    "  endpoint lists, counts or reads other people's open bids. The OQL entity\n" #
    "  `auctionBid` (open bids) is owner-only: a\n" #
    "  signed-in user reads only their own rows; it is not readable through the\n" #
    "  controller's public query path. A deposit in flight is not listed in the\n" #
    "  DEX history or the DEX transfer entity; an unresolved one appears only in\n" #
    "  To review (admin), under the existing DD kind.\n" #
    "- Reserve check: the hourly DEX reserve check compares each auction custody\n" #
    "  account (`auctionDeposits`, one per paid token) with the deposits of the\n" #
    "  open bids, the deposits in flight, and after closing every withdrawable and\n" #
    "  pending-settlement balance of that token, separately from the other\n" #
    "  accounts.\n" #
    "- Closing: the canister timer (every minute, not while the DEX is paused)\n" #
    "  closes the current auction once `closesAt` has passed, under a lock so it\n" #
    "  runs once. It needs a valid (unexpired) oracle rate for every payment\n" #
    "  token used by an offer. Without one, `getAuctionView().closingPending` is\n" #
    "  true and nothing is closed, served or returned; the next tick tries\n" #
    "  again, and no rate is invented. With the rates available, closing runs in\n" #
    "  one step without an `await`, and no ledger balance or block is rewritten.\n" #
    "- Reserve at closing: the highest of 10_000 USD, the 24 h average of the\n" #
    "  consolidated TTTI-T price and the consolidated price at closing, in USD x\n" #
    "  10^8 per whole TTTI-T. A market under 10_000 USD gives a reserve of\n" #
    "  10_000 USD, and an offer priced at 10_000 USD or more passes. The three\n" #
    "  compared values (`reserve.floorUsdE8`, `consolidatedUsdE8`,\n" #
    "  `dailyAverageUsdE8`; outside settlement of a previous auction, see the reserve\n" #
    "  price rule above), the applied `reserve.reserveUsdE8` and the rate of\n" #
    "  each payment token (`rates`, `usdE8` null when unusable) are stored in the\n" #
    "  `ClosedAuction`.\n" #
    "- Ordering: each offer price is converted to USD at the closing rate of its\n" #
    "  token; an offer under the reserve (or of a token without a rate) is\n" #
    "  `#discardedBelowReserve`. The others are ordered by price in USD\n" #
    "  (descending), then by volume (quantity x price in USD, descending), then\n" #
    "  by age (`createdAt` ascending, then bid id), and served in that order\n" #
    "  until the lot is exhausted. The last served offer may be served in part\n" #
    "  (`#partiallyServed`). If the remaining quantity of the lot is under\n" #
    "  100_000 e8s it is not served. An offer not reached is `#notServed`.\n" #
    "- Own-price payment: each served offer pays its own price\n" #
    "  (`pricePaidB = priceB`); there is no uniform price.\n" #
    "- Deposits at closing: `servedDeposit` is the required deposit for the\n" #
    "  served quantity at the offer's own price (same formula as the bid\n" #
    "  deposit); it is added to the bidder's `pendingSettlement` in that token.\n" #
    "  The rest of the deposit (`returned = deposited - servedDeposit`, the whole\n" #
    "  deposit for `#notServed` and `#discardedBelowReserve` offers) is credited\n" #
    "  to the bidder's `withdrawable` balance in that token. `pendingSettlement`\n" #
    "  is only recorded and shown; it is not withdrawable (see Settlement of the\n" #
    "  winners). A deposit confirmed after its auction closed is credited whole to\n" #
    "  `withdrawable`. Everything in `withdrawable` is moved on the ledger from the\n" #
    "  auction custody to the DEX custody and credited to the bidder's DEX internal\n" #
    "  balance (net of the ledger fee of that internal move, which is deducted from\n" #
    "  the credited amount only); `withdrawable` then drops by the gross amount.\n" #
    "- Carry-over: the unsold quantity (lot size minus served quantity) is\n" #
    "  released from the committed returned TTTI-T and joins the next lot; served\n" #
    "  quantities stay committed. With no valid offer the status is `#unsold` and\n" #
    "  the whole lot stays in the contract for the next lot. `status`:\n" #
    "  `#fullySold`, `#partiallySold` or `#unsold`. After closing there is no\n" #
    "  current auction until the next one opens (same timer tick, when a\n" #
    "  non-empty lot exists).\n" #
    "- `getClosedAuctions() : [ClosedAuction]` (query, public): every closed\n" #
    "  auction, newest first, with `id`, `openedAt`, `closesAt`, `closedAt`,\n" #
    "  `lotSizeE8s`, `reserve`, `rates`, `bidCount`, `servedE8s`,\n" #
    "  `carriedOverE8s` and `status`. No bids.\n" #
    "- `getAuctionResult(auctionId) : ?AuctionResult` (query, public): the\n" #
    "  closed auction and ALL its bids with `bidder`, `quantityE8s`, `priceB`,\n" #
    "  `token`, `outcome` (`#served`, `#partiallyServed`, `#notServed`,\n" #
    "  `#discardedBelowReserve`), `servedE8s`, `pricePaidB`, `servedDeposit` and\n" #
    "  `returned`, plus `settlement` (status `#notRequired`, `#pending`, `#settled`\n" #
    "  or `#failed`, `settledE8s`, `takenAmount`, `creatorShare`, `positionAmount`,\n" #
    "  `guaranteeAmount` (paid into the common reserve), `surplusReturned`,\n" #
    "  `carriedE8s`, `positionId`,\n" #
    "  `failureReason`, `attemptedAt`, `settledAt`). The auction carries a\n" #
    "  `settlement` summary (`pendingCount`, `settledCount`, `failedCount`,\n" #
    "  `settledE8s`, `failedCarriedE8s`). `getClosedAuctions` also carries it. null\n" #
    "  for an unknown auction and while the auction is open.\n" #
    "- `getMyWithdrawable() : [MyBalance]` (query, signed-in callers; empty for\n" #
    "  an anonymous caller): the caller's non-zero balances, one entry per\n" #
    "  deposit token, with `withdrawable` and `pendingSettlement`.\n" #
    "- OQL (public): `closedAuction`, `closedBid` and `bidSettlement` (the\n" #
    "  published results and settlements).\n" #
    "  OQL (owner-only): `bidderBalance` and `auctionMove` (deposit moves to the\n" #
    "  DEX custody: gross, credited, status), a signed-in user reads only their own.\n" #
    "- Retry safety: the queries are read-only; closing is run by the timer, not\n" #
    "  by a call, and runs once per auction.\n\n" #

    "## Settlement of the winners (lot PTM-6c)\n\n" #
    "- Trigger: automatic after closing (the same 1-minute timer resends moves in\n" #
    "  progress, settles every closed auction with a pending winner and moves the\n" #
    "  returns) and on demand with\n" #
    "  `settleAuctionWinners(auctionId) : Result<SettleReport, SettleError>` (any\n" #
    "  caller, signed in or not). One run per auction at a time (`#inProgress`);\n" #
    "  `#paused` while the DEX is paused; `#unknownAuction`; `#nothingToSettle`\n" #
    "  when no served bid is pending. `SettleReport`: `auctionId`, `attempted`,\n" #
    "  `settled`, `failed`, `remaining` (still pending, e.g. a move waiting for\n" #
    "  the ledger), `settledE8s`, `carriedE8s`.\n" #
    "- Order: winners are settled ONE AT A TIME in ranking order (price in USD at\n" #
    "  the closing rate descending, volume descending, age ascending, id).\n" #
    "- Custody: deposits sit on the auction custody account, DEX balances on the\n" #
    "  DEX custody account. Step 1 moves the served deposit of the winner with a\n" #
    "  recorded ledger transfer (memo `TTTI-SW-<n>`, created_at_time fixed before\n" #
    "  the first await, resent as recorded until Ok or Duplicate, listed as to\n" #
    "  review after 23 h) and then credits the winner's DEX balance, net of the\n" #
    "  ledger fee of the move (see Fee of the internal move). Step 2 is an isolated, all-or-nothing self-call\n" #
    "  (`auctionSettleCore`, reserved to the canister) that debits the winner's DEX\n" #
    "  balance.\n" #
    "- Amounts for q served at price B in the paid token: `takenAmount` =\n" #
    "  (10 000 USD + L) x q / 0.99 (rounded up, in favor of the pools; L = B for the\n" #
    "  choice #pool, m x B for #wallet); 1 % of it is\n" #
    "  `creatorShare`; of the rest, L x q (`positionAmount`) forms the\n" #
    "  winner's liquidity position(s) in the TTTI-T/paid-token pool: m x B x q with m x q\n" #
    "  TTTI-T locked 3 months (`lockedAmount`, `lockedPositionId`, m recorded as\n" #
    "  `mShareE6`) and, with #pool, the rest free; with #wallet (1 - m) x q TTTI-T\n" #
    "  stay in the winner's DEX balance (`handE8s`), never pooled without dollars\n" #
    "  (zap as at the mint; the position belongs to the winner) and 10 000 USD x q\n" #
    "  (`guaranteeAmount`) is paid into the common reserve in the paid token, as is,\n" #
    "  with no conversion (ICP, ckBTC, ckUSDC and ckUSDT alike). The q TTTI-T come from the returned TTTI-T held by the\n" #
    "  contract (plus, for the first lot, the end-of-mint remainder minted now\n" #
    "  for the winner and pooled with the winner's mass); nothing is burned.\n" #
    "  The reserve part is credited to the dedicated guarantee account of its\n" #
    "  reserve token (the paid token).\n" #
    "  `surplusReturned` is the credited\n" #
    "  deposit left in the winner's DEX balance after the amount charged.\n" #
    "- Fee of the internal move: the ledger fee of the move from the auction\n" #
    "  custody to the DEX custody never reduces what a winner pays. A winner whose\n" #
    "  deposit equals `takenAmount` (the exact deposit, no excess) settles. The\n" #
    "  fee is borne by the creator share: the 1 % of `takenAmount` is credited to\n" #
    "  the creator net of the fee (never below zero), so `creatorShare` is the 1 %\n" #
    "  less the fee borne and the winner's DEX balance is charged `takenAmount`\n" #
    "  less the fee borne. If the 1 % is smaller than the fee, the shortfall is\n" #
    "  covered by the winner's own bid excess (moved together with the deposit).\n" #
    "  `positionAmount` (L x q) and `guaranteeAmount` (10 000 USD x q) are exact in\n" #
    "  every case, and the custody balances still match (the fee leaves the\n" #
    "  ledger once, taken from the creator share or from the excess).\n" #
    "- Failure: if neither the creator share nor the bid excess covers the fee\n" #
    "  (the credited deposit is lower than `takenAmount` less the fee borne by the\n" #
    "  creator share) or the isolated call is refused\n" #
    "  (pool, slippage, rate, balances), nothing is created and no TTTI-T moves:\n" #
    "  the status is `#failed`, `failureReason` is set, the whole credited deposit\n" #
    "  stays in the winner's DEX balance (withdrawable) and `carriedE8s` joins the\n" #
    "  next lot (`failedCarriedE8s` of the auction). The other winners are not\n" #
    "  touched. A `#failed` or `#settled` bid is final.\n" #
    "- Recovery: unserved deposits, surplus and failed settlements all end in the\n" #
    "  same DEX internal balance, withdrawn with the existing `withdrawFromDex`\n" #
    "  (Recover button). `getMyWithdrawable` lists what has not yet been moved.\n" #
    "- Secondary market: pools, ICPSwap and transfers do not require pooling.\n" #
    "- Retry safety: calling `settleAuctionWinners` again is safe; final bids are\n" #
    "  skipped and a recorded move is resent with its original memo and time.\n\n" #

    "## Balance guard-rails (lot PTM-10d)\n\n" #
    "Each rule below is enforced in code. A violated rule is a trap, so the whole\n" #
    "message is rolled back: no balance, pool reserve, share or block is left\n" #
    "changed. None of these rules adds an endpoint that writes state.\n\n" #

    "### One ratio-preserving liquidity function\n\n" #
    "- Only a swap changes the price of a pool. Every other change of a pool's\n" #
    "  `reserve0` / `reserve1` goes through two functions of the DEX module:\n" #
    "  `depositAtRatio` (add) and `withdrawAtRatio` (remove). This covers a\n" #
    "  user's position (`addLiquidity`, `removeLiquidity`), the part of a mint\n" #
    "  deposited after the zap, an auction settlement, permanent liquidity and\n" #
    "  its reinjection, a refused deposit, and the removal and liquidation of a\n" #
    "  position or pool.\n" #
    "- After the change, the function checks that `reserve0 / reserve1` did not\n" #
    "  move beyond one unit of rounding (cross-product test). If it moved, the\n" #
    "  call traps with \"Liquidity deposit refused: it would move the price of\n" #
    "  pool #<id> ...\" or \"Liquidity withdrawal refused: it would move the price\n" #
    "  of pool #<id> ...\". A withdrawal larger than a reserve also traps. The\n" #
    "  first deposit of an empty pool (no shares, or a reserve at zero) has no\n" #
    "  ratio to preserve and is the only exception.\n" #
    "- A caller holding more of one side than the pool ratio allows deposits only\n" #
    "  the part that fits (rounded down); the rest stays where it was (internal\n" #
    "  balance or pending pot). Only the reserves are written by these functions.\n" #
    "  The public methods keep their signatures; a ratio trap reaches the caller\n" #
    "  as a reject with the message above.\n\n" #

    "### Mint balance sheet and direction (trap, whole mint rolled back)\n\n" #
    "- These checks run inside the isolated mint core (`liquidityMintCore`), for\n" #
    "  `mintLiquidity`, the BTC deposit path and auction winners' settlements. A\n" #
    "  failure is a trap: nothing is minted, no pool, balance, reserve or\n" #
    "  fee changes, and the payment is refunded as described in Atomic mint (the\n" #
    "  cause is kept in `refusalCause`).\n" #
    "- Payment: amount paid = position counterpart + reserve part + fees (creator\n" #
    "  share and rounding remainder) + ledger fee (+ the conversion cost for ICP and\n" #
    "  ckBTC), and the position counterpart,\n" #
    "  measured before the zap, equals the reserve part. Refusal texts start with\n" #
    "  \"Mint balance sheet: ...\".\n" #
    "- TTTI-T: the TTTI-T minted equals the TTTI-T in the position plus the TTTI-T\n" #
    "  left in the minter's hand (the zap's sold and bought TTTI-T taken into\n" #
    "  account), and the minter's TTTI-T never decreases. Refusal texts start with\n" #
    "  \"Mint balance sheet: ...\".\n" #
    "- Direction: after a mint, the price of the targeted pool is closer to\n" #
    "  10 000 USD per TTTI-T than before, or equal, and never passes 10 000 USD to\n" #
    "  the other side. A gap of at most 16 base units of the paid token plus the\n" #
    "  mint's rounding dust counts as on target; an empty pool before the mint\n" #
    "  counts as on target. Refusal text: \"Mint direction: the pool price moved\n" #
    "  away from 10 000 USD or passed it\".\n\n" #

    "### Two-source rate rule (mint)\n\n" #
    "- The rate of the paid token must be fresh (the usual validity: one hour\n" #
    "  plus 5 minutes) and confirmed by the other source: Coinbase and CoinGecko\n" #
    "  must agree within 2 % (200 bps; difference = |a - b| x 10 000 / lower\n" #
    "  rate, rounded up). The other source's latest observation per paid token is\n" #
    "  stored beside the main rate (stable field `secondRates`, filled by the\n" #
    "  same hourly timers and the admin refresh calls) and must itself be fresh.\n" #
    "- The rule is checked in `mintLiquidity` before anything is taken and again\n" #
    "  inside the isolated mint core. If the rate itself is absent or expired the\n" #
    "  refusal is `#rateUnavailable { token }`. If the other source is missing or\n" #
    "  stale, or the two differ by more than 2 %, the refusal is\n" #
    "  `#rateSourcesDiverge { token; coinbaseUsdE8 : ?Nat; coingeckoUsdE8 : ?Nat;\n" #
    "  differenceBps : ?Nat; maximumBps = 200 }` (`differenceBps` is null when a\n" #
    "  source is missing). Nothing is taken from the payer; the message reads \"The\n" #
    "  <SYM> rate is not confirmed by both Coinbase and CoinGecko within 200 bps\n" #
    "  (difference ...); nothing was taken\". Retrying after the next hourly rate\n" #
    "  or an admin refresh is safe.\n\n" #

    "### Per-token balance breakdown in the reserve check\n\n" #
    "- In addition to the per-account comparison (DEX reserve check and pause),\n" #
    "  each check builds one breakdown per DEX token: `total` = `poolReserves`\n" #
    "  (native pools) + `guarantees` (common reserve and legacy guarantees) +\n" #
    "  `creatorHoldings` (declared creator holdings and set-aside fees) +\n" #
    "  `dexBalances` (user DEX balances, available + reserved) +\n" #
    "  `permanentLiquidity` (set aside, not yet injected) + `requestDeposits`\n" #
    "  (pair-request deposits) + `auctionDeposits` (bid deposits) + `inFlight`\n" #
    "  (operations started and not settled). It is compared with `ledgerBalance`,\n" #
    "  the balance read on the token's ledger; `difference = ledgerBalance -\n" #
    "  total` (Int); `status` is the same reserve status as for accounts. Amounts\n" #
    "  are base units of the token.\n" #
    "- A confirmed shortfall raises the same alert and the same DEX pause as an\n" #
    "  account shortfall (pause state: `getDexPauseStatus`). A token that could\n" #
    "  not be compared fully keeps its previous row and the snapshot is marked\n" #
    "  incomplete. Nothing is corrected automatically.\n" #
    "- `getDexBalanceBreakdown() : { tokens : [TokenBalanceBreakdown]; checkedAt :\n" #
    "  Int; complete : Bool }` (public query, no sign-in; it never recomputes and\n" #
    "  stores nothing). Each `TokenBalanceBreakdown` is `{ token; poolReserves;\n" #
    "  guarantees; creatorHoldings; dexBalances; permanentLiquidity;\n" #
    "  requestDeposits; auctionDeposits; inFlight; total; ledgerBalance;\n" #
    "  difference; status }`. `checkedAt` is the time (nanoseconds) of the check\n" #
    "  it comes from, 0 before any check. `complete` is false while a batched run\n" #
    "  is in progress, before the first check, when a token could not be\n" #
    "  compared, and after an upgrade until the next check (the breakdown is kept\n" #
    "  in memory only).\n\n" #

    "## Short-lived caches (speed)\n\n" #
    "Five read-only queries are served from in-memory caches that are never stored\n" #
    "and never change a balance, block or ledger entry. Their signatures, arguments\n" #
    "and results are unchanged; a cache only makes the reply faster.\n\n" #
    "- `get_account_transactions` and `list_subaccounts` read a per-account index\n" #
    "  of the ledger blocks. A timer (every 5 seconds, up to 5000 blocks per run,\n" #
    "  re-armed on every install and upgrade) extends it. After an upgrade the\n" #
    "  index starts empty and is rebuilt from the existing ledger by the same\n" #
    "  timer. A query decodes the blocks the index has not covered yet, so the\n" #
    "  reply is complete and identical whatever the index has caught up to; right\n" #
    "  after an upgrade the first calls can be slower until the index catches up.\n" #
    "  Block ids, ordering, paging (`start`, `oldest_tx_id`, 500 per call) and the\n" #
    "  legacy-block conversion are the same as before.\n" #
    "- `listDexPools`, `getDexPool` and `getConsolidatedTttiPrice` reuse a cached\n" #
    "  result for at most 5 seconds, and only while the pools and the consolidated\n" #
    "  samples are unchanged (checked by a fingerprint). The cache is refreshed by\n" #
    "  calls that change a pool (deposits, liquidity, swaps, pair changes) and\n" #
    "  recomputed on demand otherwise, so a reply never shows reserves older than\n" #
    "  the last pool-changing call. Time-dependent fields (such as `computedAt`)\n" #
    "  can be up to 5 seconds old.\n" #
    "- Safe to call and poll as before; nothing is stored, nothing needs a retry\n" #
    "  policy, and no call needs to wait for a cache.\n\n" #

    "## Polling guidance\n\n" #
    "- Purchases, transfers and approvals are synchronous: the reply is final.\n" #
    "  There is no background job to poll, except native BTC deposits (above)\n" #
    "  and the FW/SH transfer retry: a `#pending` forward changes at most every\n" #
    "  10 minutes, when the retry timer runs.\n" #
    "- Poll cheap queries (`getSaleStatus`, `getIcpPrice`, `getTokenPrices`,\n" #
    "  `icrc1_balance_of`) every 10-30 s at most. Each stored rate changes only\n" #
    "  when its hourly timer (or its 5-minute retry) or an allowed admin refresh\n" #
    "  succeeds; polling the prices more than once a minute gains nothing.\n" #
    "- Follow the block log by calling `icrc3_get_blocks` from the last known\n" #
    "  `log_length`, in pages of up to 100.\n" #
    "- Read token balances and metadata directly on each ledger with the\n" #
    "  `icrc1_balance_of` and `icrc1_metadata` queries.\n\n" #

    "## Gotchas\n\n" #
    "- The charged rate is exactly the stored `usdE8` of the paid token shown by\n" #
    "  `getTokenPrices` (ICP also by `getIcpPrice` and\n" #
    "  `getSaleStatus().priceUsdE8`) at the time of the call.\n" #
    "- Amounts are in the paid token's base units: ckUSDC and ckUSDT have 6\n" #
    "  decimals, ICP and ckBTC 8. ckBTC's ledger fee is 10, not 10_000.\n" #
    "- Approve on the ledger of the token you pay with; an ICP approval does not\n" #
    "  cover a ck purchase.\n" #
    "- The price is 10_100 USD per TTTI-T for every pay token; `liveRate` differs\n" #
    "  per token because each token has its own USD rate.\n" #
    "- `getSaleStatus().available` already subtracts in-flight reservations.\n" #
    "- Legacy blocks are text and use 4 decimals below `boundaryIndex`.\n" #
    "- An all-zero subaccount is the same account as `null`.\n" #
    "- There are no wallet helper endpoints and no ICP balance endpoint on this\n" #
    "  canister. Read balances and metadata with the `icrc1_balance_of` and\n" #
    "  `icrc1_metadata` queries directly on the TTTI-T ledger (this canister) and\n" #
    "  the ICP ledger, and build `icrc1_transfer` arguments client-side.\n" #
    "- `icrc1_total_supply` never decreases (no burns) and never exceeds\n" #
    "  `get_max_supply()`. A transfer to the canister principal with a null or\n" #
    "  all-zero subaccount is always refused with error code 8.\n" #
    "- BTC deposits below the minter minimum or refused by its check mint no\n" #
    "  ckBTC. ckBTC refunds go to the caller's own account, not to the delivery\n" #
    "  address. `#pendingRate` keeps the ckBTC in the subaccount until a rate\n" #
    "  exists.\n" #
    "- Admin endpoints trap (reject) instead of returning `#Err`, except\n" #
    "  `markTransferArrived` / `markTransferNotArrived` / `markRefundedManually`,\n" #
    "  `setReceivingWallet`, `getReceivingWallets`, `getSettlementStatus`,\n" #
    "  `getMintFeeAccount`, `listTreasuryWithdrawals` and `listAdminHistory`\n" #
    "  (`#err(#notAdmin)`); ICRC,\n" #
    "  purchase, acknowledgement and delivery-address endpoints return typed errors.\n" #
    "- A wrong \"Not arrived\" on a PC payment drops a real refund obligation;\n" #
    "  check the pay-token ledger for the `TTTI-PC-<n>` memo first.\n" #
    "- Before the liquidity mint (earlier model), the receiving wallet received\n" #
    "  each mint's owner share minus the paid ledger's fee, in the paid token;\n" #
    "  the legacy mint fee account balance is never withdrawable and is not\n" #
    "  part of any admin balance.\n" #
    "- `listAdminHistory` returns `#err(#notAdmin)` instead of trapping; its\n" #
    "  `limit` 0 means 25, not an empty page.\n\n" #

    "## Pagination, batches and the in-flight index (PTM-9e)\n\n" #
    "- Paginated lists: `getMyRoutedSwaps(cursor : ?Nat, limit : Nat)`,\n" #
    "  `adminListRoutedSwaps(cursor : ?Nat, limit : Nat)` and\n" #
    "  `listDexSweepTransfers(cursor : ?Nat, limit : Nat)` return\n" #
    "  `{ items : [T]; nextCursor : ?Nat }`. Newest first. `cursor = null` returns the\n" #
    "  newest items; `cursor = ?c` returns the items whose id (swap id, or sweep\n" #
    "  transfer number `n`) is strictly below `c`. `limit` 0 means the default of 50;\n" #
    "  any `limit` above 100 is cut to the maximum of 100. `nextCursor` is the id of\n" #
    "  the last returned item while older items may remain and null on the last page:\n" #
    "  pass it back unchanged as the next `cursor`. All three are queries (no state\n" #
    "  change, safe to repeat); a page read while new items arrive never repeats or\n" #
    "  skips an older item. Callers: `getMyRoutedSwaps` needs a signed-in caller\n" #
    "  (anonymous gets an empty page); `adminListRoutedSwaps` returns\n" #
    "  `#err(#notAuthorized)` to a non-admin; `listDexSweepTransfers` traps with\n" #
    "  `Unauthorized: only admins can use the DEX sweep` for a non-admin.\n" #
    "- Owner index: each routed swap id is also recorded under its owner when the swap\n" #
    "  is created, so `getMyRoutedSwaps` reads only the caller's own swap ids and never\n" #
    "  scans the whole registry. The index is bookkeeping only; no swap, balance or\n" #
    "  block is altered by it. It is queryable as OQL table `routerOwnerSwap`\n" #
    "  (a user sees only their own rows, the controller sees all).\n" #
    "- Reserve check in batches: a run reads at most 25 ledger balances per batch and\n" #
    "  keeps a persisted cursor (`progress`: run id, target and account position,\n" #
    "  accounts to compare, compared, excluded as zero, unreadable, batch size, last\n" #
    "  batch time). `runDexReserveCheck` (admin) reads the next batch and resumes the\n" #
    "  cursor; the timer continues the run every 60 seconds until it finishes, and the\n" #
    "  hourly timer starts a new run. Each account is compared with a snapshot of its\n" #
    "  obligations taken when its balance is read, so DEX activity during a long run\n" #
    "  does not invalidate the comparison. Deposit accounts already swept to zero are\n" #
    "  excluded and counted in `excludedZero`; an account that is used again is\n" #
    "  included again (see PTM-9f below). `getDexReserveStatus` (admin query,\n" #
    "  `#err(#unauthorized)` otherwise) returns `progress`, `alert` and\n" #
    "  `excludedReread`.\n" #
    "- Zero-compared alert: a run that finishes with zero accounts compared while\n" #
    "  there were accounts to compare raises `alert : ?{ id; at; runId;\n" #
    "  accountsToCompare; accountsCompared; message }` (never a silent success). The\n" #
    "  alert stays until a later run compares at least one account; the short history\n" #
    "  is in OQL table `dexReserveAlert`. This zero-compared alert does not pause the DEX by itself; a confirmed shortfall does (see \"DEX reserve check and pause\").\n" #
    "- Sweep in batches: `runDexSweep` (admin) takes the SWEEP lock for one batch\n" #
    "  only and reads at most the batch size of ledger balances from the persisted\n" #
    "  cursor (`getDexSweepProgress`); call it again, or let the timer continue (every\n" #
    "  10 minutes, up to 4 batches per tick), until `active` is false. Accounts already\n" #
    "  swept to zero are excluded (`excludedZero`). The lock is released between\n" #
    "  batches, and a lock older than 20 minutes is taken over, so it never stays\n" #
    "  held for hours. A second concurrent call returns `#err(#alreadyRunning)`.\n" #
    "  Running again moves nothing more once balances are swept: it is safe to repeat.\n" #
    "- In-flight index: the unfinished DD/DW deposit and withdrawal transfers, sweep\n" #
    "  transfers and routed swaps (status in progress or needs review) are kept in a\n" #
    "  separate index, filled once from the existing records after the upgrade and\n" #
    "  updated as records are created and finish. Resending pending transfers and the\n" #
    "  per-token busy and unsettled-sweep checks read only this index, never the whole\n" #
    "  history. Transfer numbers are assigned in increasing order, so a newer record\n" #
    "  is always found. The index is queryable as OQL table `inflightEntry` (admin).\n" #
    "  `paySetAside` (router, every 10 minutes) visits only the positions of the pool\n" #
    "  concerned and removes zero entries.\n" #
    "- Units: amounts are base units of the token; timestamps are nanoseconds since the\n" #
    "  epoch (Int); ids and counters are Nat.\n\n" #

    "## Paged DEX history, reserve progress and excluded accounts (PTM-9f)\n\n" #
    "- `getDexTransfersPage(owner, cursor, limit)`: see the DEX queries above. Open to\n" #
    "  every caller, any principal can be read; no identity is derived from the caller.\n" #
    "- Reserve check progress: `getDexReserveStatus().progress` has `phase`\n" #
    "  (`#idle` before the first run, `#inProgress` while the cursor has not\n" #
    "  finished, `#finished` after a complete run), `batch` (the batch being read, or\n" #
    "  the last one read between two timer ticks, at least 1 while in progress),\n" #
    "  `totalBatches` (an estimate while in progress, exact once finished) and\n" #
    "  `alertDecided`. Read it as in progress (batch x of y). Poll at most once a\n" #
    "  minute: the continuation timer runs every 60 seconds. `batch` and\n" #
    "  `totalBatches` are also OQL columns of table `dexReserveRun`.\n" #
    "- The zero-compared alert is decided only when the complete run has ended: no\n" #
    "  alert is raised or evaluated after the first batch or during the run, and\n" #
    "  `alertDecided` is true only after the run has finished. During a run a visible\n" #
    "  `alert` is the one of an earlier run; a finished run that compared at least one\n" #
    "  account clears it. The status is a query and safe to repeat; a failed or\n" #
    "  interrupted batch resumes from the stored cursor at the next tick.\n" #
    "- No 30-day exclusion any more. An account swept to zero stays excluded from the\n" #
    "  reserve check and the sweep until it is re-included, in two ways: (1) at once,\n" #
    "  when the DEX records a new deposit (`depositToDex`), pair request\n" #
    "  (`requestPair`), swap (`swap`, `routedSwap`, including routed swaps) or\n" #
    "  withdrawal (`withdrawFromDex`) for that owner and token, so the account is read\n" #
    "  again at the next reserve check and sweep; (2) by the daily re-read below. The\n" #
    "  re-inclusion only removes the exclusion mark: no balance, block or\n" #
    "  `sale.reserved` is changed.\n" #
    "- Daily re-read of the excluded accounts: a timer (every 10 minutes, re-armed on\n" #
    "  every install and upgrade) starts a pass when 24 hours have passed since the\n" #
    "  last complete pass (or there has been none), then reads the ledger balance of\n" #
    "  the excluded accounts in batches of the batch size from a persisted cursor. A\n" #
    "  non-zero balance removes the exclusion at once (counted in `reincluded`); a\n" #
    "  zero balance keeps it; a failed read keeps it and is counted in `unreadable`.\n" #
    "  The SWEEP lock is taken for one batch only and released between batches (a\n" #
    "  lock older than 20 minutes is taken over), so a pass never holds it for hours.\n" #
    "  The pass only reads ledgers and moves nothing, so like the reserve check and the\n" #
    "  sweep it also runs while the DEX is paused. Its state is\n" #
    "  `getDexReserveStatus().excludedReread` (admin): `active`, `runId`, `startedAt`,\n" #
    "  `excludedCount`, `read`, `reincluded`, `unreadable`, `batchSize`,\n" #
    "  `lastBatchAt`, `lastFinishedAt` and `nextRunAt` (lastFinishedAt + 24 h; null\n" #
    "  before the first pass), also OQL table `dexExcludedReread` (admin). The\n" #
    "  excluded accounts are OQL table `dexZeroedAccount` (admin). Running a pass\n" #
    "  twice is harmless.\n" #
    "- Errors and gotchas: a non-admin call to an admin endpoint above returns the\n" #
    "  typed error or traps as described for that endpoint; `getDexTransfersPage` never\n" #
    "  fails (an unknown owner or cursor 0 gives an empty page). Timestamps are\n" #
    "  nanoseconds (Int); counters and transfer numbers are Nat.\n";
  };
};
