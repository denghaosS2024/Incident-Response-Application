import {
  Box,
  Button,
  Paper,
  TextField
} from "@mui/material";

type InputField = {
    label: string,
    name: string,
    value?: string | number,
    type: string;
    disabled?: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean,
    helperText?: string
}

// Always the same settings for numeric fields -- feel free to change
const numericInputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    inputMode: "numeric",
    pattern: "[0-9]*",
    min: 1,
};

interface ResourceOrRequestFormProps {
    inputFields: InputField[]
    submitButtonText: string,
    handleCancel:() => void,
    handleSubmit: () => void
}
  
const ResourceOrRequestForm: React.FC<ResourceOrRequestFormProps> = ({
    inputFields, 
    handleSubmit,
    handleCancel,
    submitButtonText
}: ResourceOrRequestFormProps) => {
    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
          {inputFields.map((inputField: InputField) => (
          <TextField
            key={inputField.name}
            label={inputField.label}
            type={inputField.type}
            fullWidth
            margin="normal"
            disabled={inputField.disabled}
            value={inputField.value}
            onChange={inputField.onChange}
            InputProps={
                inputField.type === "number"
                    ? { inputProps: numericInputProps }
                    : undefined
            }  
            error={inputField.error}    
            helperText={inputField.helperText}   
            onKeyDown={(e) => {
              if (inputField.type==="number" && ["e", "E", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}  
            />
          ))}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {submitButtonText}
            </Button>
          </Box>
        </Paper>
      );
    
}

export default ResourceOrRequestForm;
