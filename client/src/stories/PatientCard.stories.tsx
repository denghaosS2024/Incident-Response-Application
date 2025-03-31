import IPatient from '@/models/Patient'
import { Meta, StoryObj } from '@storybook/react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import PatientCard from '../components/feature/FindHospital/PatientCard'

// Mock Patient Data
const mockPatient: IPatient = {
  patientId: 'patient-001',
  name: 'John Doe',
  nameLower: 'john doe',
  visitLog: [
    {
      date: '2025-03-01',
      location: 'Emergency Room',
      link: 'https://example.com/log1',
    },
  ],
  nurseId: 'nurse-123',
  hospitalId: 'hospital-001',
  priority: 'High',
  status: 'Under Observation',
  location: 'ER',
}
const meta: Meta<typeof PatientCard> = {
  title: 'FindHospital/PatientCard',
  component: PatientCard,
  tags: ['autodocs'],
  args: {
    patient: mockPatient,
    id: 'hospital-001',
    index: 0,
    isDraggingOver: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default Story
export const DefaultPatientCard: Story = {
  render: (args) => {
    return (
      <DragDropContext onDragEnd={(result) => console.log(result)}>
        <Droppable droppableId="droppable-patients">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <PatientCard {...args} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  },
}

// Patient Assigned to User
export const AssignedPatientCard: Story = {
  args: {
    patient: { ...mockPatient, nurseId: 'mock-user-id' },
  },
  render: (args) => {
    return (
      <DragDropContext onDragEnd={(result) => console.log(result)}>
        <Droppable droppableId="droppable-patients">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <PatientCard {...args} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  },
}
