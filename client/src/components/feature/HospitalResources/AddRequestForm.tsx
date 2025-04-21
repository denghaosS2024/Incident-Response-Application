import { Alert, Snackbar } from "@mui/material";
import React, { useState } from "react";
import ResourceOrRequestForm from "./ResourceOrRequestForm";

interface AddRequestFormProps {
  resourceName: string;
  inStock: number;
  handleSubmit: (data: {
    resourceName: string;
    requestedQuantity: number;
  }) => void;
  handleCancel: () => void;
}

const AddRequestForm: React.FC<AddRequestFormProps> = ({
  resourceName,
  inStock,
  handleSubmit,
  handleCancel,
}) => {
  const [requestedQuantity, setRequestedQuantity] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const onSubmit = () => {
    if (requestedQuantity > inStock) {
      setShowWarning(true);
      return;
    }
    handleSubmit({ resourceName, requestedQuantity });
  };

  const inputFields = [
    {
      label: "Resource Name",
      name: "resourceName",
      value: resourceName,
      type: "text",
      disabled: true,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onChange: () => {},
    },
    {
      label: "In Stock",
      name: "inStock",
      value: inStock,
      type: "number",
      disabled: true,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onChange: () => {},
    },
    {
      label: "Requested Quantity",
      name: "requestedQuantity",
      value: requestedQuantity,
      type: "number",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setRequestedQuantity(Number(e.target.value)),
    },
  ];

  return (
    <>
      <ResourceOrRequestForm
        inputFields={inputFields}
        handleSubmit={onSubmit}
        handleCancel={handleCancel}
        submitButtonText="Submit Request"
      />
      <Snackbar
        open={showWarning}
        autoHideDuration={3000}
        onClose={() => setShowWarning(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowWarning(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          Requested quantity cannot exceed in-stock quantity!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddRequestForm;
