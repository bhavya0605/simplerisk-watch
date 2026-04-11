import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Role = "Admin";

const SignIn = ({ onSignIn }: { onSignIn: (role: Role) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const API_URL = "http://127.0.0.1:8000/api";

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({ title: "Error", description: "Email and password are required.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      if (isLogin) {
        // Login expects x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Login failed");
        }

        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        toast({ title: "Success", description: "Logged in successfully." });
        onSignIn("Admin");
      } else {
        // Register expects JSON Schema
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Registration failed");
        }

        toast({ title: "Success", description: "Registration successful. You can now sign in." });
        setIsLogin(true); // switch to login mode so user can sign in
        setPassword(""); // optionally clear password
      }
    } catch (e: any) {
      toast({ title: "Authentication Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="text-xs font-bold tracking-widest uppercase text-[hsl(var(--muted-foreground))]">
            SimpleRisk
          </div>
          <div className="text-3xl font-bold gradient-text">Watch</div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            AI-Powered Financial Mis-Selling Detection
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 space-y-4 fade-in">
          <div>
            <label className="section-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@simplerisk.in"
              className="w-full mt-1.5 px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-foreground text-sm outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%,0.5)] transition-all"
            />
          </div>

          <div>
            <label className="section-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1.5 px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-foreground text-sm outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%,0.5)] transition-all"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 mt-4 rounded-lg gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : (isLogin ? "Sign In →" : "Create Account →")}
          </button>

          <p className="text-center pt-2 text-xs text-[hsl(var(--muted-foreground))]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              className="font-semibold text-[hsl(var(--primary))] cursor-pointer hover:underline"
              onClick={() => { setIsLogin(!isLogin); setPassword(""); }}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
