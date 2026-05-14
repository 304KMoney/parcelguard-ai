"use client";

import { useState } from "react";
import { Loader2, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ScoreButtonProps {
  parcelId: string;
  hasScore: boolean;
}

export function ScoreButton({ parcelId, hasScore }: ScoreButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleScore = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/parcels/${parcelId}/score`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Scoring failed");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to score parcel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleScore}
        disabled={loading}
        variant={hasScore ? "outline" : "default"}
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />
            Scoring...
          </>
        ) : hasScore ? (
          <>
            <RefreshCw className="mr-2 w-3.5 h-3.5" />
            Re-Score
          </>
        ) : (
          <>
            <BarChart3 className="mr-2 w-3.5 h-3.5" />
            Generate Score
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
