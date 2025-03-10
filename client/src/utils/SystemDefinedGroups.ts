import IChannel from "@/models/Channel";

export const SystemGroupNames = [
  "Citizens", "Responders", "Dispatch", "Police", "Fire", "Nurses", "Medic", "Public"
]

export const isSystemGroup = (channel: IChannel) => {
  return SystemGroupNames.includes(channel.name)
}
