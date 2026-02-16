import { useState } from "react";
import SignIn from "./SignIn";
import WireframeLayout from "@/components/WireframeLayout";
import Dashboard from "./Dashboard";
import ProductUpload from "./ProductUpload";
import ExpectationAnalysis from "./ExpectationAnalysis";
import RealityAnalysis from "./RealityAnalysis";
import Comparison from "./Comparison";
import Reports from "./Reports";
import ScrumMaster from "./ScrumMaster";
import Developer from "./Developer";
import Admin from "./Admin";

type Role = "Admin" | "Developer" | "Scrum Master";

const pages: Record<string, React.FC> = {
  Dashboard,
  "Product Upload": ProductUpload,
  "Expectation Analysis": ExpectationAnalysis,
  "Reality Analysis": RealityAnalysis,
  Comparison,
  Reports,
  "Scrum Master": ScrumMaster,
  Developer,
  Admin,
};

const roleDefaultPage: Record<Role, string> = {
  Admin: "Admin",
  Developer: "Developer",
  "Scrum Master": "Scrum Master",
};

const Index = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<Role>("Admin");
  const [activePage, setActivePage] = useState("Dashboard");

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
