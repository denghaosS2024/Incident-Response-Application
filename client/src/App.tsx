import { Home, Message, PermContactCalendar, LocationOn } from '@mui/icons-material'
import { StyledEngineProvider } from '@mui/material/styles'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './utils/types'
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import { AppDispatch } from './app/store'
import NavigationBar from './components/NavigationBar'
import TabBar, { Link } from './components/TabBar'
import ChatRoomPage from './pages/ChatRoomPage'
import Contacts from './pages/Contacts'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import Messages from './pages/Messages'
import RegisterPage from './pages/RegisterPage'
import SocketClient from './utils/Socket'
import { addMessage, clearAllAlerts } from './features/messageSlice'
import IMessage from '@/models/Message'
import { loadContacts } from './features/contactSlice'
import Groups2Icon from '@mui/icons-material/Groups2'
import GroupsPage from './pages/GroupsPage'
import Reach911Page from './pages/Reach911Page'
import { LocalPolice as PoliceIcon,LocalFireDepartment as FirefighterIcon,LocalHospital as NurseIcon,Report,LocalPhone } from '@mui/icons-material';
import MapPage from './pages/MapPage'

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
          </Route>
          <Route element={<ProtectedRoute showBackButton isSubPage />}>
            <Route path="/messages/:id" element={<ChatRoomPage />} />
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
      icon: <LocalPhone/>,
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
    Dispatch: { prefix: '/', key: '911', icon:  <LocalPhone/>, to: '/' },
    Police: { prefix: '/', key: 'police', icon: <PoliceIcon />, to: '/' },
    Fire: { prefix: '/', key: 'fire', icon: <FirefighterIcon />, to: '/' },
    Nurse: { prefix: '/', key: 'nurse', icon:<NurseIcon />, to: '/' },
  };
  const homeTab = roleTabs[role] || { prefix: '/', key: 'home', icon: <Home />, to: '/' };
  const orderedTabs = [
    homeTab, 
    ...tabLinks.filter((link) => link.key !== 'home'), 
  ];
  
  
  useEffect(() => {
    const socket = SocketClient
    socket.connect()
    socket.on('new-message', (message: IMessage) => {
      dispatch(addMessage(message))
    })
    socket.on('user-status-changed', () => {
      dispatch(loadContacts())
    })
    return () => {
      socket.close()
    }
  }, [])

  return isLoggedIn ? (
    <>
      <NavigationBar showMenu={true} showBackButton={showBackButton} />
      {!showBackButton && <TabBar links={orderedTabs} />}
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  )
}

export default App
