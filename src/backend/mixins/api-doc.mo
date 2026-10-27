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
    "- Pause scope: while sales are paused, purchases, buyback requests\n" #
    "  (`requestBuyback`), buyback retries (`retryBuybackPayout`) and\n" #
    "  cancellations (`cancelBuyback`) are refused with `#salesPaused`; the\n" #
    "  automatic buyback payout retries, the FW/SH/RF transfer retries and all\n" #
    "  BTC refunds (BR) are not sent. Recorded attempts are kept and sent after\n" #
    "  the pause. The cycles top-up continues during the pause.\n" #
    "- The price and the 1% fee (every pay token) are code constants; nobody\n" #
    "  can change them.\n\n" #

    "## Purchase acknowledgement (versioned, per principal)\n\n" #
    "- Each principal has at most one stored record `{ acceptedAt : Int; version :\n" #
    "  Nat }` (`acceptedAt` in nanoseconds). The terms version in force is 2.\n" #
    "  Records from before versioning were migrated to version 1 with their\n" #
    "  original `acceptedAt`; they must be accepted again before the next purchase.\n" #
    "- `acceptPurchaseAcknowledgements() : { #ok : PurchaseAcknowledgement; #err :\n" #
    "  #anonymousCaller }` records that the caller accepted the six purchase\n" #
    "  acknowledgements of version 2. Idempotent at the current version: a repeat\n" #
    "  call keeps the first `acceptedAt`. A version 1 record is replaced by\n" #
    "  `{ acceptedAt = now; version = 2 }`.\n" #
    "- `getMyPurchaseAcknowledgement() : { accepted : Bool; acceptedAt : ?Int }`\n" #
    "  (query, never traps): `accepted = true` and `acceptedAt` set only for a\n" #
    "  version 2 record; anonymous, no record or version 1 -> `{ accepted = false;\n" #
    "  acceptedAt = null }`.\n" #
    "- The three purchase controls refuse a caller without a version 2 record\n" #
    "  (version 1 included) with `#acknowledgementRequired` before any token is\n" #
    "  taken: `convertDeposit` / `convertDepositWith`, the BTC purchase\n" #
    "  conversion, and the BTC purchase deposit gates (`getBtcPurchaseAddress`,\n" #
    "  `checkBtcPurchaseDeposit` without a stored tracking).\n\n" #

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
    "   `conversion = ?<record>`. BTC path (`purchaseFromDeposit`): no automatic\n" #
    "   refund, the record is `#refundReview` with `#deliveryFailedRefundFailed`.\n" #
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
    "- `forward` is `#notRequired` (zero amount: the forward base does not cover\n" #
    "  the ledger fee, or the treasury account is the canister's own account),\n" #
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
    "  PC, RF, FW, SH, BB, BR; PC (purchase collect), RF (purchase refund), FW\n" #
    "  (treasury forward) and SH (ICP reserve share) are the ones in use.\n" #
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
    "- A purchase sends its SH (ICP purchases only) and its FW exactly once each,\n" #
    "  with no inline retry. A 10-minute timer, re-armed on every install and\n" #
    "  upgrade, applies the rule to every `#pending` FW/SH (resend, new attempt,\n" #
    "  or `#needsReview`). A forward stays `#pending` while its treasury account\n" #
    "  is not configured. A zero-amount forward is `#notRequired`.\n" #
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
    "- `ReviewError`: `#notAdmin`, `#notFound` (no such purchase, share or\n" #
    "  payment to refund), `#notApplicable` (action not valid for that kind),\n" #
    "  `#notUnderReview` (the transfer is not under review). All mark calls\n" #
    "  are allowed only on a transfer to review, so a repeated call returns\n" #
    "  `#notUnderReview` and changes nothing. Check the ledger (memo and\n" #
    "  `created_at_time`) before marking: a wrong \"Not arrived\" sends again.\n\n" #

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
    "  BtcDepositResult` (signed caller with accepted version 2 purchase acknowledgements)\n" #
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
    "  and requires the caller's accepted version 2 acknowledgements.\n" #
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
    "  (purchase: version 2 acknowledgements required), calls `update_balance` and, when\n" #
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
    "  and the 600 s timer resend the same request for 23 h (not while sales are\n" #
    "  paused), then the refund is listed to review. Success: R2 sets\n" #
    "  `#refunded`; the excess clears `errorKind`/`ckbtcPendingSats`.\n" #
    "- Entries from before this rule (no `created_at_time`): a failure that\n" #
    "  is a ledger `Err` gets a new BR attempt; a reject, trap or ambiguous\n" #
    "  message (e.g. `could not be reached`) is an unknown outcome listed to\n" #
    "  review without a resend. A legacy delivery failure's excess gets a new\n" #
    "  attempt; its ckBTC cost becomes a BM cost to refund by hand.\n" #
    "- BTC cost send (BC): the purchase cost moves to the ckBTC treasury with\n" #
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
    "  `#noAddressYet` remains in the type but is no longer returned.\n" #
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
    "## TTTI-T buyback\n\n" #
    "Buybacks are optional and limited. Each one depends on the funds available\n" #
    "at that moment and on the willingness of whoever funds it. Bought-back\n" #
    "TTTI-T go to the funder, who pays for them with their own money; they are\n" #
    "never pre-mined or pre-allocated. For now, only the creator funds\n" #
    "buybacks.\n\n" #
    "The buyer sells TTTI-T back from a mass: the aggregate of the buyer's\n" #
    "purchases in one payment token. There is one mass per (buyer, token) for\n" #
    "ICP, ckBTC, ckUSDC and ckUSDT; there is no mass across tokens. For new\n" #
    "buybacks the TTTI-T stay in the contract's holding (escrow) account until\n" #
    "the payout succeeds, then go to the funder (admin) account, and the buyer\n" #
    "receives `amountReturned`, as calculated at the request (nothing is\n" #
    "burned, total supply is unchanged). If every payout attempt is refused by\n" #
    "the ledger, the buyer (or an app admin) can cancel with `cancelBuyback`\n" #
    "and get the TTTI-T back; otherwise cancelling waits until the admin has\n" #
    "checked the payout (\"To review\"). A buyback cannot be undone once the\n" #
    "payout has succeeded. Legacy buybacks (made before escrow) had their\n" #
    "TTTI-T sent to the funder at the request; when their payout failed, it is\n" #
    "retried, or the admin is contacted to have them returned\n" #
    "(`markBuybackCancelled`). The returned mass token comes from the admin\n" #
    "account.\n\n" #
    "- Escrow account: `{ owner = this canister; subaccount =\n" #
    "  \"BUYBACK-ESCROW-TTTI-T-0000000001\" (32 bytes) }` on the TTTI-T ledger,\n" #
    "  distinct from the minting account and the fee collector. Transfers to it\n" #
    "  are accepted; no public endpoint, transfer or withdrawal can debit it.\n" #
    "  Only a buyback release (escrow -> funder) or cancellation (escrow ->\n" #
    "  buyer) debits it, internally.\n" #
    "- Mass: `#completed` conversions with `depositor` = caller, that `payToken`,\n" #
    "  `netAmount` ?n with n > 0 and `tttiAmount` > 0. `totalNet` and `totalTtti`\n" #
    "  are their sums; the average ratio is `totalNet` / `totalTtti`. Purchases\n" #
    "  from before Version 26 (`netAmount` null) and TTTI-T received by transfer\n" #
    "  are not counted. BTC-deposit purchases are recorded as ckBTC, count in\n" #
    "  the ckBTC mass and are returned in ckBTC; converting ckBTC to BTC is done\n" #
    "  by the user with the ckBTC minter.\n" #
    "- Bought back: `boughtBackNet` and `boughtBackTtti` sum the caller's buyback\n" #
    "  records in that token whose TTTI-T were pulled (`#completed`,\n" #
    "  `#payoutFailed`, or `#inProgress` with `pullBlock`), legacy per-purchase\n" #
    "  records included. `remainingNet` and `remainingTtti` = total - bought back\n" #
    "  (never below 0).\n" #
    "- Percent: 1..100 of the remainder (`#invalidPercent` otherwise).\n" #
    "  `tttiAmount` = floor(`remainingTtti` * percent / 100);\n" #
    "  `originalNetAmount` = floor(`remainingNet` * `tttiAmount` /\n" #
    "  `remainingTtti`). At 100 they are exactly the whole remainder. Several\n" #
    "  partial buybacks are possible until `remainingTtti` = 0\n" #
    "  (`#nothingRemaining`).\n" #
    "- Lower-of-two rule on the average, in the mass token: `baseAmount` = min(\n" #
    "  `originalNetAmount`, quantity worth `tttiAmount` at 10,000 USD per TTTI-T\n" #
    "  at the day's stored rate). `rule` is `#originalNet` or `#dayRate`.\n" #
    "  Purchase fees are never refunded.\n" #
    "- Paid only in the mass token: `receiveToken` must equal `massToken`,\n" #
    "  otherwise `#receiveTokenMismatch`, checked before any lock, ledger call or\n" #
    "  transfer. `tokenReturned` = the mass token and `baseAmountReturned` =\n" #
    "  `baseAmount`.\n" #
    "- Fees: `buybackFee` = floor(1% of `baseAmountReturned`); `thirdPartyFees` =\n" #
    "  the mass token's ledger fee for the payout. `amountReturned` =\n" #
    "  `baseAmountReturned` - `buybackFee` - `thirdPartyFees`; `#amountTooSmall`\n" #
    "  when not positive or `tttiAmount` = 0. Two TTTI-T fees are paid by the\n" #
    "  buyer through the allowance: `tttiTransferFee` (the pull) and\n" #
    "  `tttiEscrowFee` (stored per buyback; pays the later escrow release or\n" #
    "  cancellation). The mass token's ledger fee stays deducted from\n" #
    "  `amountReturned`.\n" #
    "- Rates: the stored rate of the mass token from `getTokenPrices`, usable\n" #
    "  until validUntil + 5 min; otherwise `#rateUnavailable(token)`.\n" #
    "  `returnedRateUsdE8` = `originalRateUsdE8`. Amounts are base units of each\n" #
    "  token (ICP, ckBTC, TTTI-T: 8 decimals; ckUSDC, ckUSDT: 6); rates USD*10^8.\n" #
    "- One buyback at a time per (caller, mass token): a second request while one\n" #
    "  runs returns `#massBuybackInProgress` (`inProgress` = true in the mass).\n" #
    "- Authentication: every buyer endpoint requires a signed (non-anonymous)\n" #
    "  caller (`#anonymous` otherwise). Masses are always the caller's own; a\n" #
    "  caller cannot see or buy back another user's mass. Use the principal\n" #
    "  derived against the app's Internet Identity derivation origin (see above).\n\n" #
    "Endpoints:\n" #
    "- `listMyBuybackMasses()` (query) : `#ok [BuybackMass]`, the caller's masses\n" #
    "  with at least one counted purchase, fully bought back ones included.\n" #
    "- `quoteBuyback(massToken, percent, receiveToken)` (query) : `#ok\n" #
    "  BuybackQuote` or `#err BuybackError`. Read-only; no external call.\n" #
    "  `tttiAllowanceRequired` = `tttiAmount` + 2 TTTI-T fees.\n" #
    "- `requestBuyback(massToken, percent, receiveToken, fromSubaccount)` :\n" #
    "  prerequisite, the buyer calls `icrc2_approve` on this canister (TTTI-T\n" #
    "  ledger) with this canister as spender, amount >= `tttiAllowanceRequired`\n" #
    "  and an `expires_at`. TTTI-T are pulled from and the payout sent to `{ owner\n" #
    "  = caller; subaccount = fromSubaccount }`. Before any transfer it refuses\n" #
    "  with the quote errors (`#anonymous`, `#invalidPercent`,\n" #
    "  `#receiveTokenMismatch`, `#nothingRemaining`, `#massBuybackInProgress`,\n" #
    "  `#rateUnavailable`,\n" #
    "  `#amountTooSmall`), `#adminAccountNotSet`, `#adminAllowanceExpired`,\n" #
    "  `#adminAllowanceInsufficient`, `#adminBalanceInsufficient` (required =\n" #
    "  `amountReturned` + ledger fee), `#buyerAllowanceInsufficient` or\n" #
    "  `#callFailed` (ledger unreachable, or its fee/decimals changed). Then it\n" #
    "  pulls `tttiAmount` + `tttiEscrowFee` with `icrc2_transfer_from` to the\n" #
    "  escrow account (`pullBlock`; failure: `#pullFailed`, nothing recorded, may\n" #
    "  be requested again). It records a payout attempt in `payoutAttempts`\n" #
    "  (`{ from; attempt }`: global n, attempt index m, memo `TTTI-BB-<n>-<m>`,\n" #
    "  `created_at_time`, full request) before the first await and sends\n" #
    "  `amountReturned` from the admin account to the buyer with\n" #
    "  `icrc2_transfer_from` on the mass token's ledger, with exactly that memo\n" #
    "  and `created_at_time`. Ok or `#Duplicate`: the attempt is `#succeeded`,\n" #
    "  `payoutBlock` set, `tttiAmount` released from escrow to the funder\n" #
    "  account (`releaseBlock`), status `#completed` (a failed release returns\n" #
    "  `#releaseFailed(text)` and is retried by the timer). A ledger Err:\n" #
    "  attempt `#failed(text)`; a rejected call or trap: attempt `#unknown`; both\n" #
    "  give `#payoutFailed` and `#err #payoutFailed(text)`. The ICP cycles\n" #
    "  reserve is never used.\n" #
    "- Retry rule: an `#unknown` attempt is resent identically (same memo,\n" #
    "  `created_at_time`, request) for 23 h, then needs admin review. When every\n" #
    "  attempt got a ledger Err, a retry creates the next attempt (m + 1, new\n" #
    "  memo and `created_at_time`, current admin account) without the admin. A\n" #
    "  10-minute timer does the same (new attempts at most once an hour per\n" #
    "  buyback). Every path takes the same (buyer, mass token) lock.\n" #
    "- `retryBuybackPayout(buybackId)` : only for the caller's own records\n" #
    "  (`#buybackNotFound`, `#notBuyer`) in `#payoutFailed` (`#notRetryable`\n" #
    "  otherwise; `#buybackInProgress` while one runs on that mass;\n" #
    "  `#attemptUnknown` once an unknown attempt is past 23 h). Applies the\n" #
    "  retry rule; nothing is recomputed and TTTI-T are never pulled again.\n" #
    "- `cancelBuyback(id)` : the buyer of that buyback or an app admin\n" #
    "  (`#notAuthorized` otherwise, `#anonymous` for anonymous callers), same\n" #
    "  lock (`#buybackInProgress`). Only when the status is `#payoutFailed`, the\n" #
    "  record is not legacy and every attempt got a ledger Err: `tttiAmount` is\n" #
    "  returned from escrow to `buyerAccount` (the pull fee is not returned),\n" #
    "  status `#cancelled`, `cancelBlock` set. Refusals: `#attemptArrived`,\n" #
    "  `#attemptUnknown`, `#notCancellable` (legacy, other status),\n" #
    "  `#cancelFailed(text)` (escrow transfer refused).\n" #
    "- `markBuybackCancelled(id, block)` : app admin only (`#notAuthorized`),\n" #
    "  for a legacy `#payoutFailed` buyback (`#notLegacy`, `#notCancellable`)\n" #
    "  with no arrived attempt (`#attemptArrived`): records the admin's own\n" #
    "  TTTI-T return `block` as `cancelBlock`, status `#cancelled`. No ledger\n" #
    "  call.\n" #
    "- Legacy records (`legacy` = true, made before escrow; their TTTI-T went to\n" #
    "  the admin account): old `#inProgress` with `pullBlock` and old\n" #
    "  `#payoutFailed` without a ledger Err carry an attempt 0 without memo with\n" #
    "  an unknown outcome (to review); those with a ledger Err can be retried.\n" #
    "  Legacy records are never cancelled with `cancelBuyback`.\n" #
    "- Admin \"To review\": `listTransfersToReview` includes kind `#BB` rows\n" #
    "  (`purchaseId` = buyback id, memo, created_at_time, amount, fee, token,\n" #
    "  destination, outcome) for unknown payout attempts past 23 h and legacy\n" #
    "  `#payoutFailed` buybacks. `markTransferArrived(#BB, id, block)` marks the\n" #
    "  attempt arrived and completes the buyback (escrow release when not\n" #
    "  legacy); `markTransferNotArrived(#BB, id)` marks it failed so the next\n" #
    "  attempt can be created or the buyback cancelled.\n" #
    "- `listMyBuybacks()` (query) : the caller's buyback records, legacy\n" #
    "  per-purchase records (`purchaseId` set, `percent` 100) included.\n" #
    "- Admin only (trap `Unauthorized: admin only`): `listAllBuybackMasses()`\n" #
    "  (query; every buyer's masses), `listAllBuybacks()`\n" #
    "  (query), `setBuybackAdminAccount(account)` (refuses accounts owned by\n" #
    "  this canister or anonymous), `getBuybackAdminAccount()` (query),\n" #
    "  `getBuybackFunding()` (update; per pay token the admin account's\n" #
    "  allowance to this canister, its `expiresAt` in nanoseconds and balance,\n" #
    "  read from the ledgers; `error` on a failed call).\n" #
    "- Admin funding: the admin account calls `icrc2_approve` on each pay-token\n" #
    "  ledger with this canister as spender, a capped amount and an `expires_at`.\n" #
    "  Allowance, expiry and balance are checked before each buyback and retry.\n\n" #
    "Lifecycle: `#inProgress` (pull or payout running) -> `#completed`\n" #
    "(`pullBlock`, `payoutBlock` and `releaseBlock` set) or `#payoutFailed`\n" #
    "(`pullBlock` set, `message` explains) -> retry or `#cancelled`\n" #
    "(`cancelBlock` set; no longer counted against the mass). `#completed` is\n" #
    "final: a buyback cannot be undone once the payout has succeeded. Each record keeps the date (`timestamp`, ns), percent,\n" #
    "the mass before the buyback, rates, rule, tokens, base, fees, amount\n" #
    "returned and TTTI-T taken back. Calls are synchronous; poll\n" #
    "`listMyBuybacks` or `listMyBuybackMasses` only after a lost reply. A\n" #
    "`#payoutFailed` record stays counted against the mass. Retry safety:\n" #
    "`requestBuyback` is not idempotent (each success is a new buyback; re-read\n" #
    "before repeating). A resend uses the attempt's own memo and\n" #
    "`created_at_time`, so a duplicate is detected (`#Duplicate`) and recorded\n" #
    "as arrived; only a new attempt (after a known Err) is a new ledger\n" #
    "transfer. `cancelBuyback` and `markBuybackCancelled` refuse a second call\n" #
    "  (`#notCancellable`).\n" #
    "- `#salesPaused`: `requestBuyback`, `retryBuybackPayout` and `cancelBuyback`\n" #
    "  return it first while sales are paused, before any lock or ledger call;\n" #
    "  the 10-minute automatic payout retry also waits until sales resume.\n\n" #
    "## Upgrade readiness (admin)\n\n" #
    "- `getUpgradeReadiness() : UpgradeReadiness` (admin query; others trap\n" #
    "  `Unauthorized: admin only`): `{ salesPaused; purchasesInFlightCount;\n" #
    "  purchasesInFlight : [Principal]; btcLockHeld (the BTC finalization uses\n" #
    "  the same purchase lock, true when it is not empty); buybacksInFlightCount;\n" #
    "  buybacksInFlight : [Text] (buyback lock keys); reserveLockBusy;\n" #
    "  pendingTopUp : ?TopUpAttempt (stored cycles top-up attempt);\n" #
    "  openTraceCount; openTraces : [PurchaseTrace]; reserved (current\n" #
    "  sale.reserved, TTTI-T base units); lastReconciliation }`. In-flight sets\n" #
    "  are transient and empty right after an upgrade. Before an upgrade, pause\n" #
    "  sales and wait until the counts are 0 and `reserveLockBusy` is false.\n" #
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
    "  all deposit entries), createdAt, lastCheckedAt, errorKind, errorMessage).\n" #
    "  `addressBookContact` (primary key `id`; columns id, owner, nickname,\n" #
    "  principal, memoBytes, createdAt, updatedAt).\n" #
    "  `buyback` (primary key `id`; one row per mass buyback, legacy per-purchase\n" #
    "  rows included; columns id, purchaseId (null except legacy rows), buyer,\n" #
    "  timestamp, originalToken (the mass token), tokenReturned, percent,\n" #
    "  massTotalNet, massTotalTtti, massRemainingNet, massRemainingTtti (mass\n" #
    "  before this buyback), originalRateUsdE8, returnedRateUsdE8, rule,\n" #
    "  originalNetAmount (pro-rata net), baseAmount, baseAmountReturned,\n" #
    "  buybackFee, thirdPartyFees, tttiTransferFee, tttiEscrowFee,\n" #
    "  amountReturned, tttiAmount, pullBlock, payoutBlock, payoutAttemptCount,\n" #
    "  releaseBlock, cancelBlock, legacy, status (inProgress, completed,\n" #
    "  payoutFailed, cancelled), message). Non-legacy rows: TTTI-T stay in the\n" #
    "  holding (escrow) account until the payout succeeds (`releaseBlock` =\n" #
    "  release to the funder) or return to the buyer (`cancelBlock`); legacy\n" #
    "  rows sent TTTI-T to the funder at the request. Buybacks are optional,\n" #
    "  limited and paid by the funder with their own money. Read by\n" #
    "  controllers, app admins\n" #
    "  and the signed-in buyer of each row.\n" #
    "  `reservedReconciliation` (primary key `reconciledAt`; columns\n" #
    "  reconciledAt, previousReserved, by) and `cyclesTopUpAttempt` (primary key\n" #
    "  `createdAtTime`; at most one row, the stored top-up attempt; columns\n" #
    "  createdAtTime, memo, amount, fee, toOwner, blockIndex, createdAt, sends,\n" #
    "  lastError, outcome, needsReview): controllers and app admins only.\n" #
    "  Variants appear as their tag text, null optional values as null. Only\n" #
    "  canister controllers and app admins read conversion and BTC tracking\n" #
    "  rows. Address book rows are read only by their signed-in owner (and\n" #
    "  canister controllers); app admins do not see them. Any other\n" #
    "  signed-in caller sees no rows and anonymous callers are refused. No other\n" #
    "  app data is exposed.\n\n" #

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
    "  `markTransferArrived` / `markTransferNotArrived` / `markRefundedManually`\n" #
    "  (`#err(#notAdmin)`); ICRC,\n" #
    "  purchase, acknowledgement and delivery-address endpoints return typed errors.\n" #
    "- A wrong \"Not arrived\" on a PC payment drops a real refund obligation;\n" #
    "  check the pay-token ledger for the `TTTI-PC-<n>` memo first.\n";
  };
};
