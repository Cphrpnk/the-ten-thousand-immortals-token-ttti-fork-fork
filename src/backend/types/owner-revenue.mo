import List "mo:core/List";
import Map "mo:core/Map";
import Result "mo:core/Result";
import Common "common";
import Pay "pay-token";
import Retry "retry";

// Mint owner revenue: the 100/101 share of every mint stays in the contract,
// in the paid token (BTC counts as ckBTC), on the internal mint treasury of
// that token. No automatic send to any wallet exists any more and the per-token
// owner destinations are gone. The admin manages the treasury: reads the
// balance per token and withdraws an amount to a destination entered at each
// withdrawal (ICRC account). A withdrawal is stored as an OwnerSend with
// source #withdrawal and uses lib/retry.mo (memo TTTI-OW-<n>, created_at_time,
// identical resend for 23 h, then To review). Earlier automatic sends (#mint,
// #accumulated, #treasurySweep) finish under the same rules and stay readable.
// Amounts accumulated while no destination existed stay in the contract
// default account (`accumulated`) and are part of the admin-managed balance.
// A withdrawal never touches the cycles reserve nor its 2 ICP floor.
module {
  public type Account = Common.Account;
  public type PayToken = Pay.PayToken;
  public type Timestamp = Int; // ns
  public type TransferAttempt = Retry.TransferAttempt;

  // Key of the per-token maps: "icp", "ckbtc", "ckusdc", "ckusdt".
  public type TokenKey = Text;

  // Where the funds of a withdrawal are taken from.
  public type TreasurySource = {
    #mintTreasury; // internal mint treasury subaccount of the token
    #accumulated; // share accumulated earlier, held in the contract default account
  };

  // Where an owner send comes from.
  public type OwnerSendSource = {
    #mint : Nat; // conversion id of the mint (earlier automatic send)
    #accumulated; // earlier automatic send of the accumulated share
    #treasurySweep; // earlier one-time sweep of an internal mint treasury
    #withdrawal : { by : Principal; from : TreasurySource }; // admin withdrawal (history)
    // One-time settlement of the revenue held earlier in the contract
    // (`from` = default-account accumulated share or legacy MINT-TREASURY).
    #settlement : { from : TreasurySource };
  };

  public type OwnerSendStatus = {
    #pending;
    #sent : Nat; // ledger block
    #needsReview;
    #failed : Text; // known ledger Err (a new attempt follows)
  };

  // One owner send, keyed by id. `attempt` holds memo, created_at_time, the
  // full request (source subaccount, destination, amount, fee) and the block.
  public type OwnerSend = {
    id : Nat;
    token : PayToken;
    amount : Nat;
    source : OwnerSendSource;
    attempt : TransferAttempt;
    status : OwnerSendStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // --- One-time treasury sweep -----------------------------------------------

  public type SweepStatus = {
    #notStarted;
    #toppingUpReserve;
    #sending;
    #completed;
  };

  public type SweepTokenStatus = {
    #pending; // balance not read yet
    #waitingDestination; // no destination configured for this token
    #nothingToSend; // balance at or below the ledger fee
    #sending : Nat; // owner send id
    #sent : Nat; // owner send id
  };

  public type SweepToken = {
    token : PayToken;
    balance : ?Nat; // balance read before the send
    status : SweepTokenStatus;
  };

  // Stored once-only record: `status` never returns to #notStarted.
  public type TreasurySweep = {
    status : SweepStatus;
    startedAt : ?Timestamp;
    completedAt : ?Timestamp;
    reserveTopUpE8s : Nat; // ICP moved from MINT-TREASURY-ICP to the cycles reserve
    reserveTopUp : ?TransferAttempt; // memo TTTI-SR-<n>
    tokens : [SweepToken];
  };

  // Stable owner revenue state (stable field `ownerRevenue`). The per-token
  // destinations were removed by migration 20261119_000000.
  public type OwnerRevenueStore = {
    accumulated : Map.Map<TokenKey, Nat>; // held in the default account, per token
    sends : Map.Map<Nat, OwnerSend>; // earlier automatic sends and withdrawals
    var nextSendId : Nat;
    var sweep : TreasurySweep;
    destinationHistory : List.List<DestinationChange>; // read-only audit of removed settings
  };

  public type DestinationChange = {
    token : PayToken;
    account : ?Account; // null = cleared
    at : Timestamp;
    by : Principal;
  };

  // --- Views -----------------------------------------------------------------

  public type OwnerAccumulated = { token : PayToken; amount : Nat };

  public type OwnerSendView = {
    id : Nat;
    token : PayToken;
    amount : Nat;
    fee : ?Nat;
    destination : Account;
    source : OwnerSendSource;
    status : OwnerSendStatus;
    block : ?Nat;
    memoText : Text;
    createdAtTimeNs : Nat64;
    attempt : Nat;
    sends : Nat;
    lastError : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type OwnerSendPage = {
    items : [OwnerSendView]; // newest first
    total : Nat;
    offset : Nat;
  };

  public type TreasurySweepView = {
    status : SweepStatus;
    startedAt : ?Timestamp;
    completedAt : ?Timestamp;
    reserveTopUpE8s : Nat;
    reserveTopUpBlock : ?Nat;
    reserveTopUpMemo : ?Text;
    tokens : [SweepToken];
  };

  // --- Admin treasury management ---------------------------------------------

  // Stored withdrawal record: an OwnerSend whose source is #withdrawal. Its
  // `amount` is the debited total (received amount plus ledger fee), its
  // attempt.request holds the destination, the received amount and the fee.
  public type TreasuryWithdrawal = OwnerSend;

  // Balance of one token, read from the ledger at `readAt`.
  public type TreasuryTokenBalance = {
    token : PayToken;
    mintTreasury : Nat; // internal mint treasury subaccount balance
    accumulated : Nat; // earlier accumulated share in the default account
    fee : Nat; // ledger fee of one withdrawal, paid on top of the amount
    readAt : Timestamp;
  };

  // `amount` is what the destination receives; the ledger fee is debited on top.
  // Refused before any send when amount + fee exceeds the balance of `source`.
  public type WithdrawalArgs = {
    token : PayToken;
    amount : Nat;
    destination : Account;
    source : TreasurySource;
  };

  public type WithdrawalView = {
    id : Nat;
    token : PayToken;
    amount : Nat; // received by the destination
    fee : Nat; // ledger fee debited on top
    destination : Account;
    source : TreasurySource;
    requestedBy : Principal;
    status : OwnerSendStatus;
    block : ?Nat;
    memoText : Text; // TTTI-OW-<n>
    createdAtTimeNs : Nat64;
    attempt : Nat;
    sends : Nat;
    lastError : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type WithdrawalPage = {
    items : [WithdrawalView]; // newest first
    total : Nat;
    offset : Nat;
  };

  public type TreasuryError = {
    #notAdmin;
    #anonymousOwner; // destination owner is the anonymous principal
    #invalidSubaccount; // subaccount not 32 bytes
    #contractAccount; // destination is an account of this contract
    #zeroAmount;
    #salesPaused; // the pause blocks sends
    #operationInProgress; // a withdrawal of this token is in flight
    #balanceUnavailable : Text; // ledger balance read failed
    #insufficientBalance : { source : TreasurySource; available : Nat; requested : Nat; fee : Nat };
  };

  // --- Receiving wallets (admin-configured, one per pay token) ---------------
  // The 100/101 share of every mint is sent directly to the wallet of the paid
  // token (BTC mints use the ckBTC wallet). A mint with a token whose wallet is
  // not configured is refused before any funds are taken.

  public type ReceivingWallet = {
    token : PayToken;
    account : Account;
    setAt : Timestamp;
    setBy : Principal;
  };

  // Audit record of one wallet change (History "Destination" filter).
  public type WalletChange = {
    id : Nat;
    token : PayToken;
    oldAccount : ?Account; // null = first configuration
    newAccount : Account;
    at : Timestamp;
    by : Principal;
  };

  public type ReceivingWalletView = {
    token : PayToken;
    wallet : ?Account; // null = not configured: mints in this token are refused
    accountText : ?Text; // ICRC-1 textual account
    setAt : ?Timestamp;
    setBy : ?Principal;
  };

  // --- One-time settlement (per token) ---------------------------------------
  // When a token's wallet is first configured (then by the timer until done):
  // the accumulated 100/101 share plus the legacy MINT-TREASURY owner share
  // minus amounts already withdrawn go once to the wallet (OwnerSend, source
  // #settlement); the legacy fee part and the not-yet-redistributed fee
  // amounts go once to the dedicated fee account (FeeMove, memo TTTI-ST-<n>).
  // A completed settlement is never sent again, even after a wallet change.

  public type SettlementStatus = {
    #pendingWallet; // no receiving wallet configured yet
    #sending; // legs recorded, sends in progress (timer retries)
    #sent : [Nat]; // every leg succeeded; ledger blocks of the legs
    #failed : Text; // known error; retried by the timer
    #toReview; // a leg's outcome is unknown after 23 h
  };

  public type SettlementLegPurpose = {
    #ownerAccumulated; // default-account accumulated share -> wallet
    #ownerMintTreasury; // legacy MINT-TREASURY owner share -> wallet
    #feePending; // not-yet-redistributed fee amounts -> fee account
    #feeLegacy; // legacy MINT-TREASURY fee part -> fee account
  };

  public type SettlementLeg = {
    purpose : SettlementLegPurpose;
    amount : Nat; // debited from the source (ledger fee included)
    ownerSendId : ?Nat; // owner legs: OwnerSend id (source #settlement)
    feeMoveN : ?Nat; // fee legs: FeeMove n
  };

  public type TokenSettlement = {
    token : PayToken;
    status : SettlementStatus;
    destination : ?Account; // wallet used when the settlement started
    legs : [SettlementLeg];
    startedAt : ?Timestamp;
    completedAt : ?Timestamp;
    lastError : ?Text;
  };

  // Why funds move into the dedicated fee account.
  public type FeeMovePurpose = {
    #mintFee : Nat; // 1/101 of a mint (conversion id)
    #settlement : SettlementLegPurpose; // #feePending or #feeLegacy
  };

  // One internal move into the fee account, sent through lib/retry.mo
  // (memo TTTI-ST-<n>, created_at_time, identical resend for 23 h, then To review).
  public type FeeMove = {
    n : Nat;
    token : PayToken;
    purpose : FeeMovePurpose;
    attempt : TransferAttempt;
    status : OwnerSendStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // Stable mint revenue routing state (stable field `mintRevenue`, added by
  // migration 20261123_000000).
  public type MintRevenueStore = {
    wallets : Map.Map<TokenKey, ReceivingWallet>;
    walletChanges : List.List<WalletChange>; // oldest first
    var nextWalletChangeId : Nat;
    settlements : Map.Map<TokenKey, TokenSettlement>;
    feeMoves : Map.Map<Nat, FeeMove>;
  };

  public type SettlementLegView = {
    purpose : SettlementLegPurpose;
    amount : Nat;
    destination : Account;
    status : OwnerSendStatus;
    block : ?Nat;
    memoText : Text;
  };

  public type TokenSettlementView = {
    token : PayToken;
    status : SettlementStatus;
    destination : ?Account;
    ownerAmount : Nat; // total of the owner legs
    feeAmount : Nat; // total of the fee legs
    legs : [SettlementLegView];
    startedAt : ?Timestamp;
    completedAt : ?Timestamp;
    lastError : ?Text;
  };

  // --- Dedicated fee account (read-only, never withdrawable) -----------------

  public type FeeAccountTokenView = {
    token : PayToken;
    balance : ?Nat; // ledger balance; null when the read failed
    received : Nat; // total 1/101 routed to the fee account
    setAside : Nat; // waiting for LPs or for the 0.001 TTTI-T threshold
    redistributedToLps : Nat; // credited to LPs of the least liquid TTTI-T pool
    injected : Nat; // added to permanent liquidity
  };

  public type FeeAccountView = {
    owner : Principal; // this contract
    subaccountHex : Text;
    accountText : Text; // ICRC-1 textual account
    tokens : [FeeAccountTokenView];
    readAt : Timestamp;
  };

  public type ReceivingWalletResult = Result.Result<ReceivingWalletView, TreasuryError>;
  public type ReceivingWalletsResult = Result.Result<[ReceivingWalletView], TreasuryError>;
  public type SettlementStatusResult = Result.Result<[TokenSettlementView], TreasuryError>;
  public type FeeAccountResult = Result.Result<FeeAccountView, TreasuryError>;

  public type TreasuryBalancesResult = Result.Result<[TreasuryTokenBalance], TreasuryError>;
  public type WithdrawalResult = Result.Result<WithdrawalView, TreasuryError>;
  public type WithdrawalPageResult = Result.Result<WithdrawalPage, TreasuryError>;
};
