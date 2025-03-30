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
import EmergencyContactField from '../components/Profile/EmergencyContactField'
import MedicalInfoField from '../components/Profile/MedicalInfoField'
import ProfileField from '../components/Profile/ProfileField'
import { IEmergencyContact } from '../models/Profile'
import Globals from '../utils/Globals'
import request from '../utils/request'

export default function ProfilePage() {
    const currentUserId = localStorage.getItem('uid')

    const [name, setName] = useState('')
    const [dob, setDob] = useState('')
    const [sex, setSex] = useState('')
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [addressOptions, setAddressOptions] = useState<string[]>([])
    const mapboxToken = Globals.getMapboxToken()

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
            localStorage.getItem('savedAddresses') || '[]',
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
            if (!currentUserId) return

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
                }>(`/api/profiles/${currentUserId}`)

                setName(profileData.name || '')
                setDob(
                    profileData.dob
                        ? new Date(profileData.dob).toISOString().split('T')[0]
                        : '',
                )
                setSex(profileData.sex || '')
                setAddress(profileData.address || '')
                setPhone(profileData.phone || '')
                setEmail(profileData.email || '')
                setEmergencyContacts(profileData.emergencyContacts || [])
                setMedicalInfo({
                    condition: profileData.medicalInfo?.condition ?? '',
                    drugs: profileData.medicalInfo?.drugs ?? '',
                    allergies: profileData.medicalInfo?.allergies ?? '',
                })

                console.log('Fetched profile data:', profileData)
            } catch (error) {
                console.error('Failed to fetch profile data:', error)
            }
        }

        fetchProfileData()
    }, [currentUserId])

    // 🛠 Debounced handleSave to prevent excessive API calls
    const debouncedHandleSave = useCallback(
        debounce(async () => {
            if (!currentUserId) return

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

            // console.log("🚀 Debounced saving profileData:", profileData);

            try {
                await request(`/api/profiles/${currentUserId}`, {
                    method: 'PUT',
                    body: JSON.stringify(profileData),
                })
                // console.log("✅ Profile saved successfully!");
            } catch (error) {
                console.error('❌ Failed to save profile:', error)
            }
        }, 500),
        [
            currentUserId,
            name,
            dob,
            sex,
            address,
            phone,
            email,
            emergencyContacts,
            medicalInfo,
        ],
    )

    useEffect(() => {
        debouncedHandleSave()
    }, [name, dob, sex, address, phone, email, emergencyContacts, medicalInfo])

    // 🚀 if user leave the page, save immediately
    useEffect(() => {
        return () => {
            // console.log("🚀 Leaving Profile Page. Flushing save...");
            debouncedHandleSave.flush()
        }
    }, [])

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
            <h1> Personal Information</h1>
            <ProfileField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                        onChange={handleSexChange}
                        style={{ display: 'flex', gap: '4px' }}
                    >
                        <FormControlLabel
                            value="Female"
                            control={<Radio size="small" />}
                            label="Female"
                            sx={{ marginRight: '4px' }}
                        />
                        <FormControlLabel
                            value="Male"
                            control={<Radio size="small" />}
                            label="Male"
                            sx={{ marginRight: '4px' }}
                        />
                        <FormControlLabel
                            value="Other"
                            control={<Radio size="small" />}
                            label="Other"
                        />
                    </RadioGroup>
                </Grid>
            </Grid>

            <Autocomplete
                freeSolo
                options={addressOptions}
                onInputChange={handleAddressInputChange}
                onChange={(event, newValue) =>
                    handleAddressSelect(newValue || '')
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Address"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                )}
            />

            <ProfileField
                label="Phone"
                value={phone}
                onChange={handlePhoneChange}
                error={!!phoneError}
                helperText={phoneError}
            />
            <ProfileField
                label="Email"
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
            />

            <MedicalInfoField
                medicalInfo={medicalInfo}
                onMedicalInfoChange={handleMedicalInfoChange}
            />

            <EmergencyContactField
                contactList={emergencyContacts}
                setContactList={handleEmergencyContactChange}
            />
            {/* <AlertSnackbar open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={handleSnackbarClose} autoHideDuration={1350}/> */}
        </div>
    )
}
