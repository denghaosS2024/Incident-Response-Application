import mongoose, { Document, Schema } from 'mongoose';

export interface IAirQuality extends Document {
    locationId: string;
    latitude: number;
    longitude: number;
    air_qualities: Array<{
        air_quality: number;
        timeStamp: Date;
    }>;
}

const AirQualitySchema: Schema = new Schema(
    {
        locationId: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        air_qualities: [{
            air_quality: { type: [Number, String], required: true },
            timeStamp: { type: Date, required: true }
        }]
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

// Index for geospatial queries, to improve performance
AirQualitySchema.index({ locationId: 1 });
AirQualitySchema.index({ createdAt: 1 });

const AirQuality = mongoose.model<IAirQuality>('AirQuality', AirQualitySchema);
export default AirQuality;