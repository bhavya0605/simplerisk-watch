import { WireBox } from "@/components/WireframeLayout";

const Admin = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Admin Control Panel</h1>
    </WireBox>

    <WireBox label="Manage Users (Add / Remove / Assign Roles)">
      <div className="border-2 border-dashed border-muted-foreground h-20 flex items-center justify-center text-muted-foreground text-sm">
        [ User Management Table ]
      </div>
    </WireBox>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Role Management">
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Admin</li>
          <li>Developer</li>
          <li>Scrum Master</li>
          <li>Analyst</li>
        </ul>
      </WireBox>
      <WireBox label="Access Permissions">
        <div className="border-2 border-dashed border-muted-foreground h-20 flex items-center justify-center text-muted-foreground text-sm">
          [ Permission Matrix ]
        </div>
      </WireBox>
    </div>

    <WireBox label="System Settings">
      <div className="border-2 border-dashed border-muted-foreground h-16 flex items-center justify-center text-muted-foreground text-sm">
        [ Config Options ]
      </div>
    </WireBox>

    <WireBox label="Audit Logs">
      <div className="border-2 border-foreground p-2 text-xs text-muted-foreground font-mono space-y-1">
        <div>[LOG] User admin@demo.com updated role for user123</div>
        <div>[LOG] Product #41 flagged by system</div>
        <div>[LOG] Settings updated by admin</div>
      </div>
    </WireBox>

    <WireBox label="Product Database Management">
      <div className="border-2 border-dashed border-muted-foreground h-16 flex items-center justify-center text-muted-foreground text-sm">
        [ Product DB Table — CRUD ]
      </div>
    </WireBox>
  </div>
);

export default Admin;
