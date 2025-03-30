import { Meta, StoryObj } from '@storybook/react'
import HospitalCard from '../components/FindHospital/HospitalCard'
import IHospital from '@/models/Hospital'
import IPatient from '@/models/Patient'
import { DragDropContext } from 'react-beautiful-dnd'

const mockPatients: IPatient[] = [
  {
    patientId: 'patient-001',
    name: 'John Doe',
    nameLower: 'john doe',
    visitLog: [
      {
        date: '2025-03-01',
        location: 'Emergency Room',
        link: 'https://example.com/log1',
      },
      {
        date: '2025-03-15',
        location: 'Outpatient Clinic',
        link: 'https://example.com/log2',
      },
    ],
    nurseId: 'nurse-123',
    hospitalId: 'hospital-001',
    priority: 'High',
    status: 'Under Observation',
    location: 'ER',
  },
]

// Mock data for testing
const mockHospital: IHospital = {
  hospitalId: '1',
  hospitalName: 'Central Hospital',
  distance: 500,
  totalNumberERBeds: 50,
  totalNumberOfPatients: 20,
  hospitalAddress: '234 Willow Dr',
  hospitalDescription: '',
  nurses: [],
  patients: [],
}

const meta: Meta<typeof HospitalCard> = {
  title: 'FindHospital/HospitalCard',
  component: HospitalCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultHospitalCard: Story = {
  args: {
    hospital: mockHospital,
    id: 'hospital-001',
    index: 0,
  },
  render: (args) => {
    return (
      <DragDropContext onDragEnd={(result) => console.log(result)}>
        <HospitalCard {...args} />
      </DragDropContext>
    )
  },
}

export const HospitalCardWithPatients: Story = {
  args: {
    hospital: {
      ...mockHospital,
      totalNumberOfPatients: mockPatients.length,
    },
    id: 'hospital-001',
    index: 0,
    patients: mockPatients,
  },
  render: (args) => (
    <DragDropContext onDragEnd={(result) => console.log(result)}>
      <HospitalCard {...args} />
    </DragDropContext>
  ),
}

export const HospitalCardNoPatients: Story = {
  args: {
    hospital: {
      ...mockHospital,
      totalNumberOfPatients: 0,
    },
    id: 'hospital-001',
    index: 0,
  },
  render: (args) => (
    <DragDropContext onDragEnd={(result) => console.log(result)}>
      <HospitalCard {...args} />
    </DragDropContext>
  ),
}
