import CloseIcon from '@mui/icons-material/Close'
import { Card, CardContent, Grid, IconButton, TextField } from '@mui/material'
import { useState } from 'react'
import { IEmergencyContact } from '../../models/Profile'

interface EmergencyContactFieldProps {
    contactList: IEmergencyContact[]
    setContactList: (contactList: IEmergencyContact[]) => void
    isReadOnly?: boolean
}

export default function EmergencyContactField({
    contactList,
    setContactList,
    isReadOnly = false,
}: EmergencyContactFieldProps) {
    const handleDeleteContact = (index: number) => {
        const updatedContacts = contactList.filter((_, i) => i !== index)
        setContactList(updatedContacts)
    }

    const handleContactChange = (
        index: number,
        field: keyof IEmergencyContact,
        value: string,
    ) => {
        const updatedContacts = contactList.map((contact, i) =>
            i === index ? { ...contact, [field]: value } : contact,
        )
        setContactList(updatedContacts)
    }

    return (
        <>
            <h2>Emergency Contacts</h2>
            {contactList.map((contact, index) => (
                <ContactInfo
                    key={index}
                    index={index}
                    phone={contact.phone}
                    email={contact.email}
                    name={contact.name}
                    onChange={handleContactChange}
                    onDelete={handleDeleteContact}
                    isReadOnly={isReadOnly}
                />
            ))}

            <button
                onClick={() => {
                    const newContact: IEmergencyContact = {
                        name: '',
                        phone: '',
                        email: '',
                    }
                    setContactList([...contactList, newContact])
                }}
            >
                Add Emergency Contact
            </button>
        </>
    )
}

interface ContactInfoProps {
    index: number
    name: string
    phone: string
    email: string
    onDelete: (index: number) => void
    onChange: (
        index: number,
        field: keyof IEmergencyContact,
        value: string,
    ) => void
    isReadOnly?: boolean
}

const ContactInfo = ({
    index,
    phone,
    name,
    email,
    onDelete,
    onChange,
    isReadOnly = false,
}: ContactInfoProps) => {
    const [phoneError, setPhoneError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [nameError, setNameError] = useState('')
    const phoneRegex = /^\+?[1-9]\d{1,14}$/

    // const validatePhone = (phone: string) => {
    //     if (phone.length < 7) {
    //       setPhoneError("Phone number is too short.");
    //       return false;
    //   }
    //   if (phone.length > 15) {
    //       setPhoneError("Phone number is too long.");
    //       return false;
    //   }
    //   if (!phone.startsWith("+")) {
    //       setPhoneError("Include country code (e.g., +1 for US).");
    //       return false;
    //   }
    //   if (!phoneRegex.test(phone)) {
    //       setPhoneError("Only numbers are allowed (no spaces or symbols).");
    //       return false;
    //   }

    //   setPhoneError("");
    //   return true;
    // };

    const validatePhone = (email: string) => {
        if (!phoneRegex.test(email)) {
            setEmailError('Invalid email format')
        } else {
            setEmailError('')
        }
    }

    const validateEmail = (email: string) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Invalid email format')
        } else {
            setEmailError('')
        }
    }

    const validateName = (name: string) => {
        if (name.trim() === '') {
            setNameError('Name is required')
        } else {
            setNameError('')
        }
    }

    return (
        <Card
            sx={{ position: 'relative', marginBottom: '10px', padding: '10px' }}
        >
            <IconButton
                sx={{ position: 'absolute', top: 5, right: 5 }}
                onClick={() => onDelete(index)}
                disabled={isReadOnly}
            >
                <CloseIcon />
            </IconButton>
            <CardContent>
                <Grid container spacing={2} direction="column">
                    <Grid item xs={12}>
                        <TextField
                            label="Name"
                            value={name}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={(e) => {
                                if (!isReadOnly) {
                                    const value = e.target.value
                                    onChange(index, 'name', value)
                                    validateName(value)
                                }
                            }}
                            error={!!nameError}
                            helperText={nameError}
                            disabled={isReadOnly}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Phone"
                            value={phone}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={(e) => {
                                if (!isReadOnly) {
                                    const value = e.target.value
                                    onChange(index, 'phone', value)
                                    validatePhone(value)
                                }
                            }}
                            error={!!phoneError}
                            helperText={phoneError}
                            disabled={isReadOnly}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Email"
                            value={email}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={(e) => {
                                if (!isReadOnly) {
                                    const value = e.target.value
                                    onChange(index, 'email', value)
                                    validateEmail(value)
                                }
                            }}
                            error={!!emailError}
                            helperText={emailError}
                            disabled={isReadOnly}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
