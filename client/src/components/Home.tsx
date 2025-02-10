import { PermContactCalendar as Contact, Message } from '@mui/icons-material'
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
