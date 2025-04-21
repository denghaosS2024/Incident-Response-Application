import Inventory, { IInventory, IInventoryItem } from "../models/Inventory";

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
              { name: "Medical Kit", quantity: 10, icon: "Medical Kit" },
              { name: "Repair Tools", quantity: 5, icon: "Repair Tools" },
              {
                name: "Emergency",
                description: "Emergency response equipment",
                quantity: 22,
                icon: "Hardware",
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

  async updateItemQuantity(category, itemName, newQuantity) {
    try {
      if (!category || !itemName) {
        throw new Error("Category and item name are required");
      }

      if (
        newQuantity === undefined ||
        !Number.isInteger(newQuantity) ||
        newQuantity < 0
      ) {
        throw new Error("A valid non-negative integer quantity is required");
      }

      const inventory = await Inventory.findOne({ category });

      if (!inventory) {
        throw new Error(`Inventory with category '${category}' not found`);
      }

      const item = inventory.items.find((item) => item.name === itemName);

      if (!item) {
        throw new Error(
          `Item '${itemName}' not found in category '${category}'`,
        );
      }

      item.quantity = newQuantity;

      await inventory.save();

      return inventory;
    } catch (error) {
      throw error;
    }
  }

  async addItemToDefaultCategory(item: IInventoryItem) {
    const category = "default";
    const inventory = await Inventory.findOne({ category });

    if (!inventory) {
      const newInventory = new Inventory({
        category,
        items: [item],
      });
      return await newInventory.save();
    }

    const existingItem = inventory.items.find((i) => i.name === item.name);
    if (existingItem) {
      existingItem.quantity += item.quantity;
      if (item.description) existingItem.description = item.description;
      if (item.icon) existingItem.icon = item.icon;
    } else {
      inventory.items.push(item);
    }

    return await inventory.save();
  }

  async addNewTruckCategory(name: string) {
    const defaultInventory = await Inventory.findOne({
      category: "default",
    }).lean();

    if (
      !defaultInventory ||
      !defaultInventory.items ||
      defaultInventory.items.length === 0
    ) {
      throw new Error("Default inventory not found or has no items.");
    }

    // 3. Clone the items with quantity 0
    const clonedItems = defaultInventory.items.map((item: IInventoryItem) => ({
      name: item.name,
      quantity: 0,
      icon: item.icon,
      description: item.description,
    }));

    // 4. Create new inventory category using the truck's name
    await Inventory.create({
      category: name,
      items: clonedItems,
    });
  }

  async deleteInventoryByCategory(category: string) {
    await Inventory.deleteOne({ category });
  }

  async getItemByName(name: string) {
    const inventory = await Inventory.findOne({ category: "default" });

    if (inventory) {
      // Look for the item in the 'items' array
      return inventory.items.find((item) => item.name === name);
    }

    // Return null if no inventory document or item is found
    return null;
  }

  async addOrUpdateItemInDefaultCategory(itemData: {
    name: string;
    quantity: number;
    description?: string;
    icon: string;
  }) {
    const { name, quantity, description, icon } = itemData;

    // Try to find the "default" category inventory
    let inventory = await Inventory.findOne({ category: "default" });

    if (!inventory) {
      // If it doesn't exist, create it and add the item
      inventory = new Inventory({
        category: "default",
        items: [{ name, quantity, description, icon }],
      });
    } else {
      // Check if item exists
      const existingItem = inventory.items.find((item) => item.name === name);

      if (existingItem) {
        // Update the item
        existingItem.quantity = quantity;
        existingItem.description = description;
        existingItem.icon = icon;
      } else {
        // Add new item
        inventory.items.push({ name, quantity, description, icon });
      }
    }

    await inventory.save();

    // Step 2: Add the item to all other inventories if they don't have it
    const allInventories = await Inventory.find({
      category: { $ne: "default" },
    });

    for (const inventory of allInventories) {
      inventory.items.push({ name, quantity, description, icon });
      await inventory.save();
    }

    return inventory;
  }
  /**
   * Deletes an item by name from every inventory document's items array.
   * @param itemName - The name of the item to delete.
   * @returns A summary of the update result.
   */
  async deleteItemFromAllCategories(itemName: string) {
    if (!itemName) {
      throw new Error("Item name is required.");
    }
    console.log(`whatever ${itemName}`);
    const result = await Inventory.updateMany(
      {},
      { $pull: { items: { name: itemName } } },
    );

    return {
      message: `Item '${itemName}' removed from all inventories.`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }
}

export default new InventoryController();
