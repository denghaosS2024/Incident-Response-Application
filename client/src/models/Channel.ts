import IUser from './User'

/**
 * Channel Interface
 *
 * Defines the structure of a channel object in the application.
 */
export default interface IChannel {
  _id: string // Unique identifier for the channel
  name?: string // Optional name of the channel
  users: IUser[] // Array of users participating in the channel
}

/**
 * Resolves the channel name
 *
 * If the channel doesn't have a name, it generates one based on the usernames
 * of the participants (excluding the current user).
 *
 * @param channel - The channel object to resolve the name for
 * @returns The channel object with a resolved name
 */
export const resolveChannelName = (channel: IChannel) => {
  if (!channel.name) {
    const uid = localStorage.getItem('uid')
    const others = channel.users.filter((user) => user._id !== uid)

    channel.name = others
      .map(({ username }) => username)
      .sort()
      .join(',')
  }

  return channel
}
