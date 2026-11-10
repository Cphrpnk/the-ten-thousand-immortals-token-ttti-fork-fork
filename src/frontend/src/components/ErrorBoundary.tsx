import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";

interface ErrorBoundaryProps {
  /** Page or area name shown in the error display and the console. */
  name: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  componentStack: string;
}

/** Name of the first component listed in a React component stack. */
function firstComponentName(componentStack: string | null | undefined): string {
  const firstLine = (componentStack ?? "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstLine) return "unknown";
  const chrome = /^at\s+([^\s(]+)/.exec(firstLine);
  if (chrome) return chrome[1];
  const firefox = /^([^@\s]+)@/.exec(firstLine);
  if (firefox) return firefox[1];
  return firstLine;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null, componentStack: "" };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const componentStack = info.componentStack ?? "";
    this.setState({ componentStack });
    const componentName = firstComponentName(componentStack);
    console.error(
      `[ErrorBoundary:${this.props.name}] component ${componentName}`,
      error,
      componentStack,
    );
  }

  render() {
    const { error, componentStack } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        data-ocid="error_boundary.error_state"
        className="container mx-auto w-full max-w-3xl px-4 py-16 md:py-20"
      >
        <div className="rounded-lg border border-border bg-card p-6 md:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {this.props.name}
            </p>
            <h2 className="font-display text-2xl text-foreground">
              Une erreur est survenue · An error occurred
            </h2>
            <p className="text-sm text-muted-foreground break-words">
              {error.message || String(error)}
            </p>
          </div>

          <pre
            data-ocid="error_boundary.stack"
            className="max-h-72 overflow-auto rounded-md border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap break-words"
          >
            {[error.stack, componentStack].filter(Boolean).join("\n\n")}
          </pre>

          <Button
            type="button"
            data-ocid="error_boundary.primary_button"
            onClick={() => window.location.reload()}
          >
            Recharger · Reload
          </Button>
        </div>
      </div>
    );
  }
}
