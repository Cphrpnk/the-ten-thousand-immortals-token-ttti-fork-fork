import { useBuyFunnel } from "../../hooks/useBuyFunnel";
import { SetupFlow } from "./SetupFlow";

/**
 * Mounts the guided setup flow once for the whole app. Must be rendered inside
 * BuyFunnelProvider; the key remounts the flow at step 1 on every fresh open.
 */
export function SetupFlowHost() {
  const { isSetupOpen, setupSession, setSetupOpen, closeSetup } =
    useBuyFunnel();

  return (
    <SetupFlow
      key={setupSession}
      open={isSetupOpen}
      onOpenChange={(next: boolean) => {
        if (next) setSetupOpen(true);
        else closeSetup();
      }}
    />
  );
}
