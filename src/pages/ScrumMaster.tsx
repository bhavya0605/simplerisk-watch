import { WireBox } from "@/components/WireframeLayout";

const ScrumMaster = () => (
  <div className="space-y-6">
    <WireBox className="text-center">
      <h1 className="text-2xl font-bold">Scrum Master Dashboard</h1>
    </WireBox>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Project Timeline (Weeks 1–8)">
        <div className="border-2 border-dashed border-muted-foreground h-20 flex items-center justify-center text-muted-foreground text-sm">
          [ Gantt Chart / Timeline ]
        </div>
      </WireBox>
      <WireBox label="Sprint Progress">
        <div className="border-2 border-dashed border-muted-foreground h-20 flex items-center justify-center text-muted-foreground text-sm">
          [ Progress Bar ]
        </div>
      </WireBox>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WireBox label="Pending Tasks">
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Integrate sentiment model v2</li>
          <li>Update risk scoring weights</li>
          <li>Review complaint dataset</li>
        </ul>
      </WireBox>
      <WireBox label="Completed Tasks">
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>NLP pipeline setup</li>
          <li>Dashboard wireframe approved</li>
          <li>Product upload module tested</li>
        </ul>
      </WireBox>
    </div>

    <WireBox label="Risk Monitoring Summary">
      <div className="border-2 border-dashed border-muted-foreground h-16 flex items-center justify-center text-muted-foreground text-sm">
        [ Risk Summary Table ]
      </div>
    </WireBox>

    <WireBox label="Team Activity Overview">
      <div className="border-2 border-dashed border-muted-foreground h-16 flex items-center justify-center text-muted-foreground text-sm">
        [ Activity Feed ]
      </div>
    </WireBox>
  </div>
);

export default ScrumMaster;
