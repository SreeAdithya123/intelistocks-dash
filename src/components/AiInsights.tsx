
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      console.log("Fetching AI insights for", data.length, "data points");
      
      const points = data.map((p) => ({
        date: p.date.toISOString().slice(0, 10),
        price: Number(p.price.toFixed(4)),
      }));

      console.log("Calling analyze-stock function with points:", points.slice(0, 5)); // Log first 5 points

      const { data: result, error } = await supabase.functions.invoke('analyze-stock', {
        body: { points }
      });

      console.log("Function response:", { result, error });

      if (error) {
        throw new Error(error.message || "Failed to get AI insights");
      }

      const insights = result?.insights || "No insights returned.";
      console.log("Setting insights:", insights);
      setInsights(insights);
    } catch (e: any) {
      console.error("AI insights error:", e);
      toast({ 
        title: "AI error", 
        description: e.message || "Failed to get insights", 
        variant: "destructive" 
      } as any);
      setInsights(
        "AI insights unavailable. Please configure OPENROUTER_API_KEY in your project settings and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.length) {
      console.log("Data changed, fetching insights for", data.length, "points");
      fetchInsights();
    }
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
