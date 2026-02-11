import { WireBox } from "@/components/WireframeLayout";

const Reports = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Reports</h1>
    </WireBox>

    <WireBox label="Download PDF Report">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">MisSelling_Report_2024.pdf</span>
        <div className="border-2 border-foreground px-4 py-2 text-sm font-bold cursor-pointer">
          Download
        </div>
      </div>
    </WireBox>

    <WireBox label="Product Risk Summary">
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
        <li>Product #41 — High Risk — Score: 0.82</li>
        <li>Product #17 — Medium Risk — Score: 0.54</li>
        <li>Product #9 — Low Risk — Score: 0.21</li>
      </ul>
    </WireBox>

    <WireBox label="Historical Trend Analysis">
      <div className="border-2 border-dashed border-muted-foreground h-20 flex items-center justify-center text-muted-foreground text-sm">
        [ Trend Line Chart ]
      </div>
    </WireBox>

    <WireBox label="Export Data (CSV)">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Export all product analysis data</span>
        <div className="border-2 border-foreground px-4 py-2 text-sm font-bold cursor-pointer">
          Export CSV
        </div>
      </div>
    </WireBox>
  </div>
);

export default Reports;
