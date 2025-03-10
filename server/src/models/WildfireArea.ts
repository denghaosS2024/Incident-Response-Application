/**
 * WildfireArea Model
 *
 * Represents a wildfire area entity that will be shown on the map.
 */

import mongoose, { Document, Schema } from 'mongoose'

/**
 * Interface for the WildfireArea document
 */
export interface IWildfireArea extends Document {
    areaId: string;
    coordinates: [number, number][];
    name?: string;
}

/**
 * WildfireArea Schema
 */
const WildfireAreaSchema = new Schema<IWildfireArea>({
  areaId: {
    type: String,
    required: true,
    unique: true,
  },
  coordinates: {
    type: [[Number]],
    required: true
  },
  name: {
    type: String,
    required: false
  },
})

export default mongoose.model<IWildfireArea>('WildfireArea', WildfireAreaSchema)
