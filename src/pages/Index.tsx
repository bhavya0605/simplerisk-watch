import { useState } from "react";
import SignIn from "./SignIn";
import Dashboard from "./Dashboard";

const Index = () => {
  const [signedIn, setSignedIn] = useState(false);

  if (!signedIn) {
    return <SignIn onSignIn={() => setSignedIn(true)} />;
  }

  return <Dashboard onSignOut={() => setSignedIn(false)} />;
};

export default Index;
