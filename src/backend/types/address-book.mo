import Map "mo:core/Map";
import Principal "mo:core/Principal";

// Private address book, one per caller principal.
module {
  public type ContactId = Nat;

  public type Contact = {
    id : ContactId;
    nickname : Text;
    principal : Principal;
    // Optional default ICRC-1 memo, at most 32 bytes.
    memo : ?Blob;
    createdAt : Int; // nanoseconds
    updatedAt : Int; // nanoseconds
  };

  public type ContactInput = {
    nickname : Text;
    principal : Principal;
    memo : ?Blob;
  };

  public type InvalidReason = {
    #nicknameEmpty;
    #nicknameTooLong : { maxChars : Nat };
    #memoTooLong : { maxBytes : Nat };
    #principalNotAllowed;
  };

  public type AddressBookError = {
    #anonymous;
    #duplicateNickname;
    #invalidInput : InvalidReason;
    #notFound;
    #limitReached : { max : Nat };
  };

  public type AddressBookStore = {
    owners : Map.Map<Principal, Map.Map<ContactId, Contact>>;
    var nextId : Nat;
  };
};
