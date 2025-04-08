import AddIcon from "@mui/icons-material/Add";
import { Box, Fab, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useNavigate } from "react-router";

const rows = [
  // { Date: '11.22.20-08:00', Location: 'ER El Camino', Link: '>' },
  // { Date: '10.20.20-09:00', Location: 'ER Sequoia', Link: '>' },
  // { Date: '09.13.20-13:00', Location: 'Road', Link: '>' }
];

const VisitLogList: React.FC<{ username?: string }> = ({
  username: propUsername,
}) => {
  console.log("VisitLogList propUsername:", propUsername);
  const navigate = useNavigate();

  const handleAddPatient = () => {
    if (propUsername) {
      navigate(`/patient-visit?username=${encodeURIComponent(propUsername)}`);
    } else {
      navigate("/patient-visit");
    }
  };

  console.log(propUsername);

  return (
    <>
      {/* List of visit logs here */}
      <Box paddingX="32px">
        <Typography variant="h6" gutterBottom>
          Visits Log:
        </Typography>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e0e0e0", marginBottom: "16px" }}
        >
          <Table size="small" sx={{ width: "100%" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    padding: "12px 16px",
                    color: "#212121",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    padding: "12px 16px",
                    color: "#212121",
                  }}
                >
                  Location
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    padding: "12px 16px",
                    color: "#212121",
                  }}
                  align="right"
                >
                  Link
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={row.Date}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fafafa",
                    "&:last-child td": { borderBottom: 0 },
                    "&:hover": { backgroundColor: "#ececec" },
                  }}
                >
                  <TableCell sx={{ padding: "12px 16px", color: "#424242" }}>
                    {row.Date}
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px", color: "#424242" }}>
                    {row.Location}
                  </TableCell>
                  <TableCell
                    sx={{ padding: "12px 16px", color: "#424242" }}
                    align="right"
                  >
                    {row.Link}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Button to add a new patient visit log */}
      <Fab
        color="primary"
        aria-label="add-visit-log"
        onClick={handleAddPatient}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default VisitLogList;
