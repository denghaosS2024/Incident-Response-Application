import Inventory from "../../src/models/Inventory";

jest.mock("../../src/models/Inventory", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    }),
    find: jest.fn(),
  },
}));


import InventoryController from "../../src/controllers/InventoryController";

describe("InventoryController - Get Inventory by Category", () => {
  const defaultInventory = {
    category: "default",
    items: [
      { name: "Medical Kit", quantity: 10 },
      { name: "Repair Tools", quantity: 5 },
    ],
  };

  const truckInventory = {
    category: "truck1",
    items: [
      { name: "Medical Kit", quantity: 5 },
      { name: "Repair Tools", quantity: 2 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock `Inventory.findOne` to return an object with a mocked `exec` method
    (Inventory.findOne as jest.Mock).mockImplementation(({ category }) => {
      if (category === "default") {
        return {
          exec: jest.fn().mockResolvedValue({ ...defaultInventory }),
        };
      }
      if (category === "truck1") {
        return {
          exec: jest.fn().mockResolvedValue({ ...truckInventory }),
        };
      }
      return {
        exec: jest.fn().mockResolvedValue(null),
      };
    });
  });

  it("should return the default inventory when category is 'default'", async () => {
    const result = await InventoryController.getInventoryByCategory("default");
    expect(result).toEqual(defaultInventory);
  });

  it("should return the truck inventory when category is 'truck1'", async () => {
    const result = await InventoryController.getInventoryByCategory("truck1");
    expect(result).toEqual(truckInventory);
  });

  it("should return an empty inventory when category does not exist", async () => {
    const result = await InventoryController.getInventoryByCategory("unknown");
    expect(result).toEqual({
      category: "unknown",
      items: [
        { name: "Medical Kit", quantity: 0 },
        { name: "Repair Tools", quantity: 0 },
      ],
    });
  });

describe("InventoryController - Update Item Quantity", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock `Inventory.findOne` specifically for updateItemQuantity
    (Inventory.findOne as jest.Mock).mockImplementation(({ category }) => {
      if (category === "truck1") {
        return Promise.resolve({
          category: "truck1",
          items: [
            { name: "Medical Kit", quantity: 5 },
            { name: "Repair Tools", quantity: 2 },
          ],
          save: jest.fn().mockResolvedValue(true),
        });
      }
      return Promise.resolve(null);
    });
  });

  it("should successfully update item quantity", async () => {
    const result = await InventoryController.updateItemQuantity("truck1", "Medical Kit", 10);
    
    expect(Inventory.findOne).toHaveBeenCalledWith({ category: "truck1" });
    expect(result.items[0].quantity).toBe(10);
    expect(result.save).toHaveBeenCalled();
  });

  it("should throw error if category is not provided", async () => {
    await expect(
      InventoryController.updateItemQuantity(null, "Medical Kit", 10)
    ).rejects.toThrow("Category and item name are required");
  });

  it("should throw error if item name is not provided", async () => {
    await expect(
      InventoryController.updateItemQuantity("truck1", null, 10)
    ).rejects.toThrow("Category and item name are required");
  });

  it("should throw error if quantity is undefined", async () => {
    await expect(
      InventoryController.updateItemQuantity("truck1", "Medical Kit", undefined)
    ).rejects.toThrow("A valid non-negative integer quantity is required");
  });

  it("should throw error if quantity is not an integer", async () => {
    await expect(
      InventoryController.updateItemQuantity("truck1", "Medical Kit", 10.5)
    ).rejects.toThrow("A valid non-negative integer quantity is required");
  });

  it("should throw error if quantity is negative", async () => {
    await expect(
      InventoryController.updateItemQuantity("truck1", "Medical Kit", -5)
    ).rejects.toThrow("A valid non-negative integer quantity is required");
  });

  it("should throw error if inventory with category not found", async () => {
    await expect(
      InventoryController.updateItemQuantity("nonexistent", "Medical Kit", 10)
    ).rejects.toThrow("Inventory with category 'nonexistent' not found");
  });

  it("should throw error if item not found in inventory", async () => {
    await expect(
      InventoryController.updateItemQuantity("truck1", "Nonexistent Item", 10)
    ).rejects.toThrow("Item 'Nonexistent Item' not found in category 'truck1'");
  });

  it("should update quantity to 0 successfully", async () => {
    const result = await InventoryController.updateItemQuantity("truck1", "Medical Kit", 0);
    
    expect(result.items[0].quantity).toBe(0);
    expect(result.save).toHaveBeenCalled();
  });
});

describe("InventoryController - getAllNonDefaultInventories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all inventories with category not equal to 'default'", async () => {
    const mockInventories = [
      { category: "truck1", items: [] },
      { category: "truck2", items: [] },
    ];

    (Inventory.find as jest.Mock).mockResolvedValue(mockInventories);

    const result = await InventoryController.getAllNonDefaultInventories();

    expect(Inventory.find).toHaveBeenCalledWith({ category: { $ne: "default" } });
    expect(result).toEqual(mockInventories);
  });
});
});
