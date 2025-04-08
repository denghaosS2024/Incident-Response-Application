import { TextField } from "@mui/material";

interface MedicalInfoFieldProps {
  medicalInfo: {
    condition: string;
    drugs: string;
    allergies: string;
  };
  onMedicalInfoChange: (field: string, value: string) => void;
  isReadOnly?: boolean;
}

export default function MedicalInfoField({
  medicalInfo,
  onMedicalInfoChange,
  isReadOnly = false,
}: MedicalInfoFieldProps) {
  return (
    <>
      <h1>Medical Information</h1>
      <MedicalTextBox
        label="Condition"
        value={medicalInfo.condition}
        onChange={onMedicalInfoChange}
        disabled={isReadOnly}
      />
      <MedicalTextBox
        label="Drugs"
        value={medicalInfo.drugs}
        onChange={onMedicalInfoChange}
        disabled={isReadOnly}
      />
      <MedicalTextBox
        label="Allergies"
        value={medicalInfo.allergies}
        onChange={onMedicalInfoChange}
        disabled={isReadOnly}
      />
    </>
  );
}

interface MedicalTextBoxProps {
  label: string;
  value: string;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const MedicalTextBox = ({
  label,
  value,
  onChange,
  disabled = false,
}: MedicalTextBoxProps) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      margin="normal"
      value={value}
      onChange={(e) => onChange(label.toLowerCase(), e.target.value)}
      disabled={disabled}
    />
  );
};
