import request from "supertest";
import app from "../../src/app";
import * as TestDatabase from "../utils/TestDatabase";
import Inventory from "../../src/models/Inventory";

describe("Router - Inventory", () => {
  afterAll(TestDatabase.close);

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

  beforeAll(async () => {
    await TestDatabase.connect();

    await Inventory.create(defaultInventory);
    await Inventory.create(truckInventory);
  });

  it("should return the default inventory when category is 'default'", async () => {
    const { body } = await request(app)
      .get("/api/inventories/category/default")
      .expect(200);

    expect(body).toMatchObject(defaultInventory);
  });

  it("should return the truck inventory when category is 'truck1'", async () => {
    const { body } = await request(app)
      .get("/api/inventories/category/truck1")
      .expect(200);

    expect(body).toMatchObject(truckInventory);
  });

  it("should return an empty inventory when category does not exist", async () => {
    const { body } = await request(app)
      .get("/api/inventories/category/unknown")
      .expect(200);

    expect(body).toMatchObject({
      category: "unknown",
      items: [
        { name: "Medical Kit", quantity: 0 },
        { name: "Repair Tools", quantity: 0 },
      ],
    });
  });
});
