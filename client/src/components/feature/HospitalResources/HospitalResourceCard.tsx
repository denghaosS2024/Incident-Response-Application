import GenericItemizeContainer, {
  Column,
} from "@/components/GenericItemizeContainer";
import HospitalResource from "@/models/HospitalResource";
import { Box, Typography } from "@mui/material";
import Button from "@mui/material/Button/Button";
import React from "react";

interface HospitalResourceCardProps {
  resourceName: string; // The name of the resource
  hospitals: HospitalResource[]; // List of hospitals under this resource
  onRequest: (hospitalId: string, hospitalResourceId: string) => void; // Callback for request action
}

interface HospitalRowProps {
  hospitalResourceId: string;
  hospitalName: string;
  hospitalId: string;
  inStockQuantity: number;
  actions: string;
}

// Map hospitals to rows for the table
function mapHospitalsToRows(
  hospitals: HospitalResourceCardProps["hospitals"],
  __onRequest: HospitalResourceCardProps["onRequest"],
): HospitalRowProps[] {
  return hospitals.map((hospital) => ({
    hospitalResourceId: hospital._id || "",
    hospitalName: hospital.hospitalId.hospitalName,
    hospitalId: hospital.hospitalId._id,
    inStockQuantity: hospital.inStockQuantity,
    actions: "Request",
  }));
}

const HospitalResourceCard: React.FC<HospitalResourceCardProps> = ({
  resourceName,
  hospitals,
  onRequest,
}) => {
  const rows = mapHospitalsToRows(hospitals, onRequest);

  const columns: Column<HospitalRowProps>[] = [
    {
      key: "hospitalName",
      label: "Hospital Name",
      align: "left",
    },
    {
      key: "inStockQuantity",
      label: "Quantity",
      align: "center",
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (row) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            console.log(row);
            if (row.hospitalResourceId === "") {
              console.error("Hospital resource ID is empty");
              return;
            }
            onRequest(row.hospitalId, row.hospitalResourceId);
          }}
        >
          {row.actions}
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ marginBottom: 4 }}>
      {/* Resource Name */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {resourceName}
      </Typography>

      {/* Hospital List */}
      <GenericItemizeContainer
        items={rows}
        getKey={(item) => item.hospitalId} // Use hospitalName as the unique key
        columns={columns}
        emptyMessage="No hospitals available for this resource"
      />
    </Box>
  );
};

export default HospitalResourceCard;
