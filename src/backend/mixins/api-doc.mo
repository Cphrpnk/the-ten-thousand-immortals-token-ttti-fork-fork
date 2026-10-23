mixin () {
  public query func getApiDoc() : async Text {
    "# TTTI-T Backend API\n\n" #
    "## Purpose\n\n" #
    "This canister is the TTTI-T (test version) token ledger and its buy-to-mint\n" #
    "sale. TTTI-T is an ICRC-1 / ICRC-2 / ICRC-3 / ICRC-10 token with 8 decimals\n" #
    "and a maximum supply of 1 TTTI-T (100_000_000 base units). Tokens cannot be\n" #
    "burned, so total supply never decreases and never exceeds the cap. Base\n" #
    "price: 1 TTTI-T = 10 000 USD, plus a fixed fee. TTTI-T can be bought with\n" #
    "ICP, ckBTC, ckUSDC or ckUSDT. Every purchase carries a fixed 1% fee, so a\n" #
    "buyer pays 10 100 USD worth of the paid token per TTTI-T. ICP purchases:\n" #
    "the fee share goes to the cycles reserve. ckBTC, ckUSDC and ckUSDT\n" #
    "purchases: the amount paid, fee included, goes to that token's treasury\n" #
    "account; these fees do not become cycles. New TTTI-T is\n" #
    "created only by the purchase logic. The backend keeps only the core\n" #
    "contract: buying, balances, transfers, history and the token standards, plus\n" #
    "a few admin controls (pause sales, refresh rates, the test transfer fee,\n" #
    "the receiving accounts, the balance snapshot export).\n\n" #
    "Nobody, admin included, can mint outside the purchase logic, freeze\n" #
    "transfers, move other holders' tokens, or withdraw the TTTI-T\n" #
    "transfer-fee collector. Nobody can burn tokens. ICP, ckBTC, ckUSDC and\n" #
    "ckUSDT move only by the automatic rules below; the single manual ICP\n" #
    "movement is the admin\n" #
    "withdrawal of the cycles reserve excess above a 2 ICP floor, to the\n" #
    "configured treasury account only.\n\n" #
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
    "  `getBtcWalletAddress` and `checkBtcWalletDeposit` (anonymous -> `#Err` code\n" #
    "  `#anonymousCaller`).\n" #
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
    "  `getIcpPrice`, `getTokenPrices`, `getPublicTreasuryInfo`,\n" #
    "  `getCanisterPrincipal`,\n" #
    "  `getCyclesStatus`, `getBtcDepositInfo`, `schema`, `execute` and `getApiDoc`.\n" #
    "- Caller-scoped: `getMyPurchaseAcknowledgement`,\n" #
    "  `acceptPurchaseAcknowledgements`, `getDeliveryAddress`,\n" #
    "  `setDeliveryAddress`, `clearDeliveryAddress`, `convertDeposit`,\n" #
    "  `convertDepositWith`, `getBtcPurchaseAddress`, `checkBtcPurchaseDeposit`,\n" #
    "  `getBtcWalletAddress`, `checkBtcWalletDeposit`, `getMyBtcDeposits`,\n" #
    "  `getMyConversions`.\n" #
    "  No endpoint reads or triggers another principal's BTC deposits.\n" #
    "- Admin-only reads: `getTreasuryConfig`, `getConversions`,\n" #
    "  `exportBalanceSnapshot`.\n" #
    "- Admin-only writes: `setSalesPaused`, `refreshIcpPrice`,\n" #
    "  `refreshTokenPrice`, `set_fee` (test\n" #
    "  version only), `setTreasuryConfig` (receiving ICP account),\n" #
    "  `setPayTokenAccount` (receiving account of one pay token),\n" #
    "  `withdrawReserveExcess` (cycles reserve excess\n" #
    "  to the treasury account only). There is no admin mint, no burn endpoint,\n" #
    "  no transfer freeze and no withdrawal of the TTTI-T fee collector or of the\n" #
    "  reserve floor.\n\n" #

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
    "- Metadata: `icrc1_name` = \"TTTI-T\", `icrc1_symbol` = \"TTTI-T\",\n" #
    "  `icrc1_decimals` = 8, `icrc1_fee`, `icrc1_total_supply`,\n" #
    "  `icrc1_balance_of`, `icrc1_metadata` (`icrc1:name`, `icrc1:symbol`,\n" #
    "  `icrc1:decimals`, `icrc1:fee`, `icrc1:max_memo_length` = 32,\n" #
    "  `icrc1:max_supply`).\n" #
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
    "  `mintableRemaining = max(0, maxSupply - icrc1_total_supply)`. Every purchase\n" #
    "  mint is refused if `totalSupply + minted` would exceed the max supply.\n" #
    "  Tokens cannot be burned, so once 1 TTTI-T has been minted\n" #
    "  `mintableRemaining` is 0 and stays 0.\n" #
    "- Transfer fees stay in the fee collector and are sold again against ICP:\n" #
    "  each delivery mints first (up to `mintableRemaining`), then takes the rest\n" #
    "  from the fee collector.\n" #
    "- `set_fee(newFee) : { #ok; #err : Text }` (admin, TTTI-T test version only;\n" #
    "  trap `Unauthorized: only admins can set the fee`). Range:\n" #
    "  `get_fee_bounds() = { min; max }`, otherwise `#err`. `get_fee()`,\n" #
    "  `get_max_supply()`.\n\n" #

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
    "  (mintableRemaining + feeAccountBalance - reserved); complete; minPurchase\n" #
    "  (10_000); tokenPriceUsd (10_000); cyclesFeeBps (100);\n" #
    "  buyerPriceUsd (10_100); salesPaused; priceUsdE8 (the stored\n" #
    "  ICP rate, exactly the one an ICP purchase applies); priceSource;\n" #
    "  priceFetchedAt; priceValidUntil;\n" #
    "  priceUsable (now <= priceValidUntil + 5 minutes); liveRate; payTokens }`.\n" #
    "- `payTokens : [PayTokenStatus]` (order #icp, #ckbtc, #ckusdc, #ckusdt):\n" #
    "  `{ token; symbol; ledgerCanisterId; decimals; ledgerFee; feeBps (100\n" #
    "  for every token); minimumUsdE8 (101_000_000 for every token);\n" #
    "  buyerPriceUsd (10_100 for every token); fundsCycles (true only for ICP);\n" #
    "  treasuryConfigured; priceUsdE8; priceSource; priceFetchedAt;\n" #
    "  priceValidUntil; priceUsable; liveRate }`.\n" #
    "- `maxRateAgeSeconds` in `getTechnicalDetails` is 3_900 (1 h + 5 min).\n" #
    "- `getTechnicalDetails() : TechnicalDetails` (public) returns the ledger\n" #
    "  canister ID, token name and symbol, decimals, standards, the ICP ledger\n" #
    "  canister ID, oracle sources, refresh policy, max rate age, price, fee\n" #
    "  (`cyclesFeeBps` 100 and `buyerPriceUsd` 10_100),\n" #
    "  minimum purchase, smallest unit, rounding rule, excess payment handling,\n" #
    "  delivery order, current transfer fee, max and total supply, the fee account\n" #
    "  and its balance, `cyclesReserveAccount`, `reserveFloorE8s` (200_000_000)\n" #
    "  and `reserveRule` (the reserve rule text), plus `controllers`,\n" #
    "  `moduleHash`, `canisterInfoFetchedAt`, `legacyBlockBoundary` (see\n" #
    "  Canister info) and `payTokens` (as above). `excessPaymentHandling` states\n" #
    "  that payment beyond the cost of what is delivered is never taken.\n" #
    "- `setSalesPaused(Bool)` (admin; trap `Unauthorized: only admins can manage\n" #
    "  the TTTI-T sale`). Idempotent.\n" #
    "- The price and the 1% fee (every pay token) are code constants; nobody\n" #
    "  can change them.\n\n" #

    "## Purchase acknowledgement (once per principal)\n\n" #
    "- `acceptPurchaseAcknowledgements() : { #ok : PurchaseAcknowledgement; #err :\n" #
    "  #anonymousCaller }` records once that the caller accepted the six purchase\n" #
    "  acknowledgements. Idempotent: a repeat call keeps the first `acceptedAt`.\n" #
    "- `getMyPurchaseAcknowledgement() : { accepted : Bool; acceptedAt : ?Int }`\n" #
    "  (query, never traps; anonymous -> not accepted).\n" #
    "- A purchase by a caller without an acknowledgement is refused with\n" #
    "  `#acknowledgementRequired` before any token is taken.\n\n" #

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
    "   `#acknowledgementRequired`, `#notConfigured` (ICP treasury account not\n" #
    "   set), `#tokenNotConfigured { token }` (no receiving account set for this\n" #
    "   pay token), `#invalidAmount` (0), `#salesPaused`, `#saleComplete`; then\n" #
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
    "5. The amount is reserved before the first ledger transfer (no\n" #
    "   overselling) and released on every failure. The token is collected with\n" #
    "   `icrc2_transfer_from` into the canister's own account on that ledger.\n" #
    "   Ledger refusals return `#approvalMissing { token; allowance }`,\n" #
    "   `#insufficientBalance { token; balance }` or `#ledgerError { token }`,\n" #
    "   and nothing is taken.\n" #
    "6. Delivery goes to `recipient`, else the stored delivery address, else\n" #
    "   `{ owner = caller; subaccount = null }`: freshly minted first, from the fee\n" #
    "   account only once minting reached the cap. No TTTI-T fee is charged.\n" #
    "7. Refund: if delivery fails, the collected amount is sent back to the\n" #
    "   buyer's default account on the same ledger minus that ledger's fee:\n" #
    "   `#Err` code `#deliveryFailedRefunded` (record `#refunded`) or, if the\n" #
    "   refund also fails, `#deliveryFailedRefundFailed` (record `#refundFailed`,\n" #
    "   needs manual follow-up), both with `conversion = ?<record>`.\n" #
    "8. Success records a `#completed` conversion and returns `#Ok(Conversion)`.\n" #
    "   The collected amount is then forwarded automatically (see Receiving\n" #
    "   accounts).\n\n" #
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
    "  `floor(payAmount * feeBps / (10_000 + feeBps))`. Never refundable. For\n" #
    "  ICP it is exactly the cycles reserve share.\n" #
    "- `netAmount`: the net pay-token base units converted, fee excluded;\n" #
    "  `payAmount = netAmount + feeAmount`. The only refundable basis.\n" #
    "- `paymentBlock`: block index on the pay-token ledger of the payment\n" #
    "  collection (`icrc2_transfer_from`, or the BTC deposit subaccount\n" #
    "  transfer to the ckBTC treasury).\n" #
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

    "## Receiving accounts\n\n" #
    "- `setTreasuryConfig({ icpAccount }) : { #Ok : TreasuryConfig; #Err : Text }`\n" #
    "  (admin; trap `Unauthorized: only admins can manage the treasury`) sets the\n" #
    "  account that receives the ICP of future purchases. It does not move ICP.\n" #
    "  `getTreasuryConfig() : ?TreasuryConfig` (admin). Every purchase is refused\n" #
    "  with `#notConfigured` until it is set.\n" #
    "- `setPayTokenAccount(token, account) : { #Ok : { token; account : ?Account };\n" #
    "  #Err : Text }` (admin; same trap) sets the account that receives that pay\n" #
    "  token on its own ledger; `#icp` sets the ICP account above. It moves\n" #
    "  nothing. Purchases in a ck token are refused with `#tokenNotConfigured`\n" #
    "  until its account is set. Safe to repeat.\n" #
    "- `getPublicTreasuryInfo() : ?{ icpAccount; tokenAccounts : [{ token;\n" #
    "  account : ?Account }] }` (public query, null until the ICP account is set;\n" #
    "  `tokenAccounts` in the order #icp, #ckbtc, #ckusdc, #ckusdt).\n" #
    "- ck purchases (ckBTC, ckUSDC, ckUSDT): the 1% fee is part of the price and\n" #
    "  is forwarded during the purchase to that token's treasury account. The whole collected\n" #
    "  amount is forwarded on the same ledger, minus that ledger's fee; nothing\n" #
    "  goes to the cycles reserve.\n" #
    "- ICP purchases, fee split of each delivered purchase (cost = `icpAmount`):\n" #
    "  the cycles reserve share `share = floor(cost * 100 / 10_100)` e8s is sent\n" #
    "  from the\n" #
    "  canister's default account to the cycles reserve account (the 10_000 e8s\n" #
    "  ledger fee is paid on top, so the reserve receives exactly `share`). The\n" #
    "  treasury part `cost - share - 10_000` (or `cost` when share is 0) is then\n" #
    "  forwarded to `icpAccount`, which receives it minus another 10_000 e8s\n" #
    "  ledger fee (`#notRequired` when `icpAccount` is the canister's own account).\n" #
    "  Earlier ICP conversions keep their recorded feeBps and shares unchanged.\n" #
    "- `forward` is `#notRequired`, `#pending`, `#forwarded(blockIndex on the\n" #
    "  pay-token ledger)` or\n" #
    "  `#failed(reason)`. A failed forward or reserve transfer never undoes the\n" #
    "  buyer's credit. After the next successful purchase, failed forwards are\n" #
    "  retried on their own ledger with the treasury part only (never the\n" #
    "  reserve share again) and\n" #
    "  failed reserve transfers are retried to the reserve only; each is marked\n" #
    "  `#pending` before its ledger call. There is no manual forward endpoint.\n" #
    "- `getConversions() : [Conversion]` (admin): the purchase history.\n" #
    "- `getMyConversions() : [Conversion]` (query, any caller, never traps):\n" #
    "  only the conversions where the caller is the `depositor` or the\n" #
    "  `recipient.owner`, sorted by `id` descending (newest first). An anonymous\n" #
    "  caller gets `[]`. No registration needed. Safe to poll; it changes only\n" #
    "  when a purchase is recorded or its `forward` status is updated.\n" #
    "- `getCanisterPrincipal()` (public): the ICRC-2 spender to approve on every\n" #
    "  pay-token ledger. Read balances directly on each ledger (`icrc1_balance_of`\n" #
    "  query).\n\n" #

    "## Cycles reserve\n\n" #
    "Fixed 1% fee on every purchase. ICP purchases: the fee share\n" #
    "cost*100/10_100 of each ICP purchase is kept in the canister's public\n" #
    "cycles reserve and converted to cycles automatically when the cycles\n" #
    "balance is below 3 T cycles. ck purchases add nothing to the reserve; their\n" #
    "fees go to each token's treasury and do not become cycles. Not all reserve\n" #
    "ICP is converted: the ICP above a 2 ICP floor is transferable in ICP to the\n" #
    "treasury account only, with `withdrawReserveExcess`; the floor always stays\n" #
    "available for cycles. This transfer is blocked while the cycles balance is\n" #
    "below 3 T cycles or a top-up is running or awaiting confirmation.\n\n" #
    "- Reserve account (ICP ledger): `{ owner = <this canister>; subaccount =\n" #
    "  \"CYCLES-RESERVE-TTTI-T-0000000001\" }` (32 ASCII bytes, fixed). Also in\n" #
    "  `getCyclesStatus().reserveAccount` and `getTechnicalDetails()`.\n" #
    "- Constants: floor `RESERVE_FLOOR_E8S` = 200_000_000 e8s (2 ICP); top-up\n" #
    "  threshold 3_000_000_000_000 cycles; each top-up targets about\n" #
    "  2_000_000_000_000 cycles; minimum top-up 100_000 e8s.\n" #
    "- Automatic top-up: a timer, re-armed on every install and upgrade, runs\n" #
    "  immediately and then every 6 hours (21_600 s). If the cycles balance is\n" #
    "  below the threshold it reads `get_icp_xdr_conversion_rate` from the CMC\n" #
    "  (`rkp4c-7iaaa-aaaaa-aaaca-cai`), computes `icpE8s = 2_000_000_000_000 *\n" #
    "  10_000 * 10^8 / (xdr_permyriad_per_icp * 10^12)` (1 XDR = 10^12 cycles),\n" #
    "  capped at the\n" #
    "  reserve balance minus 10_000 e8s. The top-up may go below the floor: the\n" #
    "  floor protects cycles against withdrawals, not against top-ups. It sends\n" #
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
    "- `getCyclesStatus() : CyclesStatus` (public query): `{ cyclesBalance;\n" #
    "  topUpThreshold; reserveAccount; reserveBalanceE8s; reserveFloorE8s;\n" #
    "  withdrawableExcessE8s; lastTopUp : ?{ timestamp; icpE8s; blockIndex; status\n" #
    "  (#transferred | #notified { cycles } | #failed : Text); lastError };\n" #
    "  withdrawals : [{ timestamp; amountE8s; blockIndex }]; withdrawalAllowed :\n" #
    "  Bool; withdrawalBlockedReason : ?(#topUpRunning |\n" #
    "  #topUpAwaitingConfirmation | #cyclesBelowThreshold) }`.\n" #
    "  `withdrawalAllowed` is true exactly when `withdrawalBlockedReason` is null;\n" #
    "  the reason is checked in that order (lock held, top-up awaiting notify or\n" #
    "  ledger reply, cycles balance below 3_000_000_000_000). `reserveBalanceE8s`\n" #
    "  is a cache refreshed from the ICP ledger by the timer and after each\n" #
    "  reserve movement; read `icrc1_balance_of(reserveAccount)` on the ICP ledger\n" #
    "  for the live value. `withdrawableExcessE8s = max(0, reserveBalanceE8s -\n" #
    "  200_000_000 - 10_000)`. Timestamps are nanoseconds (Candid `int`), ICP in\n" #
    "  e8s, cycles as plain Nat.\n" #
    "- `withdrawReserveExcess(amount : Nat) : WithdrawReserveResult` (admin;\n" #
    "  others trap with `Unauthorized: only the administrator can withdraw the\n" #
    "  cycles reserve excess`). Transfers exactly `amount` e8s from the reserve to\n" #
    "  the configured treasury `icpAccount` and nowhere else; the sender pays the\n" #
    "  10_000 e8s fee on top, so the reserve never drops below the floor. Results:\n" #
    "  `#ok(icpBlockIndex)` (logged in `withdrawals`); `#busy` (a top-up or\n" #
    "  another withdrawal holds the shared lock); `#topUpPendingNotify` (a top-up\n" #
    "  transfer still awaits notify or its ledger reply); `#cyclesBelowThreshold {\n" #
    "  cyclesBalance; topUpThreshold }` (cycles balance below 3_000_000_000_000;\n" #
    "  returned before any ledger call); `#treasuryNotConfigured`; `#noExcess`\n" #
    "  (excess is 0); `#amountExceedsExcess { withdrawableE8s }`; `#ledgerError`\n" #
    "  (balance unreadable, amount 0, or the transfer failed). The balance is\n" #
    "  re-read from the ledger under the lock first; `#noExcess` and\n" #
    "  `#amountExceedsExcess` never call the transfer.\n" #
    "- Retry safety: a withdrawal is NOT idempotent. After a timeout check\n" #
    "  `getCyclesStatus().withdrawals` (or the ledger) before retrying. `#busy`,\n" #
    "  `#topUpPendingNotify` and `#cyclesBelowThreshold` moved nothing and are safe to retry later.\n" #
    "- Polling: the cycles status changes at most every 6 hours (plus purchases\n" #
    "  and withdrawals); polling `getCyclesStatus` more than once a minute gains\n" #
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
    "  BtcDepositResult` (signed caller with accepted purchase acknowledgements)\n" #
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
    "  moves from the subaccount to the ckBTC treasury account; ckBTC beyond the\n" #
    "  remaining supply is refunded to the caller's own ckBTC account minus the\n" #
    "  10 sat ledger fee. A Conversion is recorded as for other purchases.\n" #
    "- Wallet (BTC -> ckBTC only): `getBtcWalletAddress()` returns the minter\n" #
    "  address for owner = caller, no subaccount. `checkBtcWalletDeposit()` calls\n" #
    "  `update_balance` for the caller; ckBTC is minted directly to the caller's\n" #
    "  own account. No TTTI-T and no app fee.\n" #
    "- Stable address: exactly one Bitcoin address per principal per flow. The\n" #
    "  first `getBtcPurchaseAddress` / `getBtcWalletAddress` call stores it; every\n" #
    "  later call returns the stored tracking without calling the minter. It is\n" #
    "  never rotated, before or after its deposits are spent, and can be reused\n" #
    "  for any number of deposits.\n" #
    "- `getMyBtcDeposits() : { purchase : ?DepositTracking; wallet : ?DepositTracking }`\n" #
    "  (query) returns only the caller's trackings (null before the address was\n" #
    "  requested).\n" #
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
    "  ckbtcMintBlockIndex; detectedAt; updatedAt; errorKind; errorMessage }`.\n" #
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
    "  minted), or `#unrecoverable` (purchase: the refund failed, or delivery\n" #
    "  and refund failed; `ckbtcPendingSats` is the ckBTC still held; never\n" #
    "  retried automatically); older records may show `#other` with the same\n" #
    "  meaning. Refund failure on a delivered purchase: stage `#delivered`,\n" #
    "  `errorKind` `#refundFailed`, `errorMessage` the reason and\n" #
    "  `ckbtcPendingSats` the ckBTC still held on that entry; later checks and\n" #
    "  the timer retry that refund (only while the subaccount still holds every\n" #
    "  amount the entries account for) and clear both fields on success.\n" #
    "  `#addressShown` appears only at tracking level; tracking-level\n" #
    "  `errorKind` may be `#minterUnavailable` or `#other`.\n" #
    "- Errors (`#Err { code; message }`): `#anonymousCaller`,\n" #
    "  `#acknowledgementRequired`, `#purchaseInProgress` (one purchase per\n" #
    "  principal, shared with `convertDeposit*` and the background timer),\n" #
    "  `#noAddressYet` (check before requesting the address),\n" #
    "  `#minterUnavailable` (minter unreachable and no further stage reached).\n" #
    "- Background watch: a canister timer runs right after every install and\n" #
    "  upgrade, then every 600 s. Each tick calls the minter `update_balance`\n" #
    "  for purchase trackings at any stage (address shown, confirming,\n" #
    "  finished) and for wallet trackings, so deposits sent while the page is\n" #
    "  closed are detected; purchase ckBTC is then converted into TTTI-T exactly\n" #
    "  as by `checkBtcPurchaseDeposit`, and `#pendingRate` is finalized once a\n" #
    "  valid rate exists. Trackings checked in the last 5 minutes are skipped,\n" #
    "  at most 25 minter calls are made per tick (confirming deposits first,\n" #
    "  then the least recently checked), and a principal with a purchase in\n" #
    "  progress is skipped. A deposit may therefore appear up to about 10 minutes\n" #
    "  (longer with many trackings) after its confirmations without any client\n" #
    "  call.\n" #
    "- Polling: BTC needs about 6 confirmations (about one hour). While the\n" #
    "  widget is open, call the check endpoint every `suggestedPollSeconds` (60 s)\n" #
    "  at most, or poll `getMyBtcDeposits` (query) and let the timer progress the\n" #
    "  deposit. An entry is done once final (see above); the address stays in\n" #
    "  use, so keep watching it (the timer does) for a new transfer, which\n" #
    "  appears as a new entry.\n" #
    "- Retry safety: both check calls are idempotent and safe to repeat;\n" #
    "  repeated or concurrent calls (yours and the timer's) never mint or\n" #
    "  deliver twice for the same UTXO or ckBTC. `#purchaseInProgress` means the\n" #
    "  timer or another call is finishing that purchase; retry a few seconds\n" #
    "  later. The address endpoints are safe to repeat and return the same\n" #
    "  address.\n" #
    "- Identity gotcha: the address is derived from the caller principal. The\n" #
    "  draft and live domains of the app give different Internet Identity\n" #
    "  principals, hence different trackings and different Bitcoin addresses;\n" #
    "  a deposit sent to one domain's address is visible only when signed in on\n" #
    "  that domain. The same applies to Internet Identity versus Plug.\n\n" #
    "## Other endpoints\n\n" #
    "- `exportBalanceSnapshot() : { exportedAt; totalSupply; decimals; holders }`\n" #
    "  (admin query; trap `Unauthorized: only admins can manage the TTTI-T sale`).\n" #
    "  Each holder is `{ account; balance; deliveryAddress; needsMigration; kind\n" #
    "  (#holder/#feeCollector) }`; zero balances are excluded.\n" #
    "- Data intelligence (OQL): `schema()` and `execute(qJson)` expose two\n" #
    "  tables. `conversion` (primary key `id`; columns id, depositor,\n" #
    "  recipientOwner, payToken, payAmount, feeAmount, netAmount, feeBps,\n" #
    "  icpAmount, tttiAmount, status, timestamp, priceUsdE8, usedFallback,\n" #
    "  minted, fromCollector, forward, message, paymentBlock, mintBlock).\n" #
    "  `btcDepositTracking` (primary key `key` = \"<principal>:<kind>\"; columns\n" #
    "  key, principal, kind, btcAddress, stage, depositCount, btcDetectedSats,\n" #
    "  ckbtcMintedSats, ckbtcPendingSats, tttiDelivered, refundedSats (sums over\n" #
    "  all deposit entries), createdAt, lastCheckedAt, errorKind, errorMessage).\n" #
    "  Variants appear as their tag text, null optional values as null. Only\n" #
    "  canister controllers and app admins read their rows; any other signed-in\n" #
    "  caller sees no rows and anonymous callers are refused. No other app data\n" #
    "  is exposed.\n\n" #

    "## Polling guidance\n\n" #
    "- Purchases, transfers and approvals are synchronous: the reply is final.\n" #
    "  There is no background job to poll, except native BTC deposits (above).\n" #
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
    "- Admin endpoints trap (reject) instead of returning `#Err`; ICRC, purchase,\n" #
    "  acknowledgement and delivery-address endpoints return typed errors.\n";
  };
};
