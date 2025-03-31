import {
    Button,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    SelectChangeEvent,
    TextField,
} from '@mui/material'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import IIncident from '../../../models/Incident'
import { loadContacts } from '../../../redux/contactSlice'
import { updateIncident } from '../../../redux/incidentSlice'
import { AppDispatch, RootState } from '../../../redux/store'
import request from '../../../utils/request'
import { MedicalQuestions } from '../../../utils/types'
import Loading from '../../common/Loading'
import PatientHelper from './PatientHelper'
import PatientVisitLog from './PatientVisitLog'
const PatientForm: React.FC<{ username?: string }> = ({
    username: propUsername,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const incident: IIncident = useSelector(
        (state: RootState) => state.incidentState.incident,
    )
    const navigate = useNavigate()
    const medicalQuestions = (incident.questions as MedicalQuestions) ?? {}
    const [sex, setSex] = useState(medicalQuestions.sex ?? '')
    const [age, setAge] = useState(medicalQuestions.age ?? 0)
    const [name, setName] = useState('')
    const [dob, setDob] = useState('')
    // const age = medicalQuestions.age ?? 0
    // const name = ''

    // TODO: Find out what the type actually is
    // IIncident does not have a patientId field
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const patientId = ((incident as any).patientId ?? '') as string
    const [usernameError, setUserNameError] = useState<string>('')
    const [patientUserId, setPatientUserId] = useState<string | null>(null)
    const [isCreatingNewAccount, setIsCreatingNewAccount] =
        useState<boolean>(false)
    const [patientUsername, setPatientUsername] = useState<string | null>(
        propUsername ?? null,
    )

    const handleProfileClick = async () => {
        if (patientUsername) {
            try {
                console.log(
                    `Sending request to: /api/users/findByUsername?username=${patientUsername}`,
                )
                const response = await request(
                    `/api/users/findByUsername?username=${patientUsername}`,
                    {
                        method: 'GET',
                    },
                )
                console.log('Response received:', response)

                if (response && response.userId) {
                    const newPatientUserId = response.userId
                    if (typeof newPatientUserId === 'string') {
                        setPatientUserId(newPatientUserId)

                        console.log('Navigating to profile:', newPatientUserId)
                        navigate(`/profile/${newPatientUserId}`)
                    } else {
                        console.error('Invalid userId format')
                    }
                } else {
                    console.error('User not found')
                    alert('User not found in the system.')
                }
            } catch (error) {
                console.error('Failed to fetch user ID from username:', error)
                alert(
                    'Failed to retrieve user information. Please try again later.',
                )
            }
        } else {
            alert('No valid username provided.')
        }
    }

    useEffect(() => {
        PatientHelper.getPatientIdByUsername(patientUsername ?? '')
            .then((patientId) => {
                setPatientUserId(patientId ?? '')
            })
            .catch((error) => {
                console.error('Failed to fetch patient ID:', error)
            })
    }, [patientUsername])

    // Loads contacts upon page loading
    useEffect(() => {
        console.log('Loaded contacts')
        dispatch(loadContacts())
    }, [dispatch])

    const { contacts, loading } = useSelector(
        (state: RootState) => state.contactState,
    )

    // When any input changes, add the changes to the incident slice
    const onChange = (
        field: string,
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<unknown>,
        onValueUpdate?: ((value: unknown) => void) | undefined,
    ) => {
        const { type, value, checked } = e.target as HTMLInputElement
        const newValue: string | boolean = type === 'checkbox' ? checked : value

        if (onValueUpdate) {
            onValueUpdate(newValue)
        }

        const newIncident = {
            ...incident,
            questions: {
                ...(incident.questions ?? {}),
                [field]: newValue,
            } as MedicalQuestions,
        } as IIncident

        dispatch(updateIncident(newIncident))

        // Validate only the changed field
        validateField(field, newValue)
    }

    // Validates field to set certain error messages
    const validateField = (field: string, value: string | boolean) => {
        if (field === 'username') {
            setUserNameError(
                !value || value === 'Select One' ? 'Select a username' : '',
            )
        }
    }

    const createNewPatientAccount = () => {
        setIsCreatingNewAccount(true)
        request('/api/users/createTemp', { method: 'POST' })
            .then((data) => {
                if (data.userId && data.username) {
                    setPatientUserId(data.userId)
                    setPatientUsername(data.username)
                    setName(data.username)

                    alert(
                        `A new user account has been created for the Patient. \nTemporary Username: ${data.username}, Password: 1234`,
                    )
                } else {
                    alert(
                        'Failed to retrieve new userId or username from server.',
                    )
                }
            })
            .catch((error) => {
                console.error('Error creating new patient account:', error)
                alert(
                    'Failed to create a new patient account. Please try again later.',
                )
            })
            .finally(() => {
                setIsCreatingNewAccount(false)
            })
    }

    if (loading) return <Loading />
    else {
        return (
            <div className="flex flex-col items-center justify-center p-10 mt-5">
                <p className="text-4xl font-bold">Add New Patient</p>

                <div className="w-full py-10">
                    <FormControl className="w-full flex flex-col justify-center gap-5">
                        {/* Text Field for name */}
                        <TextField
                            label="Name"
                            placeholder="Patient's Name"
                            value={name}
                            onChange={(e) =>
                                onChange('name', e, (val) =>
                                    setName(val as string),
                                )
                            }
                        />

                        {/* Text Field for date of birth */}
                        <TextField
                            label="Date of Birth"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dob}
                            onChange={(e) =>
                                onChange('dob', e, (val) =>
                                    setDob(val as string),
                                )
                            }
                        />

                        {/* Radio Group for gender selection */}
                        <RadioGroup
                            row
                            aria-labelledby="sex-label"
                            name="sex-radio-buttons-group"
                            value={sex}
                            className="flex flex-row gap-5 w-full justify-center"
                            onChange={(e) =>
                                onChange('sex', e, (val) =>
                                    setSex(val as string),
                                )
                            }
                        >
                            <h5 className="text-md font-bold items-center align-center">
                                Sex:{' '}
                            </h5>

                            {['Male', 'Female', 'Other'].map((sex) => (
                                <FormControlLabel
                                    key={sex}
                                    value={sex}
                                    control={<Radio />}
                                    label={sex}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </div>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleProfileClick}
                >
                    Profile
                </Button>

                <div className="w-full mt-10">
                    <PatientVisitLog patientId={patientId} />
                </div>
            </div>
            // <>
            //     <Box
            //         display="flex"
            //         flexDirection="column"
            //         alignItems="center"
            //         paddingX="32px"
            //     >
            //         <Box
            //             sx={{
            //                 display: 'flex',
            //                 maxWidth: '500px',
            //                 width: '100%',
            //                 alignItems: 'start',
            //                 color: 'rgba(0, 0, 0, 0.6)',
            //             }}
            //         >
            //             <Typography>Patient Username:</Typography>
            //         </Box>

            //         {propUsername && propUsername !== 'unknown' ? (
            //             <Box width="100%" maxWidth="500px" my={2}>
            //                 <TextField
            //                     variant="outlined"
            //                     label="Username"
            //                     value={propUsername}
            //                     fullWidth
            //                     InputProps={{
            //                         readOnly: true,
            //                     }}
            //                 />
            //             </Box>
            //         ) : (
            //             <>
            //                 <Box width="100%" maxWidth="500px" my={2}>
            //                     <Typography
            //                         variant="subtitle1"
            //                         color="textSecondary"
            //                     >
            //                         Username: Unknown
            //                     </Typography>
            //                 </Box>
            //                 <Box display="flex" justifyContent="center" mt={2}>
            //                     <button
            //                         style={{
            //                             padding: '10px 20px',
            //                             backgroundColor: '#28a745',
            //                             color: '#fff',
            //                             border: 'none',
            //                             borderRadius: '4px',
            //                             cursor: 'pointer',
            //                             fontSize: '16px',
            //                         }}
            //                         onClick={createNewPatientAccount}
            //                         disabled={isCreatingNewAccount}
            //                     >
            //                         {isCreatingNewAccount
            //                             ? 'Creating Account...'
            //                             : 'Create New Account'}
            //                     </button>
            //                 </Box>
            //             </>
            //         )}

            //         {/**Asks the user for a name */}

            //         <Box
            //             sx={{
            //                 display: 'flex',
            //                 maxWidth: '500px',
            //                 width: '100%',
            //                 alignItems: 'start',
            //                 color: 'rgba(0, 0, 0, 0.6)',
            //             }}
            //         >
            //             <Typography>Name:</Typography>
            //         </Box>

            //         <Box width="100%" maxWidth="500px" my={2}>
            //             <TextField
            //                 variant="outlined"
            //                 label="Name"
            //                 value={name || ''}
            //                 onChange={(e) =>
            //                     onChange('name', e, (val) => setName(val as string))
            //                 }
            //                 fullWidth
            //                 error={!!usernameError}
            //                 helperText={usernameError}
            //             />
            //         </Box>

            //         <Box
            //             sx={{
            //                 display: 'flex',
            //                 maxWidth: '500px',
            //                 width: '100%',
            //                 alignItems: 'start',
            //                 color: 'rgba(0, 0, 0, 0.6)',
            //             }}
            //         >
            //             <Typography>Date of Birth:</Typography>
            //         </Box>

            //         {/**Asks the user their date of birth */}
            //         <Box width="100%" maxWidth="500px" my={2}>
            //             <TextField
            //                 variant="outlined"
            //                 // label="Date of Birth"
            //                 type="date"
            //                 fullWidth
            //                 value={age} // Replace with a state variable for date of birth if needed
            //                 InputLabelProps={{
            //                     shrink: true, // Ensures the label stays above the input
            //                 }}
            //                 onChange={(e) =>
            //                     onChange('dateOfBirth', e, (val) =>
            //                         setAge(val as number),
            //                     )
            //                 } // Update the field name accordingly
            //             />
            //         </Box>

            //         {/**Asks the user their sex */}
            //         <Box width="100%" maxWidth="500px" my={2}>
            //             <FormControl>
            //                 <FormLabel id="sex-label">Sex:</FormLabel>
            //                 <RadioGroup
            //                     row
            //                     aria-labelledby="sex-label"
            //                     name="sex-radio-buttons-group"
            //                     value={sex}
            //                     onChange={(e) =>
            //                         onChange('sex', e, (val) =>
            //                             setSex(val as string),
            //                         )
            //                     }
            //                 >
            //                     <FormControlLabel
            //                         value="female"
            //                         control={<Radio />}
            //                         label="Female"
            //                     />
            //                     <FormControlLabel
            //                         value="male"
            //                         control={<Radio />}
            //                         label="Male"
            //                     />
            //                     <FormControlLabel
            //                         value="other"
            //                         control={<Radio />}
            //                         label="Other"
            //                     />
            //                 </RadioGroup>
            //             </FormControl>
            //         </Box>
            //     </Box>

            //     <Box display="flex" justifyContent="center" mt={4}>
            //         <button
            //             style={{
            //                 padding: '10px 20px',
            //                 backgroundColor: '#1976d2',
            //                 color: '#fff',
            //                 border: 'none',
            //                 borderRadius: '4px',
            //                 cursor: 'pointer',
            //                 fontSize: '16px',
            //             }}
            //             onClick={handleProfileClick}
            //         >
            //             Profile
            //         </button>
            //     </Box>
            //     <hr
            //         style={{
            //             margin: '20px 0',
            //             border: '1px solid #000',
            //         }}
            //     />
            //     <Box
            //         width="100%"
            //         maxWidth="800px"
            //         my={4}
            //         display="flex"
            //         flexDirection="column"
            //         alignItems="left"
            //         paddingX="32px"
            //     >
            //         <Typography variant="h6" gutterBottom>
            //             Visit Log
            //         </Typography>
            //         <Box
            //             sx={{
            //                 overflowX: 'auto',
            //             }}
            //         >
            //             <table
            //                 style={{
            //                     width: '100%',
            //                     borderCollapse: 'collapse',
            //                     textAlign: 'left',
            //                     border: '1px solid #ddd',
            //                 }}
            //             >
            //                 <thead>
            //                     <tr>
            //                         <th
            //                             style={{
            //                                 border: '1px solid #ddd',
            //                                 padding: '8px',
            //                             }}
            //                         >
            //                             Date
            //                         </th>
            //                         <th
            //                             style={{
            //                                 border: '1px solid #ddd',
            //                                 padding: '8px',
            //                             }}
            //                         >
            //                             Location
            //                         </th>
            //                         <th
            //                             style={{
            //                                 border: '1px solid #ddd',
            //                                 padding: '8px',
            //                             }}
            //                         >
            //                             Link
            //                         </th>
            //                     </tr>
            //                 </thead>
            //                 <tbody>
            //                     {incident.visits?.map((visit, index) => (
            //                         <tr key={index}>
            //                             <td
            //                                 style={{
            //                                     border: '1px solid #ddd',
            //                                     padding: '8px',
            //                                 }}
            //                             >
            //                                 {visit.date}
            //                             </td>
            //                             <td
            //                                 style={{
            //                                     border: '1px solid #ddd',
            //                                     padding: '8px',
            //                                 }}
            //                             >
            //                                 {visit.location}
            //                             </td>
            //                             <td
            //                                 style={{
            //                                     border: '1px solid #ddd',
            //                                     padding: '8px',
            //                                 }}
            //                             >
            //                                 <a
            //                                     href={visit.link}
            //                                     target="_blank"
            //                                     rel="noopener noreferrer"
            //                                     style={{
            //                                         color: '#1976d2',
            //                                         textDecoration: 'none',
            //                                     }}
            //                                 >
            //                                     View
            //                                 </a>
            //                             </td>
            //                         </tr>
            //                     ))}
            //                 </tbody>
            //             </table>
            //             <div
            //                 style={{
            //                     display: 'flex',
            //                     justifyContent: 'flex-end',
            //                     marginTop: '10px',
            //                 }}
            //             >
            //                 <AddIcon
            //                     onClick={() => {
            //                         if (propUsername) {
            //                             navigate(
            //                                 `/patient-visit?username=${encodeURIComponent(propUsername)}`,
            //                             )
            //                         } else {
            //                             navigate('/patient-visit')
            //                         }
            //                     }}
            //                     style={{ cursor: 'pointer' }}
            //                 />
            //             </div>
            //         </Box>
            //     </Box>
            // </>
        )
    }
}

export default PatientForm
