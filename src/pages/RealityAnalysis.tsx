import { WireBox } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

// Replace these with your backend data
const complaintData: { name: string; value: number }[] = [];
const PIE_FILLS = ["hsl(var(--foreground))", "hsl(0 0% 40%)", "hsl(0 0% 60%)", "hsl(0 0% 80%)"];

const histogramData: { range: string; count: number }[] = [];

const pieConfig = { value: { label: "Complaints", color: "hsl(var(--foreground))" } };
const histConfig = { count: { label: "Products", color: "hsl(var(--foreground))" } };

const NoData = () => (
  <div className="flex items-center justify-center h-full min-h-[120px] text-sm text-muted-foreground">
    No data available
  </div>
);

const RealityAnalysis = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Reality Analysis</h1>
    </WireBox>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Average Sentiment Score">
        <div className="text-3xl font-bold text-center py-2">--</div>
      </WireBox>
      <WireBox label="Customer Dissatisfaction Index">
        <div className="text-3xl font-bold text-center py-2">--</div>
      </WireBox>
    </div>

    <WireBox label="Complaint Categories">
      {complaintData.length > 0 ? (
        <ChartContainer config={pieConfig} className="h-[260px] w-full">
          <PieChart>
            <Pie data={complaintData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
              {complaintData.map((_, i) => (
                <Cell key={i} fill={PIE_FILLS[i % PIE_FILLS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      ) : <NoData />}
    </WireBox>

    <WireBox label="Sentiment Score Distribution">
      {histogramData.length > 0 ? (
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
      ) : <NoData />}
    </WireBox>

    <WireBox label="Top Complaint Topics">
      <div className="text-sm text-muted-foreground text-center py-4">No complaints loaded</div>
    </WireBox>

    <button className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold">
      Compare with Expectations
    </button>
  </div>
);

export default RealityAnalysis;
