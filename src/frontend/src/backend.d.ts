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
export interface AddLiquidityArgs {
    side: PoolSide;
    lockDurationNs: bigint;
    counterAmount?: bigint;
    amount: bigint;
    poolId: PoolId;
}
export type AddLiquidityError = {
    __kind__: "insufficientBalance";
    insufficientBalance: {
        token: DexToken;
        available: bigint;
        required: bigint;
    };
} | {
    __kind__: "poolRemoved";
    poolRemoved: null;
} | {
    __kind__: "belowMinimum";
    belowMinimum: {
        token0Minimum?: bigint;
        token1Minimum?: bigint;
    };
} | {
    __kind__: "minimumsNotSet";
    minimumsNotSet: null;
} | {
    __kind__: "lockTooLong";
    lockTooLong: {
        maximumNs: bigint;
    };
} | {
    __kind__: "counterAmountRequired";
    counterAmountRequired: null;
} | {
    __kind__: "lockTooShort";
    lockTooShort: {
        minimumNs: bigint;
    };
} | {
    __kind__: "zeroAmount";
    zeroAmount: null;
} | {
    __kind__: "poolNotFound";
    poolNotFound: null;
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "operationInProgress";
    operationInProgress: null;
} | {
    __kind__: "zeroShares";
    zeroShares: null;
} | {
    __kind__: "unsupportedToken";
    unsupportedToken: null;
} | {
    __kind__: "ratioMismatch";
    ratioMismatch: {
        requiredCounterAmount: bigint;
    };
};
export interface AddLiquidityQuote {
    shares: bigint;
    gaugeAfter: UsdGauge;
    lockedShares: bigint;
    opensPool: boolean;
    isFirstDeposit: boolean;
    amount0: bigint;
    amount1: bigint;
    totalSharesAfter: bigint;
    poolId: PoolId;
}
export interface AddLiquidityQuoteArgs {
    side: PoolSide;
    counterAmount?: bigint;
    amount: bigint;
    poolId: PoolId;
}
export interface AddLiquidityResult {
    shares: bigint;
    lockedShares: bigint;
    pool: PoolView;
    amount0: bigint;
    amount1: bigint;
    position: PositionView;
}
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
export interface AllocationPoolAdd {
    shares: bigint;
    amount0: bigint;
    amount1: bigint;
    poolId: bigint;
}
export interface AllocationSkip {
    poolId: bigint;
    reason: string;
}
export interface Allowance {
    allowance: bigint;
    expires_at?: Timestamp__6;
}
export interface AllowanceArgs {
    account: Account;
    spender: Account;
}
export interface ApproveArgs {
    fee?: bigint;
    memo?: Uint8Array;
    from_subaccount?: Subaccount;
    created_at_time?: Timestamp__6;
    amount: bigint;
    expected_allowance?: bigint;
    expires_at?: Timestamp__6;
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
        ledger_time: Timestamp__6;
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
        ledger_time: Timestamp__6;
    };
} | {
    __kind__: "TooOld";
    TooOld: null;
} | {
    __kind__: "Expired";
    Expired: {
        ledger_time: Timestamp__6;
    };
} | {
    __kind__: "InsufficientFunds";
    InsufficientFunds: {
        balance: bigint;
    };
};
export type ApprovePairError = {
    __kind__: "minimumsNotAllowed";
    minimumsNotAllowed: null;
} | {
    __kind__: "refundFailed";
    refundFailed: string;
} | {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "requestNotFound";
    requestNotFound: null;
} | {
    __kind__: "minimumsRequired";
    minimumsRequired: null;
} | {
    __kind__: "invalidMinimums";
    invalidMinimums: null;
} | {
    __kind__: "notPending";
    notPending: null;
} | {
    __kind__: "pairExists";
    pairExists: {
        poolId: PoolId;
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
export interface AutonomyView {
    avg30dCyclesPerDay?: bigint;
    computedAt: Timestamp;
    totalCycles: bigint;
    sampleCount: bigint;
    autonomyDays?: bigint;
    reserveBalanceE8s: bigint;
    reserveCyclesEstimate?: bigint;
    avg7dCyclesPerDay?: bigint;
    targetDays: bigint;
    cyclesBalance: bigint;
    oldestSampleAt?: Timestamp;
}
export interface BalanceSnapshot {
    decimals: number;
    totalSupply: bigint;
    exportedAt: Timestamp__6;
    holders: Array<SnapshotEntry>;
}
export interface Block {
    id: bigint;
    block: Value__1;
}
export type BlockIndex = bigint;
export interface BonusClaimView {
    n: bigint;
    status: DexTransferStatus;
    createdAt: Timestamp;
    memoText: string;
    amountE8s: bigint;
}
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
export type ClaimBonusError = {
    __kind__: "belowMinimum";
    belowMinimum: {
        minimumE8s: bigint;
    };
} | {
    __kind__: "nothingToClaim";
    nothingToClaim: null;
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "claimInProgress";
    claimInProgress: null;
};
export type ClaimBonusResult = {
    __kind__: "ok";
    ok: BonusClaimView;
} | {
    __kind__: "err";
    err: ClaimBonusError;
};
export type ClaimMintFeeError = {
    __kind__: "belowLedgerFee";
    belowLedgerFee: {
        fee: bigint;
    };
} | {
    __kind__: "nothingToClaim";
    nothingToClaim: null;
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "claimInProgress";
    claimInProgress: null;
};
export type ClaimMintFeeResult = {
    __kind__: "ok";
    ok: MintFeeClaimView;
} | {
    __kind__: "err";
    err: ClaimMintFeeError;
};
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
    timestamp: Timestamp__6;
    payAmount: bigint;
    tttiAmount: bigint;
    mintBlock?: bigint;
    payToken: PayToken;
    icpAmount: bigint;
    forward: ForwardStatus;
    fromCollector: bigint;
}
export type CounterToken = {
    __kind__: "icp";
    icp: null;
} | {
    __kind__: "tttiT";
    tttiT: null;
} | {
    __kind__: "ckbtc";
    ckbtc: null;
} | {
    __kind__: "ckusdc";
    ckusdc: null;
} | {
    __kind__: "ckusdt";
    ckusdt: null;
} | {
    __kind__: "poolToken";
    poolToken: Principal;
};
export interface CyclesShareView {
    shareBps: bigint;
    targetShareBps: bigint;
    lastAdjustAt?: Timestamp;
    nextAdjustAfter?: Timestamp;
    autonomyDays?: bigint;
    minShareBps: bigint;
    minAdjustIntervalNs: bigint;
    maxShareBps: bigint;
    lowAutonomyDays: bigint;
    highAutonomyDays: bigint;
    maxStepBps: bigint;
}
export interface CyclesStatus {
    lastTopUp?: TopUpRecord;
    reserveFloorE8s: bigint;
    reserveAccount: Account;
    reserveBalanceE8s: bigint;
    withdrawals: Array<ReserveWithdrawal>;
    cyclesBalance: bigint;
    topUpThreshold: bigint;
}
export interface DataCertificate {
    certificate: Uint8Array;
    hash_tree: Uint8Array;
}
export interface DcBatch {
    at: Timestamp;
    id: bigint;
    toBonusE8s: bigint;
    status: DcBatchStatus;
    trigger: DcTrigger;
    legs: Array<DcLeg>;
    toCyclesE8s: bigint;
}
export type DcBatchStatus = {
    __kind__: "sent";
    sent: bigint;
} | {
    __kind__: "nothingToConvert";
    nothingToConvert: null;
} | {
    __kind__: "sending";
    sending: null;
} | {
    __kind__: "needsReview";
    needsReview: null;
} | {
    __kind__: "failed";
    failed: string;
} | {
    __kind__: "waitingPriceDeviation";
    waitingPriceDeviation: null;
};
export interface DcLeg {
    deviationBps: bigint;
    amountIn: bigint;
    tokenSymbol: string;
    executionIcpOutE8s: bigint;
    converted: boolean;
    referenceIcpOutE8s: bigint;
    poolId: PoolId;
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
export interface DexAccount {
    owner: Principal;
    subaccount?: Uint8Array;
}
export interface DexAmountArgs {
    token: DexToken;
    amount: bigint;
}
export interface DexBalanceView {
    token: DexToken;
    ledgerId: Principal;
    reserved: bigint;
    available: bigint;
    symbol: string;
}
export interface DexConfig {
    approvalStatement: string;
    rateValidForNs: bigint;
    refusalCooldownNs: bigint;
    newPairBadgeNs: bigint;
    feeTiers: Array<FeeTier>;
    launchMinimumTotalUsdE8: bigint;
    messageMaxChars: bigint;
    protocolStatement: string;
    tttiMinimumLocked: bigint;
    firstDepositMultiplier: bigint;
    depositAccount: DexAccount;
    tttiTUsdE8: bigint;
    maxLockNs: bigint;
    usdRateScale: bigint;
    rateGraceNs: bigint;
    lockedSharesStatement: string;
    minLockNs: bigint;
    launchDepthStatement: string;
    swapDeadlineMaxNs: bigint;
    lpFeeSharePercent: bigint;
    maxPendingPerUser: bigint;
    reasonMaxChars: bigint;
    requestDeposit: bigint;
    protocolFeeSharePercent: bigint;
}
export type DexDepositError = {
    __kind__: "amountTooSmall";
    amountTooSmall: {
        minimum: bigint;
    };
} | {
    __kind__: "insufficientFunds";
    insufficientFunds: {
        balance: bigint;
    };
} | {
    __kind__: "insufficientAllowance";
    insufficientAllowance: {
        required: bigint;
        allowance: bigint;
    };
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "transferInProgress";
    transferInProgress: null;
} | {
    __kind__: "ledgerError";
    ledgerError: string;
};
export interface DexTokenInfo {
    fee: bigint;
    decimals: number;
    token: DexToken;
    ledgerId: Principal;
    minimumDeposit: bigint;
    minimumWithdrawal: bigint;
    symbol: string;
}
export type DexTransferStatus = {
    __kind__: "completed";
    completed: bigint;
} | {
    __kind__: "needsReview";
    needsReview: null;
} | {
    __kind__: "inProgress";
    inProgress: null;
} | {
    __kind__: "failed";
    failed: string;
};
export interface DexTransferView {
    n: bigint;
    to: DexAccount;
    fee: bigint;
    status: DexTransferStatus;
    direction: DexTransferDirection;
    token: DexToken;
    createdAtTimeNs: bigint;
    attempt: bigint;
    owner: Principal;
    from: DexAccount;
    memoText: string;
    sends: bigint;
    ledgerAmount: bigint;
    lastError?: string;
    amount: bigint;
}
export type DexWithdrawError = {
    __kind__: "insufficientBalance";
    insufficientBalance: {
        available: bigint;
    };
} | {
    __kind__: "amountTooSmall";
    amountTooSmall: {
        minimum: bigint;
    };
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "transferInProgress";
    transferInProgress: null;
} | {
    __kind__: "ledgerError";
    ledgerError: string;
};
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
export type ExtendLockError = {
    __kind__: "notPositionOwner";
    notPositionOwner: null;
} | {
    __kind__: "lockTooLong";
    lockTooLong: {
        maximumUnlockAt: Timestamp;
    };
} | {
    __kind__: "cannotShortenLock";
    cannotShortenLock: {
        unlockAt: Timestamp;
    };
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "operationInProgress";
    operationInProgress: null;
} | {
    __kind__: "positionNotFound";
    positionNotFound: null;
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
export interface InjectionPage {
    total: bigint;
    offset: bigint;
    items: Array<LiquidityInjection>;
}
export type InjectionStatus = {
    __kind__: "completed";
    completed: null;
} | {
    __kind__: "addingLiquidity";
    addingLiquidity: null;
} | {
    __kind__: "swapping";
    swapping: null;
} | {
    __kind__: "needsReview";
    needsReview: null;
} | {
    __kind__: "failed";
    failed: string;
};
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
export interface LiquidityInjection {
    id: bigint;
    status: InjectionStatus;
    minTttiOut: bigint;
    startedAt: Timestamp;
    token: PayToken;
    venue: SwapVenue;
    amountIn: bigint;
    error?: string;
    updatedAt: Timestamp;
    tttiReceived: bigint;
    pairAmountIn: bigint;
    used0: bigint;
    used1: bigint;
    swapAmountIn: bigint;
    liquidityShares: bigint;
    poolId: PoolId;
}
export interface ListSubaccountsArgs {
    owner: Principal;
    start?: Subaccount;
}
export interface LpBonusView {
    claims: Array<BonusClaimView>;
    claimedE8s: bigint;
    positions: Array<PositionBonusWeight>;
    claimableE8s: bigint;
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
export interface MintFeeBalance {
    token: PayToken;
    claimed: bigint;
    claimable: bigint;
}
export type MintFeeClaimStatus = {
    __kind__: "completed";
    completed: bigint;
} | {
    __kind__: "needsReview";
    needsReview: null;
} | {
    __kind__: "inProgress";
    inProgress: null;
} | {
    __kind__: "failed";
    failed: string;
};
export interface MintFeeClaimView {
    n: bigint;
    status: MintFeeClaimStatus;
    token: PayToken;
    createdAt: Timestamp;
    memoText: string;
    amount: bigint;
}
export interface MintFeeLpView {
    claims: Array<MintFeeClaimView>;
    balances: Array<MintFeeBalance>;
}
export interface MintTreasuryAccount {
    token: PayToken;
    balance?: bigint;
    legacyExternalAccount?: Account;
    account: Account;
}
export interface MyBtcDeposits {
    wallet?: DepositTracking;
    purchase?: DepositTracking;
}
export interface OwnerAccumulated {
    token: PayToken;
    amount: bigint;
}
export type OwnerDestinationResult = {
    __kind__: "ok";
    ok: OwnerDestinationView;
} | {
    __kind__: "err";
    err: OwnerRevenueError;
};
export interface OwnerDestinationView {
    token: PayToken;
    setAt?: Timestamp;
    account?: Account;
    accumulated: bigint;
}
export interface OwnerSendPage {
    total: bigint;
    offset: bigint;
    items: Array<OwnerSendView>;
}
export type OwnerSendSource = {
    __kind__: "mint";
    mint: bigint;
} | {
    __kind__: "treasurySweep";
    treasurySweep: null;
} | {
    __kind__: "accumulated";
    accumulated: null;
};
export type OwnerSendStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "sent";
    sent: bigint;
} | {
    __kind__: "needsReview";
    needsReview: null;
} | {
    __kind__: "failed";
    failed: string;
};
export interface OwnerSendView {
    id: bigint;
    fee?: bigint;
    status: OwnerSendStatus;
    destination: Account;
    token: PayToken;
    createdAtTimeNs: bigint;
    attempt: bigint;
    source: OwnerSendSource;
    createdAt: Timestamp;
    memoText: string;
    sends: bigint;
    updatedAt: Timestamp;
    block?: bigint;
    lastError?: string;
    amount: bigint;
}
export type PairRefundStatus = {
    __kind__: "none";
    none: null;
} | {
    __kind__: "refunded";
    refunded: bigint;
} | {
    __kind__: "needsReview";
    needsReview: null;
} | {
    __kind__: "inProgress";
    inProgress: null;
};
export interface PairRequestView {
    id: RequestId;
    status: RequestStatus;
    depositAmount: bigint;
    token: RequestedToken;
    requester: Principal;
    counter: PoolTokenView;
    refundStatus: PairRefundStatus;
    feeBps: bigint;
    kind: PoolKind;
    createdAt: Timestamp;
    feeTier: FeeTier;
    depositBlock: bigint;
    refundBlock?: bigint;
    message: string;
    checks: RequestChecks;
    copiedSymbol: boolean;
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
export type PoolId = bigint;
export interface PoolMinimums {
    token0?: bigint;
    token1?: bigint;
}
export interface PoolTokenView {
    decimals: number;
    ledgerId: Principal;
    isTttiT: boolean;
    symbol: string;
}
export interface PoolView {
    id: PoolId;
    approvalStatement?: string;
    status: PoolStatus;
    subaccountText: string;
    requestId?: RequestId;
    minimumLocked: PoolMinimums;
    feeBps: bigint;
    acceptsWithdrawals: boolean;
    lockedShares: bigint;
    kind: PoolKind;
    acceptsSwaps: boolean;
    createdAt: Timestamp;
    reserve0: bigint;
    reserve1: bigint;
    launchMinimumTotalUsdE8: bigint;
    subaccount: Uint8Array;
    feeTier: FeeTier;
    minimumsSet: boolean;
    acceptsDeposits: boolean;
    gauge: UsdGauge;
    newPairBadgeActive: boolean;
    token0: PoolTokenView;
    token1: PoolTokenView;
    firstDepositMinimum: PoolMinimums;
    lockedSharesStatement: string;
    protocolFee0: bigint;
    protocolFee1: bigint;
    poolAccount: DexAccount;
    removedAt?: Timestamp;
    totalShares: bigint;
    newPairBadgeUntil?: Timestamp;
}
export interface PositionBonusWeight {
    weight: bigint;
    valueIcpE8s: bigint;
    positionId: bigint;
    remainingLockNs: bigint;
    poolId: PoolId;
}
export type PositionId = bigint;
export interface PositionView {
    id: PositionId;
    isCreator: boolean;
    shares: bigint;
    owner: Principal;
    createdAt: Timestamp;
    unlockAt: Timestamp;
    unlocked: boolean;
    lockDurationNs: bigint;
    amount0: bigint;
    amount1: bigint;
    withdrawable: boolean;
    token0Symbol: string;
    token1Symbol: string;
    poolId: PoolId;
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
export interface ProtocolLiquidityView {
    shares: bigint;
    fromTreasury0: bigint;
    fromTreasury1: bigint;
    lastAddedAt?: Timestamp;
    amount0: bigint;
    amount1: bigint;
    fromFees0: bigint;
    fromFees1: bigint;
    token0Symbol: string;
    totalShares: bigint;
    token1Symbol: string;
    poolId: PoolId;
}
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
export type RefusePairError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "requestNotFound";
    requestNotFound: null;
} | {
    __kind__: "reasonTooLong";
    reasonTooLong: {
        max: bigint;
    };
} | {
    __kind__: "reasonRequired";
    reasonRequired: null;
} | {
    __kind__: "notPending";
    notPending: null;
};
export type RemoveLiquidityError = {
    __kind__: "notPositionOwner";
    notPositionOwner: null;
} | {
    __kind__: "poolNotFound";
    poolNotFound: null;
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "operationInProgress";
    operationInProgress: null;
} | {
    __kind__: "positionLocked";
    positionLocked: {
        unlockAt: Timestamp;
    };
} | {
    __kind__: "positionNotFound";
    positionNotFound: null;
};
export interface RemoveLiquidityResult {
    shares: bigint;
    pool: PoolView;
    positionId: PositionId;
    amount0: bigint;
    amount1: bigint;
    poolId: PoolId;
}
export interface RequestChecks {
    metadataRead: boolean;
    pairUnique: boolean;
    icrc1: boolean;
    icrc2: boolean;
    copiedSymbolOf?: string;
}
export type RequestId = bigint;
export interface RequestPairArgs {
    ledgerId: Principal;
    counter: CounterToken;
    feeTier: FeeTier;
    message: string;
}
export type RequestPairError = {
    __kind__: "depositFailed";
    depositFailed: string;
} | {
    __kind__: "tooManyPending";
    tooManyPending: {
        max: bigint;
    };
} | {
    __kind__: "messageTooLong";
    messageTooLong: {
        max: bigint;
    };
} | {
    __kind__: "missingStandards";
    missingStandards: {
        icrc1: boolean;
        icrc2: boolean;
    };
} | {
    __kind__: "insufficientFunds";
    insufficientFunds: {
        balance: bigint;
    };
} | {
    __kind__: "insufficientAllowance";
    insufficientAllowance: {
        required: bigint;
        allowance: bigint;
    };
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "ledgerUnreachable";
    ledgerUnreachable: string;
} | {
    __kind__: "metadataUnavailable";
    metadataUnavailable: string;
} | {
    __kind__: "invalidToken";
    invalidToken: string;
} | {
    __kind__: "unknownCounterToken";
    unknownCounterToken: null;
} | {
    __kind__: "cooldown";
    cooldown: {
        until: Timestamp;
    };
} | {
    __kind__: "pairExists";
    pairExists: {
        requestId?: RequestId;
        poolId?: PoolId;
    };
};
export type RequestStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "approved";
    approved: {
        at: Timestamp;
        poolId: PoolId;
    };
} | {
    __kind__: "refused";
    refused: {
        at: Timestamp;
        reason: string;
    };
};
export interface RequestedToken {
    fee: bigint;
    decimals: number;
    ledgerId: Principal;
    name: string;
    symbol: string;
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
    ok: DexTransferView;
} | {
    __kind__: "err";
    err: DexWithdrawError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: Contact;
} | {
    __kind__: "err";
    err: AddressBookError;
};
export type Result_10 = {
    __kind__: "ok";
    ok: SwapQuote;
} | {
    __kind__: "err";
    err: SwapError;
};
export type Result_11 = {
    __kind__: "ok";
    ok: BuybackQuote;
} | {
    __kind__: "err";
    err: BuybackError;
};
export type Result_12 = {
    __kind__: "ok";
    ok: AddLiquidityQuote;
} | {
    __kind__: "err";
    err: AddLiquidityError;
};
export type Result_13 = {
    __kind__: "ok";
    ok: Array<Contact>;
} | {
    __kind__: "err";
    err: AddressBookError;
};
export type Result_14 = {
    __kind__: "ok";
    ok: Array<Buyback>;
} | {
    __kind__: "err";
    err: BuybackError;
};
export type Result_15 = {
    __kind__: "ok";
    ok: Array<BuybackMass>;
} | {
    __kind__: "err";
    err: BuybackError;
};
export type Result_16 = {
    __kind__: "ok";
    ok: PositionView;
} | {
    __kind__: "err";
    err: ExtendLockError;
};
export type Result_17 = {
    __kind__: "ok";
    ok: DexTransferView;
} | {
    __kind__: "err";
    err: DexDepositError;
};
export type Result_18 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: AddressBookError;
};
export type Result_19 = {
    __kind__: "ok";
    ok: PoolView;
} | {
    __kind__: "err";
    err: ApprovePairError;
};
export type Result_2 = {
    __kind__: "ok";
    ok: SwapResult;
} | {
    __kind__: "err";
    err: SwapError;
};
export type Result_20 = {
    __kind__: "ok";
    ok: AddLiquidityResult;
} | {
    __kind__: "err";
    err: AddLiquidityError;
};
export type Result_21 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Result_3 = {
    __kind__: "ok";
    ok: PoolView;
} | {
    __kind__: "err";
    err: SetMinimumsError;
};
export type Result_4 = {
    __kind__: "ok";
    ok: Buyback;
} | {
    __kind__: "err";
    err: BuybackError;
};
export type Result_5 = {
    __kind__: "ok";
    ok: PairRequestView;
} | {
    __kind__: "err";
    err: RequestPairError;
};
export type Result_6 = {
    __kind__: "ok";
    ok: PoolView;
} | {
    __kind__: "err";
    err: RemovePairError;
};
export type Result_7 = {
    __kind__: "ok";
    ok: RemoveLiquidityResult;
} | {
    __kind__: "err";
    err: RemoveLiquidityError;
};
export type Result_8 = {
    __kind__: "ok";
    ok: PairRequestView;
} | {
    __kind__: "err";
    err: RefusePairError;
};
export type Result_9 = {
    __kind__: "ok";
    ok: ReservedReconciliation;
} | {
    __kind__: "err";
    err: ReconcileError;
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
export interface SetAsideView {
    token: PayToken;
    totalReceived: bigint;
    lastInjectionAt?: Timestamp;
    thresholdUsdE8: bigint;
    valueUsdE8?: bigint;
    totalInjected: bigint;
    targetPoolId?: PoolId;
    amount: bigint;
}
export type SetFeeResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface ShareChange {
    at: Timestamp;
    newShareBps: bigint;
    autonomyDays?: bigint;
    oldShareBps: bigint;
}
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
export type SwapError = {
    __kind__: "insufficientBalance";
    insufficientBalance: {
        available: bigint;
    };
} | {
    __kind__: "tokenNotInPool";
    tokenNotInPool: null;
} | {
    __kind__: "poolRemoved";
    poolRemoved: null;
} | {
    __kind__: "poolFilling";
    poolFilling: {
        gauge: UsdGauge;
    };
} | {
    __kind__: "deadlineTooFar";
    deadlineTooFar: {
        maximum: Timestamp;
    };
} | {
    __kind__: "invalidSlippage";
    invalidSlippage: {
        maximumBps: bigint;
    };
} | {
    __kind__: "poolNotOpen";
    poolNotOpen: null;
} | {
    __kind__: "zeroAmount";
    zeroAmount: null;
} | {
    __kind__: "poolNotFound";
    poolNotFound: null;
} | {
    __kind__: "anonymous";
    anonymous: null;
} | {
    __kind__: "rateUnavailable";
    rateUnavailable: null;
} | {
    __kind__: "operationInProgress";
    operationInProgress: null;
} | {
    __kind__: "slippageExceeded";
    slippageExceeded: {
        amountOut: bigint;
        minAmountOut: bigint;
    };
} | {
    __kind__: "unsupportedToken";
    unsupportedToken: null;
} | {
    __kind__: "deadlineExceeded";
    deadlineExceeded: {
        now: Timestamp;
        deadline: Timestamp;
    };
} | {
    __kind__: "insufficientLiquidity";
    insufficientLiquidity: null;
};
export interface SwapQuote {
    fee: bigint;
    tokenIn: DexToken;
    slippageBps: bigint;
    maxDeadlineNs: bigint;
    tokenOut: DexToken;
    protocolFee: bigint;
    feeBps: bigint;
    amountIn: bigint;
    lpFee: bigint;
    minimumReceived: bigint;
    priceImpactBps: bigint;
    amountOut: bigint;
    poolId: PoolId;
}
export interface SwapResult {
    fee: bigint;
    tokenIn: DexToken;
    tokenOut: DexToken;
    protocolFee: bigint;
    pool: PoolView;
    amountIn: bigint;
    lpFee: bigint;
    amountOut: bigint;
    poolId: PoolId;
}
export type SwapVenue = {
    __kind__: "native";
    native: PoolId;
} | {
    __kind__: "icpswap";
    icpswap: Principal;
};
export interface SweepToken {
    status: SweepTokenStatus;
    token: PayToken;
    balance?: bigint;
}
export type SweepTokenStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "sent";
    sent: bigint;
} | {
    __kind__: "nothingToSend";
    nothingToSend: null;
} | {
    __kind__: "waitingDestination";
    waitingDestination: null;
} | {
    __kind__: "sending";
    sending: bigint;
};
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
export type Timestamp__6 = bigint;
export interface TokenAccountInfo {
    token: PayToken;
    account?: Account;
}
export interface TokenAmounts {
    icp: bigint;
    ckbtc: bigint;
    ckusdc: bigint;
    ckusdt: bigint;
}
export interface TokenMinimums {
    token0: bigint;
    token1: bigint;
}
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
    created_at_time?: Timestamp__6;
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
        ledger_time: Timestamp__6;
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
    created_at_time?: Timestamp__6;
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
        ledger_time: Timestamp__6;
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
    token: DexToken;
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
export interface TreasurySweepView {
    status: SweepStatus;
    completedAt?: Timestamp;
    startedAt?: Timestamp;
    reserveTopUpBlock?: bigint;
    reserveTopUpE8s: bigint;
    tokens: Array<SweepToken>;
    reserveTopUpMemo?: string;
}
export interface UpgradeReadiness {
    reserveLockBusy: boolean;
    purchasesInFlightCount: bigint;
    salesPaused: boolean;
    mintFeeClaimsInFlight: Array<bigint>;
    openTraceCount: bigint;
    reserved: bigint;
    ownerSendsInFlight: Array<bigint>;
    purchasesInFlight: Array<Principal>;
    btcLockHeld: boolean;
    sweepStatus: SweepStatus;
    bonusClaimsInFlight: Array<bigint>;
    buybacksInFlight: Array<string>;
    openTraces: Array<PurchaseTrace>;
    protocolFeeLocks: Array<string>;
    buybacksInFlightCount: bigint;
    pendingTopUp?: TopUpAttempt;
    injectionsInFlight: Array<bigint>;
    lastReconciliation?: ReservedReconciliation;
    dcSendsInFlight: Array<bigint>;
}
export interface UsdGauge {
    targetUsdE8: bigint;
    remainingUsdE8?: bigint;
    missingRate: {
        token0: boolean;
        token1: boolean;
    };
    valueAvailable: boolean;
    currentUsdE8?: bigint;
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
export interface WeeklyAllocation {
    at: bigint;
    id: bigint;
    toBonusE8s: bigint;
    stockPayoutCap: TokenAmounts;
    skipped: Array<AllocationSkip>;
    note: string;
    surplusE8s: bigint;
    treasuryBalances: TokenAmounts;
    autonomyDays?: bigint;
    toLiquidity: TokenAmounts;
    poolAdds: Array<AllocationPoolAdd>;
    waiting: TokenAmounts;
    toCyclesReserveE8s: bigint;
}
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
export enum DcTrigger {
    threshold = "threshold",
    daily = "daily"
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
export enum DexToken {
    icp = "icp",
    tttiT = "tttiT",
    ckbtc = "ckbtc",
    ckusdc = "ckusdc",
    ckusdt = "ckusdt"
}
export enum DexTransferDirection {
    deposit = "deposit",
    withdrawal = "withdrawal"
}
export enum FeeTier {
    bps5 = "bps5",
    bps30 = "bps30",
    bps100 = "bps100"
}
export enum HolderKind {
    feeCollector = "feeCollector",
    holder = "holder"
}
export enum OwnerRevenueError {
    notConfigured = "notConfigured",
    notAdmin = "notAdmin",
    invalidSubaccount = "invalidSubaccount",
    anonymousOwner = "anonymousOwner",
    contractAccount = "contractAccount"
}
export enum PayToken {
    icp = "icp",
    ckbtc = "ckbtc",
    ckusdc = "ckusdc",
    ckusdt = "ckusdt"
}
export enum PoolKind {
    tttiPair = "tttiPair",
    utilityPair = "utilityPair"
}
export enum PoolSide {
    token0 = "token0",
    token1 = "token1"
}
export enum PoolStatus {
    filling = "filling",
    active = "active",
    removed = "removed"
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
export enum RemovePairError {
    notAuthorized = "notAuthorized",
    alreadyRemoved = "alreadyRemoved",
    poolNotFound = "poolNotFound"
}
export enum ReviewError {
    notFound = "notFound",
    notAdmin = "notAdmin",
    notApplicable = "notApplicable",
    notUnderReview = "notUnderReview"
}
export enum SetMinimumsError {
    poolRemoved = "poolRemoved",
    notAuthorized = "notAuthorized",
    liquidityAlreadyAdded = "liquidityAlreadyAdded",
    invalidMinimums = "invalidMinimums",
    poolNotFound = "poolNotFound",
    notUtilityPair = "notUtilityPair"
}
export enum SweepStatus {
    notStarted = "notStarted",
    completed = "completed",
    toppingUpReserve = "toppingUpReserve",
    sending = "sending"
}
export enum TransferKind {
    BB = "BB",
    BC = "BC",
    BM = "BM",
    BR = "BR",
    DC = "DC",
    DD = "DD",
    DL = "DL",
    DQ = "DQ",
    DW = "DW",
    FW = "FW",
    MF = "MF",
    OW = "OW",
    PC = "PC",
    RF = "RF",
    SH = "SH",
    SR = "SR"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptPurchaseAcknowledgements(): Promise<{
        __kind__: "ok";
        ok: PurchaseAcknowledgement;
    } | {
        __kind__: "err";
        err: AcknowledgementError;
    }>;
    addContact(input: ContactInput): Promise<Result_1>;
    addLiquidity(args: AddLiquidityArgs): Promise<Result_20>;
    approvePair(requestId: bigint, minimums: TokenMinimums | null): Promise<Result_19>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBuyback(id: BuybackId): Promise<Result_4>;
    checkBtcPurchaseDeposit(): Promise<BtcDepositResult>;
    checkBtcWalletDeposit(): Promise<BtcDepositResult>;
    checkBtcWalletDepositFor(owner: Principal): Promise<BtcDepositResult>;
    claimLpBonus(): Promise<ClaimBonusResult>;
    claimMintFee(token: PayToken): Promise<ClaimMintFeeResult>;
    clearDeliveryAddress(): Promise<boolean>;
    clearOwnerDestination(token: PayToken): Promise<OwnerDestinationResult>;
    convertDeposit(recipient: Account | null, icpAmount: bigint): Promise<PurchaseResult>;
    convertDepositWith(token: PayToken, recipient: Account | null, payAmount: bigint, tttiTarget: bigint | null): Promise<PurchaseResult>;
    deleteContact(id: ContactId): Promise<Result_18>;
    depositToDex(args: DexAmountArgs): Promise<Result_17>;
    execute(qJson: string): Promise<Result__1>;
    exportBalanceSnapshot(): Promise<BalanceSnapshot>;
    extendLock(positionId: bigint, newUnlockAt: bigint): Promise<Result_16>;
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
    getCyclesAutonomy(): Promise<AutonomyView>;
    getCyclesShare(): Promise<CyclesShareView>;
    getCyclesShareHistory(): Promise<Array<ShareChange>>;
    getCyclesStatus(): Promise<CyclesStatus>;
    getDeliveryAddress(): Promise<Account | null>;
    getDexBalances(owner: Principal): Promise<Array<DexBalanceView>>;
    getDexConfig(): Promise<DexConfig>;
    getDexDepositAccount(owner: Principal): Promise<DexAccount>;
    getDexPool(poolId: bigint): Promise<PoolView | null>;
    getDexPoolAccount(poolId: bigint): Promise<DexAccount | null>;
    getDexPosition(positionId: bigint): Promise<PositionView | null>;
    getDexTokens(): Promise<Array<DexTokenInfo>>;
    getDexTransfers(owner: Principal): Promise<Array<DexTransferView>>;
    getFeeCollector(): Promise<FeeCollectorInfo>;
    getIcpPrice(): Promise<IcpPrice>;
    getLastWeeklyAllocation(): Promise<WeeklyAllocation | null>;
    getLegacyBlockInfo(): Promise<LegacyBlockInfo>;
    getMintTreasuryAccounts(): Promise<Array<MintTreasuryAccount>>;
    getMyBtcDeposits(): Promise<MyBtcDeposits>;
    getMyConversions(): Promise<Array<Conversion>>;
    getMyLpBonus(): Promise<LpBonusView>;
    getMyMintFees(): Promise<MintFeeLpView>;
    getMyPairRequests(): Promise<Array<PairRequestView>>;
    getMyPurchaseAcknowledgement(): Promise<PurchaseAcknowledgement>;
    getOwnerAccumulated(): Promise<Array<OwnerAccumulated>>;
    getProtocolLiquidity(): Promise<Array<ProtocolLiquidityView>>;
    getPublicTreasuryInfo(): Promise<PublicTreasuryInfo | null>;
    getSaleStatus(): Promise<SaleStatus>;
    getSetAsideAmounts(): Promise<Array<SetAsideView>>;
    getTechnicalDetails(): Promise<TechnicalDetails>;
    getTokenPrices(): Promise<Array<TokenPrice>>;
    getTreasuryConfig(): Promise<TreasuryConfig | null>;
    getTreasurySweepStatus(): Promise<TreasurySweepView>;
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
    listDcBatches(): Promise<Array<DcBatch>>;
    listDexPools(): Promise<Array<PoolView>>;
    listDexPositionsOf(owner: Principal): Promise<Array<PositionView>>;
    listLiquidityInjections(offset: bigint, limit: bigint): Promise<InjectionPage>;
    listMyBuybackMasses(): Promise<Result_15>;
    listMyBuybacks(): Promise<Result_14>;
    listMyContacts(): Promise<Result_13>;
    listOwnerDestinations(): Promise<Array<OwnerDestinationView>>;
    listOwnerSends(offset: bigint, limit: bigint): Promise<OwnerSendPage>;
    listPairRequests(): Promise<Array<PairRequestView>>;
    listPoolPositions(poolId: bigint): Promise<Array<PositionView>>;
    listTransfersToReview(): Promise<Array<TransferReview>>;
    listWeeklyAllocations(): Promise<Array<WeeklyAllocation>>;
    list_subaccounts(args: ListSubaccountsArgs): Promise<Array<Subaccount>>;
    markBuybackCancelled(id: BuybackId, block: bigint): Promise<Result_4>;
    markRefundedManually(kind: TransferKind, purchaseId: bigint, block: bigint): Promise<ReviewResult>;
    markTransferArrived(kind: TransferKind, purchaseId: bigint, block: bigint): Promise<ReviewResult>;
    markTransferNotArrived(kind: TransferKind, purchaseId: bigint): Promise<ReviewResult>;
    quoteAddLiquidity(args: AddLiquidityQuoteArgs): Promise<Result_12>;
    quoteBuyback(massToken: PayToken, percent: bigint, receiveToken: PayToken): Promise<Result_11>;
    quoteSwap(poolId: bigint, tokenIn: DexToken, amountIn: bigint, slippageBps: bigint): Promise<Result_10>;
    reconcileReserved(): Promise<Result_9>;
    refreshIcpPrice(): Promise<PriceResult>;
    refreshTokenPrice(token: PayToken): Promise<TokenPriceResult>;
    refusePair(requestId: bigint, reason: string): Promise<Result_8>;
    removeLiquidity(positionId: bigint): Promise<Result_7>;
    removePair(poolId: bigint): Promise<Result_6>;
    requestBuyback(massToken: PayToken, percent: bigint, receiveToken: PayToken, fromSubaccount: Uint8Array | null): Promise<Result_4>;
    requestPair(args: RequestPairArgs): Promise<Result_5>;
    retryBuybackPayout(buybackId: BuybackId): Promise<Result_4>;
    schema(): Promise<string>;
    setBuybackAdminAccount(account: Account): Promise<void>;
    setDeliveryAddress(principalText: string): Promise<DeliveryAddressResult>;
    setOwnerDestination(token: PayToken, account: Account): Promise<OwnerDestinationResult>;
    setSalesPaused(paused: boolean): Promise<void>;
    setUtilityPairMinimums(poolId: bigint, minimums: TokenMinimums): Promise<Result_3>;
    set_fee(newFee: bigint): Promise<SetFeeResult>;
    status(): Promise<IndexStatus>;
    swap(poolId: bigint, tokenIn: DexToken, amountIn: bigint, minAmountOut: bigint, deadline: bigint): Promise<Result_2>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateContact(id: ContactId, input: ContactInput): Promise<Result_1>;
    withdrawFromDex(args: DexAmountArgs): Promise<Result>;
}
