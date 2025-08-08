import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";

export type StockPoint = { date: Date; price: number };

interface UploadDropzoneProps {
  onParsed: (points: StockPoint[]) => void;
}

const ACCEPTED = ["text/csv", ".csv"]; 

export function UploadDropzone({ onParsed }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!ACCEPTED.some((t) => file.type.includes("csv") || file.name.endsWith(".csv"))) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .csv file containing Date and Close columns.",
          variant: "destructive",
        } as any);
        return;
      }

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result) => {
          try {
            const raw = result.data as any[];
            if (!raw || raw.length === 0) {
              throw new Error("Empty CSV file");
            }

            const points: StockPoint[] = raw
              .map((row) => {
                const d = row["Date"] ?? row["date"] ?? row["DATE"];
                const p = row["Close"] ?? row["close"] ?? row["CLOSE"] ?? row["Price"] ?? row["price"] ?? row["PRICE"];
                const date = new Date(d);
                const price = typeof p === "number" ? p : parseFloat(p);
                if (!isFinite(price) || isNaN(date.getTime())) return null;
                return { date, price } as StockPoint;
              })
              .filter(Boolean) as StockPoint[];

            if (points.length === 0) throw new Error("Missing required columns: Date, Close");

            onParsed(points);
            toast({ title: "CSV parsed", description: `Loaded ${points.length} rows.` } as any);
          } catch (e: any) {
            toast({ title: "Error parsing CSV", description: e.message, variant: "destructive" } as any);
          }
        },
        error: (err) => {
          toast({ title: "Parse error", description: err.message, variant: "destructive" } as any);
        },
      });
    },
    [onParsed]
  );

  return (
    <Card
      className={`border-dashed border-2 p-8 rounded-lg bg-background/60 hover-scale transition-all ${dragging ? "border-primary shadow-glow" : "border-border"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
      role="region"
      aria-label="Upload CSV dropzone"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-secondary text-foreground"><UploadCloud /></div>
        <div className="text-center">
          <p className="text-lg font-semibold">Drag & drop your CSV here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="hero" onClick={() => inputRef.current?.click()}>Upload CSV</Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
        <p className="text-xs text-muted-foreground">Accepted format: .csv with Date, Close columns</p>
      </div>
    </Card>
  );
}

export default UploadDropzone;
