import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddressBookError,
  Contact,
  ContactId,
  ContactInput,
} from "../backend";
import { pickDict } from "../i18n/core/dict";
import { formatNumber } from "../i18n/core/lang";
import { ADDRESS_BOOK_TEXT } from "../i18n/pages/addressBook";
import { MAX_MEMO_BYTES } from "../lib/tokenRegistry";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type { Contact, ContactInput };

/** Backend limits of the address book. */
export const MAX_CONTACTS = 200;
export const MAX_NICKNAME_CHARS = 64;

/** Error carrying the backend code and its message in the active language. */
export class AddressBookFailure extends Error {
  readonly code: AddressBookError["__kind__"] | "network";
  constructor(code: AddressBookFailure["code"], message: string) {
    super(message);
    this.name = "AddressBookFailure";
    this.code = code;
  }
}

/** Message in the active language for an AddressBookError. */
export function describeAddressBookError(error: AddressBookError): string {
  const t = pickDict(ADDRESS_BOOK_TEXT);
  switch (error.__kind__) {
    case "anonymous":
      return t.signInRequired;
    case "duplicateNickname":
      return t.errDuplicate;
    case "notFound":
      return t.errNotFound;
    case "limitReached":
      return t.errLimitReached(formatNumber(error.limitReached.max));
    case "invalidInput": {
      const reason = error.invalidInput;
      switch (reason.__kind__) {
        case "nicknameEmpty":
          return t.errNicknameRequired;
        case "nicknameTooLong":
          return t.errNicknameTooLong(
            formatNumber(reason.nicknameTooLong.maxChars),
          );
        case "memoTooLong":
          return t.errMemoTooLong(formatNumber(reason.memoTooLong.maxBytes));
        case "principalNotAllowed":
          return t.errPrincipalNotAllowed;
      }
    }
  }
}

function fail(error: AddressBookError): never {
  throw new AddressBookFailure(error.__kind__, describeAddressBookError(error));
}

function networkFailure(): AddressBookFailure {
  return new AddressBookFailure(
    "network",
    pickDict(ADDRESS_BOOK_TEXT).errGeneric,
  );
}

/** Signed-in Internet Identity principal; undefined when signed out. */
function useIiPrincipal(): Principal | undefined {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  return principal && !principal.isAnonymous() ? principal : undefined;
}

/** Address book enabled: signed in with a non-anonymous Internet Identity. */
export function useAddressBookEnabled(): boolean {
  return !!useIiPrincipal();
}

export function addressBookKey(owner: string | undefined) {
  return ["addressBook", owner ?? "none"] as const;
}

/** The caller's contacts, sorted by nickname. */
export function useMyContacts() {
  const { actor, isFetching } = useActor();
  const owner = useIiPrincipal();

  return useQuery<Array<Contact>>({
    queryKey: addressBookKey(owner?.toText()),
    queryFn: async () => {
      if (!actor) throw networkFailure();
      const result = await actor.listMyContacts();
      if (result.__kind__ === "err") fail(result.err);
      return [...result.ok].sort((a, b) =>
        a.nickname.localeCompare(b.nickname),
      );
    },
    enabled: !!actor && !isFetching && !!owner,
  });
}

function useInvalidateContacts() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["addressBook"] });
  };
}

async function call<T>(
  run: () => Promise<
    { __kind__: "ok"; ok: T } | { __kind__: "err"; err: AddressBookError }
  >,
): Promise<T> {
  let result: Awaited<ReturnType<typeof run>>;
  try {
    result = await run();
  } catch {
    throw networkFailure();
  }
  if (result.__kind__ === "err") fail(result.err);
  return result.ok;
}

export function useAddContact() {
  const { actor } = useActor();
  const invalidate = useInvalidateContacts();
  return useMutation<Contact, AddressBookFailure, ContactInput>({
    mutationFn: async (input) => {
      if (!actor) throw networkFailure();
      return call(() => actor.addContact(input));
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateContact() {
  const { actor } = useActor();
  const invalidate = useInvalidateContacts();
  return useMutation<
    Contact,
    AddressBookFailure,
    { id: ContactId; input: ContactInput }
  >({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw networkFailure();
      return call(() => actor.updateContact(id, input));
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteContact() {
  const { actor } = useActor();
  const invalidate = useInvalidateContacts();
  return useMutation<null, AddressBookFailure, ContactId>({
    mutationFn: async (id) => {
      if (!actor) throw networkFailure();
      return call(() => actor.deleteContact(id));
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export interface ContactDraftErrors {
  nickname?: string;
  principal?: string;
  memo?: string;
}

/**
 * Client-side checks mirroring the backend: nickname required and at most
 * MAX_NICKNAME_CHARS characters, unique among `others`,
 * valid principal that is not `self`.
 */
export function validateContactDraft(params: {
  nickname: string;
  principalText: string;
  memoValid: boolean;
  self: Principal | undefined;
  others: Array<Contact>;
  parsePrincipal: (text: string) => Principal | undefined;
}): ContactDraftErrors {
  const t = pickDict(ADDRESS_BOOK_TEXT);
  const errors: ContactDraftErrors = {};
  const nickname = params.nickname.trim();
  if (nickname === "") errors.nickname = t.errNicknameRequired;
  else if ([...nickname].length > MAX_NICKNAME_CHARS) {
    errors.nickname = t.errNicknameTooLong(formatNumber(MAX_NICKNAME_CHARS));
  } else if (params.others.some((c) => c.nickname.trim() === nickname)) {
    errors.nickname = t.errDuplicate;
  }
  const principal = params.parsePrincipal(params.principalText);
  if (!principal || principal.isAnonymous()) {
    errors.principal = t.errInvalidPrincipal;
  } else if (params.self && principal.toText() === params.self.toText()) {
    errors.principal = t.errOwnAddress;
  }
  if (!params.memoValid)
    errors.memo = t.errMemoTooLong(formatNumber(MAX_MEMO_BYTES));
  return errors;
}
