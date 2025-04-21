import React from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
} from "@mui/material";

export interface DepartmentRequest {
  name: string;
  request: number;
  department: string;
}

interface DepartmentFundingTableProps {
  departmentRequests: DepartmentRequest[];
  onChatClick?: (chiefName: string, department: string) => void;
}

const DepartmentFundingTable: React.FC<DepartmentFundingTableProps> = ({
  departmentRequests,
  onChatClick,
}) => {
  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#e3f2fd" }}>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Request</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Chat</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {departmentRequests.map((request, index) => (
            <TableRow
              key={index}
              sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" } }}
            >
              <TableCell>{request.name}</TableCell>
              <TableCell>${request.request.toLocaleString()}</TableCell>
              <TableCell>{request.department}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor:
                      request.department === "Fire" ? "#ffcdd2" : "#bbdefb",
                    color: "black",
                    "&:hover": {
                      bgcolor:
                        request.department === "Fire" ? "#ef9a9a" : "#90caf9",
                    },
                  }}
                  onClick={() =>
                    onChatClick && onChatClick(request.name, request.department)
                  }
                >
                  Chat
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {departmentRequests.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No funding requests available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DepartmentFundingTable;
