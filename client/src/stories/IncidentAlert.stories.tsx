import { Meta, StoryObj } from '@storybook/react'
import IncidentAlert from '../components/IncidentAlert'
import { Box } from '@mui/material'

const meta = {
  title: 'Resources/IncidentAlert',
  component: IncidentAlert,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ minHeight: '200px', padding: 2 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof IncidentAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
      isOpen: true,
      incidentId: 'I_Dena12',
      onClose: () => console.log('Closed'),
      onNav: () => alert('Navigating to incident...'),
    },
  }
