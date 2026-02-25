import React from "react";
import { AlertCircle, RefreshCw, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logCriticalError } from "@/lib/errorLogger";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logCriticalError({
      action: "unhandled_react_error",
      error_message: error.message,
      stack_trace: error.stack || errorInfo.componentStack || undefined,
      severity: "critical",
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">
                We're sorry.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Something unexpected happened.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Our team has been notified and is already reviewing the issue.
                You may try again in a few minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={this.handleRetry}
                size="lg"
                className="min-w-[160px] h-14 text-base gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Try again
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="min-w-[160px] h-14 text-base gap-2"
              >
                <a href="tel:18005550123">
                  <Phone className="h-5 w-5" />
                  Call us
                </a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
