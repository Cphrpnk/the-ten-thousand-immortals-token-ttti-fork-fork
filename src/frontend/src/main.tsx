import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App, { queryClient } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary name="root">
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider
        createOptions={{
          agentOptions: {
            host: new URL(process.env.II_URL || "https://id.ai").origin,
          },
        }}
      >
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
