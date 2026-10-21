import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export interface Account {
    owner: Principal;
    subaccount?: Subaccount;
}
export type AcknowledgedAt = bigint;
export interface Allowance {
    allowance: bigint;
    expires_at?: Timestamp__1;
}
export interface AllowanceArgs {
    account: Account;
    spender: Account;
}
export interface ApproveArgs {
    fee?: bigint;
    memo?: Uint8Array;
    from_subaccount?: Subaccount;
    created_at_time?: Timestamp__1;
    amount: bigint;
    expected_allowance?: bigint;
    expires_at?: Timestamp__1;
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
        ledger_time: Timestamp__1;
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
        ledger_time: Timestamp__1;
    };
} | {
    __kind__: "TooOld";
    TooOld: null;
} | {
    __kind__: "Expired";
    Expired: {
        ledger_time: Timestamp__1;
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
export type BalanceResult = {
    __kind__: "Ok";
    Ok: TokenBalance;
} | {
    __kind__: "Err";
    Err: WalletError;
};
export interface BalanceSnapshot {
    decimals: number;
    totalSupply: bigint;
    exportedAt: Timestamp__1;
    holders: Array<SnapshotEntry>;
}
export interface Block {
    id: bigint;
    block: Value__1;
}
export type BlockIndex = bigint;
export type BurnResult = {
    __kind__: "Ok";
    Ok: bigint;
} | {
    __kind__: "Err";
    Err: TransferError;
};
export interface Cell {
    value: Value__2;
    name: string;
}
export interface Conversion {
    id: bigint;
    status: ConversionStatus;
    depositor: Principal;
    usedFallback: boolean;
    priceUsdE8: bigint;
    minted: bigint;
    recipient: Account;
    message?: string;
    timestamp: Timestamp__1;
    tttiAmount: bigint;
    icpAmount: bigint;
    forward: ForwardStatus;
    fromCollector: bigint;
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
    status: OracleStatus;
    source: PriceSource;
    usdMicro: bigint;
    updatedAt: Timestamp__1;
    stale: boolean;
    usdE8: bigint;
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
export interface OriginalDocument {
    blob: ExternalBlob;
    mimeType: string;
    filename: string;
}
export interface PreparedTransfer {
    to: Account;
    fee: bigint;
    from: Account;
    memo?: Uint8Array;
    createdAt: Timestamp__1;
    ledger: Principal;
    amount: bigint;
}
export type PriceResult = {
    __kind__: "Ok";
    Ok: IcpPrice;
} | {
    __kind__: "Err";
    Err: string;
};
export interface PublicTreasuryInfo {
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
    __kind__: "saleComplete";
    saleComplete: null;
} | {
    __kind__: "salesPaused";
    salesPaused: null;
} | {
    __kind__: "priceUnavailable";
    priceUnavailable: null;
} | {
    __kind__: "icpLedgerError";
    icpLedgerError: null;
} | {
    __kind__: "deliveryFailedRefunded";
    deliveryFailedRefunded: null;
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
    __kind__: "anonymousCaller";
    anonymousCaller: null;
} | {
    __kind__: "aboveRemaining";
    aboveRemaining: {
        maximumIcpE8s: bigint;
        maximumTtti: bigint;
        requestedTtti: bigint;
    };
} | {
    __kind__: "insufficientIcp";
    insufficientIcp: {
        balance: bigint;
    };
} | {
    __kind__: "invalidAmount";
    invalidAmount: null;
} | {
    __kind__: "acknowledgementRequired";
    acknowledgementRequired: null;
} | {
    __kind__: "approvalMissing";
    approvalMissing: {
        allowance: bigint;
    };
};
export type PurchaseResult = {
    __kind__: "Ok";
    Ok: Conversion;
} | {
    __kind__: "Err";
    Err: PurchaseError;
};
export type Result = {
    __kind__: "ok";
    ok: SetupStatusView;
} | {
    __kind__: "err";
    err: SetupError;
};
export type Result_1 = {
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
export interface SaleStatus {
    priceUpdatedAt: Timestamp__1;
    buyerPriceUsd: bigint;
    minPurchase: bigint;
    tokenPriceUsd: bigint;
    salesPaused: boolean;
    priceAgeSeconds?: bigint;
    priceUsdE8: bigint;
    sold: bigint;
    reserved: bigint;
    cyclesFeeBps: bigint;
    maxPriceAgeSeconds: bigint;
    totalSupply: bigint;
    priceSource: PriceSource;
    available: bigint;
    complete: boolean;
    feeAccountBalance: bigint;
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
export interface SetupStatusView {
    status: SetupStatus;
    updatedAt?: Timestamp;
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
export interface TechnicalDetails {
    decimals: number;
    buyerPriceUsd: bigint;
    minPurchase: bigint;
    tokenPriceUsd: bigint;
    excessPaymentHandling: string;
    ledgerCanisterId: Principal;
    standards: Array<string>;
    cyclesFeeBps: bigint;
    totalSupply: bigint;
    transferFee: bigint;
    tokenSymbol: string;
    roundingRule: string;
    feeAccountBalance: bigint;
    tokenName: string;
    icpLedgerCanisterId: Principal;
    smallestUnit: bigint;
    oracleSources: Array<string>;
    maxSupply: bigint;
    feeAccount: Account;
    deliveryOrder: string;
    maxRateAgeSeconds: bigint;
    refreshPolicy: string;
}
export type Timestamp = bigint;
export type Timestamp__1 = bigint;
export interface TokenBalance {
    token: TokenDescriptor;
    balance?: bigint;
}
export interface TokenDescriptor {
    fee: bigint;
    decimals: number;
    name: string;
    symbol: string;
    canisterId: Principal;
}
export type TokenResult = {
    __kind__: "Ok";
    Ok: TokenDescriptor;
} | {
    __kind__: "Err";
    Err: WalletError;
};
export type Tokens = bigint;
export interface TransactionWithId {
    id: BlockIndex;
    transaction: IndexTransaction;
}
export interface TransferArgs {
    to: Account;
    fee?: bigint;
    memo?: Uint8Array;
    from_subaccount?: Subaccount;
    created_at_time?: Timestamp__1;
    amount: bigint;
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
        ledger_time: Timestamp__1;
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
    created_at_time?: Timestamp__1;
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
        ledger_time: Timestamp__1;
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
export type TransferResult = {
    __kind__: "Ok";
    Ok: PreparedTransfer;
} | {
    __kind__: "Err";
    Err: WalletError;
};
export type TransferResult__1 = {
    __kind__: "Ok";
    Ok: bigint;
} | {
    __kind__: "Err";
    Err: TransferError;
};
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
export interface UserProfile {
    name: string;
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
export type WalletError = {
    __kind__: "InvalidAmount";
    InvalidAmount: null;
} | {
    __kind__: "InvalidPrincipal";
    InvalidPrincipal: null;
} | {
    __kind__: "LedgerUnavailable";
    LedgerUnavailable: Principal;
} | {
    __kind__: "TransferFailed";
    TransferFailed: string;
} | {
    __kind__: "UnknownToken";
    UnknownToken: Principal;
};
export enum AcknowledgementError {
    anonymousCaller = "anonymousCaller"
}
export enum ConversionStatus {
    refundFailed = "refundFailed",
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
export enum HolderKind {
    feeCollector = "feeCollector",
    holder = "holder"
}
export enum OracleStatus {
    ok = "ok",
    stale = "stale",
    unavailable = "unavailable"
}
export enum PriceSource {
    none = "none",
    coinbase = "coinbase",
    coingecko = "coingecko"
}
export enum SetupError {
    anonymousCaller = "anonymousCaller"
}
export enum SetupOutcome {
    skipped = "skipped",
    completed = "completed"
}
export enum SetupStatus {
    notStarted = "notStarted",
    skipped = "skipped",
    completed = "completed"
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    burn(from: Account, amount: bigint): Promise<BurnResult>;
    clearDeliveryAddress(): Promise<boolean>;
    convertDeposit(recipient: Account | null, icpAmount: bigint): Promise<PurchaseResult>;
    execute(qJson: string): Promise<Result__1>;
    exportBalanceSnapshot(): Promise<BalanceSnapshot>;
    getApiDoc(): Promise<string>;
    getBalance(canisterId: Principal, account: Account): Promise<BalanceResult>;
    getBurnAccount(): Promise<Account>;
    getCallerIcpBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCanisterPrincipal(): Promise<Principal>;
    getConversions(): Promise<Array<Conversion>>;
    getDeliveryAddress(): Promise<Account | null>;
    getFeeCollector(): Promise<FeeCollectorInfo>;
    getIcpPrice(): Promise<IcpPrice>;
    getLegacyBlockInfo(): Promise<LegacyBlockInfo>;
    getMyPurchaseAcknowledgement(): Promise<PurchaseAcknowledgement>;
    getMySetupStatus(): Promise<SetupStatusView>;
    getOriginalWhitePaper(): Promise<OriginalDocument | null>;
    getPublicTreasuryInfo(): Promise<PublicTreasuryInfo | null>;
    getSaleStatus(): Promise<SaleStatus>;
    getTechnicalDetails(): Promise<TechnicalDetails>;
    getTokenMetadata(canisterId: Principal): Promise<TokenResult>;
    getTreasuryConfig(): Promise<TreasuryConfig | null>;
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
    icrc1_transfer(args: TransferArgs): Promise<TransferResult__1>;
    icrc2_allowance(args: AllowanceArgs): Promise<Allowance>;
    icrc2_approve(args: ApproveArgs): Promise<ApproveResult>;
    icrc2_transfer_from(args: TransferFromArgs): Promise<TransferFromResult>;
    icrc3_get_archives(args: GetArchivesArgs): Promise<Array<ArchiveInfo>>;
    icrc3_get_blocks(args: Array<GetBlocksArgs>): Promise<GetBlocksResult>;
    icrc3_get_tip_certificate(): Promise<DataCertificate | null>;
    icrc3_supported_block_types(): Promise<Array<SupportedBlockType>>;
    isCallerAdmin(): Promise<boolean>;
    ledger_id(): Promise<Principal>;
    listTokens(): Promise<Array<TokenDescriptor>>;
    list_subaccounts(args: ListSubaccountsArgs): Promise<Array<Subaccount>>;
    prepareTransfer(canisterId: Principal, from: Account, to: Account, amount: bigint, memo: Uint8Array | null): Promise<TransferResult>;
    publishOriginalWhitePaper(document_: OriginalDocument): Promise<void>;
    refreshIcpPrice(): Promise<PriceResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    schema(): Promise<string>;
    setDeliveryAddress(principalText: string): Promise<DeliveryAddressResult>;
    setMySetupStatus(outcome: SetupOutcome): Promise<Result>;
    setSalesPaused(paused: boolean): Promise<void>;
    setTreasuryConfig(config: TreasuryConfig): Promise<TreasuryConfigResult>;
    set_fee(newFee: bigint): Promise<SetFeeResult>;
    status(): Promise<IndexStatus>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
