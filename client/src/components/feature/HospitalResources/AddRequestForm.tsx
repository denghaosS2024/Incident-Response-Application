import { Alert, Snackbar } from "@mui/material";
import React, { useState } from "react";
import ResourceOrRequestForm from "./ResourceOrRequestForm";

interface AddRequestFormProps {
  resourceName: string;
  inStock: number;
  handleSubmit: (data: {
    resourceName: string;
    requestedQuantity: number;
  }) => Promise<boolean | string>;
  handleCancel: () => void;
}

const AddRequestForm: React.FC<AddRequestFormProps> = ({
  resourceName,
  inStock,
  handleSubmit,
  handleCancel,
}) => {
  const [requestedQuantity, setRequestedQuantity] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const onSubmit = async () => {
    if (requestedQuantity > inStock) {
      setSnackbarMessage("Requested quantity cannot exceed in-stock quantity!");
      setSnackbarSeverity("error");
      return;
    }

    const result = await handleSubmit({ resourceName, requestedQuantity });

    if (result === true) {
      setSnackbarMessage("Request submitted successfully!");
      setSnackbarSeverity("success");
    } else {
      setSnackbarMessage(result as string);
      setSnackbarSeverity("error");
    }
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
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddRequestForm;
