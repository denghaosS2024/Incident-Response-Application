import { StepIconProps, styled } from "@mui/material";

const SquareStepIconComponent = (props: StepIconProps) => {
  const { active, icon } = props;

  const SquareStepIcon = styled("div")(() => ({
    width: 32,
    height: 32,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: "bold",
    transition: "background-color 0.3s, color 0.3s",
  }));

  return (
    <SquareStepIcon
      style={{
        backgroundColor: active ? "#1976d2" : "#e0e0e0",
        color: active ? "#fff" : "#9e9e9e",
      }}
    >
      {icon}
    </SquareStepIcon>
  );
};

export default SquareStepIconComponent;
