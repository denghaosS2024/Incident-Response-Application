import { ArrowBack, MoreVert as More } from '@mui/icons-material'
import {
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import React, { FunctionComponent, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

export interface IProps {
  /**
   * Whether to show the back button
   */
  showBackButton?: boolean
  /**
   * Function to be called when the back button is clicked
   */
  onBack?: () => void
  /**
   * Whether to show the menu button
   */
  showMenu?: boolean
}

const NavigationBar: FunctionComponent<IProps> = ({
  showBackButton,
  onBack,
  showMenu,
}) => {
  const [openMenu, setOpenMenu] = useState(false)
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement>()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const [URLSearchParams] = useSearchParams()
  const name = URLSearchParams.get('name')

  const onBackHandler = onBack || (() => navigate(-1))

  const pathname = location.pathname
  const title =
    pathname === '/messages'
      ? 'Messages'
      : pathname === '/messages/' + id
        ? `${name} Messages`
        : pathname === '/contacts'
          ? 'Contacts'
          : pathname === '/groups'
            ? 'Groups'
            : pathname === '/reach911'
              ? '911 Call'
                : pathname === '/map'
                  ? 'Map'
              : 'Incident Response'
                

  const openMenuHandler = (anchor: HTMLElement) => {
    setOpenMenu(true)
    setMenuAnchor(anchor)
  }

  const closeMenu = () => {
    setOpenMenu(false)
  }

  const quit = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('uid')

    navigate('/login')
  }

  return (
    <AppBar position="static">
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBackHandler}
            size="large"
          >
            <ArrowBack />
          </IconButton>
        )}
        <Typography style={{ flex: 1 }} variant="h6" color="inherit">
          {title}
        </Typography>
        {showMenu && (
          <IconButton
            color="inherit"
            edge="end"
            onClick={(e) => openMenuHandler(e.currentTarget)}
            size="large"
          >
            <More />
          </IconButton>
        )}
        {
          <Menu open={openMenu} anchorEl={menuAnchor} onClose={closeMenu}>
            <MenuItem onClick={quit}>Quit</MenuItem>
          </Menu>
        }
      </Toolbar>
    </AppBar>
  )
}

export default NavigationBar
