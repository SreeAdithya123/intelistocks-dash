import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCcw } from "lucide-react";

export type StockPoint = { date: Date; price: number };

interface AiInsightsProps {
  data: StockPoint[];
}

export default function AiInsights({ data }: AiInsightsProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const points = data.map((p) => ({
        date: p.date.toISOString().slice(0, 10),
        price: Number(p.price.toFixed(4)),
      }));

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-stock`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        const msg = contentType.includes("application/json") ? (await res.json())?.error : await res.text();
        throw new Error(msg || `Request failed (${res.status})`);
      }

      const json = contentType.includes("application/json") ? await res.json() : { insights: await res.text() };
      setInsights(json.insights || "No insights returned.");
    } catch (e: any) {
      console.error(e);
      toast({ title: "AI error", description: e.message || "Failed to get insights", variant: "destructive" } as any);
      setInsights(
        "AI insights unavailable. Please configure OPENROUTER_API_KEY in your project settings and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.length) fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Card className="p-6 rounded-xl shadow-elegant">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">AI Market Insights</h3>
        <Button variant="outline" onClick={fetchInsights} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw />}<span className="ml-2">Regenerate</span>
        </Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Analyzing market data…</p>
      ) : (
        <p className="leading-relaxed">{insights}</p>
      )}
    </Card>
  );
}
