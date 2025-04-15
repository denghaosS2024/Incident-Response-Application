import mongoose from "mongoose";
import HospitalResource, { IHospitalResource, IHospitalResourceBase } from "../models/HospitalResource";
import Resource, { IResourceBase } from "../models/Resource";
import HttpError from "../utils/HttpError";

class HospitalResourceController {

  /**
   * Create a new Resource
   * @param resource An object containing the resourceName and optionally resourceId
   * @returns The newly created or existing resource object
   * @throws HttpError if the resource creation fails
   */
  async createResource(resource: Partial<IResourceBase>) : Promise<IResourceBase>{
    try {

      // check if resource is already exist
      const existingResource = await Resource.findOne({ resourceName: resource.resourceName }).exec();
      
      if (existingResource) {
        return existingResource.toObject();
      }

      // Ignore resourceId even it passed in, generate a new one
      const resourceId = new mongoose.Types.ObjectId().toString();

      const newResource = new Resource({
        resourceId,
        resourceName: resource.resourceName,
      });

      // Save the resource to the database
      await newResource.save();

      return newResource.toObject();

    } catch (error) {
      console.error("Error creating resource:", error);
      throw new HttpError("Failed to create resource", 500);
    }
  }

  /**
   * Create a new HospitalResource
   * @param hospitalResource An object of IHospitalResource
   * @returns The new hospital resource object which was created
   */
  async createHospitalResource(hospitalResource: IHospitalResourceBase) : Promise<IHospitalResourceBase>{
    try {
      const newHospitalResource = new HospitalResource({
        resourceId: hospitalResource.resourceId,
        hospitalId: hospitalResource.hospitalId,
        inStockQuantity: hospitalResource.inStockQuantity,
        inStockAlertThreshold: hospitalResource.inStockAlertThreshold,
      });
      await newHospitalResource.save();

      return newHospitalResource.toObject();

    } catch (error) {
      console.error("Error creating hospital resource:", error);
      throw new HttpError("Failed to create hospital resource", 500);
    }
  }

  /**
   * Fetch all resources
   * @returns An array of resource objects
   */
  async getAllResources() : Promise<IResourceBase[]>{
    try {
      const resources = await Resource.find().sort({ resourceName: 1 });

      return resources.map((resource) => resource.toObject());

    } catch (error) {

      console.error("Error fetching resources:", error);
      throw new HttpError("Failed to fetch resources", 500);
    }
  }

  /**
   * Fetch a resource by its name
   * @param resourceName The name of the resource
   * @returns The resource object as IResourceBase
   * @throws HttpError if the resource is not found
   */
  async getResourceByName(resourceName: string): Promise<IResourceBase> {
    try {
      const resource = await Resource.findOne({ resourceName }).exec();

      if (!resource) {
        throw new HttpError(`Resource with name "${resourceName}" not found.`, 404);
      }

      return resource.toObject();
    } catch (error) {
      console.error("Error fetching resource by name:", error);
      throw new HttpError("Failed to fetch resource by name", 500);
    }
  }

  /**
   * Fetch all hospitals that have a specific resource by resourceName
   * @param resourceName The name of the resource
   * @returns An array of hospital resource objects
   * @throws HttpError if no hospitals are found
   */
  async getHospitalsByResourceName(resourceName: string): Promise<IHospitalResourceBase[]> {
    try {
      // Step 1: Get the resource by name
      const resource = await this.getResourceByName(resourceName);

      // Step 2: Fetch all hospital resources with the resourceId
      const hospitalResources = await HospitalResource.find({ resourceId: resource.resourceId })
        .populate("hospitalId")
        .exec();

      if (!hospitalResources || hospitalResources.length === 0) {
        throw new HttpError(`No hospitals found with resource "${resourceName}".`, 404);
      }

      // Step 3: Return the hospital resources as plain objects
      return hospitalResources.map((hospitalResource) => hospitalResource.toObject());
    } catch (error) {
      console.error("Error fetching hospitals by resource name:", error);
      throw new HttpError("Failed to fetch hospitals by resource name", 500);
    }
  }

  /**
   * Fetch all hospital resources
   * @returns An array of hospital resource objects
   */
  async getAllHospitalResources(): Promise<IHospitalResourceBase[]> {
    try {

      const hospitalResources = await HospitalResource.find()
        .populate("resourceId")
        .populate("hospitalId");
      
      return hospitalResources.map((resource) => resource.toObject());

    } catch (error) {
      console.error("Error fetching hospital resources:", error);
      throw new HttpError("Failed to fetch hospital resources", 500);
    }
  }

  /**
   * Fetch hospital resources by resourceId
   * @param resourceId The ID of the resource
   * @returns An array of hospital resource objects
   */
  async getHospitalResourcesByResourceId(resourceId: string): Promise<IHospitalResourceBase[]> {
    try {
      const hospitalResources = await HospitalResource.find({ resourceId }).populate("hospitalId");
      return hospitalResources.map((resource) => resource.toObject());
    } catch (error) {
      console.error("Error fetching hospital resources by resourceId:", error);
      throw new HttpError("Failed to fetch hospital resources by resourceId", 500);
    }
  }

  /**
   * Update a HospitalResource
   * @param hospitalResource Partial hospital resource object with updated fields
   * @returns The updated hospital resource object
   */
  async updateHospitalResource(hospitalResource: Partial<IHospitalResource>): Promise<IHospitalResourceBase | null>{
    if (!hospitalResource.resourceId || !hospitalResource.hospitalId) {
      throw new HttpError("Invalid hospital resource data", 400);
    }

    try {
      const updatedHospitalResource = await HospitalResource.findOneAndUpdate(
        {
          resourceId: hospitalResource.resourceId,
          hospitalId: hospitalResource.hospitalId,
        },
        { $set: hospitalResource },
        { new: true }
      ).exec();

      return updatedHospitalResource ? updatedHospitalResource.toObject() : null;
    } catch (error) {
      console.error("Error updating hospital resource:", error);
      throw new HttpError("Failed to update hospital resource", 500);
    }
  }
}

export default new HospitalResourceController();