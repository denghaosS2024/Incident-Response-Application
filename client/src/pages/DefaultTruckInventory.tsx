import AddIcon from "@mui/icons-material/Add";
import { Fab, Link, Typography } from "@mui/material";
import React from "react";

const DefaultTruckInventory: React.FC = () => {
  return (
    <div>
      <Typography>Hello</Typography>
      <Link
        href={"/defaulttruckadditem"}
        underline="none"
        sx={{ display: "inline-block" }}
      >
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#1976d2", // primary blue color
            "&:hover": {
              backgroundColor: "#1565c0", // darker blue on hover
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Link>
    </div>
  );
};
export default DefaultTruckInventory;
