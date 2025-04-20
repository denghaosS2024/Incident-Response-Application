import Inventory from "../../src/models/Inventory";

jest.mock("../../src/models/Inventory", () => ({
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({}),
  }),
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
});
