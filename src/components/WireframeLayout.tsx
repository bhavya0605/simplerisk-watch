import { ReactNode } from "react";

const sidebarItems = [
  { name: "Dashboard", icon: "📊" },
  { name: "Product Upload", icon: "📄" },
  { name: "Expectation Analysis", icon: "🔍" },
  { name: "Reality Analysis", icon: "📈" },
  { name: "Comparison", icon: "⚖️" },
  { name: "Reports", icon: "📋" },
  { name: "Admin", icon: "⚙️" },
];

const WireframeLayout = ({
  active,
  onNavigate,
  onSignOut,
  children,
}: {
  active: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
  children: ReactNode;
}) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-[hsl(var(--sidebar-background))] p-3 flex flex-col gap-1 shrink-0">
        <div className="px-3 py-4 mb-2">
          <div className="text-xs font-bold tracking-widest uppercase text-[hsl(var(--muted-foreground))]">
            SimpleRisk
          </div>
          <div className="text-lg font-bold gradient-text mt-0.5">
            Watch
          </div>
        </div>

        <div className="section-label px-3 mb-1">Navigation</div>

        {sidebarItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.name)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-all duration-200 ${
              active === item.name
                ? "bg-[hsl(217,91%,60%,0.15)] text-[hsl(217,91%,70%)] shadow-sm"
                : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-foreground"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-foreground w-full text-left transition-all"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6 overflow-auto">{children}</main>
    </div>
  );
};

export const GlassCard = ({
  label,
  children,
  className = "",
  accent,
  style,
}: {
  label?: string;
  children?: ReactNode;
  className?: string;
  accent?: "blue" | "purple" | "green" | "red" | "amber";
  style?: React.CSSProperties;
}) => (
  <div className={`glass-card p-5 ${accent ? `metric-card ${accent}` : ""} ${className}`} style={style}>
    {label && (
      <div className="section-label mb-3">{label}</div>
    )}
    {children}
  </div>
);

// Keep WireBox as alias for backward compat
export const WireBox = GlassCard;

export default WireframeLayout;
