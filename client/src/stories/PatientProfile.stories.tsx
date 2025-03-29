// client/src/stories/PatientProfile.stories.tsx
import { Meta, StoryObj } from '@storybook/react'
import ProfileCard from '../components/ProfileCard'
import PatientProfile from '../pages/PatientProfile'

const meta: Meta<typeof PatientProfile> = {
    title: 'PatientProfile',
    component: PatientProfile,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PatientProfile>

export const ReadOnlyView: Story = {
    args: {
        patientId: 'sample-patient-id',
        patientData: {
            name: 'Smoke Test Patient',
            location: 'ER',
            priority: 'e',
            status: 'to_er',
            hospital: { name: 'Central Hospital', id: 'hospital-id' },
            nurse: { name: 'Nurse Joy', id: 'nurse-id' },
        },
    },
}

export const ProfileCardView: StoryObj<typeof ProfileCard> = {
    render: () => (
        <ProfileCard
            title="Patient Information"
            data={{
                name: 'Smoke Test Patient',
                location: 'ER',
                priority: 'e',
                status: 'to_er',
            }}
        />
    ),
}
