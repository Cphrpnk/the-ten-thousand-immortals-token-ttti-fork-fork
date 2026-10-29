import type { Route, RouteError } from "../../backend";
import { type Lang, formatNumber } from "../../i18n/core/lang";
import type { ROUTER_TEXT } from "../../i18n/pages/dexRouter";
import { type DexText, formatDexDate, formatDexUnits } from "./dexFormat";

export type RouterText = (typeof ROUTER_TEXT)["en"];

type TokenFormat = { decimals: number; symbol: string };

export const routeName = (r: RouterText, route: Route): string =>
  route.__kind__ === "native" ? r.routeNative : r.routeIcpswap;

/** Localized message for every RouteError of quoteRoutedSwap / routedSwap. */
export function routeErrorText(
  t: DexText,
  r: RouterText,
  error: RouteError,
  tokenIn: TokenFormat,
  tokenOut: TokenFormat,
  lang: Lang,
): string {
  switch (error.__kind__) {
    case "anonymous":
      return t.errLiqAnonymous;
    case "zeroAmount":
      return t.errZeroAmount;
    case "sameToken":
      return r.errSameToken;
    case "pairNotFound":
      return r.errPairNotFound;
    case "pairRemoved":
      return t.errPoolRemoved;
    case "noRouteAvailable":
      return r.errNoRoute;
    case "routeMismatch":
      return r.errRouteMismatch(routeName(r, error.routeMismatch.expected));
    case "invalidSlippage":
      return t.errInvalidSlippage(
        formatNumber(Number(error.invalidSlippage.maximumBps) / 100, {
          maximumFractionDigits: 2,
        }),
      );
    case "deadlineExceeded":
      return t.errDeadlineExceeded(
        formatDexDate(error.deadlineExceeded.deadline, lang),
      );
    case "deadlineTooFar":
      return t.errDeadlineTooFar(
        formatDexDate(error.deadlineTooFar.maximum, lang),
      );
    case "insufficientBalance":
      return t.errLiqInsufficientBalance(
        formatDexUnits(error.insufficientBalance.available, tokenIn),
        formatDexUnits(error.insufficientBalance.required, tokenIn),
      );
    case "slippageExceeded":
      return t.errSlippageExceeded(
        formatDexUnits(error.slippageExceeded.amountOut, tokenOut),
        formatDexUnits(error.slippageExceeded.minAmountOut, tokenOut),
      );
    case "operationInProgress":
      return t.errOperationInProgress;
    case "icpswapFailed":
      return error.icpswapFailed.fundsReturned
        ? r.errIcpswapReturned(error.icpswapFailed.message)
        : r.errIcpswapHeld(
            error.icpswapFailed.id.toString(),
            error.icpswapFailed.message,
          );
    case "outcomeUnknown":
      return r.errOutcomeUnknown(error.outcomeUnknown.id.toString());
  }
}
