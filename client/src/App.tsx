import { StyledEngineProvider } from '@mui/material/styles'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ChatRoomPage from './pages/ChatRoomPage'
import Contacts from './pages/Contacts'
import DashboardPage from './pages/DashboardPage'
import FindHospital from './pages/FindHospital'
import GroupInformationPage from './pages/GroupInformationPage'
import GroupsPage from './pages/GroupsPage'
import HomePage from './pages/HomePage'
import HospitalsDirectory from './pages/HospitalsDirectory'
import IncidentReportPage from './pages/IncidentReportPage.tsx'
import IncidentsPage from './pages/IncidentsPage'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'
import Messages from './pages/Messages'
import Organization from './pages/Organization'
import PatientPage from './pages/PatientPage.tsx'
import PatientProfile from './pages/PatientProfile'
import ProfilePage from './pages/ProfilePage'
import Reach911Page from './pages/Reach911Page'
import RegisterHospital from './pages/RegisterHospital'
import RegisterPage from './pages/RegisterPage'
import ResourcesPage from './pages/ResourcesPage'
import ViewOrganization from './pages/ViewOrganization'
import RoutedHome from './routing/RoutedHome'
import './styles/globals.css'
import './styles/tailwind.css'

export default function App() {
    // const dispatcher = useDispatch()

    // // This is an example to display a snackbar
    // useEffect(() => {
    //   setTimeout(() => {
    //     console.log('setting snackbar')
    //     dispatcher(
    //       setSnackbar({
    //         type: SnackbarType.INFO,
    //         message: 'Hello there!',
    //         durationMs: 1000,
    //       }),
    //     )
    //   }, 3000)
    // })

    //Feature toggling: show the hospitals directory page only when the flag is enabled
    const { ['hospitalsDirectory']: hospitalsDirectory } = useFlags()

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
                        {/* The path /messages/:id allows for passing channelId as a query parameter. 
            This allow us to navigate to /messages but automatically into a specific channel chat. 
            Please look into the implementation in Messages.tsx */}
                        <Route path="/messages/:id" element={<Messages />} />
                        <Route path="/groups" element={<GroupsPage />} />
                        <Route path="/reach911" element={<Reach911Page />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/incidents" element={<IncidentsPage />} />
                        <Route
                            path="/patient-profile/:patientId"
                            element={<PatientProfile />}
                        />
                        <Route path="/patients" element={<PatientPage />} />
                        <Route
                            path="/incidents/report"
                            element={<IncidentReportPage />}
                        />
                        <Route
                            path="/organization"
                            element={<Organization />}
                        />
                        <Route
                            path="/organization/view"
                            element={<ViewOrganization />}
                        />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route
                            path="/register-hospital"
                            element={<RegisterHospital />}
                        />
                        <Route
                            path="/register-hospital/:hospitalId"
                            element={<RegisterHospital />}
                        />
                        <Route path="/resources" element={<ResourcesPage />} />
                        {hospitalsDirectory && (
                            <Route
                                path="/hospitals"
                                element={<HospitalsDirectory />}
                            />
                        )}
                        <Route
                            path="/find-hospital"
                            element={<FindHospital />}
                        />
                        <Route path="/dashboard" element={<DashboardPage />} />
                    </Route>

                    <Route element={<RoutedHome showBackButton isSubPage />}>
                        <Route
                            path="/messages/:id"
                            element={<ChatRoomPage />}
                        />
                        <Route
                            path="/groups/:id"
                            element={<GroupInformationPage />}
                        />
                    </Route>
                </Routes>
            </Router>
        </StyledEngineProvider>
    )
}
