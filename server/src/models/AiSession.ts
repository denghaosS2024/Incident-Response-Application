import mongoose, { Document, Schema } from "mongoose";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface IAiSession extends Document {
  sessionId: string;
  messages: ChatCompletionMessageParam[];
  startedAt: Date;
  lastUpdated: Date;
}

const AiSessionSchema = new Schema<IAiSession>({
  sessionId: { type: String, required: true, unique: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant", "system"], required: true },
      content: { type: String, required: true },
    },
  ],
  startedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model<IAiSession>("AiSession", AiSessionSchema);
