// import WildfireArea, { IWildfireArea } from '../models/WildfireArea';
import WildfireArea from '../models/WildfireArea'

class WildfireAreaController {
  /**
   * add a new wildfire area
   * @param areaId - The id for the new wildfire area
   * @param coordinates - The password for the new user
   * @param name - The phone number for the new user
   * @returns The newly created wildfireArea object
   * @throws Error if the username already exists
   */
  async add(areaId: string, coordinates: number[][], name?: string) {
    // Check if the wildfire area already exists
    let wildfireArea = await WildfireArea.findOne({ areaId }).exec()

    if (wildfireArea) {
      throw new Error(`WildfireArea "${areaId}" already exists`)
    } else {
      // Create and save new wildfire area
      wildfireArea = await new WildfireArea({
        areaId,
        coordinates,
        name,
      }).save()
    }

    // NOTE: socket io notify everyone with the new wildfire area
    return wildfireArea
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
      return wildfireArea
    }

    throw new Error(`WildfireArea "${areaId}" does not exist`)
  }

  async delete(areaId: string) {
    const wildfireArea = await WildfireArea.findOne({ areaId })

    if (wildfireArea) {
      await wildfireArea.deleteOne()
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
