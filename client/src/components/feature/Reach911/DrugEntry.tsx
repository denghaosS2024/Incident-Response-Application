import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export interface DrugItem {
  name: string;
  dosage: string;
  route: string;
}

export interface DrugEntryHandle {
  getDrugsData: () => DrugItem[];
  setDrugsData: (items: DrugItem[]) => void;
}

interface DrugEntryProps {
  isReadOnly?: boolean;
}

const DrugEntry = forwardRef<DrugEntryHandle, DrugEntryProps>(
  ({ isReadOnly = false }, ref) => {
    const [drugs, setDrugs] = useState<DrugItem[]>([]);
    const [open, setOpen] = useState(false);
    const [currentDrug, setCurrentDrug] = useState<DrugItem>({
      name: "",
      dosage: "",
      route: "",
    });

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getDrugsData: () => [...drugs],
      setDrugsData: (items: DrugItem[]) => setDrugs(items),
    }));

    const handleClickOpen = () => {
      setOpen(true);
      setCurrentDrug({ name: "", dosage: "", route: "" });
    };

    const handleClose = () => {
      setOpen(false);
    };

    const handleAdd = () => {
      if (currentDrug.name.trim() === "") return;
      setDrugs([...drugs, currentDrug]);
      handleClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCurrentDrug((prev) => ({ ...prev, [name]: value }));
    };

    return (
      <Box>
        {/* Gray box with drug names and + button */}
        <Paper
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            position: "relative",
            minHeight: "60px",
            mb: 2,
            width: "100%",
          }}
        >
          {/* Add button in the top-right corner */}
          {!isReadOnly && (
            <IconButton
              onClick={handleClickOpen}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
              }}
              size="small"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          )}

          {/* List of drug names */}
          <Box sx={{ pt: 1 }}>
            {drugs.map((drug, index) => (
              <Paper
                key={`${drug.name}-${index}`}
                elevation={0}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  mb: 1,
                }}
              >
                <Box>
                  <Typography variant="body1">{drug.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {drug.dosage} · {drug.route}
                  </Typography>
                </Box>
              </Paper>
            ))}
            {drugs.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center">
                No medications added
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Dialog for entering a drug */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
          <DialogTitle>Drug Detail</DialogTitle>
          <DialogContent>
            <Box
              sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                autoFocus
                name="name"
                label="Medication Name"
                variant="outlined"
                fullWidth
                value={currentDrug.name}
                onChange={handleInputChange}
              />
              <TextField
                name="dosage"
                label="Dosage"
                variant="outlined"
                fullWidth
                value={currentDrug.dosage}
                onChange={handleInputChange}
              />
              <TextField
                name="route"
                label="Route"
                variant="outlined"
                fullWidth
                value={currentDrug.route}
                onChange={handleInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                color: "#4285F4",
                borderColor: "#e0e0e0",
                minWidth: "100px",
                borderRadius: 1,
                fontWeight: "normal",
              }}
            >
              CANCEL
            </Button>
            <Button
              onClick={handleAdd}
              variant="contained"
              sx={{
                bgcolor: "#4285F4",
                color: "white",
                minWidth: "100px",
                borderRadius: 1,
                fontWeight: "normal",
                "&:hover": {
                  bgcolor: "#3367d6",
                },
              }}
            >
              SUBMIT
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  },
);

export default DrugEntry;
