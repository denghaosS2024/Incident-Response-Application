// import WildfireArea, { IWildfireArea } from '../models/WildfireArea';
import WildfireArea from '../models/WildfireArea'
import UserConnections from '../utils/UserConnections'

class WildfireAreaController {
  /**
   * add a new wildfire area
   * @param coordinates - The coordinates for the new wildfire area
   * @param name - The name for the new wildfire area (Must be unique)
   * @returns The newly created wildfireArea object
   * @throws Error if the name already exists
   */
  async add(areaId: string, coordinates: number[][], name?: string) {
    // Check if the wildfire area already exists
    const wildfireArea = await WildfireArea.findOne({ areaId }).exec()

    if (wildfireArea) {
      throw new Error(`WildfireArea "${areaId}" already exists`)
    }

    const newWildfireArea = new WildfireArea({
      areaId,
      coordinates,
      name,
    })

    await newWildfireArea.save()
    const areaJson = {
      areaId: newWildfireArea.areaId,
      coordinates: newWildfireArea.coordinates,
      name: newWildfireArea.name,
    }
    UserConnections.broadcast('map-area-update', areaJson)
    return areaJson
  }

  /**
   * Find a wildfire area by its ID
   * @param areaId - The ID of the wildfire area to find
   * @returns The wildfire area object
   * @throws Error if the wildfire area does not exist
   */
  async findById(areaId: string) {
    const target = await WildfireArea.findOne({ areaId })

    if (target === null || target === undefined) {
      throw new Error(`WildfireArea by ID "${areaId}" does not exist`)
    }

    return target
  }

  /**
   * Update wildfire area name property
   * @param name - The new name of the wildfire area
   * @returns An object containing the authentication token, user ID, and role
   * @throws Error if the user doesn't exist or the password is incorrect
   */
  async update(areaId: string, newName: string) {
    const wildfireArea = await WildfireArea.findOne({ areaId })

    if (wildfireArea) {
      wildfireArea.name = newName
      await wildfireArea.save()
      const newWildfireArea = {
        areaId,
        coordinates: wildfireArea.coordinates,
        name: newName,
      }
      UserConnections.broadcast('map-area-update', newWildfireArea)
      return wildfireArea
    }

    throw new Error(`WildfireArea "${areaId}" does not exist`)
  }

  /**
   * Update wildfire area containment level
   * @param areaId - The id of the wildfire area
   * @param containmentLevel - The new containment level of the wildfire area in range 0-1
   * @returns The updated wildfire area object
   * @throws Error if the wildfire area does not exist
   */
  async updateContainmentLevel(areaId: string, containmentLevel: number) {
    const wildfireArea = await WildfireArea.findOne({ areaId })

    if (wildfireArea) {
      wildfireArea.containment = containmentLevel
      // Update last updated time (timestamp)
      wildfireArea.last_updated = new Date()
      await wildfireArea.save()
      return wildfireArea
    }

    throw new Error(`WildfireArea "${areaId}" does not exist`)
  }

  /**
   * Delete a wildfire area
   * @param areaId - The id of the wildfire area
   * @returns A message indicating the wildfire area has been deleted
   * @throws Error if the wildfire area does not exist
   */
  async delete(areaId: string) {
    const wildfireArea = await WildfireArea.findOne({ areaId })

    if (wildfireArea) {
      await wildfireArea.deleteOne()
      UserConnections.broadcast('map-area-delete', areaId)
      return { message: `WildfireArea "${areaId}" has been deleted` }
    }

    throw new Error(`WildfireArea "${areaId}" does not exist`)
  }

  /**
   * List all users with their online status
   * @returns An array of user objects, each containing _id, username, role, and online status
   */
  async listWildfireAreas() {
    const wildfireAreas = await WildfireArea.find().exec()
    return wildfireAreas.map((wildfireArea) => ({
      ...wildfireArea.toJSON(),
    }))
  }
}

export default new WildfireAreaController()
