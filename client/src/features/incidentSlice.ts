import IIncident from '../models/Incident'
import { EmergencyQuestions, IncidentsState } from '../utils/types'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


// Initial state for the incident slice
const initialState: IncidentsState = {
    incident: {
        _id: '',
        caller: '',
        timestamp: '',
        state: '',
        owner: '',
        commander: '',
        address: '',
        type: '',
        questions: {} as EmergencyQuestions,
        incidentCallGroup: '',
    },
    loading: false, // Indicates if a incident operation is in progress
    error: null, // Stores any error that occurred during incident operations
}

// Interface for the payload of the loadContacts action
interface IIncidentsPayload {
    incident: IIncident
}


const incidentsSlice = createSlice({
    name: "incidents",
    initialState,
    reducers: {
        updateIncident: (state, action: PayloadAction<IIncident>) => {
            state.incident = action.payload
        },

        // setLoading: (state, action: PayloadAction<boolean>) => {
        //     state.loading = action.payload;
        // },
        // setError: (state, action: PayloadAction<string | null>) => {
        //     state.error = action.payload;
        // },

    }
})

export default incidentsSlice.reducer
export const { updateIncident } = incidentsSlice.actions 