import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, BarChart2, CalendarClock } from "lucide-react";
import CountUp from "react-countup";

export type StockPoint = { date: Date; price: number };

interface StatsPanelProps {
  data: StockPoint[];
}

function calcStats(data: StockPoint[]) {
  if (!data.length) return { min: 0, max: 0, avg: 0, ytd: 0 };
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const first = prices[0];
  const last = prices[prices.length - 1];
  const ytd = ((last - first) / first) * 100;
  return { min, max, avg, ytd };
}

export default function StatsPanel({ data }: StatsPanelProps) {
  const { min, max, avg, ytd } = calcStats(data);
  const pos = ytd >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-card p-4 rounded-xl shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Min Price</p>
            <p className="text-2xl font-semibold font-mono">
              ₹<CountUp end={min} duration={1.2} decimals={2} />
            </p>
          </div>
          <ArrowDownRight className="text-foreground/70" />
        </div>
      </Card>

      <Card className="bg-gradient-card p-4 rounded-xl shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Max Price</p>
            <p className="text-2xl font-semibold font-mono">
              ₹<CountUp end={max} duration={1.2} decimals={2} />
            </p>
          </div>
          <ArrowUpRight className="text-foreground/70" />
        </div>
      </Card>

      <Card className="bg-gradient-card p-4 rounded-xl shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Average Price</p>
            <p className="text-2xl font-semibold font-mono">
              ₹<CountUp end={avg} duration={1.2} decimals={2} />
            </p>
          </div>
          <BarChart2 className="text-foreground/70" />
        </div>
      </Card>

      <Card className="bg-gradient-card p-4 rounded-xl shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Year-to-Date Change</p>
            <p className={`text-2xl font-semibold font-mono ${pos ? "text-[hsl(var(--success))]" : "text-[hsl(var(--danger))]"}`}>
              <CountUp end={ytd} duration={1.2} decimals={2} />%
            </p>
          </div>
          <CalendarClock className="text-foreground/70" />
        </div>
      </Card>
    </div>
  );
}
