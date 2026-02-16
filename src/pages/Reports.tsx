import { WireBox } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, LabelList } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const trendData = [
  { month: "Jan", risk: 45 },
  { month: "Feb", risk: 52 },
  { month: "Mar", risk: 58 },
  { month: "Apr", risk: 61 },
  { month: "May", risk: 55 },
  { month: "Jun", risk: 67 },
];

const productRiskData = [
  { product: "Product #9", risk: 21 },
  { product: "Product #17", risk: 54 },
  { product: "Product #23", risk: 63 },
  { product: "Product #35", risk: 45 },
  { product: "Product #41", risk: 82 },
];

const tableData = [
  { product: "Product #41", sentiment: 0.32, risk: 82, gap: "45%" },
  { product: "Product #23", sentiment: 0.48, risk: 63, gap: "38%" },
  { product: "Product #17", sentiment: 0.54, risk: 54, gap: "29%" },
  { product: "Product #35", sentiment: 0.61, risk: 45, gap: "22%" },
  { product: "Product #9", sentiment: 0.78, risk: 21, gap: "12%" },
];

const trendConfig = { risk: { label: "Risk Score", color: "hsl(var(--foreground))" } };
const barConfig = { risk: { label: "Risk Score", color: "hsl(var(--foreground))" } };

const Reports = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Reports</h1>
    </WireBox>

    <WireBox label="Risk Score Over Time">
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
    </WireBox>

    <WireBox label="Product Comparison — Risk Scores">
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
    </WireBox>

    <WireBox label="Product Risk Breakdown">
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
    </WireBox>

    <WireBox label="Download PDF Report">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">MisSelling_Report_2024.pdf</span>
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
