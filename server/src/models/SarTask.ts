import { Document, Schema, model } from 'mongoose';
// import { IIncident } from './Incident'
export interface IVictims {
  Immediate: string;
  Urgent: string;
  CouldWait: string;
  Dismiss: string;
  Deceased: string;
}

export interface IHazards {
  ActiveWire: string;
  Dogs: string;
  Explosives: string;
  Fire: string;
  Flood: string;
  Gas: string;
  Rats: string;
  Others: string;
}

export interface ITask extends Document {
  address: string
  status: string
  incidentId: string
  openingDate: Date
  closingDate?: Date
  victims?: IVictims[]; // Array of victim objects
  hazards?: IHazards[]; // Array of victim objects
}

const VictimSchema = new Schema<IVictims>({
  Immediate: { type: String},
  Urgent: { type: String},
  CouldWait: { type: String},
  Dismiss: { type: String},
  Deceased: { type: String},
});
const HazardsSchema = new Schema<IHazards>({
  ActiveWire: { type: String},
  Dogs: { type: String},
  Explosives: { type: String},
  Fire: { type: String},
  Flood: { type: String},
  Gas: { type: String},
  Rats: { type: String},
  Others: { type: String},
});

const SarTaskSchema = new Schema<ITask>({
  address: { type: String, required: true },
  status: { type: String, required: true },
  incidentId: { type: String, required: true },
  openingDate: { type: Date, required: true },
  closingDate: { type: Date},
  victims: { type: [VictimSchema], default: [] }, // Array of victim objects
  hazards: { type: [HazardsSchema], default: [] }, // Array of victim objects

})

export default model<ITask>('Task', SarTaskSchema)
