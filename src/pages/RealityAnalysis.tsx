import { WireBox } from "@/components/WireframeLayout";

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

    <WireBox label="Top Complaint Topics" className="min-h-[100px]">
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
        <li>Hidden charges not disclosed</li>
        <li>Returns lower than promised</li>
        <li>Policy terms unclear</li>
        <li>Misleading agent advice</li>
        <li>Difficult withdrawal process</li>
      </ul>
    </WireBox>

    <WireBox label="Sentiment Breakdown (Positive / Neutral / Negative)">
      <div className="flex gap-4 text-sm text-center">
        <div className="flex-1 border-2 border-foreground p-3">
          <div className="text-xs text-muted-foreground">Positive</div>
          <div className="text-xl font-bold mt-1">28%</div>
        </div>
        <div className="flex-1 border-2 border-foreground p-3">
          <div className="text-xs text-muted-foreground">Neutral</div>
          <div className="text-xl font-bold mt-1">30%</div>
        </div>
        <div className="flex-1 border-2 border-foreground p-3">
          <div className="text-xs text-muted-foreground">Negative</div>
          <div className="text-xl font-bold mt-1">42%</div>
        </div>
      </div>
    </WireBox>

    <button className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold">
      Compare with Expectations
    </button>
  </div>
);

export default RealityAnalysis;
