import { useCallback, useMemo, useState } from "react";
import hero from "@/assets/hero-stocks.jpg";
import UploadDropzone, { StockPoint as RawPoint } from "@/components/UploadDropzone";
import StockChart, { StockPoint } from "@/components/StockChart";
import StatsPanel from "@/components/StatsPanel";
import AiInsights from "@/components/AiInsights";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function processData(points: RawPoint[]): StockPoint[] {
  const valid = points.filter((p) => isFinite(p.price) && !isNaN(p.date.getTime()));
  if (!valid.length) return [];
  const sorted = [...valid].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sorted[0].date;
  const earliestJan1 = new Date(firstDate.getFullYear(), 0, 1);
  const lastDate = sorted[sorted.length - 1].date;
  const filtered = sorted.filter((p) => p.date >= earliestJan1 && p.date <= lastDate);
  return filtered;
}

export default function Index() {
  const [data, setData] = useState<StockPoint[]>([]);

  const handleParsed = useCallback((points: RawPoint[]) => {
    const processed = processData(points);
    setData(processed);
  }, []);

  const hasData = data.length > 0;

  const dateRange = useMemo(() => {
    if (!hasData) return "";
    const start = data[0].date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    const end = data[data.length - 1].date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    return `${start} → ${end}`;
  }, [data, hasData]);

  return (
    <main className="min-h-screen bg-background">
      <section className="container py-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              AI-Powered Interactive Stock Price Visualizer
            </h1>
            <p className="text-muted-foreground mb-4">
              Upload your stock CSV to explore a zoomable chart, view key statistics, and get AI-generated insights.
            </p>
            {!hasData && <Button variant="hero" className="hover-scale" onClick={() => {
              const el = document.getElementById("uploader");
              el?.scrollIntoView({ behavior: "smooth" });
            }}>Get Started</Button>}
            {hasData && <p className="text-sm text-muted-foreground mt-2">Range: {dateRange}</p>}
          </motion.div>
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={hero}
            alt="Premium stock dashboard illustration with blue to cyan gradient line"
            className="w-full rounded-xl shadow-elegant"
            loading="lazy"
          />
        </div>
      </section>

      {!hasData && (
        <section id="uploader" className="container pb-16">
          <UploadDropzone onParsed={handleParsed} />
          <p className="text-center text-sm text-muted-foreground mt-4">Expected columns: Date, Price</p>
        </section>
      )}

      {hasData && (
        <section className="container pb-10 space-y-8">
          <div className="rounded-xl border p-4">
            <StockChart data={data} />
          </div>
          <StatsPanel data={data} />
          <AiInsights data={data} />
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setData([])}>Upload New File</Button>
          </div>
        </section>
      )}
    </main>
  );
}
