"use client";

import { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ReportButtonProps {
  parcelId: string;
}

export function ReportButton({ parcelId }: ReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/parcels/${parcelId}/report`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Report generation failed");
      }

      const data = await res.json() as { reportId: string; blobUrl?: string };
      if (data.blobUrl) setReportUrl(data.blobUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleReport}
        disabled={loading}
        variant="amber"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="mr-2 w-3.5 h-3.5" />
            Generate Report
          </>
        )}
      </Button>
      {reportUrl && (
        <a href={reportUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300">
          Download Report ↓
        </a>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
