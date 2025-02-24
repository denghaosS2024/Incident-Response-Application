import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IIncident extends Document {
    incidentId: string;
    caller: string;
    openingDate: Date;
    incidentState:'Waiting' | 'Triage' | 'Assigned' | 'Closed'; 
    /*
     TODO in the future: when the app is deployed we can create reserved user System
     and replace String with type of User (same with commander)
     */
    owner: string;
    commander: string;

    // Step 4
    incidentCallGroup?: Types.ObjectId;  // Reference to Channel model
}

const IncidentSchema = new Schema(
    {
        incidentId: {
            type: String,
            required: true,
            unique: true,
        },
        caller: {
            type: String,
            required: true,
        },
        openingDate: {
            type: Date,
            default: Date.now
        },
        incidentState: {
            type: String,
            required: true,
            enum: ['Waiting', 'Triage', 'Assigned', 'Closed'],
            default: 'Waiting',
        },
        owner: {
            type: String,
            required: true,
            default: "System"
        },
        commander: {
            type: String,
            required: true,
            default: "System"
        },
        incidentCallGroup: {
            type: Schema.Types.ObjectId,
            ref: 'Channel',
            required: false
        },
    },
)

/**
 * Auto-generate `incidentId` if not provided
 * (e.g., "IZoe" for a caller named "Zoe")
 */
IncidentSchema.pre('save', function (next): void {
    if (!this.incidentId && this.caller) {
        this.incidentId = `I${this.caller}`;
    }
    next();
});

export default mongoose.model<IIncident>('Incident', IncidentSchema)