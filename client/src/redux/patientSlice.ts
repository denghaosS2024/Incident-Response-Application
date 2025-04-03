import IPatient from '@/models/Patient'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import request from '../utils/request'
import { PatientState } from '../utils/types'

/* ---------------------- Initial State ---------------------- */
const initialState: PatientState = {
    patients: [],
    loading: false,
    error: null,
}

/* ---------------------- Async Thunk to Fetch Patients ---------------------- */
const fetchPatient = createAsyncThunk('patient/fetchPatient', async () => {
    try {
        const response = await request('/api/patients/unassigned', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        return response
    } catch (error) {
        console.error('Error fetching patients with location "Road":', error)
        throw error
    }
})

const fetchPatients = createAsyncThunk('patient/fetchPatients', async () => {
    console.log('fetchPatients')
    try {
        const response = await request('/api/patients', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        return response
    } catch (error) {
        console.error('Error fetching patients with location "Road":', error)
        throw error
    }
})

const addPatient = createAsyncThunk(
    'patient/addPatient',
    async (newPatient: IPatient, { rejectWithValue }) => {
        console.log('called addPatient')
        try {
            const response = await request('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPatient),
            })
            return response
        } catch (error: unknown) {
            console.error('Error adding new patient:', error)
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to add patient')
        }
    },
)
const updatePatient = createAsyncThunk(
    'patient/updatePatient',
    async (updatedPatient: IPatient, { rejectWithValue }) => {
        try {
            const response = await request(`/api/patients`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPatient),
            })
            return response
        } catch (error: unknown) {
            console.error('Error updating patient:', error)
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to update patient')
        }
    },
)

/* ---------------------- Redux Slice ---------------------- */
const patientsSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {
        /**
         * Manually set patient data in Redux.
         */
        setPatient: (state, action: PayloadAction<IPatient>) => {
            const index = state.patients.findIndex(
                (p) => p.username === action.payload.username,
            )
            if (index !== -1) {
                state.patients[index] = action.payload
            }
        },
        /**
         * Clear patient data from Redux store.
         */
        clearPatient: (state) => {
            state.patients = []
            state.error = null
            state.loading = false
        },

        /**
         * Set loading status for patient-related operations
         */
        setPatientLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        /**
         * Set error message for patient-related operations
         */
        setPatientError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchPatients.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(
                fetchPatients.fulfilled,
                (state, action: PayloadAction<IPatient[]>) => {
                    state.patients = action.payload
                    state.loading = false
                },
            )
            .addCase(fetchPatients.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ?? 'Failed to fetch patients'
            })
            .addCase(addPatient.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(
                addPatient.fulfilled,
                (state, action: PayloadAction<IPatient>) => {
                    state.patients.push(action.payload)
                    state.loading = false
                },
            )
            .addCase(addPatient.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(
                fetchPatient.fulfilled,
                (state, action: PayloadAction<IPatient[]>) => {
                    state.patients = action.payload
                    state.loading = false
                },
            )
    },
})

/* ---------------------- Export Actions & Reducer ---------------------- */
export const { setPatient, clearPatient, setPatientLoading, setPatientError } =
    patientsSlice.actions

export { addPatient, fetchPatient, fetchPatients, updatePatient }

export default patientsSlice.reducer
