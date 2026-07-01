"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-background text-white min-h-screen flex items-center justify-center font-sans">
        <div className="max-w-md w-full p-8 bg-surface border border-white/10 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">A critical error occurred!</h2>
          <p className="text-white/60 mb-8">
            The application crashed unexpectedly. We have been notified.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-primary rounded-xl font-medium"
          >
            Try to recover
          </button>
        </div>
      </body>
    </html>
  );
}
