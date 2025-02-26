import { Button } from "@mui/material";

interface AlertButtonProps {
  label: string;
  bgColor: string; 
  textColor?: string; 
}

const AlertButton: React.FC<AlertButtonProps> = ({ label, bgColor, textColor = "#ffffff"}) => {
  return (
    <Button
      variant="contained"
      sx={{
        width: 120,
        height: 120,
        backgroundColor: bgColor,
        color: textColor,
        "&:hover": { backgroundColor: bgColor }, // Keep hover color the same
      }}
    >
      {label}
    </Button>
  );
};

export default AlertButton;

