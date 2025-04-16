import {
  AccountBalance as CityDirectorIcon,
  Whatshot as FireChiefIcon,
  LocalFireDepartment as FireIcon,
  LocalHospital as NurseIcon,
  Security as PoliceChiefIcon,
  LocalPolice as PoliceIcon,
} from "@mui/icons-material";

export const getRoleIcon = (role: string): JSX.Element | null => {
  switch (role) {
    case "Dispatch":
      return (
        <img
          src="/911-icon-red.png"
          alt="Red 911 Icon"
          style={{ width: "28px", height: "28px", borderRadius: "8px" }}
        />
      );
    case "Police":
      return <PoliceIcon sx={{ color: "red" }} />;
    case "Fire":
      return <FireIcon sx={{ color: "red" }} />;
    case "Nurse":
      return <NurseIcon sx={{ color: "red" }} />;
    case "City Director":
      return <CityDirectorIcon sx={{ color: "red" }} />;
    case "Police Chief":
      return <PoliceChiefIcon sx={{ color: "red" }} />;
    case "Fire Chief":
      return <FireChiefIcon sx={{ color: "red" }} />;
    default:
      return null;
  }
};

export default getRoleIcon;
