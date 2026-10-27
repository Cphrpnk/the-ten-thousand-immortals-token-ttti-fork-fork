import { Bitcoin, CircleDollarSign } from "lucide-react";
import type { ComponentType } from "react";
import { SiBitcoin, SiInternetcomputer, SiTether } from "react-icons/si";
import { PayToken } from "../backend";
import { BTC_PAY_OPTION, type SetupPayChoice } from "./token";
import { cn } from "./utils";

/**
 * Single place where payment token logos are defined.
 *
 * Each entry has the current brand icon. To use an official logo file later:
 * put the file in `src/frontend/public/assets/tokens/` (e.g. `icp.svg`) and set
 * `src: "/assets/tokens/icp.svg"` on that entry. When `src` is set, every logo
 * in the app (wallet, setup, buy page) shows the image instead of the icon;
 * nothing else needs to change.
 */
export interface TokenLogoDefinition {
  icon: ComponentType<{ className?: string }>;
  /** Optional official image path; replaces the icon when set. */
  src?: string;
}

export const TOKEN_LOGOS: Record<SetupPayChoice, TokenLogoDefinition> = {
  [PayToken.icp]: { icon: SiInternetcomputer },
  [PayToken.ckbtc]: { icon: SiBitcoin },
  [PayToken.ckusdc]: { icon: CircleDollarSign },
  [PayToken.ckusdt]: { icon: SiTether },
  [BTC_PAY_OPTION.id]: { icon: Bitcoin },
};

/** The bare logo mark (icon or official image) of a payment option. */
export function TokenLogoMark({
  id,
  className,
}: {
  id: SetupPayChoice;
  className?: string;
}) {
  const logo = TOKEN_LOGOS[id];
  if (logo.src) {
    return (
      <img
        src={logo.src}
        alt=""
        className={cn("rounded-full object-contain", className)}
      />
    );
  }
  const Icon = logo.icon;
  return <Icon className={className} />;
}

const SIZES = {
  sm: { box: "h-7 w-7", mark: "h-3.5 w-3.5" },
  md: { box: "h-10 w-10", mark: "h-5 w-5" },
} as const;

/** Round payment token logo, same look as the wallet token logos. */
export function PaymentTokenLogo({
  id,
  size = "md",
  className,
}: {
  id: SetupPayChoice;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const dims = SIZES[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-gold bg-muted text-primary",
        dims.box,
        className,
      )}
      aria-hidden="true"
    >
      <TokenLogoMark id={id} className={dims.mark} />
    </span>
  );
}
