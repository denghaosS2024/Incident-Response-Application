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
    console.log("Category requested:", req.params.category);
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
  })

  /**
 * @swagger
 * /api/inventories/non-default:
 *   get:
 *     summary: Get all non-default inventory categories
 *     description: Retrieve all inventory categories except the default one
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Non-default inventory categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                     description: The category of the inventory
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: The name of the inventory item
 *                         quantity:
 *                           type: integer
 *                           description: The quantity of the inventory item
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
.get("/non-default", async (_req, res) => {
  try {
    // Get all inventory documents except the one with category "default"
    const nonDefaultInventories = await InventoryController.getAllNonDefaultInventories();
    console.log("Non-default inventories:", nonDefaultInventories);
    res.status(200).json(nonDefaultInventories);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
})


/**
 * @swagger
 * /api/inventories/default/item/{itemName}:
 *   get:
 *     summary: Get quantity for a specific item in the default category
 *     description: Retrieve quantity information for a specified item in the default category
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: itemName
 *         required: true
 *         schema:
 *           type: string
 *           description: The name of the item to retrieve quantity for
 *     responses:
 *       200:
 *         description: Item quantity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the inventory item
 *                 quantity:
 *                   type: integer
 *                   description: The quantity of the inventory item
 *       404:
 *         description: Item not found in default inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
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
.get("/default/item/:itemName", async (req, res) => {
  try {
    const { itemName } = req.params;
    
    if (!itemName) {
      return res.status(400).json({ 
        error: "Item name parameter is required" 
      });
    }
    
    // Get the default inventory
    const defaultInventory = await InventoryController.getInventoryByCategory("default");
    
    if (!defaultInventory || !defaultInventory.items) {
      return res.status(404).json({ error: "Default inventory not found" });
    }
    
    // Find the requested item
    const item = defaultInventory.items.find(item => item.name === itemName);
    
    if (item) {
      // Item found
      return res.status(200).json(item);
    } else {
      // Item not found, return with quantity 0
      return res.status(200).json({
        name: itemName,
        quantity: 0
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "An unknown error occurred" });
    }
  }
})

/**
 * @swagger
 * /api/inventories/category/{category}/item/{itemName}:
 *   patch:
 *     summary: Update quantity for a specific item in a category
 *     description: Update the quantity of a specified item in a given category
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           description: The category of the inventory
 *       - in: path
 *         name: itemName
 *         required: true
 *         schema:
 *           type: string
 *           description: The name of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: The new quantity of the item
 *     responses:
 *       200:
 *         description: Item quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                   description: The category of the inventory
 *                 item:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the inventory item
 *                     quantity:
 *                       type: integer
 *                       description: The updated quantity of the inventory item
 */
.patch("/category/:category/item/:itemName", async (req, res) => {
  try {
    const { category, itemName } = req.params;
    const { quantity } = req.body;
    
    if (!category || !itemName) {
      return res.status(400).json({ 
        error: "Category and item name parameters are required" 
      });
    }
    
    if (quantity === undefined || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ 
        error: "A valid non-negative integer quantity is required" 
      });
    }
    
    const result = await InventoryController.updateItemQuantity(category, itemName, quantity);
    
    return res.status(200).json({result});
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "An unknown error occurred" });
    }
  }
})