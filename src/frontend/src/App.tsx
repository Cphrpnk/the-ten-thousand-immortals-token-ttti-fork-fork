import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import {
  WalletTermsBanner,
  WalletTermsDialog,
  WalletTermsProvider,
} from "./components/acceptance";
import { DepositAlerts } from "./components/btc/DepositAlerts";
import { SetupFlowHost } from "./components/funnel/SetupFlowHost";
import { Toaster } from "./components/ui/sonner";
import { ActorProvider } from "./hooks/useActor";
import { BuyFunnelProvider } from "./hooks/useBuyFunnel";
import { ConnectedWalletProvider } from "./hooks/useConnectedWallet";
import { PlugProvider } from "./hooks/usePlug";
import { LanguageProvider } from "./i18n/core";

const AdminPage = lazy(() =>
  import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })),
);
const AuctionPage = lazy(() =>
  import("./pages/AuctionPage").then((m) => ({ default: m.AuctionPage })),
);
const BuyIcpPage = lazy(() =>
  import("./pages/BuyIcpPage").then((m) => ({ default: m.BuyIcpPage })),
);
const ExchangePage = lazy(() =>
  import("./pages/ExchangePage").then((m) => ({ default: m.ExchangePage })),
);
const GuaranteePage = lazy(() =>
  import("./pages/GuaranteePage").then((m) => ({ default: m.GuaranteePage })),
);
const HistoryPage = lazy(() =>
  import("./pages/HistoryPage").then((m) => ({ default: m.HistoryPage })),
);
const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const PoolsPage = lazy(() =>
  import("./pages/PoolsPage").then((m) => ({ default: m.PoolsPage })),
);
const TransferPage = lazy(() =>
  import("./pages/TransferPage").then((m) => ({ default: m.TransferPage })),
);
const WalletPage = lazy(() =>
  import("./pages/WalletPage").then((m) => ({ default: m.WalletPage })),
);
const WhitePaperRoute = lazy(() =>
  import("./components/WhitePaperRoute").then((m) => ({
    default: m.WhitePaperRoute,
  })),
);

/**
 * Single QueryClient shared by main.tsx and App.tsx. Queries that set their own
 * staleTime or refetchInterval keep it; the rest are fresh for 30 seconds.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

function Layout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLanding = pathname === "/";

  return (
    <BuyFunnelProvider>
      <WalletTermsProvider>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <WalletTermsBanner />
          <main
            className={
              isLanding
                ? "w-full flex-1"
                : "container mx-auto w-full flex-1 px-4 py-16 md:py-20"
            }
          >
            <ErrorBoundary
              key={pathname}
              name={`page:${pathname === "/" ? "home" : pathname.replace(/^\//, "")}`}
            >
              <Suspense fallback={null}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
        <WalletTermsDialog />
        <DepositAlerts />
        <SetupFlowHost />
      </WalletTermsProvider>
    </BuyFunnelProvider>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const buyIcpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buy-icp",
  component: BuyIcpPage,
});

/** Buy TTTI-T page (component file kept at pages/ExchangePage.tsx). */
const buyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buy",
  component: ExchangePage,
});

/** Former address of the buy page; kept so old links still land on /buy. */
const exchangeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exchange",
  beforeLoad: () => {
    throw redirect({ to: "/buy", replace: true });
  },
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

const guaranteeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guarantee",
  component: GuaranteePage,
});

/** Alias of the Rachat page; lands on /guarantee. */
const redeemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/redeem",
  beforeLoad: () => {
    throw redirect({ to: "/guarantee", replace: true });
  },
});

const auctionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auction",
  component: AuctionPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const transferRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transfer",
  component: TransferPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: WalletPage,
});

const poolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pools",
  component: PoolsPage,
});

const whitePaperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/white-paper",
  component: WhitePaperRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  buyIcpRoute,
  buyRoute,
  exchangeRoute,
  historyRoute,
  guaranteeRoute,
  redeemRoute,
  auctionRoute,
  adminRoute,
  transferRoute,
  walletRoute,
  poolsRoute,
  whitePaperRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ErrorBoundary name="app">
      <LanguageProvider router={router}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryClientProvider client={queryClient}>
            <ActorProvider>
              <PlugProvider>
                <ConnectedWalletProvider>
                  <RouterProvider router={router} />
                  <Toaster />
                </ConnectedWalletProvider>
              </PlugProvider>
            </ActorProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
