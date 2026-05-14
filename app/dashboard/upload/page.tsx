"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UploadResult {
  success: boolean;
  parcelsCreated: number;
  message: string;
  errors?: string[];
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [pasteContent, setPasteContent] = useState("");
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file && !pasteContent.trim()) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("content", pasteContent);
        formData.append("format", "paste");
      }

      const res = await fetch("/api/parcels/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json() as UploadResult;
      setResult(data);

      if (data.success) {
        setFile(null);
        setPasteContent("");
      }
    } catch {
      setResult({
        success: false,
        parcelsCreated: 0,
        message: "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / 1024 / 1024)} MB`;
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Upload Sale List</h1>
        <p className="text-slate-400">
          Upload your county tax sale list. We&apos;ll normalize the data, score each parcel,
          and flag risks before you bid.
        </p>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-lg border px-4 py-3 text-xs text-slate-500 mb-8"
        style={{ backgroundColor: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}
      >
        ⚠️ Research support only. Not legal, tax, title, financial, or investment advice.
        Verify all data before bidding.
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ backgroundColor: "#1e293b" }}>
        {(["file", "paste"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all capitalize"
            style={
              activeTab === tab
                ? { backgroundColor: "#0f172a", color: "#f1f5f9" }
                : { color: "#64748b" }
            }
          >
            {tab === "file" ? "Upload File" : "Paste Data"}
          </button>
        ))}
      </div>

      {activeTab === "file" ? (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
            style={{
              borderColor: isDragActive ? "#6366f1" : "#334155",
              backgroundColor: isDragActive ? "rgba(99,102,241,0.05)" : "rgba(30,41,59,0.5)",
            }}
          >
            <input {...getInputProps()} />
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(99,102,241,0.12)" }}
            >
              <Upload className="w-7 h-7" style={{ color: "#6366f1" }} />
            </div>
            {isDragActive ? (
              <p className="text-indigo-400 font-semibold">Drop it here</p>
            ) : (
              <>
                <p className="text-slate-200 font-semibold mb-1">
                  Drag & drop your sale list
                </p>
                <p className="text-slate-400 text-sm mb-4">or click to browse files</p>
                <p className="text-xs text-slate-500">
                  Supported: CSV, Excel (.xlsx, .xls), PDF — Max 10MB
                </p>
              </>
            )}
          </div>

          {/* Selected file */}
          {file && (
            <div
              className="flex items-center gap-4 p-4 rounded-lg border"
              style={{ backgroundColor: "rgba(30,41,59,0.8)", borderColor: "#334155" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(99,102,241,0.12)" }}
              >
                <FileText className="w-5 h-5" style={{ color: "#6366f1" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Paste CSV or tabular data
            </label>
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Paste your CSV data here. Include headers in the first row:&#10;parcel_id,situs_address,owner_name,assessed_value,opening_bid,auction_type,county,state&#10;12-345-678,123 Oak St,John Smith,85000,4200,lien,Baltimore,MD&#10;..."
              className="w-full h-48 rounded-lg border p-4 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
              style={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                color: "#f1f5f9",
              }}
            />
            <p className="text-xs text-slate-500 mt-2">
              Tip: Export your county sale list as CSV, then paste it here.
            </p>
          </div>
        </div>
      )}

      {/* Expected columns */}
      <div
        className="mt-6 rounded-lg p-4 border"
        style={{ backgroundColor: "rgba(15,23,42,0.5)", borderColor: "#1e293b" }}
      >
        <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Recognized Column Headers
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            "parcel_id",
            "situs_address",
            "owner_name",
            "assessed_value",
            "tax_amount_owed",
            "opening_bid",
            "auction_type",
            "redemption_period",
            "property_type",
            "county",
            "state",
            "sale_date",
          ].map((col) => (
            <span
              key={col}
              className="text-xs font-mono px-2 py-1 rounded"
              style={{ backgroundColor: "rgba(99,102,241,0.08)", color: "#818cf8" }}
            >
              {col}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Column headers are flexible — we&apos;ll match common variations automatically.
          Missing columns will be flagged, not guessed.
        </p>
      </div>

      {/* Upload button */}
      <div className="mt-6 flex items-center gap-4">
        <Button
          onClick={handleUpload}
          disabled={uploading || (!file && !pasteContent.trim())}
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 w-4 h-4" />
              Upload & Analyze
            </>
          )}
        </Button>
        {uploading && (
          <p className="text-sm text-slate-400">
            Parsing and scoring your parcels. This may take a moment...
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div
          className="mt-6 rounded-lg border p-5"
          style={{
            backgroundColor: result.success
              ? "rgba(34,197,94,0.05)"
              : "rgba(239,68,68,0.05)",
            borderColor: result.success
              ? "rgba(34,197,94,0.2)"
              : "rgba(239,68,68,0.2)",
          }}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className="font-semibold mb-1"
                style={{ color: result.success ? "#22c55e" : "#ef4444" }}
              >
                {result.success ? "Upload Successful" : "Upload Failed"}
              </p>
              <p className="text-sm text-slate-300">{result.message}</p>
              {result.parcelsCreated > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  {result.parcelsCreated} parcel{result.parcelsCreated !== 1 ? "s" : ""} created
                  and scored.
                </p>
              )}
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-xs text-red-400">
                      • {err}
                    </li>
                  ))}
                </ul>
              )}
              {result.success && (
                <div className="mt-3 flex gap-3">
                  <Link href="/dashboard/parcels" className="text-sm text-indigo-400 hover:text-indigo-300">
                    View parcels →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
