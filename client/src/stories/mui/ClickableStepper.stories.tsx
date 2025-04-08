import { Box, Typography } from "@mui/material";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import ClickableStepper, {
  StepIconStyle,
} from "../../components/ClickableStepper";

const meta: Meta<typeof ClickableStepper> = {
  title: "Material UI/Stepper",
  component: ClickableStepper,
  tags: ["autodocs"],
  argTypes: {
    numberOfSteps: {
      control: { type: "number", min: 1 },
      description: "Total number of steps in the stepper.",
    },
    activeStep: {
      control: { type: "number", min: 0 },
      description: "Currently active step.",
    },
    contents: {
      control: { type: "array", of: "jsxElement" },
      description:
        "Array of React components to be displayed. One for each step.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultStepper: Story = {
  args: {
    numberOfSteps: 4,
    activeStep: 0,
  },
  render: function DefaultStepperStory({ numberOfSteps, activeStep }) {
    const [currentStep, setCurrentStep] = useState<number>(activeStep);
    const contents: JSX.Element[] = [
      <Box key={0}>
        <Typography>React Component for Step 1</Typography>
      </Box>,
      <Box key={1}>
        <Typography>React Component for Step 2</Typography>
      </Box>,
      <Box key={2}>
        <Typography>React Component for Step 3</Typography>
      </Box>,
    ];

    return (
      <ClickableStepper
        numberOfSteps={numberOfSteps}
        activeStep={currentStep}
        setActiveStep={setCurrentStep}
        contents={contents}
      />
    );
  },
};

export const SquareStepper: Story = {
  args: {
    numberOfSteps: 4,
    activeStep: 0,
  },
  render: function DefaultStepperStory({ numberOfSteps, activeStep }) {
    const [currentStep, setCurrentStep] = useState<number>(activeStep);
    const contents: JSX.Element[] = [
      <Box key={0}>
        <Typography>React Component for Step 1</Typography>
      </Box>,
      <Box key={1}>
        <Typography>React Component for Step 2</Typography>
      </Box>,
      <Box key={2}>
        <Typography>React Component for Step 3</Typography>
      </Box>,
    ];

    return (
      <ClickableStepper
        numberOfSteps={numberOfSteps}
        activeStep={currentStep}
        setActiveStep={setCurrentStep}
        contents={contents}
        stepIconStyle={StepIconStyle.Square}
      />
    );
  },
};
