import { PermContactCalendar as Contact, LocationOn, Message } from '@mui/icons-material'
import Groups2Icon from '@mui/icons-material/Groups2'
import {
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Fragment, FunctionComponent, ReactElement } from 'react'

interface ITab {
  text: string
  link: string
  icon: ReactElement
}

const tabs: ITab[] = [
  {
    text: 'Messages',
    link: '/messages',
    icon: <Message />,
  },
  {
    text: 'Contacts',
    link: '/contacts',
    icon: <Contact />,
  },
  {
    text: 'Groups',
    link: '/groups',
    icon: <Groups2Icon />,
  },
  {
    text: 'Map',
    link: '/map',
    icon: <LocationOn />,
  },
]

const Home: FunctionComponent = () => {
  return (
    <List>
      {tabs.map(({ text, link, icon }, index) => (
        <Fragment key={link}>
          <Link color="inherit" href={link}>
            <ListItem button>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText>{text}</ListItemText>
            </ListItem>
          </Link>

          {index !== tabs.length - 1 && <Divider />}
        </Fragment>
      ))}
    </List>
  )
}

export default Home
