import { Unstable_NumberInput as BaseNumberInput } from "@mui/base/Unstable_NumberInput";
import { styled } from "@mui/system";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Button, Container, TextField } from "@mui/material";
import React from "react";

const DefaultTruckAddItem: React.FC = () => {
  return (
    <div>
      <Container
        sx={{
          padding: "40px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          flexDirection: "column",
        }}
      >
        <Box width="100%" maxWidth="400px" my={2} paddingBottom={"30px"}>
          <TextField variant="outlined" label="Icon" fullWidth />
        </Box>
        <Box width="100%" maxWidth="400px" my={2} paddingBottom={"30px"}>
          <TextField variant="outlined" label="Item Name" fullWidth />
        </Box>
        <Box width="100%" maxWidth="500px" my={2} paddingBottom={"30px"}>
          <BaseNumberInput
            min={0}
            aria-label="Item quantity"
            placeholder="Quantity"
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
        </Box>
        <Box width="100%" maxWidth="400px" my={2}>
          <TextField variant="outlined" label="Description" fullWidth />
        </Box>
        <Container
          sx={{ display: "flex", alignItems: "center", padding: "20px 115px" }}
        >
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2, mx: 1, width: "80px" }}
          >
            Remove
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2, mx: 1, width: "80px" }}
          >
            Add
          </Button>
        </Container>
      </Container>
    </div>
  );
};

const StyledInputRoot = styled("div")(
  ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 400;
    color: grey;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
  `,
);

const StyledInput = styled("input")(
  ({ theme }) => `
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
  `,
);

const StyledButton = styled("button")(
  ({ theme }) => `
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
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 120ms;
  
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
  `,
);
export default DefaultTruckAddItem;
