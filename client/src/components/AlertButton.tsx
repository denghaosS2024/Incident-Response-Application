import { Button } from '@mui/material'

interface AlertButtonProps {
  label: string
  bgColor: string
  textColor?: string
  onSubmit?: () => void
}

const AlertButton: React.FC<AlertButtonProps> = ({
  label,
  bgColor,
  textColor = '#ffffff',
  onSubmit,
}) => {
  return (
    <Button
      variant="contained"
      onClick={onSubmit}
      sx={{
        width: '100%', // Ensures buttons take up full width of container
        minWidth: '80px', // Prevents buttons from becoming too small
        minHeight: '80px',
        aspectRatio: '1 / 1', // Ensures buttons remain square
        backgroundColor: bgColor,
        color: textColor,
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': { backgroundColor: bgColor }, // Keep hover color the same
      }}
    >
      {label}
    </Button>
  )
}

export default AlertButton
