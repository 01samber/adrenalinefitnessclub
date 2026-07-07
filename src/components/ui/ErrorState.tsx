import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="afc-surface afc-error-state">
      <div className="afc-error-state__icon" aria-hidden>
        !
      </div>
      <h3 className="afc-error-state__title">{title}</h3>
      <p className="afc-error-state__message">{message}</p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry} variant="secondary">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
