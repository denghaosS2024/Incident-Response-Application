import { Home, Message, PermContactCalendar, AccessAlarm } from '@mui/icons-material'
import { StyledEngineProvider } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
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

const App: React.FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/reach911" element={<Reach911Page />} />
          </Route>
          <Route element={<ProtectedRoute showBackButton />}>
            <Route path="/messages/:id" element={<ChatRoomPage />} />
          </Route>
        </Routes>
      </Router>
    </StyledEngineProvider>
  )
}

interface IProps {
  showBackButton?: boolean
}

const ProtectedRoute = ({ showBackButton }: IProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const isLoggedIn = localStorage.getItem('token') ? true : false
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
      icon: <img src="/911-icon.png" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />,
      selectedIcon: <img src="/911-icon-selected.png" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />,
      to: '/reach911',
    },
  ]

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
      {!showBackButton && <TabBar links={tabLinks} />}
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  )
}

export default App
