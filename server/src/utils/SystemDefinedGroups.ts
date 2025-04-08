import ROLES from "./Roles";

export interface ISystemGroupConfig {
  name: string;
  description: string;
  participantRole: string[];
}

const SystemGroupConfigs: ISystemGroupConfig[] = [
  {
    name: "Public",
    description: "Group includes all users.",
    participantRole: [
      ROLES.CITIZEN,
      ROLES.DISPATCH,
      ROLES.POLICE,
      ROLES.FIRE,
      ROLES.NURSE,
      ROLES.ADMINISTRATOR,
    ],
  },
  {
    name: "Citizens",
    description: "Group includes all citizens.",
    participantRole: [ROLES.CITIZEN, ROLES.ADMINISTRATOR],
  },
  {
    name: "Responders",
    description: "Group includes all responders.",
    participantRole: [
      ROLES.DISPATCH,
      ROLES.POLICE,
      ROLES.FIRE,
      ROLES.ADMINISTRATOR,
    ],
  },
  {
    name: "Dispatch",
    description: "Group includes all dispatchers.",
    participantRole: [ROLES.DISPATCH, ROLES.ADMINISTRATOR],
  },
  {
    name: "Police",
    description: "Group includes all Police personnel.",
    participantRole: [ROLES.POLICE, ROLES.ADMINISTRATOR],
  },
  {
    name: "Fire",
    description: "Group includes all Fire personnel.",
    participantRole: [ROLES.FIRE, ROLES.ADMINISTRATOR],
  },
  {
    name: "Nurses",
    description: "Group includes all nurses.",
    participantRole: [ROLES.NURSE, ROLES.ADMINISTRATOR],
  },
  {
    name: "Medic",
    description: "Group includes all medical personnel.",
    participantRole: [
      ROLES.NURSE,
      ROLES.POLICE,
      ROLES.FIRE,
      ROLES.NURSE,
      ROLES.ADMINISTRATOR,
    ],
  },
];

export default SystemGroupConfigs;
