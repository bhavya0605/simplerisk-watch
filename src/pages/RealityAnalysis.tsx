import { WireBox } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

const complaintData = [
  { name: "Fees", value: 35 },
  { name: "Service", value: 25 },
  { name: "Hidden Charges", value: 28 },
  { name: "Others", value: 12 },
];
const PIE_FILLS = ["hsl(var(--foreground))", "hsl(0 0% 40%)", "hsl(0 0% 60%)", "hsl(0 0% 80%)"];

const histogramData = [
  { range: "0–0.2", count: 12 },
  { range: "0.2–0.4", count: 18 },
  { range: "0.4–0.6", count: 30 },
  { range: "0.6–0.8", count: 25 },
  { range: "0.8–1.0", count: 15 },
];

const pieConfig = { value: { label: "Complaints", color: "hsl(var(--foreground))" } };
const histConfig = { count: { label: "Products", color: "hsl(var(--foreground))" } };

const RealityAnalysis = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Reality Analysis</h1>
    </WireBox>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Average Sentiment Score">
        <div className="text-3xl font-bold text-center py-2">0.64</div>
      </WireBox>
      <WireBox label="Customer Dissatisfaction Index">
        <div className="text-3xl font-bold text-center py-2">42%</div>
      </WireBox>
    </div>

    <WireBox label="Complaint Categories">
      <ChartContainer config={pieConfig} className="h-[260px] w-full">
        <PieChart>
          <Pie data={complaintData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
            {complaintData.map((_, i) => (
              <Cell key={i} fill={PIE_FILLS[i]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    </WireBox>

    <WireBox label="Sentiment Score Distribution">
      <ChartContainer config={histConfig} className="h-[220px] w-full">
        <BarChart data={histogramData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" label={{ value: "Score Range", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: "Products", angle: -90, position: "insideLeft" }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </WireBox>

    <WireBox label="Top Complaint Topics">
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
        <li>Hidden charges not disclosed</li>
        <li>Returns lower than promised</li>
        <li>Policy terms unclear</li>
        <li>Misleading agent advice</li>
        <li>Difficult withdrawal process</li>
      </ul>
    </WireBox>

    <button className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold">
      Compare with Expectations
    </button>
  </div>
);

export default RealityAnalysis;
