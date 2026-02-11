import { WireBox } from "@/components/WireframeLayout";

const ProductUpload = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Product Upload</h1>
    </WireBox>

    <WireBox label="Select Product Category">
      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="border-2 border-foreground px-4 py-2">Mutual Fund</div>
        <div className="border-2 border-foreground px-4 py-2">Insurance</div>
        <div className="border-2 border-foreground px-4 py-2">FD</div>
      </div>
    </WireBox>

    <WireBox label="Upload Product Document (PDF)">
      <div className="border-2 border-dashed border-muted-foreground h-20 flex items-center justify-center text-muted-foreground text-sm">
        [ Drop PDF here or click to browse ]
      </div>
    </WireBox>

    <WireBox label="Enter Product Name">
      <div className="border-2 border-foreground p-3">
        <span className="text-sm text-muted-foreground">Product Name...</span>
      </div>
    </WireBox>

    <button className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold">
      Analyze Product
    </button>

    <div className="border-2 border-foreground p-2 text-xs text-muted-foreground text-center">
      Supported formats: PDF
    </div>
  </div>
);

export default ProductUpload;
