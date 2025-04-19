import { Router } from "express";
import InventoryController from "../controllers/InventoryController";

export default Router().get("/category/:category", async (req, res) => {
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
