import {
  Button,
  Box,
  MenuItem,
  Select,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
} from '@mui/material'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmationDialog from './common/ConfirmationDialog'

export interface IFormData {
  username: string
  password: string
  phoneNumber: string
  role: string
}

export interface IProps {
  /**
   * Function to call when the form is submitted
   */
  onSubmit: (data: IFormData) => void
}

const RegisterForm: React.FC<IProps> = (props: IProps) => {
  const [username, setUserName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [usernameError, setUserNameError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('')
  const [phoneNumberError, setPhoneNumberError] = useState<string>('')
  const [roleError, setRoleError] = useState<string>('')
  const [openDialog, setOpenDialog] = useState(false)

  const clearError = () => {
    setUserNameError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setRoleError('')
  }
  const onSubmitHandler = () => {
    clearError()

    let hasError = false

    if (!username) {
      setUserNameError('Username can not be empty')
      hasError = true
    }

    if (!password) {
      setPasswordError('Password can not be empty')
      hasError = true
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password can not be empty')
      hasError = true
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError('Two passwords do not match')
      hasError = true
    }

    if (!role) {
      setRoleError('Role can not be empty')
      hasError = true
    }

    if (!hasError) {
      setOpenDialog(true) // Open the confirmation dialog
    }
  }

  const handleDialogConfirm = () => {
    setOpenDialog(false)
    props.onSubmit({
      username,
      password,
      phoneNumber,
      role,
    })
  }

  const handleDialogCancel = () => {
    setOpenDialog(false)
  }
  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingX="32px"
      >
        <Box width="100%" maxWidth="500px" my={2}>
          <TextField
            variant="outlined"
            label="Username"
            fullWidth
            value={username}
            error={!!usernameError}
            helperText={usernameError}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Box>
        <Box width="100%" maxWidth="500px" my={2}>
          <TextField
            variant="outlined"
            label="Password"
            fullWidth
            value={password}
            type="password"
            error={!!passwordError}
            helperText={passwordError}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>
        <Box width="100%" maxWidth="500px" my={2}>
          <TextField
            variant="outlined"
            label="Confirm Password"
            fullWidth
            value={confirmPassword}
            type="password"
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Box>
        <Box width="100%" maxWidth="500px" my={2}>
          <TextField
            variant="outlined"
            label="Phone Number"
            fullWidth
            value={phoneNumber}
            error={!!phoneNumberError}
            helperText={phoneNumberError}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Box>
        <Box width="100%" maxWidth="500px" my={2}>
          <FormControl fullWidth error={!!roleError}>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as string)}
              fullWidth
            >
              <MenuItem value="Citizen">Citizen</MenuItem>
              <MenuItem value="Dispatch">Dispatch</MenuItem>
              <MenuItem value="Police">Police</MenuItem>
              <MenuItem value="Fire">Fire</MenuItem>
              <MenuItem value="Nurse">Nurse</MenuItem>
              <MenuItem value="Administrator">Administrator</MenuItem>
            </Select>
            <FormHelperText>{roleError}</FormHelperText>
          </FormControl>
        </Box>
        <Box width="100%" maxWidth="500px" my={2}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={(e) => {
              e.preventDefault()

              onSubmitHandler()
            }}
            fullWidth
          >
            Register
          </Button>
        </Box>
        <Box width="100%" maxWidth="500px" my={2}>
          <Button fullWidth>
            <Link to="/login">Login</Link>
          </Button>
        </Box>
      </Box>

      <ConfirmationDialog
        open={openDialog}
        title="Confirm Registration"
        description={`Are you sure you want to create a new ${role} account?`}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </>
  )
}

export default RegisterForm
