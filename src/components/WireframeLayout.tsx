import { useState, ReactNode } from "react";

const sidebarItems = [
  "Dashboard",
  "Product Upload",
  "Expectation Analysis",
  "Reality Analysis",
  "Comparison",
  "Reports",
  "Scrum Master",
  "Developer",
  "Admin",
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
      <aside className="w-48 border-r-2 border-foreground p-2 flex flex-col gap-1 shrink-0">
        <div className="border-2 border-foreground p-2 mb-2 text-center font-bold text-sm">
          Menu
        </div>
        {sidebarItems.map((item) => (
          <button
            key={item}
            onClick={() => onNavigate(item)}
            className={`border-2 border-foreground p-2 text-left text-sm w-full ${
              active === item
                ? "bg-foreground text-primary-foreground"
                : "bg-background text-foreground"
            }`}
          >
            {item}
          </button>
        ))}
        <button
          onClick={onSignOut}
          className="border-2 border-foreground p-2 text-left text-sm mt-auto text-muted-foreground"
        >
          Sign Out
        </button>
      </aside>
      <main className="flex-1 p-6 space-y-6 overflow-auto">{children}</main>
    </div>
  );
};

export const WireBox = ({
  label,
  children,
  className = "",
}: {
  label?: string;
  children?: ReactNode;
  className?: string;
}) => (
  <div className={`border-2 border-foreground p-4 ${className}`}>
    {label && <div className="font-bold text-foreground mb-2">{label}</div>}
    {children}
  </div>
);

export default WireframeLayout;
