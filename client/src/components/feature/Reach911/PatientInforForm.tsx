import BirthdayField from '@/components/common/BirthdayField'
import IPatient from '@/models/Patient'
import {
    addPatient,
    fetchPatients,
    setPatient,
    updatePatient,
} from '@/redux/patientSlice'
import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material'
import { Button } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router'
import IUser from '../../../models/User'
import { loadContacts } from '../../../redux/contactSlice'
import { AppDispatch, RootState } from '../../../redux/store'
import request from '../../../utils/request'
import Loading from '../../common/Loading'

const PatientInforForm: React.FC<{ username?: string; sex?: string }> = ({
    username: propUsername,
    sex: propSex,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const [searchParams, setSearchParams] = useSearchParams()
    const [currentUsername, setcurrentUsername] = useState<string>(
        propUsername || '',
    )
    const patients: IPatient[] = useSelector(
        (state: RootState) => state.patientState.patients,
    )
    const [isFetchingPatients, setIsFetchingPatients] = useState(true)
    useEffect(() => {
        dispatch(loadContacts())
        const fetchData = async () => {
            await dispatch(fetchPatients()) // Wait for fetchPatients to complete
            setIsFetchingPatients(false) // Mark fetching as complete
        }
        fetchData()
    }, [dispatch])
    const [isPatientAdded, setIsPatientAdded] = useState(false)

    let patient: IPatient =
        patients.find((p) => p.username === currentUsername) || ({} as IPatient)

    if (
        !isFetchingPatients &&
        !patient.username &&
        propUsername &&
        !isPatientAdded
    ) {
        console.log('patientUsername is empty')
        patient = {
            username: propUsername,
            name: '',
            sex: propSex || '',
            dob: '',
        }
        dispatch(addPatient(patient))
        setIsPatientAdded(true)
    }

    const navigate = useNavigate()
    const username = patient.username ?? null
    const name = patient.name ?? ''
    const dob = patient.dob ?? ''
    const userId = localStorage.getItem('uid') || ''
    const [usernameError, setUserNameError] = useState<string>('')
    const incident = useSelector(
        (state: RootState) => state.incidentState.incident,
    )
    const questionsArray = Array.isArray(incident?.questions)
        ? incident.questions
        : []
    const patientQuestion = questionsArray.find(
        (question: any) => question.username === currentUsername,
    )
    const sex = (patientQuestion?.sex ?? patient.sex) || ''

    // Loads contacts upon page loading

    const { contacts, loading } = useSelector(
        (state: RootState) => state.contactState,
    )

    // When any input changes, add the changes to the incident slice
    const onChange = async (
        field: string,
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<string>,
    ) => {
        const { type, value, checked } = e.target as HTMLInputElement
        const newValue: string | boolean = type === 'checkbox' ? checked : value

        if (field === 'username') {
            if (value === 'create-one') {
                try {
                    const response = await request('/api/users/createTemp', {
                        method: 'POST',
                    })

                    if (response && response.userId && response.username) {
                        patient = {
                            username: response.username,
                            name: '',
                            sex: propSex || '',
                            dob: '',
                        }
                        dispatch(addPatient(patient))

                        setcurrentUsername(response.username)

                        const newContact: IUser = {
                            _id: response.userId,
                            username: response.username,
                            role: 'Citizen',
                        }

                        dispatch(loadContacts())

                        alert(
                            `A new user account has been created for the Patient.\nTemporary Username: ${response.username}, Password: 1234`,
                        )
                    } else {
                        alert(
                            'Failed to create a new patient account. Please try again.',
                        )
                    }
                } catch (error) {
                    console.error('Error creating new patient account:', error)
                    alert(
                        'Failed to create a new patient account. Please try again later.',
                    )
                }
                return
            }

            patient =
                patients.find((p) => p.username === value) || ({} as IPatient)
            if (Object.keys(patient).length === 0) {
                patient = {
                    username: value,
                    name: '',
                    sex: propSex || '',
                    dob: '',
                }
                dispatch(addPatient(patient))
            }
            setcurrentUsername(value)
            console.log('Current username set to:', value)
            searchParams.set('username', value)
            navigate(`/patients/admit?${searchParams.toString()}`)
            // setSearchParams(searchParams);// Update the URL search params
        } else {
            dispatch(
                setPatient({
                    ...patient,
                    [field]: newValue,
                }),
            )
            dispatch(
                updatePatient({
                    ...patient,
                    [field]: newValue,
                }),
            )
        }

        validateField(field, newValue)
    }

    const onUpdateBirthday = (dob: Date) => {
        dispatch(
            setPatient({
                ...patient,
                dob: dob.toISOString(),
            }),
        )
        dispatch(
            updatePatient({
                ...patient,
                dob: dob.toISOString(),
            }),
        )
    }
    // Validates field to set certain error messages
    const validateField = (field: string, value: string | boolean) => {
        if (field === 'username') {
            setUserNameError(
                !value || value === 'Select One' ? 'Select a username' : '',
            )
        }
    }

    const handleProfileClick = async () => {
        if (!username) {
            alert('Username is missing.')
            return
        }

        try {
            const response = await request(
                `/api/users/findByUsername?username=${username}`,
                {
                    method: 'GET',
                },
            )

            if (response && response.userId) {
                const fetchedUserId = response.userId
                console.log('Fetched userId:', fetchedUserId)
                navigate(`/profile/${fetchedUserId}`)
            } else {
                alert(
                    'User not found. Please make sure the username is correct.',
                )
            }
        } catch (error) {
            console.error('Failed to fetch userId by username:', error)
            alert('Error fetching user information. Please try again later.')
        }
    }

    if (loading) return <Loading />

    return (
        <div className="flex flex-col items-center p-10 gap-2">
            <div className="flex flex-col w-1/3 items-center gap-2">
                <div className="flex flex-row w-full gap-2 items-center justify-center">
                    <p className="text-md my-0 text-nowrap">
                        Patient Username:
                    </p>

                    {propUsername ? (
                        <p className="text-lg font-bold my-0 w-full">
                            {propUsername}
                        </p>
                    ) : (
                        <FormControl fullWidth error={!!usernameError}>
                            <InputLabel id="username-label">
                                Select One
                            </InputLabel>
                            <Select
                                labelId="username-label"
                                label="Username"
                                value={currentUsername}
                                onChange={(e) => onChange('username', e)}
                                fullWidth
                            >
                                <MenuItem value="create-one">
                                    Create One
                                </MenuItem>

                                {contacts.map((user: IUser) => (
                                    <MenuItem
                                        key={user._id}
                                        value={user.username}
                                    >
                                        {user.username}
                                    </MenuItem>
                                ))}
                            </Select>

                            <FormHelperText>{usernameError}</FormHelperText>
                        </FormControl>
                    )}
                </div>

                {!propUsername ? <div className="w-full"></div> : null}

                {/* Name, DOB, Sex */}
                <div className="w-full flex flex-col gap-3 my-10 items-center justify-center">
                    {/* Name */}
                    <div className="w-full flex flex-row gap-5 items-center justify-center">
                        <p className="text-lg font-bold text-center py-0 my-auto">
                            Name:{' '}
                        </p>

                        <TextField
                            variant="outlined"
                            label="Name"
                            value={name || ''}
                            onChange={(e) => onChange('name', e)}
                            fullWidth
                            error={!!usernameError}
                            helperText={usernameError}
                        />
                    </div>

                    {/* DOB */}
                    <div className="flex flex-row w-full gap-5 items-center justify-center">
                        <p className="text-lg font-bold text-center py-0 my-auto">
                            DOB:{' '}
                        </p>

                        <BirthdayField
                            onChangeDob={(dob) => onUpdateBirthday(dob)}
                        />
                    </div>

                    {/* Sex */}
                    <div className="w-full flex flex-row gap-5 items-center justify-center">
                        <p className="text-lg font-bold text-center py-0 my-auto">
                            Sex:{' '}
                        </p>

                        <FormControl>
                            <RadioGroup
                                row
                                aria-labelledby="sex-label"
                                name="sex-radio-buttons-group"
                                value={sex}
                                onChange={(e) => onChange('sex', e)}
                            >
                                {['Female', 'Male', 'Other'].map((sex) => (
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
                </div>

                <Button
                    type="primary"
                    style={{
                        borderRadius: '10px',
                        backgroundColor: '#1976d2',
                    }}
                    onClick={handleProfileClick}
                >
                    <p className="text-white text-lg font-bold m-0">Profile</p>
                </Button>
            </div>

            <hr
                style={{
                    margin: '20px 0',
                    border: '1px solid #000',
                }}
            />
        </div>
    )
}

export default PatientInforForm
