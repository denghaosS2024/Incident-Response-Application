import mongoose, { Document, Schema } from 'mongoose';

export interface IMapMarker extends Document {
  type: string;
  latitude: number;
  altitude: number;
  description?: string;
}

const MapMarkerSchema: Schema = new Schema(
  {
    type: { type: String, required: true },
    latitude: { type: Number, required: true },
    altitude: { type: Number, required: true },
    description: { type: String, required: false },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const MapMarker = mongoose.model<IMapMarker>('MapMarker', MapMarkerSchema);
export default MapMarker;
