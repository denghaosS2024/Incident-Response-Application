import { StyledEngineProvider } from "@mui/material/styles";
import { useFlags } from "launchdarkly-react-client-sdk";
import { Route, BrowserRouter as Router, Routes } from "react-router";

// Pages
import HospitalResourceForm from "./components/feature/HospitalResources/HospitalResourceForm.tsx";
import ChatRoomPage from "./pages/ChatRoomPage";
import Contacts from "./pages/Contacts";
import CreatechartPage from "./pages/CreatechartPage.tsx";
import DashboardPage from "./pages/DashboardPage";
import DefaultTruckAddItem from "./pages/DefaultTruckAddItem.tsx";
import DefaultTruckInventory from "./pages/DefaultTruckInventory.tsx";
import FindHospital from "./pages/FindHospital";
import FirstResponderPatientsPage from "./pages/FirstResponderPatientsPage";
import GroupInformationPage from "./pages/GroupInformationPage";
import GroupsPage from "./pages/GroupsPage";
import HomePage from "./pages/HomePage";
import HospitalResourceDirectoryPage from "./pages/HospitalResourceDirectoryPage.tsx";
import HospitalResourceRequestsPage from "./pages/HospitalResourceRequestsPage.tsx";
import HospitalResourcesPage from "./pages/HospitalResourcesPage.tsx";
import HospitalsDirectory from "./pages/HospitalsDirectory";
import IncidentReportPage from "./pages/IncidentReportPage.tsx";
import IncidentsPage from "./pages/IncidentsPage";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import Messages from "./pages/Messages";
import MissingPersonDirectoryPage from "./pages/MissingPersonDirectoryPage";
import MissingPersonFollowUpPage from "./pages/MissingPersonFollowUpPage.tsx";
import MissingPersonIndividualReportPage from "./pages/MissingPersonIndividualReportPage";
import MissingPersonRegisterPage from "./pages/MissingPersonRegisterPage";
import NursePatientsPage from "./pages/NursePatientsPage.tsx";
import NurseShiftPage from "./pages/NurseShiftPage";
import Organization from "./pages/Organization";
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
import RoutedHome from "./routing/RoutedHome";
import "./styles/globals.css";
import "./styles/tailwind.css";
import FundingCenter from "./pages/FundingCenter.tsx";
import FundingInformation from "./pages/FundingInformation.tsx";

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
            <Route path="/" element={<HomePage />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/funding-center" element={<FundingCenter />} />
            <Route path="/funding-information/:incidentId" element={<FundingInformation />} />
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
              path="/register-hospital/resources/directory"
              element={<HospitalResourceDirectoryPage />}
            />
            <Route
              path="/register-hospital/:hospitalId/resources"
              element={<HospitalResourcesPage />}
            />
            <Route
              path="/register-hospital/:hospitalId/resources/newResource"
              element={<HospitalResourceForm />}
            />

            <Route
              path="/register-hospital/:hospitalId/resources/newResource/:resourceId"
              element={<HospitalResourceForm />}
            />

            <Route
              path="/register-hospital/:hospitalId/requests"
              element={<HospitalResourceRequestsPage />}
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
              path="missing-person/followUp/:reportId"
              element={<MissingPersonFollowUpPage />}
            />

            <Route
              path="/defaulttruckinventory"
              element={<DefaultTruckInventory />}
            />
            <Route
              path="/defaulttruckadditem"
              element={<DefaultTruckAddItem />}
            />
            <Route
              path="/truck-inventory/:truckName"
              element={<TruckInventoryPage />}
            />
            <Route path="/truck-stock" element={<TruckStockPage />} />
            <Route path="/shifts" element={<NurseShiftPage />} />
          </Route>

          <Route element={<RoutedHome showBackButton isSubPage />}>
            <Route path="/messages/:id" element={<ChatRoomPage />} />
            <Route path="/groups/:id" element={<GroupInformationPage />} />
          </Route>
        </Routes>
      </Router>
    </StyledEngineProvider>
  );
}
