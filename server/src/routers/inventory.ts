import { Router } from "express";
import InventoryController from "../controllers/InventoryController";

export default Router()
  /**
   * @swagger
   * /api/inventories/category/{category}:
   *   get:
   *     summary: Get inventory by category
   *     description: Retrieve inventory items by their category
   *     tags: [Inventory]
   *     parameters:
   *       - in: path
   *         name: category
   *         required: true
   *         schema:
   *           type: string
   *           description: The category of the inventory to retrieve
   *     responses:
   *       200:
   *         description: Inventory retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 category:
   *                   type: string
   *                   description: The category of the inventory
   *                 items:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         description: The name of the inventory item
   *                       quantity:
   *                         type: integer
   *                         description: The quantity of the inventory item
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Error message
   */
  
  .get("/category/:category", async (req, res) => {
    const { category } = req.params;
    try {
      const inventory =
        await InventoryController.getInventoryByCategory(category);
      res.status(200).json(inventory);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });
