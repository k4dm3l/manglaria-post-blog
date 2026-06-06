"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/constants/ui";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex min-h-[400px] flex-col items-center justify-center gap-4"
          role="alert"
        >
          <h2 className="text-2xl font-bold">Algo salió mal</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {this.state.error?.message || UI_COPY.errors.generic}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
