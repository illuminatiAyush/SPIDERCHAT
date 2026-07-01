"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="bg-surface/80 border border-white/5 p-8 rounded-2xl max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
          <p className="text-white/60">
            We encountered an unexpected error. Please try again or return home.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Try again
          </button>
          
          <Link
            href="/dashboard"
            className="w-full py-3 px-4 bg-white/5 text-white rounded-xl font-medium transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
