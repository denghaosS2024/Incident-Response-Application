import { Meta, StoryObj } from '@storybook/react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlProps,
} from '@mui/material'
import { useState } from 'react'

interface SelectWithFormControlProps
  extends Omit<FormControlProps, 'onChange' | 'value'> {
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
}

const SelectWithFormControl = ({
  label,
  value,
  onChange,
  error,
  helperText,
  ...props
}: SelectWithFormControlProps) => {
  return (
    <FormControl fullWidth error={error} {...props}>
      <InputLabel id={`${label}-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-label`}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        fullWidth
      >
        <MenuItem value="Citizen">Citizen</MenuItem>
        <MenuItem value="Dispatch">Dispatch</MenuItem>
        <MenuItem value="Police">Police</MenuItem>
        <MenuItem value="Fire">Fire</MenuItem>
        <MenuItem value="Nurse">Nurse</MenuItem>
        <MenuItem value="Administrator">Administrator</MenuItem>
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

const meta: Meta<typeof SelectWithFormControl> = {
  title: 'Material UI/SelectWithFormControl',
  component: SelectWithFormControl,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the Select component',
    },
    value: {
      control: 'text',
      description: 'Current value of the Select component',
    },
    error: {
      control: 'boolean',
      description: 'If true, the component will be displayed in an error state',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the Select component',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when the value is changed',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultSelect: Story = {
  args: {
    label: 'Role',
    value: 'Citizen',
    error: false,
    helperText: '',
  },
  render: (args) => {
    const [role, setRole] = useState(args.value)

    return (
      <SelectWithFormControl
        {...args}
        value={role}
        onChange={(newValue) => setRole(newValue)}
      />
    )
  },
}

export const ErrorSelect: Story = {
  args: {
    label: 'Role',
    value: '',
    error: true,
    helperText: 'Please select a role',
  },
  render: (args) => {
    const [role, setRole] = useState(args.value)

    return (
      <SelectWithFormControl
        {...args}
        value={role}
        onChange={(newValue) => setRole(newValue)}
      />
    )
  },
}
