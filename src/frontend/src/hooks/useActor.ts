import { useActor as useCoreActor } from "@caffeineai/core-infrastructure";
import {
  type ReactElement,
  type ReactNode,
  createContext,
  createElement,
  useContext,
} from "react";
import { createActor } from "../backend";

type ActorState = ReturnType<
  typeof useCoreActor<ReturnType<typeof createActor>>
>;

const ActorContext = createContext<ActorState | undefined>(undefined);

export function ActorProvider({
  children,
}: { children: ReactNode }): ReactElement {
  const value = useCoreActor(createActor, {
    mockModules: import.meta.glob("../mocks/backend.{ts,tsx,js,jsx}"),
  });
  return createElement(ActorContext.Provider, { value }, children);
}

export function useActor(): ActorState {
  const value = useContext(ActorContext);
  if (value === undefined) {
    throw new Error("useActor must be used within an ActorProvider");
  }
  return value;
}
