import { Router } from "express";
import HospitalResourceController from "../controllers/HospitalResourceController";
import HttpError from "../utils/HttpError";

interface HospitalResourceRequest {
    hospitalId: string;
    resourceName: string;
    inStockQuantity?: number;
    inStockAlertThreshold?: number;
}

export default Router()
    /**
   * @swagger
   * /api/hospital-resource:
   *   post:
   *     summary: Create a new HospitalResource
   *     description: Check if the resource exists, create it if not, and then create a HospitalResource.
   *     tags: [HospitalResource]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hospitalId:
   *                 type: string
   *               resourceName:
   *                 type: string
   *               inStockQuantity:
   *                 type: number
   *               inStockAlertThreshold:
   *                 type: number
   *     responses:
   *       201:
   *         description: HospitalResource created successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Server error
   */
    .post("/", async (request, response) => {
      try {
        const hospitalResource: HospitalResourceRequest = request.body;
  
        // Validate required fields
        const { hospitalId, resourceName, inStockQuantity, inStockAlertThreshold } = hospitalResource;
  
        if (!hospitalId || !resourceName || inStockQuantity === undefined) {
          throw new HttpError("hospitalId, resourceName, and inStockQuantity are mandatory fields.", 400);
        }
  
        // Step 1: Call the controller to check or create the resource
        const resource = await HospitalResourceController.createResource({ resourceName });
  
        // Step 2: Use the resourceId to create the HospitalResource
        const hospitalResourceData = {
          resourceId: resource.resourceId,
          hospitalId,
          inStockQuantity,
          inStockAlertThreshold,
        };
  
        const result = await HospitalResourceController.createHospitalResource(hospitalResourceData);
        
        const returnHospitalResource: HospitalResourceRequest = {
          hospitalId: result.hospitalId,
          resourceName: resource.resourceName,
          inStockQuantity: result.inStockQuantity,
          inStockAlertThreshold: result.inStockAlertThreshold,
        }

        // Step 3: Return the result in the front-end friendly format
        return response.status(201).send(returnHospitalResource);
      } catch (e) {
        if (e instanceof HttpError) {
          return response.status(e.statusCode).send({ message: e.message });
        }
        const error = e as Error;
        return response.status(500).send({ message: error.message });
      }
    })
  
    /**
   * @swagger
   * /api/hospital-resource:
   *   put:
   *     summary: Update a HospitalResource
   *     description: Update a specific HospitalResource by resourceId or resourceName.
   *     tags: [HospitalResource]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hospitalId:
   *                 type: string
   *               resourceId:
   *                 type: string
   *               resourceName:
   *                 type: string
   *               inStockQuantity:
   *                 type: number
   *               inStockAlertThreshold:
   *                 type: number
   *     responses:
   *       200:
   *         description: HospitalResource updated successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: HospitalResource not found
   *       500:
   *         description: Server error
   */
  .put("/", async (request, response) => {
    try {
      const hospitalResource: HospitalResourceRequest = request.body;

      if (!hospitalResource.hospitalId || (!hospitalResource.resourceName)) {
        throw new HttpError("hospitalId and either resourceId or resourceName are mandatory fields.", 400);
      }

      // Step 1: Resolve resourceId if only resourceName is provided

      const resource = await HospitalResourceController.createResource({ resourceName: hospitalResource.resourceName });
      const resourceId = resource.resourceId;

      // Step 2: Update the hospital resource
      const updatedResource = await HospitalResourceController.updateHospitalResource({
        hospitalId: hospitalResource.hospitalId,
        resourceId,
        inStockQuantity: hospitalResource.inStockQuantity,
        inStockAlertThreshold: hospitalResource.inStockAlertThreshold,
      });

      if (!updatedResource) {
        throw new HttpError("HospitalResource not found.", 404);
      }

      // Step 3: Return the updated resource in the front-end friendly format
      const returnHospitalResource: HospitalResourceRequest = {
        hospitalId: updatedResource.hospitalId,
        resourceName: hospitalResource.resourceName,
        inStockQuantity: updatedResource.inStockQuantity,
        inStockAlertThreshold: updatedResource.inStockAlertThreshold,
      }
      return response.status(200).send(returnHospitalResource);

    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/hospital-resource/{resourceName}:
   *   get:
   *     summary: Get all hospitals with a specific resource
   *     description: Fetch all hospitals that have a specific resource by resourceName.
   *     tags: [HospitalResource]
   *     parameters:
   *       - in: path
   *         name: resourceName
   *         description: Name of the resource
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Hospitals retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   hospitalId:
   *                     type: string
   *                   resourceName:
   *                     type: string
   *                   inStockQuantity:
   *                     type: number
   *                   inStockAlertThreshold:
   *                     type: number
   *       400:
   *         description: Bad request
   *       404:
   *         description: No hospitals found
   *       500:
   *         description: Server error
   */
  .get("/:resourceName", async (request, response) => {
    try {
      const { resourceName } = request.params;
  
      // Validate the resourceName parameter
      if (!resourceName) {
        throw new HttpError("resourceName parameter is required.", 400);
      }
  
      // Fetch all hospitals with the specified resourceName
      const hospitals = await HospitalResourceController.getHospitalsByResourceName(resourceName);
  
      // Transform the result to match the front-end format
      const result = hospitals.map((hospitalResource) => ({
        hospitalId: hospitalResource.hospitalId,
        resourceName,
        inStockQuantity: hospitalResource.inStockQuantity,
        inStockAlertThreshold: hospitalResource.inStockAlertThreshold,
      }));
  
      return response.status(200).send(result);
    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  });