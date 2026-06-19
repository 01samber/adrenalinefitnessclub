interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = "Loading...",
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 px-4 ${fullScreen ? "min-h-screen afc-gradient-bg" : "py-20"}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-afc-border-grey border-t-afc-red" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-afc-red/20" />
      </div>
      <p className="text-center text-sm text-afc-soft-grey">{message}</p>
    </div>
  );
}
