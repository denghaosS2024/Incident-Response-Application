import {
  Home,
  LocalFireDepartment,
  LocalHospital,
  LocalPolice,
  Message,
  PermContactCalendar,
  AccountBalance as CityDirectorIcon,
} from "@mui/icons-material";
import Groups2Icon from "@mui/icons-material/Groups2";
import { Badge } from "@mui/material";
import { Meta, StoryObj } from "@storybook/react";
import TabBar, { Link } from "../components/common/TabBar";

const roleHomeTabs: Record<string, Link> = {
  Citizen: { prefix: "/", key: "home", icon: <Home />, to: "#" },
  Dispatch: {
    prefix: "/",
    key: "dispatch",
    icon: (
      <img
        src="/911-icon-selected.png"
        alt="Dispatch Icon"
        title="Dispatch"
        style={{ width: "28px", height: "28px", borderRadius: "8px" }}
      />
    ),
    to: "#",
  },
  Police: { prefix: "/", key: "police", icon: <LocalPolice />, to: "#" },
  Fire: { prefix: "/", key: "fire", icon: <LocalFireDepartment />, to: "#" },
  Nurse: { prefix: "/", key: "nurse", icon: <LocalHospital />, to: "#" },
  "City Director": { prefix: "/", key: "city_director", icon: <CityDirectorIcon />, to: "#" },
};

const commonLinks: Link[] = [
  { prefix: "/messages", key: "msg", icon: <Message />, to: "#" },
  {
    prefix: "/contacts",
    key: "contacts",
    icon: <PermContactCalendar />,
    to: "#",
  },
  { prefix: "/groups", key: "groups", icon: <Groups2Icon />, to: "#" },
];

const meta: Meta<typeof TabBar> = {
  title: "Common/TabBar",
  component: TabBar,
  tags: ["autodocs"],
  parameters: {
    role: "Citizen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RoleBasedTabBar: Story = {
  parameters: {
    role: "Citizen",
  },
  render: (_, { parameters }) => {
    const role = parameters.role as keyof typeof roleHomeTabs;
    const homeTab = roleHomeTabs[role] || roleHomeTabs["Citizen"];

    return <TabBar links={[homeTab, ...commonLinks]} />;
  },
};

export const CitizenView = {
  ...RoleBasedTabBar,
  parameters: { role: "Citizen" },
};
export const DispatchView = {
  ...RoleBasedTabBar,
  parameters: { role: "Dispatch" },
};
export const PoliceView = {
  ...RoleBasedTabBar,
  parameters: { role: "Police" },
};
export const FireView = { ...RoleBasedTabBar, parameters: { role: "Fire" } };
export const NurseView = { ...RoleBasedTabBar, parameters: { role: "Nurse" } };
export const CityDirectorView = {
  ...RoleBasedTabBar,
  parameters: { role: "City Director" },
};

export const CitizenUnreadMessageView: Story = {
  parameters: { role: "Citizen" },
  render: (_, { parameters }) => {
    const UnreadMessageComponent = () => {
      const role = parameters.role as keyof typeof roleHomeTabs;
      const homeTab = roleHomeTabs[role] || roleHomeTabs["Citizen"];
      const unreadMessageLink: Link = {
        prefix: "/messages",
        key: "msg",
        icon: (
          <Badge badgeContent="!" color="error">
            <Message />
          </Badge>
        ),
        to: "#",
      };
      const otherLinks: Link[] = [
        {
          prefix: "/contacts",
          key: "contacts",
          icon: <PermContactCalendar />,
          to: "#",
        },
        { prefix: "/groups", key: "groups", icon: <Groups2Icon />, to: "#" },
      ];
      return <TabBar links={[homeTab, unreadMessageLink, ...otherLinks]} />;
    };
    return <UnreadMessageComponent />;
  },
};
