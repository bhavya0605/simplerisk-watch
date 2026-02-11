import { WireBox } from "@/components/WireframeLayout";

const ExpectationAnalysis = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Expectation Analysis</h1>
    </WireBox>

    <WireBox label="Extracted Investment Objective" className="min-h-[100px]">
      <div className="border-2 border-dashed border-muted-foreground h-16 flex items-center justify-center text-muted-foreground text-sm">
        [ Investment objective extracted from document ]
      </div>
    </WireBox>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Claimed Returns">
        <div className="border-2 border-dashed border-muted-foreground h-14 flex items-center justify-center text-muted-foreground text-sm">
          [ Promised return figures ]
        </div>
      </WireBox>

      <WireBox label="Risk Profile">
        <div className="border-2 border-dashed border-muted-foreground h-14 flex items-center justify-center text-muted-foreground text-sm">
          [ Risk classification ]
        </div>
      </WireBox>
    </div>

    <WireBox label="Fees & Lock-in Details">
      <div className="border-2 border-dashed border-muted-foreground h-14 flex items-center justify-center text-muted-foreground text-sm">
        [ Fee structure and lock-in period ]
      </div>
    </WireBox>

    <button className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold">
      Proceed to Reality Analysis
    </button>
  </div>
);

export default ExpectationAnalysis;
