import { Box, Typography } from "@mui/material";

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
      onClick={() => (window.location.href = `/appointment/${appointmentId}`)}
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
