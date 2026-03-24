import { WireBox } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

// Replace these with your backend data
const radarData: { dimension: string; value: number; fullMark: number }[] = [];

const radarConfig = { value: { label: "Score", color: "hsl(var(--foreground))" } };

const NoData = () => (
  <div className="flex items-center justify-center h-full min-h-[120px] text-sm text-muted-foreground">
    No data available
  </div>
);

const ExpectationAnalysis = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Expectation Analysis</h1>
    </WireBox>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Risk Profile Score">
        <div className="text-center py-4">
          <div className="text-4xl font-bold">--</div>
          <div className="text-sm text-muted-foreground">/100</div>
        </div>
      </WireBox>
      <WireBox label="Claimed Return Score">
        <div className="text-center py-4">
          <div className="text-4xl font-bold">--</div>
          <div className="text-sm text-muted-foreground">/100</div>
        </div>
      </WireBox>
    </div>

    <WireBox label="Product Dimension Radar">
      {radarData.length > 0 ? (
        <ChartContainer config={radarConfig} className="h-[300px] w-full">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar dataKey="value" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ChartContainer>
      ) : <NoData />}
    </WireBox>

    <WireBox label="Fees & Lock-in Details">
      <div className="grid grid-cols-2 gap-4 text-center text-sm">
        <div>
          <div className="text-muted-foreground">Annual Fee</div>
          <div className="text-xl font-bold">--</div>
        </div>
        <div>
          <div className="text-muted-foreground">Lock-in Period</div>
          <div className="text-xl font-bold">--</div>
        </div>
      </div>
    </WireBox>

    <button className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold">
      Proceed to Reality Analysis
    </button>
  </div>
);

export default ExpectationAnalysis;
