import { Box, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import AlertSnackbar from '../components/common/AlertSnackbar'
import RegisterForm, {
  IProps as IRegisterFormProps,
} from '../components/RegisterForm'
import request, { IRequestError } from '../utils/request'

// RegisterPage component: Handles user registration
const RegisterPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const navigator = useNavigate()

  // Function to handle form submission
  // @param form - The registration form data submitted by the user
  const onSubmit: IRegisterFormProps['onSubmit'] = async (form) => {
    try {
      await request('/api/users', {
        method: 'POST',
        body: JSON.stringify(form),
      })

      navigator('/login')
    } catch (e) {
      const error = e as IRequestError
      if (error.status >= 400 && error.status < 500) {
        setErrorMessage(`Error: ${error.message}`)
      } else {
        setErrorMessage('Server error occurred. Please try again later.')
      }
      setOpenSnackbar(true)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="16px"
      height="100%"
    >
      <Box mt={4} mb={2}>
        <Typography color="primary" align="center" variant="h3">
          Register
        </Typography>
      </Box>
      <Box width="100%" maxWidth="500px">
        <RegisterForm onSubmit={onSubmit} />
      </Box>
      <AlertSnackbar
        open={openSnackbar}
        message={errorMessage || ''}
        onClose={handleCloseSnackbar}
        severity="error"
        vertical="bottom"
        horizontal="center"
      />
    </Box>
  )
}

export default RegisterPage
