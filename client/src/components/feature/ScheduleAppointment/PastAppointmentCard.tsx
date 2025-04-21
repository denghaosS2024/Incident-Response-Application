import { ROLES } from "@/utils/Roles";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router";

interface PastAppointmentCardProps {
  appointmentId: string;
  index: number;
  issueName: string;
  closedDate: Date;
}

const PastAppointmentCard: React.FC<PastAppointmentCardProps> = ({
  appointmentId,
  index,
  issueName,
  closedDate,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (localStorage.getItem("role") === ROLES.NURSE) {
      // TODO: Direct to nurse's past appointment info page
      // navigate(`/nurse-appointment-info?appointmentId=${encodeURIComponent(appointmentId)}`);
    } else if (localStorage.getItem("role") === ROLES.CITIZEN) {
      // TODO: Direct to citizen's past appointment info page
      // navigate(`/appointment/${appointmentId}`);
    }
  };
  return (
    <Box
      key={index}
      sx={{
        marginBottom: 2,
        padding: 2,
        border: "1px solid #ccc",
        borderRadius: "8px",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
      onClick={handleCardClick}
    >
      <Typography>{issueName}</Typography>
      <Typography>
        {closedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Typography>
    </Box>
  );
};

export default PastAppointmentCard;
