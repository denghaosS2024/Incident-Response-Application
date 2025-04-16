import PatientCreationForm from "@/components/feature/Reach911/PatientCreationForm";
import VisitLogForm from "@/components/feature/Reach911/VisitLogForm";
import { useSearchParams } from "react-router";

const PatientVisitPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username") ?? undefined;
  const visitLogId = searchParams.get("visitLogId") ?? undefined;
  const active = searchParams.get("active") ?? undefined;
  const isActive = active === "true";

  return (
    <div style={{ overflowY: "auto" }}>
      <PatientCreationForm username={username} />
      <VisitLogForm
        username={username}
        visitLogId={visitLogId}
        active={isActive}
      />
    </div>
  );
};

export default PatientVisitPage;
