// LC-F4 ErrorBoundary — prevents full-app crashes (SECURITY-15, FRR-1).
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      // dev-only logging; no PII/secrets
      // eslint-disable-next-line no-console
      console.error("UI error boundary:", error.message, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-slate-600">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm">Please reload the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
