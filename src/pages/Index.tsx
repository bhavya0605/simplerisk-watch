import { useState } from "react";
import SignIn from "./SignIn";
import WireframeLayout from "@/components/WireframeLayout";
import Dashboard from "./Dashboard";
import ProductUpload from "./ProductUpload";
import ExpectationAnalysis from "./ExpectationAnalysis";
import RealityAnalysis from "./RealityAnalysis";
import Comparison from "./Comparison";
import Reports from "./Reports";

const pages: Record<string, React.FC> = {
  Dashboard,
  "Product Upload": ProductUpload,
  "Expectation Analysis": ExpectationAnalysis,
  "Reality Analysis": RealityAnalysis,
  Comparison,
  Reports,
};

const Index = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  if (!signedIn) {
    return <SignIn onSignIn={() => setSignedIn(true)} />;
  }

  const PageComponent = pages[activePage] || Dashboard;

  return (
    <WireframeLayout
      active={activePage}
      onNavigate={setActivePage}
      onSignOut={() => setSignedIn(false)}
    >
      <PageComponent />
    </WireframeLayout>
  );
};

export default Index;
