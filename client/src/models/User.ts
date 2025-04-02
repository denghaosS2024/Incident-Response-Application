/**
 * User Interface
 *
 * Defines the structure of a user object in the application.
 */
export default interface IUser {
  _id: string // Unique identifier for the user
  username: string // User's display name
  online?: boolean // Optional flag indicating user's online status
  role: string // User's role in the system (e.g., 'user', 'admin')
  hospitalId?: string // Reference to the hospital where the user works (for nurses)
}
