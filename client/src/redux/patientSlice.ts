import IPatient from '@/models/Patient'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import request from '../utils/request'
import { PatientState } from '../utils/types'

/* ---------------------- Initial State ---------------------- */
const initialState: PatientState = {
    patient: null,
    patients: [],
    loading: false,
    error: null,
}

/* ---------------------- Async Thunk to Fetch Patients ---------------------- */
const fetchPatients = createAsyncThunk('patient/fetchPatients', async () => {
    try {
        const response = await request('/api/patients', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        return response
    } catch (error) {
        console.error('Error fetching patients:', error)
        throw error
    }
})

/* ---------------------- Redux Slice ---------------------- */
const patientsSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {
        /**
         * Manually set patient data in Redux.
         */
        setPatient: (state, action: PayloadAction<IPatient>) => {
            state.patient = action.payload
        },
        /**
         * Clear patient data from Redux store.
         */
        clearPatient: (state) => {
            state.patient = null
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
    },
})

/* ---------------------- Export Actions & Reducer ---------------------- */
export const { setPatient, clearPatient, setPatientLoading, setPatientError } =
    patientsSlice.actions

export { fetchPatients }

export default patientsSlice.reducer
