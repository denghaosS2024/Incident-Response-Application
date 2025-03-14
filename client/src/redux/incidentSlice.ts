import IIncident, { IncidentPriority, IncidentType } from '../models/Incident'
import { EmergencyQuestions, IncidentsState } from '../utils/types'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


// Function to load state from local storage
const loadPersistatedState = (): IncidentsState | null => {
    try {
        const username = localStorage.getItem('username');
        const uid = localStorage.getItem('uid');
        const incidentState = localStorage.getItem("incidentState");
        return incidentState ? JSON.parse(incidentState) : null;
    } catch (err) {
        console.error("Failed to load state", err);
        return null;
    }
};


// Initial state for the incident slice
// It either loads the persisted state or reinitializes it
const initialState: IncidentsState = loadPersistatedState() || {
    incident: {
        _id: '',
        incidentId: '',
        caller: '',
        openingDate: '',
        incidentState: '',
        owner: '',
        commander: '',
        address: '',
        type: IncidentType.Unset,
        questions: {} as EmergencyQuestions,
        incidentCallGroup: '',
        priority: IncidentPriority.Unset
    },
    loading: false, // Indicates if a incident operation is in progress
    error: null, // Stores any error that occurred during incident operations
}

// Interface for the payload of the loadContacts action
interface IIncidentsPayload {
    incident: IIncident
}

// Function to save state to local storage
const persistState = (state: IncidentsState) => {
    try {
        localStorage.setItem("incidentState", JSON.stringify(state));
    } catch (err) {
        console.error("Failed to save state", err);
    }
};


const incidentsSlice = createSlice({
    name: "incidents",
    initialState,
    reducers: {
        updateIncident: (state: IncidentsState, action: PayloadAction<IIncident>) => {
            state.incident = action.payload
            persistState(state)
        },

        // setLoading: (state, action: PayloadAction<boolean>) => {
        //     state.loading = action.payload;
        // },
        // setError: (state, action: PayloadAction<string | null>) => {
        //     state.error = action.payload;
        // },

        resetIncident: (state) => {
            state.incident = {
                _id: '',
                incidentId: '',
                caller: '',
                openingDate: '',
                incidentState: '',
                owner: '',
                commander: '',
                address: '',
                type: IncidentType.Unset,
                questions: {} as EmergencyQuestions,
                incidentCallGroup: '',
                priority: IncidentPriority.Unset
            };
            persistState(state); // Save cleared state to localStorage
        }
    }
})



export default incidentsSlice.reducer
export const { updateIncident, resetIncident } = incidentsSlice.actions;