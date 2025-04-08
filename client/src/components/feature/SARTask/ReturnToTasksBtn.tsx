import React from "react";
import { Button, Link } from "@mui/material";

const ReturnToTasksBtn: React.FC = () => {
  return (
    <Button
      component={Link}
      href="/sar-incident?step=2"
      variant="outlined"
      color="primary"
      sx={{ mt: 2, mx: 1 }}
    >
      Tasks
    </Button>
  );
};

export default ReturnToTasksBtn;
