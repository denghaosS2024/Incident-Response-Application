import { Button, Box, TextField } from '@mui/material'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export interface IFormData {
  username: string
  password: string
}

export interface IProps {
  /**
   * Login function that will be called when the form is submitted
   */
  login: (data: IFormData) => void
}

const LoginForm: React.FC<IProps> = (props: IProps) => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [usernameError, setUsernameError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')

  const onSubmit = () => {
    clearError()

    let hasError = false

    if (!username) {
      setUsernameError('Username can not be empty')
      hasError = true
    }

    if (!password) {
      return setPasswordError('Password can not be empty')
      hasError = true
    }

    if (!hasError) {
      props.login({
        username,
        password,
      })
    }
  }

  const clearError = () => {
    setUsernameError('')
    setPasswordError('')
  }

  return (
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
          onChange={(e) => setUsername(e.target.value)}
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
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          fullWidth
        >
          Login
        </Button>
      </Box>
      <Box width="100%" maxWidth="500px" my={2}>
        <Button fullWidth>
          <Link to="/register">Register</Link>
        </Button>
      </Box>
    </Box>
  )
}

export default LoginForm
