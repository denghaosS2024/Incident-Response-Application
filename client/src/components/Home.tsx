import { PermContactCalendar as Contact, LocationOn, Message } from '@mui/icons-material'
import Groups2Icon from '@mui/icons-material/Groups2'
import {
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Grid
} from '@mui/material'
import { Fragment, FunctionComponent, ReactElement } from 'react'
import { LocationOn as LocationIcon, LocalPolice as PoliceIcon, LocalFireDepartment as FirefighterIcon, PriorityHigh as ExclamationIcon, Hotel as BedIcon } from '@mui/icons-material';

interface ITab {
  text: string
  link: string
  icon?: ReactElement
}

const roleTabs: Record<string, ITab[]> = {
  Citizen: [
    { text: 'Messages', link: '/messages', icon: <Message /> },
    { text: 'Contacts', link: '/contacts', icon: <Contact /> },
    { text: 'Groups', link: '/groups', icon: <Groups2Icon /> },
    { text: 'Maps', link: '/maps', icon: <LocationIcon /> },
    { text: '911', link: '/reach911', icon: <img src="/911-icon.png" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />, }
  ],
  Dispatch: [
    { text: 'Messages', link: '/messages', icon: <Message /> },
    { text: 'Contacts', link: '/contacts', icon: <Contact /> },
    { text: 'Groups', link: '/groups', icon: <Groups2Icon /> },
    { text: 'Maps', link: '/maps', icon: <LocationIcon /> },
    { text: 'Incidents', link: '/incidents', icon: <ExclamationIcon /> },
  ],
  Police: [
    { text: 'Messages', link: '/messages', icon: <Message /> },
    { text: 'Contacts', link: '/contacts', icon: <Contact /> },
    { text: 'Groups', link: '/groups', icon: <Groups2Icon /> },
    { text: 'Maps', link: '/maps', icon: <LocationIcon /> },
    { text: 'Incidents', link: '/incidents', icon: <ExclamationIcon /> },
    // please add route here
    { text: 'Resource Allocation', link: '/' },
    { text: 'Patients', link: '/', icon: <BedIcon /> },
    { text: 'Find Hospital', link: '/' }
  ],
  Fire: [
    { text: 'Messages', link: '/messages', icon: <Message /> },
    { text: 'Contacts', link: '/contacts', icon: <Contact /> },
    { text: 'Groups', link: '/groups', icon: <Groups2Icon /> },
    { text: 'Maps', link: '/maps', icon: <LocationIcon /> },
    { text: 'Incidents', link: '/incidents', icon: <ExclamationIcon /> },
    // please add route here
    { text: 'Resource Allocation', link: '/' },
    { text: 'Patients', link: '/', icon: <BedIcon /> },
    { text: 'Find Hospital', link: '/' }
  ],
  Nurse: [
    { text: 'Messages', link: '/messages', icon: <Message /> },
    { text: 'Contacts', link: '/contacts', icon: <Contact /> },
    { text: 'Groups', link: '/groups', icon: <Groups2Icon /> },
    { text: 'Maps', link: '/maps', icon: <LocationIcon /> },
    // please add route here
    { text: 'Patients', link: '/nurse', icon: <BedIcon /> },
  ]

};

const Home: FunctionComponent = () => {
  const role = localStorage.getItem('role') || 'Citizen';
  const tabs = roleTabs[role] || roleTabs['Citizen'];
  return (
    <List sx={{ width: '100%', maxWidth: 320, mx: 'auto', padding: 0 }}>
      {tabs.map(({ text, link, icon }, index) => (
        <Fragment key={link}>
          <Link color="inherit" href={link} style={{textDecoration:'none'}}>
          <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:'space-between',
                padding: '10px 10px',
                border: '1.5px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                marginBottom: '8px',
                width:'90%',
                marginTop:'5px',
                '&:hover': { backgroundColor: '#f0f0f0' },
              }}
            >
              <ListItemText sx={{ flex: 1, textAlign: 'center' }} primary={text} />
              {icon && <Box sx={{ ml: 'auto', pr: 1 }}>{icon}</Box>}
            </Box>
          </Link>

        </Fragment>
      ))}
    </List>

  )
}

export default Home
