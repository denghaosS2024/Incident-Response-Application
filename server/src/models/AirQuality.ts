import mongoose, { Document, Schema } from 'mongoose';

export interface IAirQuality extends Document {
    locationId: string;
    latitude: number; 
    longitude: number;
    air_qualities: Array<{
        air_quality: number;
        timeStamp: number;
    }>;
}

const AirQualitySchema: Schema = new Schema(
    {
        locationId: { type: String, required: true },
        air_qualities: [{
            air_quality: { type: Number || String, required: true },
            timeStamp: { type: Date, required: true }
        }]
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields automatically
    }
);

const AirQuality = mongoose.model<IAirQuality>('AirQuality', AirQualitySchema);
export default AirQuality;