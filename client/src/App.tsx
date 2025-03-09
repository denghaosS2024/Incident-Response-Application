// Material-UI Components
import { StyledEngineProvider } from '@mui/material/styles';
import { Home, Message, PermContactCalendar, AccessAlarm, LocationOn, FmdBadRounded } from '@mui/icons-material';
import Groups2Icon from '@mui/icons-material/Groups2';
import { LocalPolice as PoliceIcon, LocalFireDepartment as FirefighterIcon, LocalHospital as NurseIcon, Report } from '@mui/icons-material';
import { Box, Modal, Typography, keyframes } from '@mui/material'
// React and Redux
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './utils/types';
import { AppDispatch } from './app/store';

// React Router
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Components
import NavigationBar from './components/NavigationBar';
import TabBar, { Link } from './components/TabBar';

// Pages
import ChatRoomPage from './pages/ChatRoomPage';
import Contacts from './pages/Contacts';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Messages from './pages/Messages';
import Organization from './pages/Organization'
import RegisterPage from './pages/RegisterPage';
import GroupsPage from './pages/GroupsPage';
import Reach911Page from './pages/Reach911Page';
import MapPage from './pages/MapPage';
import IncidentsPage from './pages/IncidentsPage';
import GroupInformationPage from './pages/GroupInformationPage';

// Utilities and Features
import SocketClient from './utils/Socket';
import { addMessage, clearAllAlerts } from './features/messageSlice';
import IMessage from '@/models/Message';
import { loadContacts } from './features/contactSlice';


const App: React.FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute showBackButton />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/reach911" element={<Reach911Page />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/organization" element={<Organization />} />
          </Route>
          <Route element={<ProtectedRoute showBackButton isSubPage />}>
            <Route path="/messages/:id" element={<ChatRoomPage />} />
            <Route path="/groups/:id" element={<GroupInformationPage />} />
          </Route>
        </Routes>
      </Router>
    </StyledEngineProvider>
  )
}

interface IProps {
  showBackButton?: boolean
  // Set this to true to hide the menu in subpages such as the chat room view.
  isSubPage?: boolean
}

const ProtectedRoute = ({ showBackButton, isSubPage }: IProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const isLoggedIn = localStorage.getItem('token') ? true : false
  const role = localStorage.getItem('role')||'Citizen';
  // Check if there are any unread messages
  const alerts = useSelector((state: RootState) => state.messageState.alerts)
  const hasUnreadMessages = Object.values(alerts).some((alert) => alert)
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [bgColor, setBgColor] = useState('black')
  const [textColor, setTextColor] = useState('white')

  const tabLinks: Array<Link> = [
    { prefix: '/', key: 'home', icon: <Home />, to: '/' },
    {
      prefix: '/messages',
      key: 'msg',
      icon: hasUnreadMessages ? (
        <Message style={{ color: 'red' }} />
      ) : (
        <Message />
      ),
      to: '/messages',
      onClick: () => {
        dispatch(clearAllAlerts())
      },
    },
    {
      prefix: '/contacts',
      key: 'contact',
      icon: <PermContactCalendar />,
      to: '/contacts',
    },
    { prefix: '/groups', key: 'groups', icon: <Groups2Icon />, to: '/groups' },
    {
      prefix: '/reach911',
      key: 'reach911',
      icon: <img src="/911-icon.png" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />,
      selectedIcon: <img src="/911-icon-selected.png" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />,
      to: '/reach911',
    },
    {
      prefix: '/map',
      key: 'map',
      icon: <LocationOn />,
      to: '/map',
    },
    {
      prefix: '/police',
      key: 'ploice',
      icon: <PoliceIcon  />,
      to: '/police',
    },
    {
      prefix: '/firefighter',
      key: 'firefighter',
      icon: <FirefighterIcon  />,
      to: '/firefighter',
    },
    {
      prefix: '/nurse',
      key: 'nurse',
      icon: <NurseIcon  />,
      to: '/nurse',
    },
  ]
  const roleTabs: Record<string, Link> = {
    Dispatch: { prefix: '/', key: '911', icon: <img src="/911-icon-selected.png" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />, to: '/' },
    Police: { prefix: '/', key: 'police', icon: <PoliceIcon />, to: '/' },
    Fire: { prefix: '/', key: 'fire', icon: <FirefighterIcon />, to: '/' },
    Nurse: { prefix: '/', key: 'nurse', icon:<NurseIcon />, to: '/' },
  };
  const homeTab = roleTabs[role] || { prefix: '/', key: 'home', icon: <Home />, to: '/' };
  const orderedTabs = [
    homeTab, 
    ...tabLinks.filter((link) => link.key !== 'home'), 
  ];

  // TODO: Does Admmin see everything? If so, we need to include admin here
  const firstResponderRoleList = ['Dispatch', 'Police', 'Fire']
  if (firstResponderRoleList.includes(role)) {
    orderedTabs.push({
      prefix: '/incidents',
      key: 'incidents',
      icon: <Report />,
      to: '/incidents',
    })
  }

  const [maydayOpen, setMaydayOpen] = useState<boolean>(false)

  const lastTap = useRef<number | null>(null)

  const handleDoubleTapDismiss = () => {
    console.log('Double clicked')
    const now = Date.now()
    if (lastTap.current && now - lastTap.current < 300) {
      setAlertOpen(prev => false);
      setMaydayOpen(prev => false);
      SocketClient.emit('acknowledge-alert', {
        senderId: localStorage.getItem('id'),
        type: alertMessage,
      })
    }
    lastTap.current = now
  }

  const useFlashAnimation = (bgColor: string) => {
    return useMemo(
      () => keyframes`
        0% { background-color: ${bgColor};}
        50% { background-color: black ;}
        100% { background-color: ${bgColor};}
      `,
      [bgColor],
    )
  }

  const flash = useFlashAnimation(bgColor)
  
  useEffect(() => {
    const handleMaydayReceived = (data: any) => {
      console.log('Mayday received:', data);
      setMaydayOpen(true)
      setBgColor('red')
      setAlertMessage('MAYDAY')
    };

    const socket = SocketClient
    socket.connect()
    socket.on('new-message', (message: IMessage) => {
      dispatch(addMessage(message))
    })
    socket.on('new-fire-alert', (message: IMessage) => {
      dispatch(addMessage(message))
      const [msg, bg, text] = message.content.split('-')
      setAlertMessage(msg)
      setBgColor(bg)
      setTextColor(text)
      setAlertOpen(true)
    })
    socket.on('new-police-alert', (message: IMessage) => {
      dispatch(addMessage(message))
      const [msg, bg, text] = message.content.split('-')
      setAlertMessage(msg)
      setBgColor(bg)
      setTextColor(text)
      setAlertOpen(true)
    })
    socket.on('send-mayday', handleMaydayReceived);
    socket.on('user-status-changed', () => {
      dispatch(loadContacts())
    })
    return () => {
      socket.off('send-mayday')
      socket.close()
    }
  }, [])

  return isLoggedIn ? (
    <>
      <NavigationBar showMenu={true} showBackButton={showBackButton} />
      <TabBar links={orderedTabs}></TabBar>
      {!alertOpen && <Outlet />}

      <Modal open={alertOpen}>
        <Box
          onClick={handleDoubleTapDismiss}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100%',
            animation: `${flash} 1s infinite`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h2"
            sx={{ color: textColor, fontWeight: 'bold', mb: 2 }}
          >
            {alertMessage}
          </Typography>
        </Box>
      </Modal>

      <Modal open={maydayOpen}>
        <Box 
          onPointerDown={handleDoubleTapDismiss}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            animation: `${flash} 1s infinite`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <Typography variant="h2" sx={{ color: 'black', fontWeight: 'bold', mb: 2 }}>
            MAYDAY
          </Typography>
        </Box>
      </Modal>
    </>
  ) : (
    <Navigate to="/login" />
  )
}

export default App
