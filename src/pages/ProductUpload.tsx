import { useState, useRef } from "react";
import { GlassCard } from "@/components/WireframeLayout";
import { uploadProduct } from "@/lib/api";
import { useProduct } from "@/hooks/useProduct";
import { InsightPanel } from "@/components/InsightComponents";

const categories = ["Mutual Fund", "Insurance", "FD"];

const ProductUpload = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const [selectedCategory, setSelectedCategory] = useState("Mutual Fund");
  const [productName, setProductName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const { setSelectedProduct } = useProduct();

  const handleUpload = async () => {
    if (!file || !productName.trim()) {
      setStatus({ type: "error", msg: "Please provide both a product name and a PDF file." });
      return;
    }
    setUploading(true);
    setStatus({ type: null, msg: "" });
    try {
      const product = await uploadProduct(file, productName.trim(), selectedCategory);
      setSelectedProduct(product);
      setStatus({
        type: "success",
        msg: `Product uploaded successfully! Redirecting to analysis report...`,
      });
      setProductName("");
      setFile(null);
      
      // Navigate straight to the report after a short delay
      if (onUploadComplete) {
        setTimeout(onUploadComplete, 1500);
      }
    } catch (err: any) {
      setStatus({ type: "error", msg: `Upload failed: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Product Upload</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Upload a financial product document (PDF) to begin mis-selling analysis
        </p>
      </div>

      {/* How it works */}
      <InsightPanel type="info" title="How It Works">
        Upload a product brochure or document → Our NLP engine extracts claims and promises → 
        Live feedback is scraped from customer forums → Expectations are compared against reality → 
        A risk score is generated with detailed insights.
      </InsightPanel>

      {/* Category Selection */}
      <GlassCard label="Product Category">
        <div className="flex gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "gradient-primary text-white shadow-lg"
                  : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* File Upload */}
      <GlassCard label="Product Document">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-28 rounded-lg border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[hsl(217,91%,60%)] hover:bg-[hsl(217,91%,60%,0.05)] transition-all"
        >
          <span className="text-2xl">{file ? "📄" : "☁️"}</span>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {file ? file.name : "Click to select PDF or drag & drop"}
          </span>
          <span className="text-xs text-[hsl(var(--muted-foreground))] opacity-60">
            Supported: PDF (up to 10MB)
          </span>
        </button>
      </GlassCard>

      {/* Product Name */}
      <GlassCard label="Product Name">
        <input
          type="text"
          placeholder="e.g. SBI Bluechip Fund, HDFC Life Plan..."
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-foreground text-sm outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%,0.5)] transition-all"
        />
      </GlassCard>

      {/* Submit Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full py-3.5 rounded-lg gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {uploading ? "⏳ Uploading & Analyzing..." : "🔍 Upload & Analyze Product"}
      </button>

      {/* Status */}
      {status.type === "success" && (
        <InsightPanel type="success" title="Upload Successful">
          {status.msg}
        </InsightPanel>
      )}
      {status.type === "error" && (
        <InsightPanel type="danger" title="Upload Error">
          {status.msg}
        </InsightPanel>
      )}
    </div>
  );
};

export default ProductUpload;
