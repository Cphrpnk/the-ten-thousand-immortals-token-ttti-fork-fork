import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Account {
    owner: Principal;
    subaccount?: Subaccount;
}
export type AcknowledgedAt = bigint;
export type AddressBookError = {
    __kind__: "invalidInput";
    invalidInput: InvalidReason;
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "duplicateNickname";
    duplicateNickname: null;
} | {
    __kind__: "limitReached";
    limitReached: {
        max: bigint;
    };
};
export interface Allowance {
    allowance: bigint;
    expires_at?: Timestamp__2;
}
export interface AllowanceArgs {
    account: Account;
    spender: Account;
}
export interface ApproveArgs {
    fee?: bigint;
    memo?: Uint8Array;
    from_subaccount?: Subaccount;
    created_at_time?: Timestamp__2;
    amount: bigint;
    expected_allowance?: bigint;
    expires_at?: Timestamp__2;
    spender: Account;
}
export type ApproveError = {
    __kind__: "GenericError";
    GenericError: {
        message: string;
        error_code: bigint;
    };
} | {
    __kind__: "TemporarilyUnavailable";
    TemporarilyUnavailable: null;
} | {
    __kind__: "Duplicate";
    Duplicate: {
        duplicate_of: bigint;
    };
} | {
    __kind__: "ExpiredFrom";
    ExpiredFrom: {
        ledger_time: Timestamp__2;
    };
} | {
    __kind__: "BadFee";
    BadFee: {
        expected_fee: bigint;
    };
} | {
    __kind__: "AllowanceChanged";
    AllowanceChanged: {
        current_allowance: bigint;
    };
} | {
    __kind__: "CreatedInFuture";
    CreatedInFuture: {
        ledger_time: Timestamp__2;
    };
} | {
    __kind__: "TooOld";
    TooOld: null;
} | {
    __kind__: "Expired";
    Expired: {
        ledger_time: Timestamp__2;
    };
} | {
    __kind__: "InsufficientFunds";
    InsufficientFunds: {
        balance: bigint;
    };
};
export type ApproveResult = {
    __kind__: "Ok";
    Ok: bigint;
} | {
    __kind__: "Err";
    Err: ApproveError;
};
export interface ArchiveInfo {
    end: bigint;
    canister_id: Principal;
    start: bigint;
}
export type AttemptOutcome = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "unknown";
    unknown: null;
} | {
    __kind__: "failed";
    failed: string;
} | {
    __kind__: "succeeded";
    succeeded: bigint;
};
export interface BalanceSnapshot {
    decimals: number;
    totalSupply: bigint;
    exportedAt: Timestamp__2;
    holders: Array<SnapshotEntry>;
}
export interface Block {
    id: bigint;
    block: Value__1;
}
export type BlockIndex = bigint;
export interface BtcCostToRefund {
    amount: bigint;
    refundedBlock?: bigint;
    conversionId?: bigint;
}
export interface BtcDepositError {
    code: BtcDepositErrorCode;
    message: string;
}
export interface BtcDepositInfo {
    depositMinSats: bigint;
    suggestedPollSeconds: bigint;
    checkFeeSats: bigint;
    infoFetchedAt?: Timestamp;
    minterCanisterId: Principal;
    ckbtcLedgerId: Principal;
    purchaseFeeBps: bigint;
    minConfirmations: bigint;
}
export type BtcDepositResult = {
    __kind__: "Ok";
    Ok: DepositTracking;
} | {
    __kind__: "Err";
    Err: BtcDepositError;
};
export interface BtcRefund {
    attempt: TransferAttempt;
    purpose: BtcRefundPurpose;
}
export interface BtcUsdRate {
    fetchedAt: Timestamp;
    source: PriceSource;
    usdE8: bigint;
    validUntil: Timestamp;
}
export interface Buyback {
    id: BuybackId;
    status: BuybackStatus;
    buybackFee: bigint;
    buyerAccount: Account;
    tttiEscrowFee: bigint;
    payoutAttempts: Array<BuybackPayoutAttempt>;
    tokenReturned: PayToken;
    massTotalNet: bigint;
    massRemainingTtti: bigint;
    rule: BuybackRule;
    cancelBlock?: bigint;
    returnedRateUsdE8: bigint;
    thirdPartyFees: bigint;
    payoutBlock?: bigint;
    baseAmountReturned: bigint;
    originalRateUsdE8: bigint;
    originalToken: PayToken;
    pullBlock?: bigint;
    originalNetAmount: bigint;
    percent: bigint;
    releaseBlock?: bigint;
    message?: string;
    legacy: boolean;
    tttiTransferFee: bigint;
    timestamp: Timestamp;
    massRemainingNet: bigint;
    baseAmount: bigint;
    tttiAmount: bigint;
    buyer: Principal;
    purchaseId?: PurchaseId;
    amountReturned: bigint;
    massTotalTtti: bigint;
}
export type BuybackError = {
    __kind__: "payoutFailed";
    payoutFailed: string;
} | {
    __kind__: "notCancellable";
    notCancellable: null;
} | {
    __kind__: "callFailed";
    callFailed: string;
} | {
    __kind__: "notLegacy";
    notLegacy: null;
} | {
    __kind__: "adminBalanceInsufficient";
    adminBalanceInsufficient: {
        token: PayToken;
        balance: bigint;
        required: bigint;
    };
} | {
    __kind__: "salesPaused";
    salesPaused: null;
} | {
    __kind__: "attemptArrived";
    attemptArrived: null;
} | {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "invalidPercent";
    invalidPercent: null;
} | {
    __kind__: "adminAllowanceInsufficient";
    adminAllowanceInsufficient: {
        token: PayToken;
        required: bigint;
        allowance: bigint;
    };
} | {
    __kind__: "adminAccountNotSet";
    adminAccountNotSet: null;
} | {
    __kind__: "notBuyer";
    notBuyer: null;
} | {
    __kind__: "pullFailed";
    pullFailed: string;
} | {
    __kind__: "amountTooSmall";
    amountTooSmall: null;
} | {
    __kind__: "releaseFailed";
    releaseFailed: string;
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "rateUnavailable";
    rateUnavailable: PayToken;
} | {
    __kind__: "receiveTokenMismatch";
    receiveTokenMismatch: null;
} | {
    __kind__: "buybackInProgress";
    buybackInProgress: null;
} | {
    __kind__: "cancelFailed";
    cancelFailed: string;
} | {
    __kind__: "adminAllowanceExpired";
    adminAllowanceExpired: {
        token: PayToken;
    };
} | {
    __kind__: "notRetryable";
    notRetryable: null;
} | {
    __kind__: "attemptUnknown";
    attemptUnknown: null;
} | {
    __kind__: "massBuybackInProgress";
    massBuybackInProgress: null;
} | {
    __kind__: "nothingRemaining";
    nothingRemaining: null;
} | {
    __kind__: "buyerAllowanceInsufficient";
    buyerAllowanceInsufficient: {
        required: bigint;
        allowance: bigint;
    };
} | {
    __kind__: "buybackNotFound";
    buybackNotFound: null;
};
export interface BuybackFunding {
    token: PayToken;
    expiresAt?: bigint;
    balance: bigint;
    error?: string;
    allowance: bigint;
}
export type BuybackId = bigint;
export interface BuybackMass {
    token: PayToken;
    boughtBackTtti: bigint;
    remainingTtti: bigint;
    totalTtti: bigint;
    totalNet: bigint;
    purchaseCount: bigint;
    buyer: Principal;
    remainingNet: bigint;
    boughtBackNet: bigint;
    inProgress: boolean;
}
export interface BuybackPayoutAttempt {
    attempt: TransferAttempt;
    from: Account;
}
export interface BuybackQuote {
    buybackFee: bigint;
    tttiEscrowFee: bigint;
    tttiAllowanceRequired: bigint;
    tokenReturned: PayToken;
    massTotalNet: bigint;
    massRemainingTtti: bigint;
    rule: BuybackRule;
    returnedRateUsdE8: bigint;
    thirdPartyFees: bigint;
    baseAmountReturned: bigint;
    originalRateUsdE8: bigint;
    originalToken: PayToken;
    originalNetAmount: bigint;
    percent: bigint;
    tttiTransferFee: bigint;
    massRemainingNet: bigint;
    baseAmount: bigint;
    tttiAmount: bigint;
    amountReturned: bigint;
    massTotalTtti: bigint;
}
export interface Cell {
    value: Value__2;
    name: string;
}
export interface Contact {
    id: ContactId;
    principal: Principal;
    nickname: string;
    memo?: Uint8Array;
    createdAt: bigint;
    updatedAt: bigint;
}
export type ContactId = bigint;
export interface ContactInput {
    principal: Principal;
    nickname: string;
    memo?: Uint8Array;
}
export interface Conversion {
    id: bigint;
    status: ConversionStatus;
    depositor: Principal;
    feeAmount?: bigint;
    netAmount?: bigint;
    feeBps: bigint;
    usedFallback: boolean;
    priceUsdE8: bigint;
    minted: bigint;
    recipient: Account;
    paymentBlock?: bigint;
    message?: string;
    timestamp: Timestamp__2;
    payAmount: bigint;
    tttiAmount: bigint;
    mintBlock?: bigint;
    payToken: PayToken;
    icpAmount: bigint;
    forward: ForwardStatus;
    fromCollector: bigint;
}
export interface CyclesStatus {
    withdrawableExcessE8s: bigint;
    withdrawalAllowed: boolean;
    lastTopUp?: TopUpRecord;
    reserveFloorE8s: bigint;
    reserveAccount: Account;
    reserveBalanceE8s: bigint;
    withdrawals: Array<ReserveWithdrawal>;
    withdrawalBlockedReason?: WithdrawalBlockedReason;
    cyclesBalance: bigint;
    topUpThreshold: bigint;
}
export interface DataCertificate {
    certificate: Uint8Array;
    hash_tree: Uint8Array;
}
export interface DeliveryAddressError {
    code: DeliveryAddressErrorCode;
    message: string;
}
export type DeliveryAddressResult = {
    __kind__: "Ok";
    Ok: Account;
} | {
    __kind__: "Err";
    Err: DeliveryAddressError;
};
export interface DepositEntry {
    btcDetectedSats: bigint;
    refundedSats: bigint;
    ckbtcMintedSats: bigint;
    costToRefund?: BtcCostToRefund;
    errorMessage?: string;
    detectedAt: Timestamp;
    errorKind?: DepositErrorKind;
    updatedAt: Timestamp;
    stage: DepositStage;
    ckbtcPendingSats: bigint;
    index: bigint;
    btcRefund?: BtcRefund;
    conversionId?: bigint;
    tttiDelivered: bigint;
    ckbtcMintBlockIndex?: bigint;
    btcTxids: Array<string>;
}
export type DepositStage = {
    __kind__: "refunded";
    refunded: null;
} | {
    __kind__: "minted";
    minted: null;
} | {
    __kind__: "error";
    error: null;
} | {
    __kind__: "addressShown";
    addressShown: null;
} | {
    __kind__: "delivered";
    delivered: null;
} | {
    __kind__: "depositDetected";
    depositDetected: null;
} | {
    __kind__: "pendingRate";
    pendingRate: null;
} | {
    __kind__: "confirming";
    confirming: {
        required: bigint;
        current: bigint;
    };
};
export interface DepositTracking {
    kind: DepositKind;
    createdAt: Timestamp;
    errorMessage?: string;
    errorKind?: DepositErrorKind;
    stage: DepositStage;
    lastCheckedAt?: Timestamp;
    btcAddress: string;
    deposits: Array<DepositEntry>;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface FeeBounds {
    max: bigint;
    min: bigint;
}
export interface FeeCollectorInfo {
    balance: bigint;
    account: Account;
}
export type ForwardStatus = {
    __kind__: "forwarded";
    forwarded: bigint;
} | {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "needsReview";
    needsReview: null;
} | {
    __kind__: "notRequired";
    notRequired: null;
} | {
    __kind__: "failed";
    failed: string;
};
export interface GetAccountTransactionsArgs {
    max_results: bigint;
    start?: BlockIndex;
    account: Account;
}
export interface GetArchivesArgs {
    from?: Principal;
}
export interface GetBlocksArgs {
    start: bigint;
    length: bigint;
}
export interface GetBlocksResult {
    log_length: bigint;
    blocks: Array<Block>;
    archived_blocks: Array<{
        args: Array<GetBlocksArgs>;
        callback: [Principal, string];
    }>;
}
export interface GetTransactions {
    balance: Tokens;
    transactions: Array<TransactionWithId>;
    oldest_tx_id?: BlockIndex;
}
export interface GetTransactionsErr {
    message: string;
}
export type GetTransactionsResult = {
    __kind__: "Ok";
    Ok: GetTransactions;
} | {
    __kind__: "Err";
    Err: GetTransactionsErr;
};
export interface HttpHeader {
    value: string;
    name: string;
}
export interface HttpRequestResult {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface IcpPrice {
    lastSuccessAt?: Timestamp;
    fetchedAt: Timestamp;
    source: PriceSource;
    usable: boolean;
    usdE8: bigint;
    lastError?: PriceError;
    validUntil: Timestamp;
}
export interface IndexApprove {
    fee?: Tokens;
    from: Account;
    memo?: Uint8Array;
    created_at_time?: bigint;
    amount: Tokens;
    expected_allowance?: Tokens;
    expires_at?: bigint;
    spender: Account;
}
export interface IndexAuthorizedBurn {
    from: Account;
    mthd?: string;
    caller?: Principal;
    created_at_time?: bigint;
    amount: bigint;
    reason?: string;
}
export interface IndexAuthorizedMint {
    to: Account;
    mthd?: string;
    caller?: Principal;
    created_at_time?: bigint;
    amount: bigint;
    reason?: string;
}
export interface IndexBurn {
    fee?: bigint;
    from: Account;
    memo?: Uint8Array;
    created_at_time?: bigint;
    amount: Tokens;
    spender?: Account;
}
export interface IndexFeeCollector {
    ts?: bigint;
    mthd?: string;
    fee_collector?: Account;
    caller?: Principal;
}
export interface IndexMint {
    to: Account;
    fee?: bigint;
    memo?: Uint8Array;
    created_at_time?: bigint;
    amount: Tokens;
}
export interface IndexStatus {
    num_blocks_synced: BlockIndex;
}
export interface IndexTransaction {
    burn?: IndexBurn;
    kind: string;
    mint?: IndexMint;
    approve?: IndexApprove;
    authorized_burn?: IndexAuthorizedBurn;
    authorized_mint?: IndexAuthorizedMint;
    fee_collector?: IndexFeeCollector;
    timestamp: bigint;
    transfer?: IndexTransfer;
}
export interface IndexTransfer {
    to: Account;
    fee?: Tokens;
    from: Account;
    memo?: Uint8Array;
    created_at_time?: bigint;
    amount: Tokens;
    spender?: Account;
}
export type InvalidReason = {
    __kind__: "nicknameTooLong";
    nicknameTooLong: {
        maxChars: bigint;
    };
} | {
    __kind__: "principalNotAllowed";
    principalNotAllowed: null;
} | {
    __kind__: "memoTooLong";
    memoTooLong: {
        maxBytes: bigint;
    };
} | {
    __kind__: "nicknameEmpty";
    nicknameEmpty: null;
};
export interface LegacyBlockInfo {
    boundaryIndex: bigint;
    currentDecimals: number;
    legacyDecimals: number;
}
export interface ListSubaccountsArgs {
    owner: Principal;
    start?: Subaccount;
}
export type MetadataValue = {
    __kind__: "Int";
    Int: bigint;
} | {
    __kind__: "Nat";
    Nat: bigint;
} | {
    __kind__: "Blob";
    Blob: Uint8Array;
} | {
    __kind__: "Text";
    Text: string;
};
export interface MyBtcDeposits {
    wallet?: DepositTracking;
    purchase?: DepositTracking;
}
export interface PayTokenStatus {
    decimals: number;
    token: PayToken;
    buyerPriceUsd: bigint;
    ledgerCanisterId: Principal;
    minimumUsdE8: bigint;
    feeBps: bigint;
    priceUsdE8: bigint;
    ledgerFee: bigint;
    priceSource: PriceSource;
    priceUsable: boolean;
    fundsCycles: boolean;
    priceValidUntil: Timestamp;
    priceFetchedAt: Timestamp;
    treasuryConfigured: boolean;
    liveRate?: bigint;
    symbol: string;
}
export interface PriceError {
    at: Timestamp;
    message: string;
}
export type PriceResult = {
    __kind__: "Ok";
    Ok: IcpPrice;
} | {
    __kind__: "Err";
    Err: string;
};
export interface PublicTreasuryInfo {
    tokenAccounts: Array<TokenAccountInfo>;
    icpAccount: Account;
}
export interface PurchaseAcknowledgement {
    accepted: boolean;
    acceptedAt?: AcknowledgedAt;
}
export interface PurchaseError {
    code: PurchaseErrorCode;
    message: string;
    conversion?: Conversion;
}
export type PurchaseErrorCode = {
    __kind__: "insufficientBalance";
    insufficientBalance: {
        token: PayToken;
        balance: bigint;
    };
} | {
    __kind__: "saleComplete";
    saleComplete: null;
} | {
    __kind__: "salesPaused";
    salesPaused: null;
} | {
    __kind__: "priceUnavailable";
    priceUnavailable: {
        token: PayToken;
    };
} | {
    __kind__: "deliveryFailedRefunded";
    deliveryFailedRefunded: null;
} | {
    __kind__: "ledgerMismatch";
    ledgerMismatch: {
        token: PayToken;
        expectedDecimals: number;
        actualDecimals: number;
        expectedFee: bigint;
        actualFee: bigint;
    };
} | {
    __kind__: "belowMinimum";
    belowMinimum: {
        minimumTtti: bigint;
        requestedTtti: bigint;
    };
} | {
    __kind__: "notConfigured";
    notConfigured: null;
} | {
    __kind__: "deliveryFailedRefundFailed";
    deliveryFailedRefundFailed: null;
} | {
    __kind__: "tokenNotConfigured";
    tokenNotConfigured: {
        token: PayToken;
    };
} | {
    __kind__: "anonymousCaller";
    anonymousCaller: null;
} | {
    __kind__: "aboveRemaining";
    aboveRemaining: {
        token: PayToken;
        maximumPayAmount: bigint;
        maximumTtti: bigint;
        requestedTtti: bigint;
    };
} | {
    __kind__: "ledgerError";
    ledgerError: {
        token: PayToken;
    };
} | {
    __kind__: "invalidAmount";
    invalidAmount: null;
} | {
    __kind__: "purchaseInProgress";
    purchaseInProgress: null;
} | {
    __kind__: "acknowledgementRequired";
    acknowledgementRequired: null;
} | {
    __kind__: "approvalMissing";
    approvalMissing: {
        token: PayToken;
        allowance: bigint;
    };
};
export type PurchaseId = bigint;
export type PurchaseResult = {
    __kind__: "Ok";
    Ok: Conversion;
} | {
    __kind__: "Err";
    Err: PurchaseError;
};
export interface PurchaseTrace {
    n: bigint;
    token: PayToken;
    memo: Uint8Array;
    reserved: bigint;
    buyer: Principal;
    created_at_time: bigint;
    amount: bigint;
}
export interface ReserveWithdrawal {
    blockIndex: bigint;
    timestamp: Timestamp;
    amountE8s: bigint;
}
export interface ReservedReconciliation {
    by: Principal;
    reconciledAt: bigint;
    previousReserved: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: Contact;
} | {
    __kind__: "err";
    err: AddressBookError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: Buyback;
} | {
    __kind__: "err";
    err: BuybackError;
};
export type Result_2 = {
    __kind__: "ok";
    ok: ReservedReconciliation;
} | {
    __kind__: "err";
    err: ReconcileError;
};
export type Result_3 = {
    __kind__: "ok";
    ok: BuybackQuote;
} | {
    __kind__: "err";
    err: BuybackError;
};
export type Result_4 = {
    __kind__: "ok";
    ok: Array<Contact>;
} | {
    __kind__: "err";
    err: AddressBookError;
};
export type Result_5 = {
    __kind__: "ok";
    ok: Array<Buyback>;
} | {
    __kind__: "err";
    err: BuybackError;
};
export type Result_6 = {
    __kind__: "ok";
    ok: Array<BuybackMass>;
} | {
    __kind__: "err";
    err: BuybackError;
};
export type Result_7 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: AddressBookError;
};
export type Result_8 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type ReviewResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: ReviewError;
};
export interface SaleStatus {
    buyerPriceUsd: bigint;
    minPurchase: bigint;
    tokenPriceUsd: bigint;
    salesPaused: boolean;
    priceUsdE8: bigint;
    sold: bigint;
    reserved: bigint;
    cyclesFeeBps: bigint;
    payTokens: Array<PayTokenStatus>;
    totalSupply: bigint;
    priceSource: PriceSource;
    available: bigint;
    complete: boolean;
    priceUsable: boolean;
    feeAccountBalance: bigint;
    priceValidUntil: Timestamp;
    priceFetchedAt: Timestamp;
    liveRate?: bigint;
    maxSupply: bigint;
    mintableRemaining: bigint;
}
export type SetFeeResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface SnapshotEntry {
    deliveryAddress?: Account;
    balance: bigint;
    needsMigration: boolean;
    kind: HolderKind;
    account: Account;
}
export type Subaccount = Uint8Array;
export interface SupportedBlockType {
    url: string;
    block_type: string;
}
export interface SupportedStandard {
    url: string;
    name: string;
}
export interface TechnicalDetails {
    decimals: number;
    buyerPriceUsd: bigint;
    minPurchase: bigint;
    tokenPriceUsd: bigint;
    excessPaymentHandling: string;
    controllers?: Array<Principal>;
    ledgerCanisterId: Principal;
    moduleHash?: string;
    standards: Array<string>;
    cyclesFeeBps: bigint;
    payTokens: Array<PayTokenStatus>;
    totalSupply: bigint;
    reserveFloorE8s: bigint;
    transferFee: bigint;
    legacyBlockBoundary: bigint;
    tokenSymbol: string;
    roundingRule: string;
    feeAccountBalance: bigint;
    reserveRule: string;
    tokenName: string;
    icpLedgerCanisterId: Principal;
    smallestUnit: bigint;
    ckbtcMinterId: Principal;
    oracleSources: Array<string>;
    maxSupply: bigint;
    feeAccount: Account;
    deliveryOrder: string;
    maxRateAgeSeconds: bigint;
    canisterInfoFetchedAt?: bigint;
    refreshPolicy: string;
    cyclesReserveAccount: Account;
}
export type Timestamp = bigint;
export type Timestamp__2 = bigint;
export interface TokenAccountInfo {
    token: PayToken;
    account?: Account;
}
export type TokenAccountResult = {
    __kind__: "Ok";
    Ok: TokenAccountInfo;
} | {
    __kind__: "Err";
    Err: string;
};
export interface TokenPrice {
    lastSuccessAt?: Timestamp;
    token: PayToken;
    fetchedAt: Timestamp;
    source: PriceSource;
    usable: boolean;
    pair: string;
    usdE8: bigint;
    lastError?: PriceError;
    validUntil: Timestamp;
}
export type TokenPriceResult = {
    __kind__: "Ok";
    Ok: TokenPrice;
} | {
    __kind__: "Err";
    Err: string;
};
export type Tokens = bigint;
export interface TopUpAttempt {
    request: TopUpTransferRequest;
    memo: Uint8Array;
    createdAt: Timestamp;
    sends: bigint;
    blockIndex?: bigint;
    needsReview: boolean;
    lastError?: string;
    created_at_time: bigint;
    amount: bigint;
    outcome: TopUpOutcome;
}
export type TopUpOutcome = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "unknown";
    unknown: null;
} | {
    __kind__: "failed";
    failed: string;
} | {
    __kind__: "succeeded";
    succeeded: bigint;
};
export interface TopUpRecord {
    status: TopUpStatus;
    icpE8s: bigint;
    blockIndex: bigint;
    timestamp: Timestamp;
    lastError?: string;
}
export type TopUpStatus = {
    __kind__: "transferred";
    transferred: null;
} | {
    __kind__: "notified";
    notified: {
        cycles: bigint;
    };
} | {
    __kind__: "failed";
    failed: string;
};
export interface TopUpTransferRequest {
    to: Account;
    fee: bigint;
    from_subaccount?: Uint8Array;
    amount: bigint;
}
export interface TransactionWithId {
    id: BlockIndex;
    transaction: IndexTransaction;
}
export interface TransferArgs {
    to: Account;
    fee?: bigint;
    memo?: Uint8Array;
    from_subaccount?: Subaccount;
    created_at_time?: Timestamp__2;
    amount: bigint;
}
export interface TransferAttempt {
    n: bigint;
    attempt: bigint;
    request: TransferRequest;
    memo: Uint8Array;
    sends: bigint;
    lastError?: string;
    created_at_time: bigint;
    outcome: AttemptOutcome;
}
export type TransferError = {
    __kind__: "GenericError";
    GenericError: {
        message: string;
        error_code: bigint;
    };
} | {
    __kind__: "TemporarilyUnavailable";
    TemporarilyUnavailable: null;
} | {
    __kind__: "BadBurn";
    BadBurn: {
        min_burn_amount: bigint;
    };
} | {
    __kind__: "Duplicate";
    Duplicate: {
        duplicate_of: bigint;
    };
} | {
    __kind__: "BadFee";
    BadFee: {
        expected_fee: bigint;
    };
} | {
    __kind__: "CreatedInFuture";
    CreatedInFuture: {
        ledger_time: Timestamp__2;
    };
} | {
    __kind__: "TooOld";
    TooOld: null;
} | {
    __kind__: "InsufficientFunds";
    InsufficientFunds: {
        balance: bigint;
    };
};
export interface TransferFromArgs {
    to: Account;
    fee?: bigint;
    spender_subaccount?: Subaccount;
    from: Account;
    memo?: Uint8Array;
    created_at_time?: Timestamp__2;
    amount: bigint;
}
export type TransferFromError = {
    __kind__: "GenericError";
    GenericError: {
        message: string;
        error_code: bigint;
    };
} | {
    __kind__: "TemporarilyUnavailable";
    TemporarilyUnavailable: null;
} | {
    __kind__: "InsufficientAllowance";
    InsufficientAllowance: {
        allowance: bigint;
    };
} | {
    __kind__: "BadBurn";
    BadBurn: {
        min_burn_amount: bigint;
    };
} | {
    __kind__: "Duplicate";
    Duplicate: {
        duplicate_of: bigint;
    };
} | {
    __kind__: "BadFee";
    BadFee: {
        expected_fee: bigint;
    };
} | {
    __kind__: "CreatedInFuture";
    CreatedInFuture: {
        ledger_time: Timestamp__2;
    };
} | {
    __kind__: "TooOld";
    TooOld: null;
} | {
    __kind__: "InsufficientFunds";
    InsufficientFunds: {
        balance: bigint;
    };
};
export type TransferFromResult = {
    __kind__: "Ok";
    Ok: bigint;
} | {
    __kind__: "Err";
    Err: TransferFromError;
};
export interface TransferRequest {
    to: Account;
    fee?: bigint;
    token: PayToken;
    from_subaccount?: Uint8Array;
    amount: bigint;
}
export type TransferResult = {
    __kind__: "Ok";
    Ok: bigint;
} | {
    __kind__: "Err";
    Err: TransferError;
};
export interface TransferReview {
    fee?: bigint;
    destination?: Account;
    token: PayToken;
    createdAtTimeNs?: bigint;
    memoHex?: string;
    kind: TransferKind;
    memoText?: string;
    sends: bigint;
    depositIndex?: bigint;
    block?: bigint;
    buyer?: Principal;
    lastError?: string;
    purchaseId: bigint;
    amount: bigint;
    outcome?: AttemptOutcome;
    refundPurpose?: BtcRefundPurpose;
    collect?: CollectState;
    conversionId?: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: HttpRequestResult;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface TreasuryConfig {
    icpAccount: Account;
}
export type TreasuryConfigResult = {
    __kind__: "Ok";
    Ok: TreasuryConfig;
} | {
    __kind__: "Err";
    Err: string;
};
export interface UpgradeReadiness {
    reserveLockBusy: boolean;
    purchasesInFlightCount: bigint;
    salesPaused: boolean;
    openTraceCount: bigint;
    reserved: bigint;
    purchasesInFlight: Array<Principal>;
    btcLockHeld: boolean;
    buybacksInFlight: Array<string>;
    openTraces: Array<PurchaseTrace>;
    buybacksInFlightCount: bigint;
    pendingTopUp?: TopUpAttempt;
    lastReconciliation?: ReservedReconciliation;
}
export type Value__1 = {
    __kind__: "Int";
    Int: bigint;
} | {
    __kind__: "Map";
    Map: Array<[string, Value__1]>;
} | {
    __kind__: "Nat";
    Nat: bigint;
} | {
    __kind__: "Blob";
    Blob: Uint8Array;
} | {
    __kind__: "Text";
    Text: string;
} | {
    __kind__: "Array";
    Array: Array<Value__1>;
};
export type Value__2 = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export type WithdrawReserveResult = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "busy";
    busy: null;
} | {
    __kind__: "amountExceedsExcess";
    amountExceedsExcess: {
        withdrawableE8s: bigint;
    };
} | {
    __kind__: "topUpPendingNotify";
    topUpPendingNotify: null;
} | {
    __kind__: "cyclesBelowThreshold";
    cyclesBelowThreshold: {
        cyclesBalance: bigint;
        topUpThreshold: bigint;
    };
} | {
    __kind__: "noExcess";
    noExcess: null;
} | {
    __kind__: "ledgerError";
    ledgerError: string;
} | {
    __kind__: "treasuryNotConfigured";
    treasuryNotConfigured: null;
};
export enum AcknowledgementError {
    anonymousCaller = "anonymousCaller"
}
export enum BtcDepositErrorCode {
    noAddressYet = "noAddressYet",
    minterUnavailable = "minterUnavailable",
    anonymousCaller = "anonymousCaller",
    purchaseInProgress = "purchaseInProgress",
    acknowledgementRequired = "acknowledgementRequired"
}
export enum BtcRefundPurpose {
    deliveryFailedExcess = "deliveryFailedExcess",
    excess = "excess",
    fullRefund = "fullRefund"
}
export enum BuybackRule {
    originalNet = "originalNet",
    dayRate = "dayRate"
}
export enum BuybackStatus {
    payoutFailed = "payoutFailed",
    cancelled = "cancelled",
    completed = "completed",
    inProgress = "inProgress"
}
export enum CollectState {
    confirmed = "confirmed",
    unknown = "unknown"
}
export enum ConversionStatus {
    refundFailed = "refundFailed",
    refundReview = "refundReview",
    completed = "completed",
    refunded = "refunded",
    failed = "failed"
}
export enum DeliveryAddressErrorCode {
    invalidPrincipal = "invalidPrincipal",
    empty = "empty",
    anonymousCaller = "anonymousCaller",
    anonymousPrincipal = "anonymousPrincipal",
    accountIdentifier = "accountIdentifier"
}
export enum DepositErrorKind {
    refundFailed = "refundFailed",
    unrecoverable = "unrecoverable",
    other = "other",
    minterUnavailable = "minterUnavailable",
    tainted = "tainted",
    valueTooSmall = "valueTooSmall"
}
export enum DepositKind {
    wallet = "wallet",
    purchase = "purchase"
}
export enum HolderKind {
    feeCollector = "feeCollector",
    holder = "holder"
}
export enum PayToken {
    icp = "icp",
    ckbtc = "ckbtc",
    ckusdc = "ckusdc",
    ckusdt = "ckusdt"
}
export enum PriceSource {
    none = "none",
    coinbase = "coinbase",
    coingecko = "coingecko"
}
export enum ReconcileError {
    notPaused = "notPaused",
    openTraces = "openTraces",
    purchaseInFlight = "purchaseInFlight",
    notAdmin = "notAdmin"
}
export enum ReviewError {
    notFound = "notFound",
    notAdmin = "notAdmin",
    notApplicable = "notApplicable",
    notUnderReview = "notUnderReview"
}
export enum TransferKind {
    BB = "BB",
    BC = "BC",
    BM = "BM",
    BR = "BR",
    FW = "FW",
    PC = "PC",
    RF = "RF",
    SH = "SH"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawalBlockedReason {
    cyclesBelowThreshold = "cyclesBelowThreshold",
    topUpRunning = "topUpRunning",
    topUpAwaitingConfirmation = "topUpAwaitingConfirmation"
}
export interface backendInterface {
    acceptPurchaseAcknowledgements(): Promise<{
        __kind__: "ok";
        ok: PurchaseAcknowledgement;
    } | {
        __kind__: "err";
        err: AcknowledgementError;
    }>;
    addContact(input: ContactInput): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBuyback(id: BuybackId): Promise<Result_1>;
    checkBtcPurchaseDeposit(): Promise<BtcDepositResult>;
    checkBtcWalletDeposit(): Promise<BtcDepositResult>;
    checkBtcWalletDepositFor(owner: Principal): Promise<BtcDepositResult>;
    clearDeliveryAddress(): Promise<boolean>;
    convertDeposit(recipient: Account | null, icpAmount: bigint): Promise<PurchaseResult>;
    convertDepositWith(token: PayToken, recipient: Account | null, payAmount: bigint, tttiTarget: bigint | null): Promise<PurchaseResult>;
    deleteContact(id: ContactId): Promise<Result_7>;
    execute(qJson: string): Promise<Result__1>;
    exportBalanceSnapshot(): Promise<BalanceSnapshot>;
    getApiDoc(): Promise<string>;
    getBtcDepositInfo(): Promise<BtcDepositInfo>;
    getBtcPurchaseAddress(): Promise<BtcDepositResult>;
    getBtcUsdRate(): Promise<BtcUsdRate | null>;
    getBtcWalletAddress(): Promise<BtcDepositResult>;
    getBtcWalletAddressFor(owner: Principal): Promise<BtcDepositResult>;
    getBtcWalletDepositsFor(owner: Principal): Promise<DepositTracking | null>;
    getBurnAccount(): Promise<Account>;
    getBuybackAdminAccount(): Promise<Account | null>;
    getBuybackFunding(): Promise<Array<BuybackFunding>>;
    getCallerUserRole(): Promise<UserRole>;
    getCanisterPrincipal(): Promise<Principal>;
    getConversions(): Promise<Array<Conversion>>;
    getCyclesStatus(): Promise<CyclesStatus>;
    getDeliveryAddress(): Promise<Account | null>;
    getFeeCollector(): Promise<FeeCollectorInfo>;
    getIcpPrice(): Promise<IcpPrice>;
    getLegacyBlockInfo(): Promise<LegacyBlockInfo>;
    getMyBtcDeposits(): Promise<MyBtcDeposits>;
    getMyConversions(): Promise<Array<Conversion>>;
    getMyPurchaseAcknowledgement(): Promise<PurchaseAcknowledgement>;
    getPublicTreasuryInfo(): Promise<PublicTreasuryInfo | null>;
    getSaleStatus(): Promise<SaleStatus>;
    getTechnicalDetails(): Promise<TechnicalDetails>;
    getTokenPrices(): Promise<Array<TokenPrice>>;
    getTreasuryConfig(): Promise<TreasuryConfig | null>;
    getUpgradeReadiness(): Promise<UpgradeReadiness>;
    get_account_transactions(args: GetAccountTransactionsArgs): Promise<GetTransactionsResult>;
    get_fee(): Promise<bigint>;
    get_fee_bounds(): Promise<FeeBounds>;
    get_max_supply(): Promise<bigint>;
    icrc10_supported_standards(): Promise<Array<SupportedStandard>>;
    icrc1_balance_of(account: Account): Promise<bigint>;
    icrc1_decimals(): Promise<number>;
    icrc1_fee(): Promise<bigint>;
    icrc1_metadata(): Promise<Array<[string, MetadataValue]>>;
    icrc1_minting_account(): Promise<Account | null>;
    icrc1_name(): Promise<string>;
    icrc1_supported_standards(): Promise<Array<SupportedStandard>>;
    icrc1_symbol(): Promise<string>;
    icrc1_total_supply(): Promise<bigint>;
    icrc1_transfer(args: TransferArgs): Promise<TransferResult>;
    icrc2_allowance(args: AllowanceArgs): Promise<Allowance>;
    icrc2_approve(args: ApproveArgs): Promise<ApproveResult>;
    icrc2_transfer_from(args: TransferFromArgs): Promise<TransferFromResult>;
    icrc3_get_archives(args: GetArchivesArgs): Promise<Array<ArchiveInfo>>;
    icrc3_get_blocks(args: Array<GetBlocksArgs>): Promise<GetBlocksResult>;
    icrc3_get_tip_certificate(): Promise<DataCertificate | null>;
    icrc3_supported_block_types(): Promise<Array<SupportedBlockType>>;
    isCallerAdmin(): Promise<boolean>;
    ledger_id(): Promise<Principal>;
    listAllBuybackMasses(): Promise<Array<BuybackMass>>;
    listAllBuybacks(): Promise<Array<Buyback>>;
    listMyBuybackMasses(): Promise<Result_6>;
    listMyBuybacks(): Promise<Result_5>;
    listMyContacts(): Promise<Result_4>;
    listTransfersToReview(): Promise<Array<TransferReview>>;
    list_subaccounts(args: ListSubaccountsArgs): Promise<Array<Subaccount>>;
    markBuybackCancelled(id: BuybackId, block: bigint): Promise<Result_1>;
    markRefundedManually(kind: TransferKind, purchaseId: bigint, block: bigint): Promise<ReviewResult>;
    markTransferArrived(kind: TransferKind, purchaseId: bigint, block: bigint): Promise<ReviewResult>;
    markTransferNotArrived(kind: TransferKind, purchaseId: bigint): Promise<ReviewResult>;
    quoteBuyback(massToken: PayToken, percent: bigint, receiveToken: PayToken): Promise<Result_3>;
    reconcileReserved(): Promise<Result_2>;
    refreshIcpPrice(): Promise<PriceResult>;
    refreshTokenPrice(token: PayToken): Promise<TokenPriceResult>;
    requestBuyback(massToken: PayToken, percent: bigint, receiveToken: PayToken, fromSubaccount: Uint8Array | null): Promise<Result_1>;
    retryBuybackPayout(buybackId: BuybackId): Promise<Result_1>;
    schema(): Promise<string>;
    setBuybackAdminAccount(account: Account): Promise<void>;
    setDeliveryAddress(principalText: string): Promise<DeliveryAddressResult>;
    setPayTokenAccount(token: PayToken, account: Account): Promise<TokenAccountResult>;
    setSalesPaused(paused: boolean): Promise<void>;
    setTreasuryConfig(config: TreasuryConfig): Promise<TreasuryConfigResult>;
    set_fee(newFee: bigint): Promise<SetFeeResult>;
    status(): Promise<IndexStatus>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateContact(id: ContactId, input: ContactInput): Promise<Result>;
    withdrawReserveExcess(amount: bigint): Promise<WithdrawReserveResult>;
}
