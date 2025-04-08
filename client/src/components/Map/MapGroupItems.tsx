import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IChannel from "../../models/Channel";

export default function MapGroupItems({
  groups,
  activeGroup,
  onItemClick,
}: {
  groups: IChannel[];
  activeGroup: Record<string, boolean>;
  onItemClick: (groupId: string) => void;
}) {
  if (groups === null || groups === undefined || groups.length === 0)
    return null;

  return (
    <>
      {groups.map((group) => (
        <ListItemButton
          dense
          key={group._id}
          onClick={() => onItemClick(group._id)}
          sx={{
            backgroundColor: activeGroup[group._id] ? "#F0F5FB" : "transparent",
            fontSize: "0.875rem",
          }}
        >
          <ListItemText primary={group.name} sx={{ fontSize: "0.875rem" }} />
        </ListItemButton>
      ))}
    </>
  );
}
