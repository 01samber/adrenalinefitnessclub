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
    <div className="afc-surface afc-surface-accent-red mx-auto max-w-lg p-8 text-center">
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-afc-red/15 text-xl font-bold text-afc-red"
        aria-hidden
      >
        !
      </div>
      <h3 className="text-lg font-semibold text-afc-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-afc-soft-grey">
        {message}
      </p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry} variant="secondary">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
