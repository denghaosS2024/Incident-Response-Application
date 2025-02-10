import { Home, Message, PermContactCalendar } from '@mui/icons-material'
import { StyledEngineProvider } from '@mui/material/styles'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import { AppDispatch } from './app/store'
import NavigationBar from './components/NavigationBar'
import TabBar from './components/TabBar'
import ChatRoomPage from './pages/ChatRoomPage'
import Contacts from './pages/Contacts'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import Messages from './pages/Messages'
import RegisterPage from './pages/RegisterPage'
import SocketClient from './utils/Socket'
import { addMessage } from './features/messageSlice'
import IMessage from '@/models/Message'
import { loadContacts } from './features/contactSlice'

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
  const tabLinks = [
    { prefix: '/', key: 'home', icon: <Home />, to: '/' },
    { prefix: '/messages', key: 'msg', icon: <Message />, to: '/messages' },
    {
      prefix: '/contacts',
      key: 'contact',
      icon: <PermContactCalendar />,
      to: '/contacts',
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
