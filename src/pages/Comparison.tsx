import { WireBox } from "@/components/WireframeLayout";

const Comparison = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Comparison & Risk Evaluation</h1>
    </WireBox>

    <WireBox label="Expectation vs Reality Chart" className="min-h-[140px]">
      <div className="border-2 border-dashed border-muted-foreground h-24 flex items-center justify-center text-muted-foreground text-sm">
        [ Bar / Line Chart Area ]
      </div>
    </WireBox>

    <WireBox label="Gap Analysis Summary">
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
        <li>Claimed returns: 12% — Actual avg: 7.2%</li>
        <li>Risk disclosed: Low — Actual: Medium-High</li>
        <li>Fees mentioned: 1.5% — Hidden charges: 3.2%</li>
      </ul>
    </WireBox>

    <WireBox label="Risk Gauge (Low / Medium / High)">
      <div className="flex gap-4 text-sm text-center">
        <div className="flex-1 border-2 border-foreground p-3">
          <div className="font-bold">Low</div>
        </div>
        <div className="flex-1 border-2 border-foreground p-3">
          <div className="font-bold">Medium</div>
        </div>
        <div className="flex-1 border-2 border-foreground p-3 bg-foreground text-primary-foreground">
          <div className="font-bold">▶ High</div>
        </div>
      </div>
    </WireBox>

    <button className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold">
      Generate Report
    </button>
  </div>
);

export default Comparison;
