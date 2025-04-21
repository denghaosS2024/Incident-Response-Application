import { Unstable_NumberInput as BaseNumberInput } from "@mui/base/Unstable_NumberInput";
import { styled } from "@mui/system";

import { Hardware } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import FlagIcon from "@mui/icons-material/Flag";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useState } from "react";
import { IInventoryItem } from "../models/Inventory";

export interface IProps {
  item?: IInventoryItem;
  onSubmit: (data: IInventoryItem) => void;
  onCancel: () => void;
  onDelete?: (item: IInventoryItem) => void;
}

const DefaultTruckAddItem: React.FC<IProps> = (props: IProps) => {
  const { item } = props;
  const [itemName, setName] = useState<string>(item?.name || "");
  const [itemIcon, setIcon] = useState<string>(item?.icon || "");
  const [itemQuantity, setQuantity] = useState<number>(item?.quantity || 0);
  const [itemDescription, setDescription] = useState<string>(
    item?.description || "",
  );

  const [itemNameError, setItemNameError] = useState<string>("");
  const [itemIconError, setItemIconError] = useState<string>("");

  const clearError = () => {
    setItemNameError("");
    setItemIconError("");
  };

  const onSubmitHandler = async () => {
    clearError();

    let hasError = false;

    if (!itemName) {
      setItemNameError("Item name cannot be empty");
      hasError = true;
    }

    if (!itemIcon) {
      setItemIconError("Icon cannot be empty");
      hasError = true;
    }

    if (!hasError) {
      const payload = {
        name: itemName,
        icon: itemIcon,
        quantity: itemQuantity,
        description: itemDescription,
      };
      console.log("Sending payload:", payload);
      props.onSubmit(payload); // this will call the handleSubmitItem function in DefaultTruckInventory
    }
  };

  return (
    <div>
      <Container
        sx={{
          padding: "15px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          flexDirection: "column",
        }}
      >
        <Box width="100%" maxWidth="400px" my={2} paddingBottom={"30px"}>
          <TextField
            variant="outlined"
            label="Item Name"
            fullWidth
            value={itemName || ""} // Ensure value is a string
            error={!!itemNameError}
            helperText={itemNameError}
            onChange={(e) => setName(e.target.value)}
          />
        </Box>
        <Box width="60%" maxWidth="400px" my={2} paddingBottom={"30px"}>
          <FormControl sx={{ width: "100%" }} error={!!itemIconError}>
            <InputLabel id="selectIcon">Icon</InputLabel>
            <Select
              labelId="icon"
              id="icon"
              label="Icon"
              value={itemIcon || ""}
              onChange={(e) => setIcon(e.target.value)}
            >
              <MenuItem value={"Hardware"} sx={{ justifyContent: "center" }}>
                <Hardware />
              </MenuItem>
              <MenuItem value={"Medical Kit"} sx={{ justifyContent: "center" }}>
                <MedicalServicesIcon />,
              </MenuItem>
              <MenuItem
                value={"Repair Tools"}
                sx={{ justifyContent: "center" }}
              >
                <HomeRepairServiceIcon />
              </MenuItem>
              <MenuItem value={"Flag"} sx={{ justifyContent: "center" }}>
                <FlagIcon />
              </MenuItem>
            </Select>
            <FormHelperText>{itemIconError}</FormHelperText>
          </FormControl>
        </Box>
        <Box width="100%" maxWidth="400px" my={2} paddingBottom={"30px"}>
          <BaseNumberInput
            min={0}
            aria-label="Item quantity"
            placeholder="Quantity"
            value={itemQuantity || 0}
            onChange={(_, value) => setQuantity(Number(value))}
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
          <TextField
            variant="outlined"
            label="Description"
            fullWidth
            value={itemDescription || ""}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
        <Box width="100%" maxWidth="200px" alignItems="center">
          <Button
            variant="outlined"
            color="primary"
            type="submit"
            sx={{ mt: 2, mx: 1, width: "80px" }}
            onClick={props.onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2, mx: 1, width: "80px" }}
            onClick={(e) => {
              e.preventDefault();

              onSubmitHandler();
            }}
          >
            Save
          </Button>
        </Box>
        <Box width="100%" maxWidth="100px" alignItems="center">
          {item && item.name != "" && (
            <Button
              variant="contained"
              color="error"
              sx={{ mt: 2, mx: 1, width: "80px" }}
              onClick={() => props.onDelete?.(item)}
            >
              Remove
            </Button>
          )}
        </Box>
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
