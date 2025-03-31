import { TextField } from '@mui/material'
import React from 'react'

interface ProfileFieldProps {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: boolean
    helperText?: string
    disabled?: boolean
}

export default function ProfileField({
    label,
    value,
    onChange,
    error = false,
    helperText = '',
    disabled = false,
}: ProfileFieldProps) {
    return (
        <TextField
            label={label}
            value={value}
            onChange={onChange}
            variant="outlined"
            fullWidth
            margin="normal"
            error={error}
            helperText={helperText}
            disabled={disabled}
        />
    )
}
