import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// Lot 8: purchase acknowledgements become versioned. Every existing entry
// keeps its original timestamp and is marked version 1. Touches only
// purchaseAcknowledgements (never sale.reserved, balances, blocks or other state).
module {
  type OldActor = {
    purchaseAcknowledgements : Map.Map<CorePrincipal.Principal, Int>;
  };

  type AcknowledgementRecord = {
    acceptedAt : Int;
    version : Nat;
  };

  type NewActor = {
    purchaseAcknowledgements : Map.Map<CorePrincipal.Principal, AcknowledgementRecord>;
  };

  public func migration(old : OldActor) : NewActor {
    {
      purchaseAcknowledgements = old.purchaseAcknowledgements.map(
        func(_, at) { { acceptedAt = at; version = 1 } }
      );
    };
  };
};
