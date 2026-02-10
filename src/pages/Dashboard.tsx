import { useState } from "react";

const sidebarItems = [
  "Dashboard",
  "Product Upload",
  "Expectation Analysis",
  "Reality Analysis",
  "Reports",
];

const summaryCards = [
  { label: "Total Products", value: "142" },
  { label: "High Risk Products", value: "23" },
  { label: "Avg Sentiment Score", value: "0.64" },
  { label: "Mis-Selling Risk Index", value: "37%" },
];

const WireBox = ({ label, children, className = "" }: { label?: string; children?: React.ReactNode; className?: string }) => (
  <div className={`border-2 border-foreground p-4 ${className}`}>
    {label && <div className="font-bold text-foreground mb-2">{label}</div>}
    {children}
  </div>
);

const Dashboard = ({ onSignOut }: { onSignOut: () => void }) => {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-48 border-r-2 border-foreground p-2 flex flex-col gap-1 shrink-0">
        <div className="border-2 border-foreground p-2 mb-2 text-center font-bold text-sm">
          Menu
        </div>
        {sidebarItems.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`border-2 border-foreground p-2 text-left text-sm w-full ${
              active === item ? "bg-foreground text-primary-foreground" : "bg-background text-foreground"
            }`}
          >
            {item}
          </button>
        ))}
        <button
          onClick={onSignOut}
          className="border-2 border-foreground p-2 text-left text-sm mt-auto text-muted-foreground"
        >
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Heading */}
        <WireBox className="text-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </WireBox>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <WireBox key={card.label} className="text-center">
              <div className="text-xs text-muted-foreground">{card.label}</div>
              <div className="text-2xl font-bold mt-1">{card.value}</div>
            </WireBox>
          ))}
        </div>

        {/* Main Content */}
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

        {/* Insights */}
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
      </main>
    </div>
  );
};

export default Dashboard;
