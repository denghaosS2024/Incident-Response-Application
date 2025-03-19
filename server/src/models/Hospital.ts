import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// TODO: Add further fields after discussing with team
export interface IHospital extends Document {
    hospitalId: string;
    hospitalName: string;
    hospitalAddress: string;
    hospitalDescription: string;
}

// TODO : Add further fields after discussing with team
const HospitalSchema = new Schema(
    {
        hospitalId: {
            type: String,
            required: true,
            unique: true,
            default: uuidv4,
        },
        hospitalName: {
            type: String,
            required: true,
            unique: false,
        },
        hospitalAddress: {
            type: String,
            required: true,
            unique: true,
        },
        hospitalDescription: {
            type: String,
            required: false,
            unique: false,
        }
    },
)

export default mongoose.model<IHospital>('Hospital', HospitalSchema)