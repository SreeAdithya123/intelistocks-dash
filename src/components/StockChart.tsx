import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import { motion } from "framer-motion";
import { useMemo } from "react";

const Plot = createPlotlyComponent(Plotly);

export type StockPoint = { date: Date; price: number };

interface StockChartProps {
  data: StockPoint[];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function StockChart({ data }: StockChartProps) {
  const { x, y, markerColors } = useMemo(() => {
    const x = data.map((d) => d.date);
    const y = data.map((d) => d.price);
    // Gradient from blue (#2563EB) to cyan (#06B6D4) in HSL
    const h1 = 221, s1 = 83, l1 = 53; // blue-600 approx
    const h2 = 190, s2 = 89, l2 = 52; // cyan-500 approx
    const markerColors = y.map((_, i) => {
      const t = i / Math.max(1, y.length - 1);
      const h = lerp(h1, h2, t).toFixed(1);
      const s = lerp(s1, s2, t).toFixed(1);
      const l = lerp(l1, l2, t).toFixed(1);
      return `hsl(${h} ${s}% ${l}%)`;
    });
    return { x, y, markerColors };
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Plot
        data={[{
          x,
          y,
          type: "scatter",
          mode: "lines+markers",
          line: { color: "hsl(221 83% 53%)", width: 3, shape: "spline", smoothing: 1.2 },
          marker: { size: 5, color: markerColors },
          hovertemplate: "%{x|%b %d, %Y}: ₹%{y:.2f}<extra></extra>",
        }]}
        layout={{
          margin: { l: 48, r: 24, t: 10, b: 48 },
          xaxis: { title: "Date", type: "date", tickformat: "%b %d, %Y" },
          yaxis: { title: "Price", tickprefix: "₹", separatethousands: true, zeroline: false, gridcolor: "#E5E7EB" },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          showlegend: false,
        }}
        config={{
          displayModeBar: true,
          responsive: true,
          toImageButtonOptions: { format: "png", filename: "stock-chart" },
          modeBarButtonsToRemove: ["select2d", "lasso2d"],
        }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
        className="min-h-[320px]"
      />
    </motion.div>
  );
}
