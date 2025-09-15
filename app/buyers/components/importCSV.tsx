"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Upload} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImportCSV() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors([]);
    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/importBuyers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(results.data),
          });

          const json = await res.json();
          if (!res.ok) {
            setErrors(json.errors || [{ row: 0, message: json.error }]);
            setShowErrors(true);
          } else {
            toast.success(` Imported ${json.insertedCount} buyer leads successfully!`,
  { position: "top-right" });
            if (json.errors?.length) {
              setErrors(json.errors);
              setShowErrors(true);
            }
             router.refresh();
          }
        } catch (err) {
          setErrors([{ row: 0, message: "Network error" }]);
          setShowErrors(true);
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = ""; // reset file input
        }
      },
    });
  }

  return (
    <div className="mb-6 p-2 flex flex-col items-center justify-center w-full">
      <h2 className="block font-medium mb-2">Import Buyers (CSV)</h2>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Styled button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        <Upload size={16} />
        {uploading ? "Uploading…" : "Import CSV"}
      </button>

      {/* Uploading text */}
      {/* {uploading && <p className="text-blue-600 mt-2 text-sm">Processing file…</p>} */}

      {/* Errors section */}
      {errors.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-center">
         
          <button
            type="button"
            className="text-sm font-medium text-red-600 hover:text-red-800 underline cursor-pointer"
            onClick={() => setShowErrors((s) => !s)}
          >
            {showErrors ? "Hide Errors" : `Show Errors (${errors.length})`}
          </button>

          {showErrors && (
            <div className="mt-3 border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-3 py-2 text-left">Row</th>
                      <th className="border px-3 py-2 text-left">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((err, i) => (
                      <tr key={i} >
                        <td className="border px-3 py-2">{err.row}</td>
                        <td className="border px-3 py-2 text-red-700">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
