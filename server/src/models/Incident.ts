import mongoose, { Schema, Document } from 'mongoose'

export interface IIncident extends Document {
    incidentId: string,
    caller: string,
    openingDate: Date,
    incidentState: string,
    /*
     TODO in the future: when the app is deployed we can create reserved user System
     and replace String with type of User (same with commander)
     */
    owner: string,
    commander: string
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
            enum: ['Waiting'],
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