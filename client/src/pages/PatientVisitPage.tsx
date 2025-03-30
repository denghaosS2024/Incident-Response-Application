import PatientInforForm from "@/components/feature/Reach911/PatientInforForm";
import VisitLogForm from "@/components/feature/Reach911/VisitLogForm";

const PatientVisitPage: React.FC = () => {
    return (
        <div>
            <PatientInforForm />
            <VisitLogForm />
        </div>
    );
}

export default PatientVisitPage;