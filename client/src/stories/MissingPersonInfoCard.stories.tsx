import MissingPersonCard from "@/components/feature/MissingPerson/MissingPersonInfoCard";
import IMissingPerson, { Gender, Race } from "@/models/MissingPersonReport";
import { Meta, StoryObj } from "@storybook/react";


// Mock Missing Person Data
const mockMissingPerson: IMissingPerson = {
    name: 'Adam',
    age: 21,
    weight: 160,
    height: 180,
    race: Race.White,
    eyeColor: "Green",
    gender: Gender.Male,
    dateLastSeen: new Date(),
    reportStatus: "Open",
    personStatus: "Not Found"
};

const mockMissingPersonFound: IMissingPerson = {
    name: 'Adam',
    age: 21,
    weight: 160,
    height: 180,
    race: Race.White,
    eyeColor: "Green",
    gender: Gender.Male,
    dateLastSeen: new Date(),
    reportStatus: "Closed",
    personStatus: "Not Found"
};


const mockMissingPersonWithPhoto: IMissingPerson = {
    name: 'Adam',
    age: 21,
    weight: 160,
    height: 180,
    race: Race.White,
    eyeColor: "Green",
    gender: Gender.Male,
    dateLastSeen: new Date(),
    photo: "911-icon-red.png",
    reportStatus: "Closed",
    personStatus: "Not Found"
};

const meta: Meta<typeof MissingPersonCard> = {
  title: "Missing Person/MissingPersonCard",
  component: MissingPersonCard,
  tags: ["autodocs"],
  args: {
    person: mockMissingPerson,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default Story
export const DefaultMissingPersonCard: Story = {
  render: () => {
    return (         
    <MissingPersonCard person={mockMissingPerson} />
    );
  },
};


// Missing Person Marked as Found
export const FoundMissingPersonCard: Story = {
    render: () => {
      return (         
      <MissingPersonCard person={mockMissingPersonFound} />
      );
    },
  };

// Missing Person With Uploaded Photo
export const MissingPersonCardWithPhoto: Story = {
    render: () => {
      return (         
      <MissingPersonCard person={mockMissingPersonWithPhoto} />
      );
    },
  };