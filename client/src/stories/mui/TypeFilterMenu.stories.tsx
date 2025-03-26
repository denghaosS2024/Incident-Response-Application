import Settings from '@mui/icons-material/Settings'
import {
    Button,
    FormControl,
    IconButton,
    Menu,
    MenuItem,
    Select,
    Typography
} from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

const TypeFilterMenuDemo = ({ triggerType }: { triggerType: 'icon' | 'button' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedType, setSelectedType] = useState('All')

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      {triggerType === 'icon' ? (
        <IconButton onClick={handleClick}>
          <Settings />
          <Typography variant="caption" sx={{ marginLeft: 1, fontSize: 'medium' }}>
            Type
          </Typography>
        </IconButton>
      ) : (
        <Button variant="contained" onClick={handleClick}>
          Open Filter
        </Button>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem>
          <FormControl fullWidth>
            <Select
              value={selectedType}
              onChange={(event) => {
                setSelectedType(event.target.value)
                handleClose()
              }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Fire">Fire</MenuItem>
              <MenuItem value="Medical">Medical</MenuItem>
              <MenuItem value="Police">Police</MenuItem>
              <MenuItem value="SAR">SAR</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>
    </>
  )
}

const meta: Meta<typeof TypeFilterMenuDemo> = {
  title: 'Components/TypeFilterMenu',
  component: TypeFilterMenuDemo,
  argTypes: {
    triggerType: {
      control: 'radio',
      options: ['icon', 'button']
    }
  }
}

export default meta

type Story = StoryObj<typeof TypeFilterMenuDemo>

export const Default: Story = {
  args: {
    triggerType: 'icon'
  }
}

export const ButtonTrigger: Story = {
  args: {
    triggerType: 'button'
  }
}
