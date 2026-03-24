import { WireBox } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, LabelList } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Replace these with your backend data
const trendData: { month: string; risk: number }[] = [];
const productRiskData: { product: string; risk: number }[] = [];
const tableData: { product: string; sentiment: number; risk: number; gap: string }[] = [];

const trendConfig = { risk: { label: "Risk Score", color: "hsl(var(--foreground))" } };
const barConfig = { risk: { label: "Risk Score", color: "hsl(var(--foreground))" } };

const NoData = () => (
  <div className="flex items-center justify-center h-full min-h-[120px] text-sm text-muted-foreground">
    No data available
  </div>
);

const Reports = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Reports</h1>
    </WireBox>

    <WireBox label="Risk Score Over Time">
      {trendData.length > 0 ? (
        <ChartContainer config={trendConfig} className="h-[220px] w-full">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} label={{ value: "Risk Score", angle: -90, position: "insideLeft" }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="risk" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 4 }}>
              <LabelList dataKey="risk" position="top" />
            </Line>
          </LineChart>
        </ChartContainer>
      ) : <NoData />}
    </WireBox>

    <WireBox label="Product Comparison — Risk Scores">
      {productRiskData.length > 0 ? (
        <ChartContainer config={barConfig} className="h-[220px] w-full">
          <BarChart data={productRiskData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="risk" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]}>
              <LabelList dataKey="risk" position="top" />
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : <NoData />}
    </WireBox>

    <WireBox label="Product Risk Breakdown">
      {tableData.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Sentiment Score</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Gap %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.product}>
                <TableCell className="font-bold">{row.product}</TableCell>
                <TableCell>{row.sentiment}</TableCell>
                <TableCell>{row.risk}</TableCell>
                <TableCell>{row.gap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : <NoData />}
    </WireBox>

    <WireBox label="Download PDF Report">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">No report generated</span>
        <div className="border-2 border-foreground px-4 py-2 text-sm font-bold cursor-pointer">Download</div>
      </div>
    </WireBox>

    <WireBox label="Export Data (CSV)">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Export all product analysis data</span>
        <div className="border-2 border-foreground px-4 py-2 text-sm font-bold cursor-pointer">Export CSV</div>
      </div>
    </WireBox>
  </div>
);

export default Reports;
