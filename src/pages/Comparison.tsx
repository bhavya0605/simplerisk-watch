import { WireBox } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, PieChart, Pie, Cell } from "recharts";

const comparisonData = [
  { metric: "Returns (%)", promised: 12, actual: 7.2, gap: "40%" },
  { metric: "Risk Level", promised: 3, actual: 7, gap: "133%" },
  { metric: "Fees (%)", promised: 1.5, actual: 3.2, gap: "113%" },
];

const gaugeData = [
  { name: "Score", value: 74 },
  { name: "Remaining", value: 26 },
];

const chartConfig = {
  promised: { label: "Promised", color: "hsl(var(--foreground))" },
  actual: { label: "Actual", color: "hsl(0 0% 60%)" },
};
const gaugeConfig = { score: { label: "Risk", color: "#ef4444" } };

const Comparison = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Comparison & Risk Evaluation</h1>
    </WireBox>

    <WireBox label="Expectation vs Reality">
      <ChartContainer config={chartConfig} className="h-[240px] w-full">
        <BarChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="promised" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]}>
            <LabelList dataKey="promised" position="top" />
          </Bar>
          <Bar dataKey="actual" fill="hsl(0 0% 60%)" radius={[2, 2, 0, 0]}>
            <LabelList dataKey="actual" position="top" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </WireBox>

    <WireBox label="Gap Analysis Summary">
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
        <li>Claimed returns: 12% — Actual avg: 7.2% (Gap: 40%)</li>
        <li>Risk disclosed: Low — Actual: Medium-High (Gap: 133%)</li>
        <li>Fees mentioned: 1.5% — Hidden charges: 3.2% (Gap: 113%)</li>
      </ul>
    </WireBox>

    <WireBox label="Risk Gauge">
      <div className="flex flex-col items-center">
        <div className="h-[140px] w-[260px]">
          <ChartContainer config={gaugeConfig} className="h-full w-full">
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
                <Cell fill={gaugeData[0].value > 66 ? "#ef4444" : gaugeData[0].value > 33 ? "#eab308" : "#22c55e"} />
                <Cell fill="#e5e5e5" />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className="text-3xl font-bold -mt-4">{gaugeData[0].value}/100</div>
        <div className="text-sm text-muted-foreground">Risk Level: High</div>
      </div>
    </WireBox>

    <button className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold">
      Generate Report
    </button>
  </div>
);

export default Comparison;
