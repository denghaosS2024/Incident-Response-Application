import { StyledEngineProvider } from "@mui/material/styles";
import { useFlags } from "launchdarkly-react-client-sdk";
import { Route, BrowserRouter as Router, Routes } from "react-router";

// Pages
import HospitalResourceForm from "./components/feature/HospitalResources/HospitalResourceForm.tsx";
import AddExercisePage from "./pages/AddExercisePage.tsx";
import AppointmentSchedulerPage from "./pages/AppointmentSchedulerPage.tsx";
import ChatRoomPage from "./pages/ChatRoomPage";
import ChiefFundingHistory from "./pages/ChiefFundingHistory.tsx";
import Contacts from "./pages/Contacts";
import CreatechartPage from "./pages/CreatechartPage.tsx";
import DashboardPage from "./pages/DashboardPage";
import DefaultTruckInventory from "./pages/DefaultTruckInventory.tsx";
import DirectorChatPage from "./pages/DirectorChatPage.tsx";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import FindHospital from "./pages/FindHospital";
import FirstResponderPatientsPage from "./pages/FirstResponderPatientsPage";
import FundingCenter from "./pages/FundingCenter.tsx";
import FundingInformation from "./pages/FundingInformation.tsx";
import GroupInformationPage from "./pages/GroupInformationPage";
import GroupsPage from "./pages/GroupsPage";
import HomePage from "./pages/HomePage";
import HospitalResourceDirectoryPage from "./pages/HospitalResourceDirectoryPage.tsx";
import HospitalResourceRequestCreatePage from "./pages/HospitalResourceRequestCreatePage.tsx";
import HospitalResourceRequestEditPage from "./pages/HospitalResourceRequestEditPage.tsx";
import HospitalResourceRequestsPage from "./pages/HospitalResourceRequestsPage.tsx";
import HospitalResourcesPage from "./pages/HospitalResourcesPage.tsx";
import HospitalsDirectory from "./pages/HospitalsDirectory";
import IncidentReportPage from "./pages/IncidentReportPage.tsx";
import IncidentsPage from "./pages/IncidentsPage";
import IncidentSpendHistory from "./pages/IncidentSpendHistoryPage.tsx";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import Messages from "./pages/Messages";
import MissingPersonDirectoryPage from "./pages/MissingPersonDirectoryPage.tsx";
import MissingPersonFollowUpPage from "./pages/MissingPersonFollowUpPage.tsx";
import MissingPersonIndividualReportPage from "./pages/MissingPersonIndividualReportPage.tsx";
import MissingPersonManagePage from "./pages/MissingPersonManagePage.tsx";
import MissingPersonRegisterPage from "./pages/MissingPersonRegisterPage.tsx";
import MissingPersonUpdatePage from "./pages/MissingPersonUpdatePage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import NurseAppointmentInfoPage from "./pages/NurseAppointmentInfoPage.tsx";
import NursePatientsPage from "./pages/NursePatientsPage.tsx";
import NurseShiftPage from "./pages/NurseShiftPage";
import NurseShiftSelector from "./pages/NurseShiftSelector.tsx";
import Organization from "./pages/Organization";
import PastAppointmentPage from "./pages/PastAppointmentPage.tsx";
import PatientAdmitPage from "./pages/PatientAdmitPage.tsx";
import PatientMedicalReportPage from "./pages/PatientMedicalReportPage";
import PatientsRouter from "./pages/PatientsRouter";
import PatientVisitPage from "./pages/PatientVisitPage.tsx";
import ProfilePage from "./pages/ProfilePage";
import Reach911Page from "./pages/Reach911Page";
import RegisterHospital from "./pages/RegisterHospital";
import RegisterPage from "./pages/RegisterPage";
import ResourcesPage from "./pages/ResourcesPage";
import SARIncidentPage from "./pages/SARIncidentPage";
import SARTaskPage from "./pages/SARTaskPage.tsx";
import TodoTasksPage from "./pages/SarTasks";
import DoneTasksPage from "./pages/SarTasksDone";
import StatisticsPage from "./pages/SarTasksStatistics";
import TruckInventoryPage from "./pages/TruckInventoryPage.tsx";
import TruckStockPage from "./pages/TruckStockPage.tsx";
import ViewOrganization from "./pages/ViewOrganization";
import ViewPatientVisitPage from "./pages/ViewPatientVisitPage";
import YourAppointmentPage from "./pages/YourAppointmentPage.tsx";
import RoutedHome from "./routing/RoutedHome";
import PatientPlanPage from './pages/PatientPlanPage.tsx'
import MedicationFormPage from "./pages/MedicationFormPage.tsx";
import MedicationDetailPage from "./pages/MedicationDetailPage.tsx";
import PlanViewPage from "./pages/PlanViewPage.tsx";
import ExerciseDetailPage from "./pages/ExerciseDetailPage.tsx"
import FirstAidAssistancePage from "./pages/FirstAidAssistancePage.tsx";
import AIChatPage from "./pages/AIChatPage.tsx";
import AISupportPage from "./pages/AISupportPage.tsx";
import "./styles/globals.css";
import "./styles/tailwind.css";

export default function App() {
  //Feature toggling: show the hospitals directory page only when the flag is enabled
  const { ["hospitalsDirectory"]: hospitalsDirectory } = useFlags();

  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<RoutedHome showBackButton />}>
            <Route
              path="/first-aid-assistance"
              element={<FirstAidAssistancePage />}
            />

            <Route path="/ai-chat" element={<AIChatPage />} />

            <Route path="/ai-support/:sessionId" element={<AISupportPage />} />
            <Route path="/ai-support" element={<AISupportPage />} />

            <Route path="/" element={<HomePage />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/funding-center" element={<FundingCenter />} />
            <Route
              path="/directorchatroom/:city/:role"
              element={<DirectorChatPage />}
            />
            <Route
              path="/funding-information/:incidentId"
              element={<FundingInformation />}
            />
            <Route
              path="/spending-history/:incidentId"
              element={<IncidentSpendHistory />}
            />
            <Route
              path="/chief-funding-history/:incidentId"
              element={<ChiefFundingHistory />}
            />
            {/* The path /messages/:id allows for passing channelId as a query parameter.
            This allow us to navigate to /messages but automatically into a specific channel chat.
            Please look into the implementation in Messages.tsx */}
            <Route path="/messages/:id" element={<Messages />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/reach911" element={<Reach911Page />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/sar-incident" element={<SARIncidentPage />} />
            <Route path="/sar-task/:incidentId" element={<SARTaskPage />} />

            <Route path="/patients" element={<PatientsRouter />} />
            <Route
              path="/patients/first-responder"
              element={<FirstResponderPatientsPage />}
            />
            <Route path="/patients/nurse" element={<NursePatientsPage />} />
            <Route path="/patients/plan" element={<PatientPlanPage />} />
            <Route path="/patients/plan/add-medication" element={<MedicationFormPage />} />
            <Route path="/patients/plan/medication/:index" element={<MedicationDetailPage />} />
            <Route path="/patients/plan/view" element={<PlanViewPage />} />
            <Route path="/exercise/:id" element={<ExerciseDetailPage />} />
            <Route path="/patients/admit" element={<PatientAdmitPage />} />
            <Route path="/patient-visit" element={<PatientVisitPage />} />
            <Route
              path="/patients/report"
              element={<PatientMedicalReportPage />}
            />
            <Route
              path="/patients/visit/view"
              element={<ViewPatientVisitPage />}
            />
            <Route path="/incidents/report" element={<IncidentReportPage />} />
            <Route path="/organization" element={<Organization />} />
            <Route path="/organization/view" element={<ViewOrganization />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
            <Route path="/exercise-library/:id" element={<AddExercisePage />} />

            <Route path="/register-hospital" element={<RegisterHospital />} />
            <Route
              path="/register-hospital/:hospitalId"
              element={<RegisterHospital />}
            />
            <Route path="/resources" element={<ResourcesPage />} />
            {hospitalsDirectory && (
              <Route path="/hospitals" element={<HospitalsDirectory />} />
            )}
            <Route path="/find-hospital" element={<FindHospital />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-chart" element={<CreatechartPage />} />
            <Route path="/sartasks/:incidentId" element={<TodoTasksPage />} />
            <Route
              path="/sartasksdone/:incidentId"
              element={<DoneTasksPage />}
            />
            <Route
              path="/sartasksstatistics/:incidentId"
              element={<StatisticsPage />}
            />
            <Route
              path="/hospital-resource/directory"
              element={<HospitalResourceDirectoryPage />}
            />
            <Route
              path="/hospital/:hospitalId/resources"
              element={<HospitalResourcesPage />}
            />
            <Route
              path="/hospital/:hospitalId/resource/add"
              element={<HospitalResourceForm />}
            />

            <Route
              path="/hospital/:hospitalId/resource/:resourceId/update"
              element={<HospitalResourceForm />}
            />

            <Route
              path="/hospital/:hospitalId/resource-request/directory"
              element={<HospitalResourceRequestsPage />}
            />
            <Route
              path="/hospital-resource-request/:hospitalId/:requestId"
              element={<HospitalResourceRequestEditPage />}
            />
            <Route
              path="/hospital-resource-request/:senderHospitalId/:hospitalResourceId/add"
              element={<HospitalResourceRequestCreatePage />}
            />

            <Route
              path="/missing-person/directory"
              element={<MissingPersonDirectoryPage />}
            />
            <Route
              path="/missing-person/report/:reportId"
              element={<MissingPersonIndividualReportPage />}
            />
            <Route
              path="/missing-person/register"
              element={<MissingPersonRegisterPage />}
            />

            <Route
              path="/missing-person/followUp/:reportId"
              element={<MissingPersonFollowUpPage />}
            />
            <Route
              path="missing-person/manage/:reportId"
              element={<MissingPersonManagePage />}
            />

            <Route
              path="/missing-person/update/:reportId"
              element={<MissingPersonUpdatePage />}
            />

            <Route
              path="/defaulttruckinventory"
              element={<DefaultTruckInventory />}
            />
            <Route
              path="/truck-inventory/:truckName"
              element={<TruckInventoryPage />}
            />
            <Route path="/truck-stock" element={<TruckStockPage />} />
            <Route path="/shifts" element={<NurseShiftPage />} />
            <Route path="/shifts/mine" element={<NurseShiftSelector />} />
            <Route path="/past-appointment" element={<PastAppointmentPage />} />
            <Route path="/your-appointment" element={<YourAppointmentPage />} />
            <Route
              path="/appointment-scheduler"
              element={<AppointmentSchedulerPage />}
            />
            <Route
              path="/nurse-appointment-info"
              element={<NurseAppointmentInfoPage />}
            />
          </Route>

          <Route element={<RoutedHome showBackButton isSubPage />}>
            <Route path="/messages/:id" element={<ChatRoomPage />} />
            <Route path="/groups/:id" element={<GroupInformationPage />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </StyledEngineProvider>
  );
}
