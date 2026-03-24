import { WireBox } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  PieChart, Pie, Cell, LabelList,
} from "recharts";

const summaryCards = [
  { label: "Total Products", value: "--" },
  { label: "High Risk Products", value: "--" },
  { label: "Avg Sentiment Score", value: "--" },
  { label: "Mis-Selling Risk Index", value: "--" },
];

// Replace these with your backend data
const sentimentData: { category: string; value: number }[] = [];
const trendData: { month: string; score: number }[] = [];
const comparisonData: { metric: string; promised: number; actual: number }[] = [];
const gapScore: number | null = null;
const gaugeData: { name: string; value: number }[] = [];

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

const NoData = () => (
  <div className="flex items-center justify-center h-full min-h-[120px] text-sm text-muted-foreground">
    No data available
  </div>
);

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
      {sentimentData.length > 0 ? (
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
      ) : <NoData />}
    </WireBox>

    <WireBox label="Sentiment Trend Over Time">
      {trendData.length > 0 ? (
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
      ) : <NoData />}
    </WireBox>

    <WireBox label="Expectation vs Reality Comparison">
      {comparisonData.length > 0 ? (
        <>
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
            Gap Score: <span className="text-lg">{gapScore ?? "--"}</span>/100
          </div>
        </>
      ) : <NoData />}
    </WireBox>

    <WireBox label="Mis-Selling Risk Gauge">
      {gaugeData.length > 0 ? (
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
          <div className="text-sm text-muted-foreground">
            Risk Level: {gaugeData[0].value > 66 ? "High" : gaugeData[0].value > 33 ? "Medium" : "Low"}
          </div>
        </div>
      ) : <NoData />}
    </WireBox>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Top Customer Complaints">
        <div className="text-sm text-muted-foreground text-center py-4">No complaints loaded</div>
      </WireBox>
      <WireBox label="Alerts">
        <div className="text-sm text-muted-foreground text-center py-4">No alerts</div>
      </WireBox>
    </div>
  </div>
);

export default Dashboard;
