import { LeanDocument, Types } from "mongoose";
import HospitalResource, {
  IHospitalResource,
  IHospitalResourceBase,
} from "../models/HospitalResource";
import Resource, { IResource, IResourceBase } from "../models/Resource";
import HttpError from "../utils/HttpError";

export interface HospitalResourceClient {
  hospitalId: string;
  resourceName: string;
  inStockQuantity?: number;
  inStockAlertThreshold?: number;
}
class HospitalResourceController {
  /**
   * Create a new Resource
   * @param resource An object containing the resourceName and optionally resourceId
   * @returns The newly created or existing resource object
   * @throws HttpError if the resource creation fails
   */
  async createResource(
    resource: Partial<IResourceBase>,
  ): Promise<LeanDocument<IResource>> {
    try {
      const {resourceName} = resource;
      // check if resource is already exist
      const existingResource = await Resource.findOne({
        resourceName: resourceName,
      }).exec();

      if (existingResource) {
        return existingResource.toObject();
      }

      const newResource = new Resource({
        resourceName: resourceName,
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
  async createHospitalResource(
    hospitalResource: IHospitalResourceBase,
  ): Promise<LeanDocument<IHospitalResource>> {
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
  async getAllResources(): Promise<LeanDocument<IResource>[]> {
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
  async getResourceByName(
    resourceName: string,
  ): Promise<LeanDocument<IResource>> {
    try {
      const resource = await Resource.findOne({ resourceName }).exec();
      console.log("Resource fetched by name:", resourceName, resource);
      if (!resource) {
        throw new HttpError(
          `Resource with name "${resourceName}" not found.`,
          404,
        );
      }

      return resource.toObject();
    } catch (error) {
      console.error("Error fetching resource by name:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }

      throw new HttpError("Failed to fetch resource by name", 500);
    }
  }

  /**
   * Fetch all hospitals that have a specific resource by resourceName
   * @param resourceName The name of the resource
   * @returns An array of hospital resource objects
   * @throws HttpError if no hospitals are found
   */
  async getHospitalsByResourceName(
    resourceName: string,
  ): Promise<LeanDocument<IHospitalResource>[]> {
    try {
      // Step 1: Get the resource by name
      const resource = await this.getResourceByName(resourceName);

      // Step 2: Fetch all hospital resources with the resourceId
      const hospitalResources = await HospitalResource.find({
        resourceId: resource._id,
      }).exec();

      if (!hospitalResources || hospitalResources.length === 0) {
        throw new HttpError(
          `No hospitals found with resource "${resourceName}".`,
          404,
        );
      }

      // Step 3: Return the hospital resources as plain objects
      return hospitalResources.map((hospitalResource) =>
        hospitalResource.toObject(),
      );
    } catch (error) {
      console.error("Error fetching hospitals by resource name:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }

      throw new HttpError(
        `Failed to fetch hospitals by resource name ${error}`,
        500,
      );
    }
  }

    /**
   * Fetch hospital resource by mongodb _id
   * @param _id mongodb id
   * @returns A hospital resource object
   * @throws HttpError if no resource is found
   */
     async getHospitalResourceById(
      _id: Types.ObjectId,
    ){
      try {
        const hospitalResource = await HospitalResource.find({
          _id: _id,
        }).populate("resourceId");
        return hospitalResource;
      } catch (error) {
        console.error(
          "Error fetching a specific hospital resource",
          error,
        );
        if (error instanceof HttpError) {
          throw error; // Re-throw if it's already an HttpError
        }
        throw new HttpError(
          "Failed to fetch a specific hospital resources",
          500,
        );
      }
    }

  /**
   * Fetch all hospital resources
   * @returns An array of hospital resource objects
   */
  async getAllHospitalResources(): Promise<LeanDocument<IHospitalResource>[]> {
    try {
      const hospitalResources =
        await HospitalResource.find().populate("resourceId");

      return hospitalResources.map((resource) => resource.toObject());
    } catch (error) {
      console.error("Error fetching hospital resources:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError("Failed to fetch hospital resources", 500);
    }
  }

  /**
   * Fetch hospital resources for a specific hospital
   * @returns An array of hospital resource objects for a specific hospital
   */
  async getAllHospitalResourcesByHospitalId(_id: Types.ObjectId) {
    try {
      const hospitalResources = await HospitalResource.find({
        hospitalId: _id,
      }).populate("resourceId");
      console.log("res", hospitalResources);
      return hospitalResources;
    } catch (error) {
      console.error(
        "Error fetching hospital resources for a specific hospital:",
        error,
      );
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError(
        "Failed to fetch hospital resources for a specific hospital",
        500,
      );
    }
  }

  /**
   * Fetch hospital resources by resourceId
   * @param resourceId The ID of the resource
   * @returns An array of hospital resource objects
   */
  async getHospitalResourcesByResourceId(
    resourceId: Types.ObjectId,
  ): Promise<LeanDocument<IHospitalResource>[]> {
    try {
      const hospitalResources = await HospitalResource.find({
        resourceId,
      });
      return hospitalResources.map((resource) => resource.toObject());
    } catch (error) {
      console.error("Error fetching hospital resources by resourceId:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError(
        "Failed to fetch hospital resources by resourceId",
        500,
      );
    }
  }

  /**
   * Fetch all HospitalResources and group them by resourceName
   * @returns An object where keys are resourceNames and values are arrays of HospitalResourceRequest
   */
  async getAllHospitalResourcesGroupedByResource(): Promise<
    Record<string, HospitalResourceClient[]>
  > {
    try {
      // Fetch all hospital resources and populate resourceId
      const hospitalResources = await HospitalResource.find()
        .populate<{ resourceId: IResource }>("resourceId") // Populate resourceId with IResource type
        .exec();

      // Group resources by resourceName
      const groupedResources: Record<string, HospitalResourceClient[]> = {};

      hospitalResources.forEach((hospitalResource) => {
        // Ensure resourceId is populated and has a resourceName
        const resource = hospitalResource.resourceId as LeanDocument<IResource>;
        if (!resource || !resource.resourceName) {
          throw new HttpError(
            `Resource data is incomplete or not populated. ${hospitalResources}`,
            500,
          );
        }

        const resourceName = resource.resourceName;

        if (!groupedResources[resourceName]) {
          groupedResources[resourceName] = [];
        }

        groupedResources[resourceName].push({
          hospitalId: hospitalResource.hospitalId.toString(),
          resourceName,
          inStockQuantity: hospitalResource.inStockQuantity,
          inStockAlertThreshold: hospitalResource.inStockAlertThreshold,
        });
      });

      return groupedResources;
    } catch (error) {
      console.error("Error fetching and grouping hospital resources:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError(
        `Failed to fetch and group hospital resources, ${error}`,
        500,
      );
    }
  }

  /**
   * Update a HospitalResource
   * @param hospitalResource Partial hospital resource object with updated fields
   * @returns The updated hospital resource object
   */
  async updateHospitalResource(
    hospitalResource: Partial<IHospitalResource>,
  ): Promise<LeanDocument<IHospitalResource> | null> {
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
        { new: true },
      ).exec();

      return updatedHospitalResource
        ? updatedHospitalResource.toObject()
        : null;
    } catch (error) {
      console.error("Error updating hospital resource:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError("Failed to update hospital resource", 500);
    }
  }

  /**
   * Delete a HospitalResource
   * @param resourceId The ID of the resource
   * @param hospitalId The ID of the hospital
   * @returns The deleted hospital resource object, or null if not found
   */
  async deleteHospitalResource(
    resourceId: Types.ObjectId,
    hospitalId: Types.ObjectId,
  ): Promise<LeanDocument<IHospitalResource> | null> {
    try {
      const deletedHospitalResource = await HospitalResource.findOneAndDelete({
        resourceId,
        hospitalId,
      }).exec();

      if (!deletedHospitalResource) {
        throw new HttpError("HospitalResource not found.", 404);
      }

      return deletedHospitalResource.toObject();
    } catch (error) {
      console.error("Error deleting hospital resource:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError("Failed to delete hospital resource", 500);
    }
  }

  /**
   * Delete all HospitalResources
   * @returns The number of deleted hospital resources
   */
  async deleteAllHospitalResources(): Promise<number> {
    try {
      const result = await HospitalResource.deleteMany({});
      return result.deletedCount || 0;
    } catch (error) {
      console.error("Error deleting all hospital resources:", error);
      throw new HttpError("Failed to delete all hospital resources", 500);
    }
  }

  /**
   * Delete all Resources
   * @returns The number of deleted resources
   */
  async deleteAllResources(): Promise<number> {
    try {
      const result = await Resource.deleteMany({});
      return result.deletedCount || 0;
    } catch (error) {
      console.error("Error deleting all resources:", error);
      throw new HttpError("Failed to delete all resources", 500);
    }
  }
}

export default new HospitalResourceController();
