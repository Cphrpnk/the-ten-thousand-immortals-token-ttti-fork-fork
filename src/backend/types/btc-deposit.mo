import Map "mo:core/Map";

module {
  // Native BTC deposits through the ckBTC minter (mqygn-kiaaa-aaaar-qaadq-cai).
  //   #purchase: BTC -> ckBTC (minted into this canister, buyer subaccount)
  //              -> TTTI-T delivered to the buyer's delivery address.
  //   #wallet:   BTC -> ckBTC minted directly to the caller's own account;
  //              no TTTI-T, no app fee.
  // Amounts: BTC / ckBTC in satoshis (e8s), TTTI-T in base units (e8).
  // Timestamps: nanoseconds since epoch (Int, Time.now()).

  public type Timestamp = Int;

  public type DepositKind = {
    #purchase;
    #wallet;
  };

  public type DepositStage = {
    #addressShown; // address returned, nothing seen yet
    #depositDetected; // a UTXO is known to the minter
    #confirming : { current : Nat; required : Nat }; // waiting for BTC confirmations
    #minted; // ckBTC minted (wallet: final; purchase: awaiting delivery)
    #delivered; // purchase: TTTI-T delivered
    #refunded; // purchase: ckBTC refunded to the buyer's own account
    #pendingRate; // purchase: ckBTC available, no valid hourly ckBTC rate yet
    #error; // see errorKind / errorMessage
  };

  public type DepositErrorKind = {
    #valueTooSmall;
    #tainted;
    #minterUnavailable;
    #other;
    // purchase: refund failed, or delivery and refund failed; final for the
    // entry, ckbtcPendingSats is the ckBTC still held for manual follow-up.
    #unrecoverable;
    // purchase, stage #delivered: the excess refund failed; ckbtcPendingSats
    // is the amount still held, errorMessage the reason; retried automatically.
    #refundFailed;
  };

  // One Bitcoin transfer (transaction) sent to the stable address, tracked and
  // converted for its own amount; UTXOs are attributed to entries by txid.
  public type DepositEntry = {
    index : Nat; // 0-based, increasing per address
    stage : DepositStage;
    btcDetectedSats : Nat; // value of UTXOs seen (pending or minted)
    ckbtcMintedSats : Nat; // ckBTC minted by the minter (after its check fee)
    ckbtcPendingSats : Nat; // purchase: minted ckBTC still in the buyer subaccount
    tttiDelivered : Nat; // purchase: TTTI-T base units delivered
    refundedSats : Nat; // purchase: ckBTC refunded (ledger fee deducted)
    conversionId : ?Nat; // purchase: recorded Conversion id
    // Bitcoin txids of this deposit's UTXOs, lowercase hex in display order
    // (outpoint txid bytes reversed), deduplicated.
    btcTxids : [Text];
    // ckBTC ledger block index of this deposit's mint.
    ckbtcMintBlockIndex : ?Nat;
    detectedAt : Timestamp;
    updatedAt : Timestamp;
    errorKind : ?DepositErrorKind;
    errorMessage : ?Text;
  };

  // Per principal and kind: one stable address, never rotated, with the
  // per-deposit history (newest first).
  public type DepositTracking = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage; // current stage: newest entry's, or #addressShown
    deposits : [DepositEntry]; // newest first
    createdAt : Timestamp;
    lastCheckedAt : ?Timestamp;
    errorKind : ?DepositErrorKind; // last check error (e.g. minter unavailable)
    errorMessage : ?Text;
  };

  // Cached get_minter_info values.
  public type MinterInfoCache = {
    minConfirmations : Nat;
    depositMinSats : Nat;
    checkFeeSats : Nat;
    retrieveMinSats : Nat;
    fetchedAt : Timestamp;
  };

  public type BtcDepositStore = {
    purchases : Map.Map<Principal, DepositTracking>;
    wallets : Map.Map<Principal, DepositTracking>;
    var minterInfo : ?MinterInfoCache;
  };

  // --- Public API results ----------------------------------------------------

  public type BtcDepositErrorCode = {
    #anonymousCaller;
    #acknowledgementRequired; // purchase only
    #purchaseInProgress; // purchase only: shared one-purchase-per-principal lock
    #noAddressYet; // check called before the address was requested
    #minterUnavailable; // minter call rejected or failed
  };

  public type BtcDepositError = {
    code : BtcDepositErrorCode;
    message : Text;
  };

  public type BtcDepositResult = {
    #Ok : DepositTracking;
    #Err : BtcDepositError;
  };

  public type MyBtcDeposits = {
    purchase : ?DepositTracking;
    wallet : ?DepositTracking;
  };

  public type BtcDepositInfo = {
    minterCanisterId : Principal;
    ckbtcLedgerId : Principal;
    minConfirmations : Nat;
    depositMinSats : Nat;
    checkFeeSats : Nat;
    purchaseFeeBps : Nat; // 100 (1%) on the purchase flow; wallet flow has no app fee
    suggestedPollSeconds : Nat;
    infoFetchedAt : ?Timestamp; // null = defaults, minter not read yet
  };

  // --- ckBTC minter Candid interface (subset) --------------------------------

  public type MinterAccountArg = {
    owner : ?Principal;
    subaccount : ?Blob;
  };

  public type Outpoint = { txid : Blob; vout : Nat32 };

  public type Utxo = {
    outpoint : Outpoint;
    value : Nat64;
    height : Nat32;
  };

  public type PendingUtxo = {
    outpoint : Outpoint;
    value : Nat64;
    confirmations : Nat32;
  };

  public type UtxoStatus = {
    #ValueTooSmall : Utxo;
    #Tainted : Utxo;
    #Checked : Utxo;
    #Minted : { block_index : Nat64; minted_amount : Nat64; utxo : Utxo };
  };

  public type UpdateBalanceError = {
    #NoNewUtxos : {
      current_confirmations : ?Nat32;
      required_confirmations : Nat32;
      pending_utxos : ?[PendingUtxo];
    };
    #AlreadyProcessing;
    #TemporarilyUnavailable : Text;
    #GenericError : { error_message : Text; error_code : Nat64 };
  };

  public type UpdateBalanceResult = {
    #Ok : [UtxoStatus];
    #Err : UpdateBalanceError;
  };

  public type MinterInfo = {
    min_confirmations : Nat32;
    retrieve_btc_min_amount : Nat64;
    kyt_fee : Nat64;
    deposit_btc_min_amount : ?Nat64;
  };
};
