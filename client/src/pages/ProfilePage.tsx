import Autocomplete from '@mui/lab/Autocomplete'
import {
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmergencyContactField from '../components/Profile/EmergencyContactField'
import MedicalInfoField from '../components/Profile/MedicalInfoField'
import ProfileField from '../components/Profile/ProfileField'
import { IEmergencyContact } from '../models/Profile'
import Globals from '../utils/Globals'
import request from '../utils/request'

export default function ProfilePage() {
    const { userId: paramUserId } = useParams<{ userId: string }>()
    console.log('paramUserId:', paramUserId)
    const [name, setName] = useState('')
    const [dob, setDob] = useState('')
    const [sex, setSex] = useState('')
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [addressOptions, setAddressOptions] = useState<string[]>([])
    const mapboxToken = Globals.getMapboxToken()
    const patientUserId = localStorage.getItem('patientUserId') || ''
    const uid = localStorage.getItem('uid') || ''
    const isViewingOwnProfile = !paramUserId || paramUserId === uid
    const isReadOnly = paramUserId !== undefined && paramUserId !== uid
    const effectiveUserId = paramUserId || uid
    console.log('Effective UserId being used:', effectiveUserId)
    const [emergencyContacts, setEmergencyContacts] = useState<
        IEmergencyContact[]
    >([])
    const [medicalInfo, setMedicalInfo] = useState({
        condition: '',
        drugs: '',
        allergies: '',
    })
    const [emailError, setEmailError] = useState('')
    const [phoneError, setPhoneError] = useState('')
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        'success' | 'error' | 'warning' | 'info'
    >('info')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[1-9]\d{1,14}$/

    const handleSnackbarClose = () => {
        setSnackbarOpen(false)
    }

    const handleSexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSex(event.target.value)
    }

    const handleMedicalInfoChange = (field: string, value: string) => {
        setMedicalInfo((prev) => ({ ...prev, [field]: value }))
    }
    const handleEmergencyContactChange = (newContacts: IEmergencyContact[]) => {
        setEmergencyContacts(newContacts)
    }
    const handleAddressInputChange = async (
        event: React.SyntheticEvent<Element, Event>,
        value: string,
    ) => {
        if (value.length < 3) return

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?` +
                    `access_token=${mapboxToken}&autocomplete=true&limit=5&country=us&proximity=-98.5795,39.8283`,
            )
            const data = await response.json()

            if (data.features) {
                const places = data.features.map(
                    (feature: any) => feature.place_name,
                )
                setAddressOptions(places)
            }
        } catch (error) {
            console.error('Error fetching address suggestions:', error)
        }
    }

    // Store addresses for future use
    const handleAddressSelect = (newAddress: string) => {
        setAddress(newAddress)
        const savedAddresses = JSON.parse(
            localStorage.getItem('savedAddresses') ?? '[]',
        )
        if (!savedAddresses.includes(newAddress)) {
            savedAddresses.push(newAddress)
            localStorage.setItem(
                'savedAddresses',
                JSON.stringify(savedAddresses),
            )
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setEmail(value)
        setEmailError(emailRegex.test(value) ? '' : 'Invalid email format')
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPhone(value)
        if (value.length < 7) {
            setPhoneError('Phone number is too short.')
            return false
        }
        if (value.length > 15) {
            setPhoneError('Phone number is too long.')
            return false
        }
        if (!value.startsWith('+')) {
            setPhoneError('Include country code (e.g., +1 for US).')
            return false
        }
        if (!phoneRegex.test(value)) {
            setPhoneError('Only numbers are allowed (no spaces or symbols).')
            return false
        }

        setPhoneError('')
        return true
    }

    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = new Date(e.target.value)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Normalize time to prevent time-zone issues

        if (selectedDate > today) {
            setSnackbarMessage('Date of Birth cannot be in the future.')
            setSnackbarSeverity('error')
            setSnackbarOpen(true)
            return
        }

        setDob(e.target.value)
    }

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!paramUserId) return

            try {
                const profileData = await request<{
                    name?: string
                    dob?: string
                    sex?: string
                    address?: string
                    phone?: string
                    email?: string
                    emergencyContacts?: IEmergencyContact[]
                    medicalInfo?: {
                        condition?: string
                        drugs?: string
                        allergies?: string
                    }
                }>(`/api/profiles/${paramUserId}`)

                console.log('Fetched profile data:', profileData)
            } catch (error) {
                console.error('Failed to fetch profile data:', error)
            }
        }

        fetchProfileData()
    }, [paramUserId])

    // 🛠 Debounced handleSave to prevent excessive API calls
    const debouncedHandleSave = useCallback(
        debounce(async () => {
            if (isReadOnly) {
                console.log(
                    '❌ Unauthorized attempt to save profile. ReadOnly mode is active.',
                )
                return
            }

            const userIdToUse = effectiveUserId

            if (!userIdToUse) {
                console.error(
                    '❌ Cannot save profile because userId is undefined.',
                )
                return
            }

            const sanitizedEmail = emailRegex.test(email) ? email : ''
            const sanitizedPhone = phoneRegex.test(phone) ? phone : ''
            const sanitizedEmergencyContacts = emergencyContacts.map(
                (contact) => ({
                    ...contact,
                    phone: phoneRegex.test(contact.phone) ? contact.phone : '',
                    email: emailRegex.test(contact.email) ? contact.email : '',
                }),
            )

            const profileData = {
                name,
                dob,
                sex,
                address,
                phone: sanitizedPhone,
                email: sanitizedEmail,
                emergencyContacts: sanitizedEmergencyContacts,
                medicalInfo,
            }

            try {
                console.log(
                    '🔵 Attempting to save profile data for userId:',
                    userIdToUse,
                )
                console.log('Profile Data:', profileData)

                await request(`/api/profiles/${userIdToUse}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileData),
                })

                console.log('✅ Profile saved successfully.')
            } catch (error) {
                console.error('❌ Failed to save profile:', error)
            }
        }, 500),
        [
            name,
            dob,
            sex,
            address,
            phone,
            email,
            emergencyContacts,
            medicalInfo,
            isReadOnly,
        ],
    )

    useEffect(() => {
        const initializeProfile = async () => {
            if (!effectiveUserId) return

            try {
                const response = await request(
                    `/api/profiles/${effectiveUserId}`,
                )

                if (response) {
                    console.log(
                        '🟢 Profile already exists. Data loaded successfully.',
                    )
                    setName(response.name || '')
                    setDob(
                        response.dob
                            ? new Date(response.dob).toISOString().split('T')[0]
                            : '',
                    )
                    setSex(response.sex || '')
                    setAddress(response.address || '')
                    setPhone(response.phone || '')
                    setEmail(response.email || '')
                    setEmergencyContacts(response.emergencyContacts || [])
                    setMedicalInfo({
                        condition: response.medicalInfo?.condition || '',
                        drugs: response.medicalInfo?.drugs || '',
                        allergies: response.medicalInfo?.allergies || '',
                    })
                } else {
                    console.log('🟡 Profile not found. No profile data loaded.')
                }
            } catch (error) {
                console.error('❌ Failed to load profile:', error)
            }
        }

        initializeProfile()
    }, [effectiveUserId])

    useEffect(() => {
        debouncedHandleSave()
    }, [name, dob, sex, address, phone, email, emergencyContacts, medicalInfo])

    useEffect(() => {
        if (paramUserId === uid) {
            localStorage.removeItem('patientUserId')
        }
    }, [paramUserId, uid])

    // 🚀 if user leave the page, save immediately
    useEffect(() => {
        return () => {
            // console.log("🚀 Leaving Profile Page. Flushing save...");
            debouncedHandleSave.flush()
            localStorage.removeItem('patientUserId')
        }
    }, [])

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
            <h1> Personal Information</h1>
            <ProfileField
                label="Name"
                value={name}
                onChange={(e) => {
                    setName(e.target.value)
                }}
                disabled={isReadOnly}
            />

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                    <Typography variant="body1">Date of Birth:</Typography>
                </Grid>
                <Grid item xs={8}>
                    <input
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={dob}
                        onChange={handleDobChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '16px',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            outline: 'none',
                        }}
                        disabled={isReadOnly}
                    />
                </Grid>
            </Grid>

            <Grid
                container
                spacing={2}
                alignItems="center"
                style={{ marginTop: '8px' }}
            >
                <Grid item xs={2}>
                    <Typography variant="body1">Sex:</Typography>
                </Grid>
                <Grid item xs={10}>
                    <RadioGroup
                        row
                        value={sex}
                        onChange={(e) => {
                            if (!isReadOnly) {
                                handleSexChange(e)
                            }
                        }}
                        style={{ display: 'flex', gap: '4px' }}
                    >
                        <FormControlLabel
                            value="Female"
                            control={
                                <Radio size="small" disabled={isReadOnly} />
                            }
                            label="Female"
                            sx={{ marginRight: '4px' }}
                        />
                        <FormControlLabel
                            value="Male"
                            control={
                                <Radio size="small" disabled={isReadOnly} />
                            }
                            label="Male"
                            sx={{ marginRight: '4px' }}
                        />
                        <FormControlLabel
                            value="Other"
                            control={
                                <Radio size="small" disabled={isReadOnly} />
                            }
                            label="Other"
                        />
                    </RadioGroup>
                </Grid>
            </Grid>

            <Autocomplete
                freeSolo
                options={addressOptions}
                onInputChange={(event, value) => {
                    if (!isReadOnly) handleAddressInputChange(event, value)
                }}
                onChange={(event, newValue) => {
                    if (!isReadOnly) handleAddressSelect(newValue || '')
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Address"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={address}
                        onChange={(e) => {
                            if (!isReadOnly) setAddress(e.target.value)
                        }}
                        disabled={isReadOnly}
                    />
                )}
                disabled={isReadOnly}
            />

            <ProfileField
                label="Phone"
                value={phone}
                onChange={handlePhoneChange}
                error={!!phoneError}
                helperText={phoneError}
                disabled={isReadOnly}
            />
            <ProfileField
                label="Email"
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                disabled={isReadOnly}
            />

            <MedicalInfoField
                medicalInfo={medicalInfo}
                onMedicalInfoChange={(field, value) => {
                    if (!isReadOnly) return
                    handleMedicalInfoChange(field, value)
                }}
                isReadOnly={isReadOnly}
            />

            <EmergencyContactField
                contactList={emergencyContacts}
                setContactList={(newContacts) => {
                    if (!isReadOnly) handleEmergencyContactChange(newContacts)
                }}
                isReadOnly={isReadOnly}
            />
            {/* <AlertSnackbar open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={handleSnackbarClose} autoHideDuration={1350}/> */}
        </div>
    )
}
