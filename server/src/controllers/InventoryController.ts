import Inventory, { IInventory } from "../models/Inventory";

class InventoryController {
  private defaultInventory: IInventory | null = null;

  constructor() {
    Inventory.findOne({ category: "default" })
      .exec()
      .then((inventory) => {
        if (!inventory) {
          const newDefaultInventory = new Inventory({
            category: "default",
            items: [
              { name: "Medical Kit", quantity: 10 },
              { name: "Repair Tools", quantity: 5 },
              {
                name: "Emergency",
                description: "Emergency response equipment",
                quantity: 22,
              },
            ],
          });
          newDefaultInventory.save();
          this.defaultInventory = newDefaultInventory;
        } else {
          this.defaultInventory = inventory;
        }
      })
      .catch((err) => {
        console.error("Error fetching default inventory:", err);
      });
  }

  async getInventoryByCategory(category: string) {
    console.log("Category requested:", category);

    if (!category) {
      throw new Error("Category is required");
    }

    // Ensure default inventory is loaded
    if (!this.defaultInventory) {
      throw new Error("Default inventory not initialized");
    }

    this.defaultInventory = await Inventory.findOne({
      category: "default",
    }).exec();
    if (category === "default") {
      if (!this.defaultInventory) {
        throw new Error("Default inventory not found");
      }
      return this.defaultInventory;
    }

    // Fetch the requested inventory
    const inventory = (await Inventory.findOne({
      category,
    }).exec()) as IInventory | null;

    // If no inventory exists for the requested category, return an empty inventory
    if (!inventory && this.defaultInventory) {
      return {
        category,
        items: this.defaultInventory.items.map((item) => ({
          name: item.name,
          quantity: 0,
        })),
      };
    }

    if (!this.defaultInventory) {
      throw new Error("Default inventory not found");
    }

    // Fill in missing items from the default inventory with 0 quantity
    const mergedItems = this.defaultInventory.items.map((defaultItem) => {
      const matchingItem = inventory?.items.find(
        (item) => item.name === defaultItem.name,
      );
      return matchingItem || { name: defaultItem.name, quantity: 0 };
    });

    return {
      category: inventory?.category || category,
      items: mergedItems,
    };
  }

  async getAllNonDefaultInventories() {
    const inventories = await Inventory.find({ category: { $ne: "default" } });
    console.log("Non-default inventories:", inventories);
    return inventories;
  }
}

export default new InventoryController();
