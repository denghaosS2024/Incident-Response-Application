import IChannel from '../../models/Channel'
import IUser from '../../models/User'
import eventEmitter from '../../utils/eventEmitter'
import request from '../../utils/request'

export default class MapOverlayHelper {
  static roleUtilMapping: Record<string, string[]> = {
    Citizen: ['Areas', 'Hospitals', 'Pins', 'Pollution'],
    Fire: [
      'Areas',
      'Blocks',
      'Cars',
      'Hospitals',
      'Hydrants',
      'Incidents',
      'Pins',
      'Pollution',
      'SAR',
      'Trucks',
    ],
    Police: [
      'Areas',
      'Blocks',
      'Cars',
      'Hospitals',
      'Hydrants',
      'Incidents',
      'Pins',
      'Pollution',
      'SAR',
      'Trucks',
    ],
    Nurse: ['Areas', 'Hospitals', 'Incidents', 'Pins', 'Pollution', 'Trucks'],
    Administrator: [
      'Areas',
      'Blocks',
      'Cars',
      'Hospitals',
      'Hydrants',
      'Incidents',
      'Pins',
      'Pollution',
      'SAR',
      'Trucks',
    ],
  }

  public static getMenuStyle(isFullPage: boolean, is911Page: boolean) {
    return isFullPage
      ? { left: '20px', bottom: '120px', top: 'auto', transform: 'none' }
      : is911Page
        ? { left: '20px', bottom: '120px', top: 'auto', transform: 'none' }
        : { left: '20px', top: '45%', transform: 'translateY(-50%)' }
  }

  public static getUsers(contacts: IUser[]) {
    const currentUserId = localStorage.getItem('uid')
    return contacts.filter((user: IUser) => user._id !== currentUserId)
  }

  /**
   * Gets the role key for the current user. Reads "role" from localStorage and tries to match it to a role in the roleUtilMapping.
   * @returns The role key for the current user
   */
  private static getRoleKey() {
    const parsedRole = localStorage.getItem('role') ?? 'Citizen'
    const capitalized = parsedRole.charAt(0).toUpperCase() + parsedRole.slice(1)

    if (capitalized.includes('Admin')) {
      return 'Administrator'
    } else if (Object.keys(this.roleUtilMapping).includes(capitalized)) {
      return capitalized
    }

    console.warn(`Unknown role: ${parsedRole}`)

    return 'Citizen'
  }

  /**
   * Gets the utility items for the current user
   * @returns The utility items for the current user
   */
  public static getUtilItems() {
    const roleKey = this.getRoleKey()
    return this.roleUtilMapping[roleKey] ?? []
  }

  private static utilLayerEvents: Record<string, () => void> = {
    Pins: () => eventEmitter.emit('toggle_pin'),
    Blocks: () => eventEmitter.emit('toggle_roadblock'),
    Hydrants: () => eventEmitter.emit('toggle_fireHydrant'),
    Areas: () => eventEmitter.emit('area_util'),
    Pollution: () => eventEmitter.emit('toggle_airQuality'),
    Hospitals: () => eventEmitter.emit('toggle_hospital'),
    Incidents: () => eventEmitter.emit('toggle_incidents'),
    Trucks: () => eventEmitter.emit('toggle_trucks'),
    Cars: () => eventEmitter.emit('toggle_cars'),
    SAR: () => eventEmitter.emit('toggle_sar')
  }

  /**
   * Handles the click event for a utility layer, emits an event to toggle the layer
   * @param layerId - The layer to handle the click event for
   */
  static onUtilLayerClick(layerId: string) {
    if (Object.keys(this.utilLayerEvents).includes(layerId)) {
      this.utilLayerEvents[layerId]()
    }
  }

  /**
   * Fetches the groups the user is participating in and the groups the user is managing
   *
   * @returns An object containing the active groups and the owned groups
   */
  static async fetchGroups(): Promise<
    | {
        active: IChannel[]
        owned: IChannel[]
      }
    | undefined
  > {
    try {
      const owner = localStorage.getItem('uid') ?? ''

      // Fetch groups the user is participating in
      const myGroups = await request(`/api/channels/groups/${owner}`, {
        method: 'GET',
      })

      // Filter active groups the user is participating in
      const activeGroups = myGroups.filter((group: IChannel) => !group.closed)

      // Filter groups the user is managing (owner of)
      const ownedGroups = myGroups.filter(
        (group: IChannel) => group.owner?._id === owner && !group.closed,
      )

      return {
        active: activeGroups,
        owned: ownedGroups,
      }
    } catch (error) {
      console.error('Error fetching groups:', error)

      return undefined
    }
  }
}
