import AddIcon from '@mui/icons-material/Add'
import { Fragment, FunctionComponent, ReactElement } from 'react'
import {
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'

interface ITab {
  text: string
  link: string
  icon: ReactElement
}

const tabs: ITab[] = [
  {
    text: '',
    link: '/groups',
    icon: <AddIcon />,
  },
]

const AddGroup: FunctionComponent = () => {
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

export default AddGroup
