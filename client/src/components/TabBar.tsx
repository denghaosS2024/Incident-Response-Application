import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { FunctionComponent, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export type Link = {
  prefix: string
  key: string
  icon: JSX.Element
  to: string
}

const getCurrentTab = (links: Link[], currentPath: string): number => {
  // First, check for an exact match with the root path '/'
  if (currentPath === '/') {
    return links.findIndex((link) => link.prefix === '/')
  }

  // Otherwise, find a matching path that is not the root
  const currentTab = links.findIndex(
    (link) => currentPath.includes(link.prefix) && link.prefix !== '/',
  )

  return currentTab === -1 ? 0 : currentTab
}

export interface TabBarProps {
  /**
   * Array of links to display in the tab bar
   */
  links: Link[]
}

const TabBar: FunctionComponent<TabBarProps> = ({ links }) => {
  const location = useLocation() // Hook to get the current path
  const [value, setValue] = useState(getCurrentTab(links, location.pathname))

  // Effect to update the current tab value based on route changes
  useEffect(() => {
    setValue(getCurrentTab(links, location.pathname))
  }, [location.pathname, links])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Tabs value={value} onChange={handleChange}>
      {links.map((link) => (
        <Tab key={link.key} icon={link.icon} component={Link} to={link.to} />
      ))}
    </Tabs>
  )
}

export default TabBar
