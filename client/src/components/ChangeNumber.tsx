import { Unstable_NumberInput as BaseNumberInput } from "@mui/base/Unstable_NumberInput";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { styled } from "@mui/system";
import React from "react";

export interface BaseNumberInputWrapperProps {
  value: number;
  onChange: (
    event: React.FocusEvent<HTMLInputElement> | React.PointerEvent | React.KeyboardEvent,
    val: number | undefined
  ) => void;
  min?: number;
  placeholder?: string;
  ariaLabel?: string;
}

const BaseNumberInputWrapper: React.FC<BaseNumberInputWrapperProps> = ({
  value,
  onChange,
  min = 0,
  placeholder = "Quantity",
  ariaLabel = "Item quantity",
}) => {
  return (
    <BaseNumberInput
      min={min}
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      slots={{
        root: StyledInputRoot,
        input: StyledInput,
        incrementButton: StyledButton,
        decrementButton: StyledButton,
      }}
      slotProps={{
        incrementButton: {
          children: <AddIcon fontSize="small" />,
          className: "increment",
        },
        decrementButton: {
          children: <RemoveIcon fontSize="small" />,
        },
      }}
    />
  );
};

export default BaseNumberInputWrapper;


const StyledInputRoot = styled("div")`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  color: grey;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;

const StyledInput = styled("input")`
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.375;
  color: black;
  background: white;
  border: 1px solid grey;
  border-radius: 8px;
  margin: 0 8px;
  padding: 10px 12px;
  outline: 0;
  min-width: 0;
  width: 10rem;
  text-align: center;

  &:hover {
    border-color: #1976d2;
  }

  &:focus {
    border-color: #1976d2;
    box-shadow: 0 0 0 1px #1976d2;
  }

  &:focus-visible {
    outline: 0;
  }
`;

const StyledButton = styled("button")`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 999px;
  border-color: grey;
  background: white;
  color: black;
  width: 32px;
  height: 32px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    cursor: pointer;
    background: #1976d2;
    border-color: #1976d2;
    color: grey;
  }

  &:focus-visible {
    outline: 0;
  }

  &.increment {
    order: 1;
  }
`;
