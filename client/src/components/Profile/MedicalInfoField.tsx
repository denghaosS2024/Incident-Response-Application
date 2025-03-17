import { TextField } from '@mui/material'

interface MedicalInfoFieldProps {
  medicalInfo: {
    condition: string
    drugs: string
    allergies: string
  }
  onMedicalInfoChange: (field: string, value: string) => void
}

export default function MedicalInfoField({
  medicalInfo,
  onMedicalInfoChange,
}: MedicalInfoFieldProps) {
  return (
    <>
      <h1>Medical Information</h1>
      <MedicalTextBox
        label="Condition"
        value={medicalInfo.condition}
        onChange={onMedicalInfoChange}
      />
      <MedicalTextBox
        label="Drugs"
        value={medicalInfo.drugs}
        onChange={onMedicalInfoChange}
      />
      <MedicalTextBox
        label="Allergies"
        value={medicalInfo.allergies}
        onChange={onMedicalInfoChange}
      />
    </>
  )
}

interface MedicalTextBoxProps {
  label: string
  value: string
  onChange: (field: string, value: string) => void
}

const MedicalTextBox = ({ label, value, onChange }: MedicalTextBoxProps) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      margin="normal"
      value={value}
      onChange={(e) => onChange(label.toLowerCase(), e.target.value)} // 确保字段名称匹配
    />
  )
}
