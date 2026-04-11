import { useState } from "react";
import SignIn from "./SignIn";
import WireframeLayout from "@/components/WireframeLayout";
import Dashboard from "./Dashboard";
import ProductUpload from "./ProductUpload";
import ExpectationAnalysis from "./ExpectationAnalysis";
import RealityAnalysis from "./RealityAnalysis";
import Comparison from "./Comparison";
import Reports from "./Reports";
import AnalyzePage from "./AnalyzePage";
import { type NewsItem } from "@/lib/api";
import { ProductProvider } from "@/hooks/useProduct";

type Role = "Admin" | "Analyst" | "Viewer";

const pages: Record<string, React.FC<any>> = {
  Dashboard,
  "Product Upload": ProductUpload,
  "Expectation Analysis": ExpectationAnalysis,
  "Reality Analysis": RealityAnalysis,
  Comparison,
  Reports,
};

const roleDefaultPage: Record<Role, string> = {
  Admin: "Dashboard",
  Analyst: "Dashboard",
  Viewer: "Dashboard",
};

const Index = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<Role>("Admin");
  const [activePage, setActivePage] = useState("Dashboard");
  const [analyzingNews, setAnalyzingNews] = useState<NewsItem | null>(null);

  if (!signedIn) {
    return (
      <SignIn
        onSignIn={(r) => {
          setRole(r);
          setActivePage(roleDefaultPage[r]);
          setSignedIn(true);
        }}
      />
    );
  }

  const PageComponent = pages[activePage] || Dashboard;

  let content = <PageComponent />;
  
  if (activePage === "Dashboard") {
    content = (
      <Dashboard 
        onAnalyze={(news) => { 
          setAnalyzingNews(news); 
          setActivePage("Analyze"); 
        }} 
      />
    );
  } else if (activePage === "Product Upload") {
    content = <ProductUpload onUploadComplete={() => setActivePage("Reports")} />;
  } else if (activePage === "Analyze") {
    content = analyzingNews ? (
      <AnalyzePage 
        newsItem={analyzingNews} 
        onBack={() => setActivePage("Dashboard")} 
      />
    ) : (
      <Dashboard />
    );
  }

  return (
    <ProductProvider>
      <WireframeLayout
        active={activePage === "Analyze" ? "Dashboard" : activePage}
        onNavigate={setActivePage}
        onSignOut={() => setSignedIn(false)}
      >
        {content}
      </WireframeLayout>
    </ProductProvider>
  );
};

export default Index;
