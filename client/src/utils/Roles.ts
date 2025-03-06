/**
 * Roles Utility
 * 
 * This file defines the roles available in the system.
 * Note: Keep this file in sync with server/src/utils/Roles.ts
 */

export enum ROLES {
    CITIZEN = 'Citizen',
    DISPATCH = 'Dispatch',
    POLICE = 'Police',
    FIRE = 'Fire',
    NURSE = 'Nurse',
    ADMINISTRATOR = 'Administrator',
  }

export const isValidRole = (role: string): role is ROLES => {
    return Object.values(ROLES).includes(role as ROLES)
}
  
export default ROLES