import { WireBox } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  PieChart, Pie, Cell, LabelList,
} from "recharts";

const summaryCards = [
  { label: "Total Products", value: "142" },
  { label: "High Risk Products", value: "23" },
  { label: "Avg Sentiment Score", value: "0.64" },
  { label: "Mis-Selling Risk Index", value: "37%" },
];

const sentimentData = [
  { category: "Positive", value: 28 },
  { category: "Neutral", value: 30 },
  { category: "Negative", value: 42 },
];

const trendData = [
  { month: "Jan", score: 0.72 },
  { month: "Feb", score: 0.68 },
  { month: "Mar", score: 0.61 },
  { month: "Apr", score: 0.55 },
  { month: "May", score: 0.60 },
  { month: "Jun", score: 0.64 },
];

const comparisonData = [
  { metric: "Returns", promised: 12, actual: 7.2 },
  { metric: "Risk Level", promised: 3, actual: 7 },
  { metric: "Fees", promised: 1.5, actual: 3.2 },
];

const gapScore = 42;

const gaugeData = [
  { name: "Score", value: 67 },
  { name: "Remaining", value: 33 },
];
const GAUGE_COLORS = ["#ef4444", "#e5e5e5"];

const sentimentConfig = {
  value: { label: "Percentage", color: "hsl(var(--foreground))" },
};
const trendConfig = {
  score: { label: "Sentiment Score", color: "hsl(var(--foreground))" },
};
const comparisonConfig = {
  promised: { label: "Promised", color: "hsl(var(--foreground))" },
  actual: { label: "Actual", color: "hsl(var(--muted-foreground))" },
};

const Dashboard = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </WireBox>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {summaryCards.map((card) => (
        <WireBox key={card.label} className="text-center">
          <div className="text-xs text-muted-foreground">{card.label}</div>
          <div className="text-2xl font-bold mt-1">{card.value}</div>
        </WireBox>
      ))}
    </div>

    <WireBox label="Sentiment Breakdown (%)">
      <ChartContainer config={sentimentConfig} className="h-[220px] w-full">
        <BarChart data={sentimentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis unit="%" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]}>
            <LabelList dataKey="value" position="top" formatter={(v: number) => `${v}%`} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </WireBox>

    <WireBox label="Sentiment Trend Over Time">
      <ChartContainer config={trendConfig} className="h-[220px] w-full">
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 1]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="score" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 4 }}>
            <LabelList dataKey="score" position="top" />
          </Line>
        </LineChart>
      </ChartContainer>
    </WireBox>

    <WireBox label="Expectation vs Reality Comparison">
      <ChartContainer config={comparisonConfig} className="h-[240px] w-full">
        <BarChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="promised" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]}>
            <LabelList dataKey="promised" position="top" />
          </Bar>
          <Bar dataKey="actual" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]}>
            <LabelList dataKey="actual" position="top" />
          </Bar>
        </BarChart>
      </ChartContainer>
      <div className="text-center mt-2 text-sm font-bold">
        Gap Score: <span className="text-lg">{gapScore}</span>/100
      </div>
    </WireBox>

    <WireBox label="Mis-Selling Risk Gauge">
      <div className="flex flex-col items-center">
        <div className="h-[140px] w-[260px]">
          <ChartContainer config={{ score: { label: "Risk", color: "#ef4444" } }} className="h-full w-full">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
                stroke="none"
              >
                {gaugeData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? (gaugeData[0].value > 66 ? "#ef4444" : gaugeData[0].value > 33 ? "#eab308" : "#22c55e") : GAUGE_COLORS[1]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className="text-3xl font-bold -mt-4">{gaugeData[0].value}/100</div>
        <div className="text-sm text-muted-foreground">Risk Level: High</div>
      </div>
    </WireBox>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Top Customer Complaints">
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Hidden charges not disclosed</li>
          <li>Returns lower than promised</li>
          <li>Policy terms unclear</li>
        </ul>
      </WireBox>
      <WireBox label="Alerts">
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>⚠ Product #41 flagged high risk</li>
          <li>⚠ Sentiment drop detected</li>
          <li>⚠ 3 new complaints today</li>
        </ul>
      </WireBox>
    </div>
  </div>
);

export default Dashboard;
