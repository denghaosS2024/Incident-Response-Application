import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { FunctionComponent, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

export type Link = {
  prefix: string
  key: string
  icon: React.JSX.Element
  // use selectedIcon to use custom icons not available in materil ui
  selectedIcon?: React.JSX.Element
  to: string
  onClick?: () => void
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
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(
    getCurrentTab(links, location.pathname),
  )

  // Effect to update the current tab value based on route changes
  useEffect(() => {
    setCurrentTabIndex(getCurrentTab(links, location.pathname))
  }, [location.pathname, links])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabIndex(newValue)
  }

  return (
    <Tabs
      value={currentTabIndex}
      onChange={handleChange}
      centered
      sx={{ minHeight: 40, display: 'flex', justifyContent: 'center' }}
    >
      {links.map((link: Link, idx: number) => {
        const isSelected = idx === currentTabIndex
        return (
          <Tab
            key={link.key}
            // When selected, try "selectedIcon" if exist. Otherwise, use "icon".
            icon={
              isSelected && link.selectedIcon != null
                ? link.selectedIcon
                : link.icon
            }
            component={Link}
            to={link.to}
            onClick={link.onClick}
            sx={{
              minWidth: 50,
              maxWidth: 60,
            }}
          />
        )
      })}
    </Tabs>
  )
}

export default TabBar
