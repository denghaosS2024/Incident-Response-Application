import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import NavigationBar from "../components/NavigationBar";

const roleTitles: Record<string, string> = {
  Citizen: "IR Citizen",
  Dispatch: "IR Dispatch",
  Police: "IR Police",
  Fire: "IR Fire",
  Nurse: "IR Nurse",
  "City Director": "IR City Director",
  "Police Chief": "IR Police Chief",
  "Fire Chief": "IR Fire Chief",
};

const meta = {
  title: "Common/NavigationBar",
  component: NavigationBar,
  parameters: {
    showBackButton: false,
    onBack: action("back"),
    showMenu: false,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const generateRoleStory = (role: string): Story => ({
  args: {
    showBackButton: true,
    showMenu: true,
  },
  parameters: {
    role,
  },
  decorators: [
    (Story) => {
      localStorage.setItem("role", role);
      return <Story />;
    },
  ],
  name: roleTitles[role] || "IR Citizen",
});

export const Default: Story = {};

export const WithBackButton: Story = { args: { showBackButton: true } };
export const WithMenuButton: Story = { args: { showMenu: true } };

export const CitizenView = generateRoleStory("Citizen");
export const DispatchView = generateRoleStory("Dispatch");
export const PoliceView = generateRoleStory("Police");
export const FireView = generateRoleStory("Fire");
export const NurseView = generateRoleStory("Nurse");
export const CityDirectorView = generateRoleStory("City Director");
export const PoliceChiefView = generateRoleStory("Police Chief");
export const FireChiefView = generateRoleStory("Fire Chief");
