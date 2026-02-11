import { WireBox } from "@/components/WireframeLayout";

const summaryCards = [
  { label: "Total Products", value: "142" },
  { label: "High Risk Products", value: "23" },
  { label: "Avg Sentiment Score", value: "0.64" },
  { label: "Mis-Selling Risk Index", value: "37%" },
];

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

    <WireBox label="Expectation vs Reality Comparison" className="min-h-[120px]">
      <div className="border-2 border-dashed border-muted-foreground h-20 flex items-center justify-center text-muted-foreground text-sm">
        [ Chart Area ]
      </div>
    </WireBox>

    <WireBox label="Mis-Selling Risk Level" className="min-h-[80px]">
      <div className="border-2 border-dashed border-muted-foreground h-12 flex items-center justify-center text-muted-foreground text-sm">
        [ Risk Gauge ]
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
