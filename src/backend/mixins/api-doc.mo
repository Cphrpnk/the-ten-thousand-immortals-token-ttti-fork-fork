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
    "buyer pays 10 100 USD worth of the paid token per TTTI-T (101 for 100).\n" #
    "The amount paid is collected into this canister's default account on the\n" #
    "paid token's ledger and stays in the paid token. The 100/101 owner share is\n" #
    "sent automatically to the destination account set by the admin for that\n" #
    "token, and accumulates while none is set. The 1/101 fee is split in two\n" #
    "halves for the TTTI-T pair of the paid token with the lowest liquidity:\n" #
    "half A to that pair's LPs pro rata (set aside when it has no LP), half B\n" #
    "set aside for permanent liquidity (see Mint revenue). New TTTI-T is\n" #
    "created only by the purchase logic. The backend keeps only the core\n" #
    "contract: buying, balances, transfers, history and the token standards, plus\n" #
    "a few admin controls (pause sales, refresh rates, the test transfer fee,\n" #
    "the balance snapshot export).\n\n" #
    "Nobody, admin included, can mint outside the purchase logic, freeze\n" #
    "transfers, move other holders' tokens, or withdraw the TTTI-T\n" #
    "transfer-fee collector. Nobody can burn tokens. ICP, ckBTC, ckUSDC and\n" #
    "ckUSDT move only by the automatic rules below. There is no manual\n" #
    "withdrawal: not from the cycles reserve, not from the internal mint\n" #
    "treasuries, not from the protocol fee account, not from protocol\n" #
    "liquidity (DEX lot 4).\n\n" #
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
    "  `exportBalanceSnapshot`, `getCyclesAutonomy`, `getCyclesShare`,\n" #
    "  `getCyclesShareHistory`, `getMintTreasuryAccounts`,\n" #
    "  `getLastWeeklyAllocation`, `listWeeklyAllocations`, `listDcBatches`.\n" #
    "- Public (lot 4): `getProtocolLiquidity`. Caller-scoped (lot 4):\n" #
    "  `getMyLpBonus`, `claimLpBonus`.\n" #
    "- Admin-only writes: `setSalesPaused`, `refreshIcpPrice`,\n" #
    "  `refreshTokenPrice`, `set_fee` (test version only).\n" #
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
    "   `#acknowledgementRequired`, `#notConfigured` (no stored legacy treasury\n" #
    "   configuration), `#tokenNotConfigured { token }` (kept in the type; no\n" #
    "   longer returned since DEX lot 4), `#invalidAmount` (0), `#salesPaused`, `#saleComplete`; then\n" #
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
    "   The owner share (100/101) and the mint fee (1/101) are then routed\n" #
    "   automatically (see Mint revenue, below).\n\n" #
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
    "  routed as the 1/101 mint fee (see Mint revenue).\n" #
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
    "  one-time treasury sweep (below).\n" #
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
    "  PC, RF, FW, SH, BB, BR, DD, DW, DQ, DC, DL, OW, SR, MF; PC (purchase\n" #
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
    "  Not arrived opens a new attempt to the token's current owner destination\n" #
    "  (new memo and `created_at_time`), sent by the 10-minute retry timer.\n" #
    "  `#SR` (id = attempt `n`): the one-time sweep reserve top-up; Arrived\n" #
    "  records it and the sweep continues; Not arrived opens a new attempt.\n" #
    "  `#MF` (id = claim `n`): a mint-fee claim; Arrived(block) records it\n" #
    "  claimed; Not arrived closes the claim and returns its amount to the\n" #
    "  owner's claimable mint-fee balance. `markRefundedManually` on OW/SR/MF\n" #
    "  returns `#notApplicable`.\n" #
    "- `ReviewError`: `#notAdmin`, `#notFound` (no such purchase, share or\n" #
    "  payment to refund), `#notApplicable` (action not valid for that kind),\n" #
    "  `#notUnderReview` (the transfer is not under review). All mark calls\n" #
    "  are allowed only on a transfer to review, so a repeated call returns\n" #
    "  `#notUnderReview` and changes nothing. Check the ledger (memo and\n" #
    "  `created_at_time`) before marking: a wrong \"Not arrived\" sends again.\n\n" #

    "## Cycles reserve\n\n" #
    "Fixed 1% fee on every purchase (the 1/101 mint fee, see Mint revenue).\n" #
    "Since the mint revenue correction, new mints send nothing to the cycles\n" #
    "reserve; earlier ICP purchases sent their share cost*100/10_100 there. The\n" #
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
    "  withdrawals : [{ timestamp; amountE8s; blockIndex }] }`. `withdrawals` is\n" #
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
    "  `poolPriceSample` (key `<poolId>/<at>`; poolId, at, reserve0, reserve1).\n" #
    "  Variants appear as their tag text, null optional values as null. Only\n" #
    "  canister controllers and app admins read conversion and BTC tracking\n" #
    "  rows. Address book rows are read only by their signed-in owner (and\n" #
    "  canister controllers); app admins do not see them. Any other\n" #
    "  signed-in caller sees no rows and anonymous callers are refused. No other\n" #
    "  app data is exposed.\n\n" #
    "## DEX pair registry (lot 1)\n\n" #
    "Purpose: a registry of v2 constant-product pools and of public pair\n" #
    "requests. This lot creates no liquidity, no LP shares and no swaps. The\n" #
    "protocol places no price-based order and mints no TTTI-T for pools.\n\n" #
    "Units and encodings: amounts are token base units (TTTI-T in e8s, so\n" #
    "50_000 = 0.0005 TTTI-T and 10_000 = 0.0001 TTTI-T); fees are basis points\n" #
    "(`FeeTier` `#bps5` = 5, `#bps30` = 30, `#bps100` = 100); timestamps are\n" #
    "Int nanoseconds since the epoch. Pool accounts are `{ owner = this\n" #
    "canister; subaccount }` where the subaccount is the 32-byte ASCII text\n" #
    "`DEX-POOL-` followed by the pool id zero-padded to 23 digits (pool 1 =\n" #
    "`DEX-POOL-00000000000000000000001`). Request deposits are held in the\n" #
    "subaccount `DEX-REQUEST-DEPOSIT-TTTI-T-00001` (32 ASCII bytes) of this\n" #
    "canister on the TTTI-T ledger. `#internal` token ledger = this canister's\n" #
    "TTTI-T ledger; `#external(p)` = ledger canister p.\n\n" #
    "Authentication and authorization: queries are open to everyone,\n" #
    "anonymous included. `requestPair` needs a signed-in caller; anonymous\n" #
    "callers get `#anonymous`. `approvePair`, `refusePair`, `removePair` and\n" #
    "`setUtilityPairMinimums` are admin-only and return `#notAuthorized` to\n" #
    "any other caller, with nothing changed. The caller principal is the one\n" #
    "derived against the app's Internet Identity derivation origin (see\n" #
    "above); a principal derived elsewhere is a different requester.\n\n" #
    "Queries:\n" #
    "- `listDexPools() : [PoolView]`, `getDexPool(poolId) : ?PoolView`. A\n" #
    "  `PoolView` carries tokens (ledgerId, symbol, decimals, isTttiT), feeTier,\n" #
    "  feeBps, kind (`#tttiPair` / `#utilityPair`), status\n" #
    "  (`#filling` / `#active` / `#removed`, effective status: a `#filling`\n" #
    "  pool is reported `#active` once its reserves reach 100 USD), subaccount and\n" #
    "  subaccountText, poolAccount, minimumLocked (per token, null = not set),\n" #
    "  firstDepositMinimum (10 x minimumLocked), minimumsSet,\n" #
    "  lockedSharesStatement (\"The minimum locked shares sqrt(A x B) belong to\n" #
    "  the contract forever.\"), newPairBadgeUntil / newPairBadgeActive (30\n" #
    "  days after approval), approvalStatement (\"Approval of a pair is not a\n" #
    "  recommendation.\", only on pools created from a request), requestId,\n" #
    "  removedAt and the flags acceptsSwaps (status `#active`), acceptsDeposits\n" #
    "  (not removed and minimums set) and acceptsWithdrawals (always true).\n" #
    "  `launchMinimumTotalUsdE8` (10_000_000_000 = 100 USD, computed, same\n" #
    "  on every pool) is the launch depth rule below.\n" #
    "- The 7 starting pools (ids 1-7, fee tier `#bps30`, status\n" #
    "  `#filling`): TTTI-T/ICP, TTTI-T/ckBTC, TTTI-T/ckUSDC,\n" #
    "  TTTI-T/ckUSDT (TTTI-T pairs, TTTI-T side minimum 10_000) and ckBTC/ICP,\n" #
    "  ckUSDC/ICP, ckUSDT/ICP (utility pairs; minimums null until the admin sets\n" #
    "  them with `setUtilityPairMinimums`).\n" #
    "- `getDexConfig() : DexConfig`: requestDeposit (50_000), depositAccount,\n" #
    "  maxPendingPerUser (2), refusalCooldownNs (7 days), messageMaxChars and\n" #
    "  reasonMaxChars (280), newPairBadgeNs (30 days), tttiMinimumLocked\n" #
    "  (10_000), firstDepositMultiplier (10), feeTiers and the three statements,\n" #
    "  plus the launch depth fields: launchMinimumTotalUsdE8 (10_000_000_000 =\n" #
    "  100 USD), usdRateScale (100_000_000: USD values are USD x 1e8, like the\n" #
    "  stored usdE8 rates), tttiTUsdE8 (1_000_000_000_000 = 10,000 USD per\n" #
    "  TTTI-T), rateValidForNs (1 hour), rateGraceNs (5 minutes) and\n" #
    "  launchDepthStatement. All are computed constants, not stored state.\n" #
    "- `listPairRequests() : [PairRequestView]` (all requests, ascending id)\n" #
    "  and `getMyPairRequests()` (the caller's). Each view shows the token\n" #
    "  metadata read from its ledger, the counter token, fee tier, message,\n" #
    "  checks `{ icrc1; icrc2; metadataRead; pairUnique; copiedSymbolOf }`,\n" #
    "  copiedSymbol (true when the symbol copies a known token: flagged, not\n" #
    "  rejected), depositAmount, depositBlock, status and refundBlock.\n\n" #
    "Request lifecycle: `#pending` -> `#approved { poolId; at }` or\n" #
    "`#refused { reason; at }` (the reason is public). Both are final.\n\n" #
    "- `requestPair({ ledgerId; counter; feeTier; message }) :\n" #
    "  Result<PairRequestView, RequestPairError>`. `counter` is `#icp`,\n" #
    "  `#ckbtc`, `#ckusdc`, `#ckusdt`, `#tttiT` or `#poolToken(ledger)` (a\n" #
    "  token of a non-removed pool). Before calling, the caller must\n" #
    "  `icrc2_approve` this canister on the TTTI-T ledger for at least the\n" #
    "  deposit plus one TTTI-T transfer fee (50_000 + fee). Checks, in order,\n" #
    "  all before any deposit is taken: anonymous, message length, pending\n" #
    "  limit (2), refusal cooldown (7 days after the caller's last refusal),\n" #
    "  ledger validity, counter token, pair uniqueness (same two ledgers in\n" #
    "  either order with the same fee tier, among pools and non-refused\n" #
    "  requests), ICRC-1 and ICRC-2 in `icrc1_supported_standards` (or\n" #
    "  `icrc10_supported_standards`), metadata (name, symbol, decimals, fee);\n" #
    "  limits and uniqueness are checked again after the ledger reads. Then\n" #
    "  50_000 TTTI-T are taken with transfer_from into the deposit subaccount\n" #
    "  and the request is recorded `#pending` with the deposit block. Errors:\n" #
    "  `#anonymous`, `#messageTooLong { max }`, `#tooManyPending { max }`,\n" #
    "  `#cooldown { until }`, `#invalidToken(text)` (TTTI-T itself, anonymous\n" #
    "  or same ledger on both sides), `#unknownCounterToken`,\n" #
    "  `#pairExists { poolId; requestId }`, `#ledgerUnreachable(text)`,\n" #
    "  `#missingStandards { icrc1; icrc2 }`, `#metadataUnavailable(text)`,\n" #
    "  `#insufficientAllowance { allowance; required }`,\n" #
    "  `#insufficientFunds { balance }`, `#depositFailed(text)`. Retry safety:\n" #
    "  not idempotent. Every error leaves nothing taken and nothing recorded,\n" #
    "  so it can be retried; a successful call followed by a repeat returns\n" #
    "  `#pairExists` (the pending request) instead of a second deposit.\n" #
    "- `approvePair(requestId, minimums : ?{ token0; token1 }) :\n" #
    "  Result<PoolView, ApprovePairError>` (admin). TTTI-T pairs take null\n" #
    "  (TTTI-T side minimum 10_000; TTTI-T is token0); utility pairs require\n" #
    "  both minimums > 0 (token0 = the requested token, token1 = the counter\n" #
    "  token). The pool is created `#filling` with the new-pair\n" #
    "  badge for 30 days and the request becomes `#approved` with\n" #
    "  refundStatus `#inProgress`. Then the deposit minus one TTTI-T transfer\n" #
    "  fee is refunded (DQ, see lot 2) from the deposit subaccount to the\n" #
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
    "- `removePair(poolId) : Result<PoolView, RemovePairError>` (admin):\n" #
    "  status `#removed`; acceptsSwaps and acceptsDeposits become false,\n" #
    "  acceptsWithdrawals stays true. Errors: `#notAuthorized`,\n" #
    "  `#poolNotFound`, `#alreadyRemoved`.\n" #
    "- `setUtilityPairMinimums(poolId, { token0; token1 }) : Result<PoolView,\n" #
    "  SetMinimumsError>` (admin, utility pairs before any liquidity: refused\n" #
    "  with `#liquidityAlreadyAdded` once totalShares > 0 or the pool is open). Errors:\n" #
    "  `#notAuthorized`, `#poolNotFound`, `#notUtilityPair`, `#poolRemoved`,\n" #
    "  `#liquidityAlreadyAdded`, `#invalidMinimums` (a zero minimum).\n\n" #
    "Launch depth rule: the first deposit that launches a pool must total at\n" #
    "least 100 USD, both sides combined (`launchMinimumTotalUsdE8`). Rate\n" #
    "basis: TTTI-T at a fixed 10,000 USD per token; ICP, ckBTC, ckUSDC and\n" #
    "ckUSDT at the hourly stored rate, used only within its validity (1 hour\n" #
    "after the fetch plus 5 minutes of grace). A side's USD value is amount x\n" #
    "usdE8 / 10^decimals, rounded down. The rule adds to the minimum locked\n" #
    "liquidity (TTTI-T side 10_000; utility pairs: per-token minimums set by\n" #
    "the admin) and to the first deposit >= 10 x that minimum; the most\n" #
    "demanding rule applies.\n\n" #
    "Filling rule (lot 3): the 100 USD figure is now the opening threshold of\n" #
    "a `#filling` pool, reached by one or several liquidity adds (see the DEX\n" #
    "liquidity section below). The minimum locked liquidity and the 10x first\n" #
    "deposit minimum still apply to the first add.\n\n" #
    "Gotchas: a removed pool still reports acceptsWithdrawals = true; approval\n" #
    "is not a recommendation; the copied-symbol flag does not block a request;\n" #
    "the protocol places no price-based order and mints no TTTI-T for pools.\n" #
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
    "liquidity positions are public and linked to the identifier on TTTI.\n\n" #
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
    "  `#needsReview`, `#completed(block)`, `#failed(text)`) and lastError.\n\n" #
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
    "Pair deposit refund (DQ): `approvePair` refunds 50_000 minus one TTTI-T\n" #
    "fee from `DEX-REQUEST-DEPOSIT-TTTI-T-00001` with memo `TTTI-DQ-<n>` and\n" #
    "created_at_time, under one lock per request. The request's refundStatus\n" #
    "is `#none` (refused or pending), `#inProgress`, `#needsReview` or\n" #
    "`#refunded(block)` (refundBlock filled). Never refunded twice.\n\n" #
    "Retry and dedup: ledgers deduplicate on (memo, created_at_time). An\n" #
    "unknown outcome (rejected call) is resent identically by a 10-minute\n" #
    "timer (re-armed on every install and upgrade) for 23 h, then becomes\n" #
    "`#needsReview`. A DQ ledger Err opens a new attempt (`TTTI-DQ-<n>-<m>`,\n" #
    "new created_at_time). Admin \"To review\" (`listTransfersToReview`) lists\n" #
    "DD, DW and DQ rows (kind `#DD`/`#DW`/`#DQ`; purchaseId = n, or the\n" #
    "request id for DQ). `markTransferArrived`: DD credits the balance once,\n" #
    "DW finalizes the debit, DQ marks the request refunded.\n" #
    "`markTransferNotArrived`: DD becomes `#failed` with no credit, DW gives\n" #
    "the balance back, DQ opens a new attempt sent by the timer.\n\n" #
    "Polling: poll `getDexTransfers` and `getDexBalances` every 10-30 s while\n" #
    "a row is `#inProgress`; it changes at most every 10 minutes after an\n" #
    "unknown outcome. Retry safety: a new `depositToDex` or `withdrawFromDex`\n" #
    "call is a new transfer with a new memo; do not repeat a call whose row is\n" #
    "still `#inProgress`. OQL tables `dexBalance` (primary key `key` =\n" #
    "`<principal>/<symbol>`) and `dexTransfer` (primary key `key` = `DD-<n>`,\n" #
    "`DW-<n>` or `DQ-<request id>`; memo, createdAtTime, sends, outcome,\n" #
    "block, status) are public.\n\n" #
    "## DEX liquidity, positions and swaps (lot 3)\n\n" #
    "Units: token amounts, reserves and shares are base units (TTTI-T, ICP,\n" #
    "ckBTC 8 decimals = e8; ckUSDC, ckUSDT 6). USD values are USD x 1e8.\n" #
    "Timestamps (`createdAt`, `unlockAt`, `deadline`, `newUnlockAt`) are Int\n" #
    "nanoseconds since the epoch; durations (`lockDurationNs`) are Nat ns.\n" #
    "Fees, price impact and slippage are basis points (1 bps = 0.01 %).\n\n" #
    "Pool lifecycle: an approved pool starts `#filling`. Several users may add\n" #
    "liquidity; swaps stay closed until the total USD value of both reserves\n" #
    "reaches 100 USD (`gauge.targetUsdE8` = 10_000_000_000). USD value: TTTI-T\n" #
    "at a fixed 10,000 USD; ICP, ckBTC, ckUSDC, ckUSDT at the stored hourly rate,\n" #
    "valid 1 h after its fetch plus 5 min grace. The check runs on every add and\n" #
    "on every pool read (effective status); an add that reaches the target\n" #
    "stores `#active`, and an open pool stays open. A missing or expired rate\n" #
    "means no opening: the gauge reports `valueAvailable = false`,\n" #
    "`currentUsdE8 = null`, `remainingUsdE8 = null` and `missingRate { token0;\n" #
    "token1 }`. `PoolView` adds reserve0, reserve1, totalShares, lockedShares,\n" #
    "protocolFee0, protocolFee1 and `gauge { currentUsdE8; targetUsdE8;\n" #
    "remainingUsdE8; valueAvailable; missingRate }`. `#removed`: no adds or\n" #
    "swaps; LP withdrawals always allowed, even when locked. No instantaneous\n" #
    "pool price is used as an oracle; the protocol places no price-based order.\n\n" #
    "Authentication: queries are open to everyone (anonymous included);\n" #
    "updates need a signed-in caller (anonymous gets `#anonymous`). The owner\n" #
    "of a position or balance is the caller principal derived against the\n" #
    "app's Internet Identity derivation origin (see above). There is no admin\n" #
    "function on other users' positions. All amounts move between internal\n" #
    "DEX balances (lot 2); no ledger transfer happens in these calls.\n\n" #
    "Rounding always favors the pool: counter amounts and fees round up;\n" #
    "minted shares, withdrawals and amountOut round down.\n\n" #
    "- `quoteAddLiquidity({ poolId; side; amount; counterAmount }) :\n" #
    "  Result<AddLiquidityQuote, AddLiquidityError>` (query, no change):\n" #
    "  isFirstDeposit, amount0, amount1, shares, lockedShares,\n" #
    "  totalSharesAfter, gaugeAfter, opensPool. Same computation as\n" #
    "  `addLiquidity`.\n" #
    "- `addLiquidity({ poolId; side; amount; counterAmount; lockDurationNs }) :\n" #
    "  Result<AddLiquidityResult, AddLiquidityError>`. Debits the caller's\n" #
    "  `available` balances of both tokens on a `#filling` or `#active` pool.\n" #
    "  First add (totalShares = 0): `counterAmount` is required and fixes the\n" #
    "  ratio; each side must be >= 10 x its minimum locked liquidity; it mints\n" #
    "  floor(sqrt(amount0 x amount1)) shares, of which lockedShares (the shares\n" #
    "  holding the minimum locked amounts, rounded up, at least 1) belong to\n" #
    "  the contract forever and are never withdrawable; the depositor receives\n" #
    "  the rest. Later adds: the contract computes the counter amount from the\n" #
    "  reserves, ceil(amount x reserveOther / reserveSide); a given\n" #
    "  `counterAmount` that differs returns `#ratioMismatch {\n" #
    "  requiredCounterAmount }`; shares = min(amount0 x total / reserve0,\n" #
    "  amount1 x total / reserve1), rounded down. Each add creates its own\n" #
    "  position locked for lockDurationNs (24 h minimum, 5 years =\n" #
    "  157_766_400_000_000_000 ns maximum); unlockAt = now + lockDurationNs.\n" #
    "  isCreator = the caller had the admin role at add time (same rules).\n" #
    "  Errors: `#anonymous`, `#poolNotFound`, `#poolRemoved`, `#minimumsNotSet`,\n" #
    "  `#unsupportedToken`, `#zeroAmount`, `#counterAmountRequired`,\n" #
    "  `#insufficientBalance { token; available; required }`, `#belowMinimum\n" #
    "  { token0Minimum; token1Minimum }`, `#ratioMismatch {\n" #
    "  requiredCounterAmount }`, `#lockTooShort { minimumNs }`, `#lockTooLong\n" #
    "  { maximumNs }`, `#zeroShares`, `#operationInProgress`. Retry safety: not\n" #
    "  idempotent; each success is a new position. Errors change nothing.\n" #
    "- `removeLiquidity(positionId) : Result<RemoveLiquidityResult,\n" #
    "  RemoveLiquidityError>`. Owner only, at or after unlockAt (any time on a\n" #
    "  removed pair). Burns the position's shares and credits shares x reserve\n" #
    "  / totalShares of each token (rounded down) to the owner's `available`\n" #
    "  balances; the position is deleted. Errors: `#anonymous`,\n" #
    "  `#positionNotFound`, `#notPositionOwner`, `#poolNotFound`,\n" #
    "  `#positionLocked { unlockAt }`, `#operationInProgress`. Retry safety: a\n" #
    "  repeat after success returns `#positionNotFound`; never paid twice.\n" #
    "- `extendLock(positionId, newUnlockAt : Int) : Result<PositionView,\n" #
    "  ExtendLockError>`. Owner only; newUnlockAt >= current unlockAt and <=\n" #
    "  now + 5 years; never shortens. Errors: `#anonymous`, `#positionNotFound`,\n" #
    "  `#notPositionOwner`, `#cannotShortenLock { unlockAt }`, `#lockTooLong {\n" #
    "  maximumUnlockAt }`, `#operationInProgress`. Retry safety: idempotent for\n" #
    "  the same newUnlockAt.\n" #
    "- Positions are public: `getDexPosition(positionId) : ?PositionView`,\n" #
    "  `listPoolPositions(poolId)`, `listDexPositionsOf(owner)`. A PositionView\n" #
    "  has id, poolId, owner (principal), shares, amount0, amount1 (pro rata,\n" #
    "  rounded down), token symbols, createdAt, lockDurationNs, unlockAt,\n" #
    "  isCreator, unlocked (now >= unlockAt) and withdrawable (unlocked or the\n" #
    "  pair is removed). The contract-owned lockedShares have no position.\n" #
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
    "  tier (5, 30 or 100 bps). Of each fee, 70 % (lpFee) stays in the pool\n" #
    "  reserves for LPs; 30 % (protocolFee = floor(fee x 30 / 100)) is added to\n" #
    "  protocolFee0 / protocolFee1, kept outside the reserves and not used in\n" #
    "  pricing until it is added as permanent liquidity (see Mint revenue). Refused with no state change when\n" #
    "  amountOut < minAmountOut (`#slippageExceeded { amountOut; minAmountOut\n" #
    "  }`), when now > deadline (`#deadlineExceeded { deadline; now }`) or when\n" #
    "  deadline > now + 5 minutes (`#deadlineTooFar { maximum }`). Other errors:\n" #
    "  `#anonymous`, `#poolNotFound`, `#poolFilling { gauge }`, `#poolRemoved`,\n" #
    "  `#poolNotOpen`, `#unsupportedToken`, `#tokenNotInPool`, `#zeroAmount`,\n" #
    "  `#invalidSlippage { maximumBps }` (quote), `#insufficientBalance {\n" #
    "  available }`, `#insufficientLiquidity`, `#operationInProgress`. Retry\n" #
    "  safety: not idempotent; each success is a new swap, but the deadline\n" #
    "  bounds a late resend to 5 minutes and minAmountOut bounds its price.\n\n" #
    "Concurrency: one operation at a time per position and per owner token;\n" #
    "a concurrent call returns `#operationInProgress`. Polling: re-read\n" #
    "`getDexPool` / `quoteSwap` before each swap; reserves change with every\n" #
    "swap and add. OQL table `dexPool` adds reserve and share columns; table\n" #
    "`dexPosition` (primary key `id`; poolId, owner, shares, createdAt,\n" #
    "lockDurationNs, unlockAt, isCreator) is public.\n\n" #

    "## Mint revenue: owner share, mint fee and liquidity injections\n\n" #
    "Price: a mint collects 101 for 100. Of the collected cost (pay-token base\n" #
    "units), `feeAmount` = floor(cost x 100 / 10_100) is the 1/101 mint fee and\n" #
    "`netAmount` = cost - feeAmount is the 100/101 owner share. Both stay in\n" #
    "the paid token (BTC counts as ckBTC). No TTTI-T is created for pools, no\n" #
    "order depends on the TTTI-T price and nothing is sent to the cycles\n" #
    "reserve. Token keys are \"icp\", \"ckbtc\", \"ckusdc\", \"ckusdt\".\n\n" #
    "### Owner destinations and owner sends (OW, admin)\n\n" #
    "- `setOwnerDestination(token, account) : Result<OwnerDestinationView,\n" #
    "  OwnerRevenueError>` (admin): sets the ICRC account receiving the owner\n" #
    "  share of `token`, records the change in the history, then sends the\n" #
    "  amount accumulated for that token (one OW send) and resumes a sweep\n" #
    "  waiting for it. Errors: `#notAdmin`, `#anonymousOwner`,\n" #
    "  `#invalidSubaccount` (not 32 bytes), `#contractAccount` (an account of\n" #
    "  this canister).\n" #
    "- `clearOwnerDestination(token)` (admin): later shares accumulate.\n" #
    "  `#notConfigured` when the token has no destination.\n" #
    "- `listOwnerDestinations() : [OwnerDestinationView]` (admin query): one row\n" #
    "  per pay token `{ token; account : ?Account; setAt : ?Int; accumulated }`.\n" #
    "- `getOwnerAccumulated() : [{ token; amount }]` (admin query): shares not\n" #
    "  yet sent, held in the canister default account of each ledger.\n" #
    "- `listOwnerSends(offset, limit) : { items; total; offset }` (admin query,\n" #
    "  newest first, limit capped at 100). Each item: `{ id; token; amount (share\n" #
    "  before the ledger fee); fee; destination; source (#mint(conversionId) |\n" #
    "  #accumulated | #treasurySweep); status (#pending | #sent(block) |\n" #
    "  #needsReview | #failed(text)); block; memoText; createdAtTimeNs : nat64;\n" #
    "  attempt; sends; lastError; createdAt; updatedAt }`.\n" #
    "- Rule: after each delivered mint, with a destination, the share is\n" #
    "  recorded as an OW send before the first await (destination receives\n" #
    "  amount - ledger fee, memo `TTTI-OW-<n>`, `created_at_time` set) and sent\n" #
    "  once by the call; without a destination, or when the share does not\n" #
    "  cover the ledger fee, it is added to the accumulated amount. The\n" #
    "  10-minute retry timer resends identically for 23 h (Ok or `#Duplicate`\n" #
    "  = `#sent`), opens a new attempt `TTTI-OW-<n>-<m>` to the current\n" #
    "  destination after a ledger Err, and moves an unknown outcome to To\n" #
    "  review (`#OW`) after 23 h. Owner sends wait while sales are paused.\n\n" #
    "### One-time treasury sweep (SR + OW, admin read)\n\n" #
    "- Runs once from the retry timer: first tops the cycles reserve up to\n" #
    "  2 ICP (200_000_000 e8s) from MINT-TREASURY-ICP (memo `TTTI-SR-<n>`,\n" #
    "  To review kind `#SR`), then sends every remaining internal mint treasury\n" #
    "  balance to that token's owner destination as an OW send with source\n" #
    "  `#treasurySweep`. A token without destination waits\n" #
    "  (`#waitingDestination`) until one is set.\n" #
    "- `getTreasurySweepStatus() : TreasurySweepView` (admin query): `{ status\n" #
    "  (#notStarted | #toppingUpReserve | #sending | #completed); startedAt;\n" #
    "  completedAt; reserveTopUpE8s; reserveTopUpBlock; reserveTopUpMemo;\n" #
    "  tokens : [{ token; balance : ?Nat; status (#pending | #waitingDestination\n" #
    "  | #nothingToSend | #sending(sendId) | #sent(sendId)) }] }`. The status\n" #
    "  never returns to `#notStarted`; the sweep never runs twice.\n\n" #
    "### Mint fee (1/101): LP balances and set-aside amounts\n\n" #
    "- The fee (minus the paid ledger's fee when it was moved first, as for\n" #
    "  BTC mints) is routed at delivery, in the paid token, to the TTTI-T pair\n" #
    "  of that token with the lowest USD liquidity: half A (floor(fee / 2)) to\n" #
    "  that pair's LP positions pro rata to their shares (to the set-aside\n" #
    "  amount when the pair has no LP, rounding remainders included), half B\n" #
    "  to the set-aside amount. Accounting only, no ledger transfer.\n" #
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
    "- 70 % of each native swap fee stays in the reserves for LPs; 30 % is\n" #
    "  added to the same pool as permanent locked liquidity by the 10-minute\n" #
    "  pass, at the pool ratio (the part beyond the ratio waits). Nothing goes\n" #
    "  to cycles. `getProtocolLiquidity()` (public) shows it.\n\n" #
    "### Admin data, polling and gotchas\n\n" #
    "- `getUpgradeReadiness` adds `ownerSendsInFlight : [Nat]` (pending OW ids),\n" #
    "  `sweepStatus`, `mintFeeClaimsInFlight : [Nat]` (claims `#inProgress`) and\n" #
    "  `injectionsInFlight : [Nat]` (`#swapping` / `#addingLiquidity`). Before\n" #
    "  an upgrade wait until these lists are empty.\n" #
    "- OQL tables: `ownerDestination`, `ownerSend`, `treasurySweep`,\n" #
    "  `mintFeeRouting` (admin only); `mintFeeBalance`, `mintFeeClaim` (owner\n" #
    "  or admin); `setAsideAmount`, `liquidityInjection` (public).\n" #
    "- Poll `getMyMintFees`, `listOwnerSends` and `getSetAsideAmounts` every\n" #
    "  10-30 s at most; they change at most every 10 minutes after a mint.\n" #
    "- Timers re-armed on every install and upgrade: retries (FW / SH / RF / OW\n" #
    "  / SR) every 10 minutes, DL / MF retries, fee recycling and injections\n" #
    "  every 10 minutes, price samples every 5 minutes.\n" #
    "- A wrong \"Not arrived\" on OW or MF sends again: check the ledger for the\n" #
    "  memo first.\n\n" #
    "## DEX lot 4 history: DC, cycles share and weekly allocation (read-only)\n\n" #
    "DC batches, the dynamic cycles share, the DL bonus credited from swap\n" #
    "fees and the weekly allocation no longer run since the mint revenue\n" #
    "correction. Their records stay readable as history; bonuses already\n" #
    "earned stay claimable with `claimLpBonus`; ICP held for cycles stays\n" #
    "recorded. The descriptions below describe how that history was produced.\n" #
    "All constants below are fixed in the code; no endpoint changes them. The\n" #
    "protocol never places a price-dependent order, never mints or buys TTTI-T\n" #
    "for pools and does no buyback or price support. Figures are observed\n" #
    "values only; no yield projection is computed.\n\n" #
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
    "- Cycles share (part of the 20 % pool protocol share, basis points):\n" #
    "  between 500 (5 %) and 4000 (40 %); 4000 below 45 days of autonomy, 500\n" #
    "  above 180 days, linear in between. Adjusted at most once a day, by at\n" #
    "  most 1000 bps (10 percentage points) per adjustment; starts at 4000.\n" #
    "  `getCyclesShare() : CyclesShareView` (admin, same trap): shareBps,\n" #
    "  targetShareBps, minShareBps, maxShareBps, lowAutonomyDays,\n" #
    "  highAutonomyDays, maxStepBps, minAdjustIntervalNs, lastAdjustAt,\n" #
    "  nextAdjustAfter, autonomyDays. `getCyclesShareHistory() : [ShareChange]`\n" #
    "  (admin, same trap; newest first): `{ at; oldShareBps; newShareBps;\n" #
    "  autonomyDays }`.\n\n" #
    "### Split of the 20 % protocol share of each swap fee (history)\n\n" #
    "Swaps keep 20 % of each fee in pool.protocolFee0/1 (lot 3). Every hour the\n" #
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
    "  fees; no TTTI-T is minted or bought for them. Amounts beyond the ratio\n" #
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
