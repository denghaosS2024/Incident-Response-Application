import request from "supertest";
import app from "../../src/app";
import Inventory from "../../src/models/Inventory";
import * as TestDatabase from "../utils/TestDatabase";

describe("Router - Inventory", () => {
  afterAll(async () => {
    await Inventory.deleteMany({});
    await TestDatabase.close();
  });

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
    await Inventory.deleteMany({});
    await Inventory.create(defaultInventory);
    await Inventory.create(truckInventory);
  });

  it("should return the default inventory when category is 'default'", async () => {
    const { body } = await request(app)
      .get("/api/inventories/category/default")
      .expect(200);

    expect(body).toMatchObject(
      expect.objectContaining({
        category: defaultInventory.category,
        items: expect.arrayContaining(
          defaultInventory.items.map((item) => expect.objectContaining(item)),
        ),
      }),
    );
  });

  it("should return the truck inventory when category is 'truck1'", async () => {
    const { body } = await request(app)
      .get("/api/inventories/category/truck1")
      .expect(200);

    expect(body).toMatchObject(
      expect.objectContaining({
        category: truckInventory.category,
        items: expect.arrayContaining(
          truckInventory.items.map((item) => expect.objectContaining(item)),
        ),
      }),
    );
  });

  it("should return an empty inventory when category does not exist", async () => {
    const { body } = await request(app)
      .get("/api/inventories/category/unknown")
      .expect(200);

    expect(body).toMatchObject(
      expect.objectContaining({
        category: "unknown",
        items: expect.arrayContaining([
          expect.objectContaining({ name: "Medical Kit", quantity: 0 }),
          expect.objectContaining({ name: "Repair Tools", quantity: 0 }),
        ]),
      }),
    );
  });


describe("PATCH /api/inventories/category/:category/item/:itemName", () => {
    it("should update quantity for an existing item in truck1 inventory", async () => {
      const { body } = await request(app)
        .patch("/api/inventories/category/truck1/item/Medical Kit")
        .send({ quantity: 8 })
        .expect(200);

      expect(body).toHaveProperty("result");

      const updatedInventory = await Inventory.findOne({ category: "truck1" });
      const medicalKit = updatedInventory?.items.find(item => item.name === "Medical Kit");
      expect(medicalKit?.quantity).toBe(8);
    });

    it("should update quantity to 0 for an existing item", async () => {
      const { body } = await request(app)
        .patch("/api/inventories/category/truck1/item/Repair Tools")
        .send({ quantity: 0 })
        .expect(200);

      expect(body).toHaveProperty("result");

      // Verify the update in database
      const updatedInventory = await Inventory.findOne({ category: "truck1" });
      const repairTools = updatedInventory?.items.find(item => item.name === "Repair Tools");
      expect(repairTools?.quantity).toBe(0);
    });

    it("should return 400 if quantity is not provided", async () => {
      const { body } = await request(app)
        .patch("/api/inventories/category/truck1/item/Medical Kit")
        .send({})
        .expect(400);

      expect(body).toEqual({
        error: "A valid non-negative integer quantity is required"
      });
    });

    it("should return 400 for negative quantity", async () => {
      const { body } = await request(app)
        .patch("/api/inventories/category/truck1/item/Medical Kit")
        .send({ quantity: -5 })
        .expect(400);

      expect(body).toEqual({
        error: "A valid non-negative integer quantity is required"
      });
    });

    it("should return 400 for non-integer quantity", async () => {
      const { body } = await request(app)
        .patch("/api/inventories/category/truck1/item/Medical Kit")
        .send({ quantity: 5.5 })
        .expect(400);

      expect(body).toEqual({
        error: "A valid non-negative integer quantity is required"
      });
    });

    it("should return 404 if category does not exist", async () => {
      const { body } = await request(app)
        .patch("/api/inventories/category/nonexistent/item/Medical Kit")
        .send({ quantity: 10 })
        .expect(404);

      expect(body).toHaveProperty("error");
      expect(body.error).toContain("not found");
    });

    it("should return 404 if item does not exist in the category", async () => {
      const { body } = await request(app)
        .patch("/api/inventories/category/truck1/item/Nonexistent Item")
        .send({ quantity: 10 })
        .expect(404);

      expect(body).toHaveProperty("error");
      expect(body.error).toContain("not found");
    });

    it("should handle URL-encoded item names", async () => {
      // Add an item with space in name to test URL encoding
      await Inventory.findOneAndUpdate(
        { category: "truck1" },
        { $push: { items: { name: "First Aid Kit", quantity: 15 } } },
      );

      const { body } = await request(app)
        .patch("/api/inventories/category/truck1/item/First%20Aid%20Kit")
        .send({ quantity: 20 })
        .expect(200);

      expect(body).toHaveProperty("result");

      // Verify the update in database
      const updatedInventory = await Inventory.findOne({ category: "truck1" });
      const firstAidKit = updatedInventory?.items.find(item => item.name === "First Aid Kit");
      expect(firstAidKit?.quantity).toBe(20);
    });
  });

describe("GET /api/inventories/default/item/:itemName", () => {
    it("should return quantity for an existing item in default inventory", async () => {
      const { body } = await request(app)
        .get("/api/inventories/default/item/Medical Kit")
        .expect(200);

      expect(body.name).toBe("Medical Kit");
      expect(body.quantity).toBe(10);
      expect(body.description).toBe("");
    });

    it("should return quantity for another existing item in default inventory", async () => {
      const { body } = await request(app)
        .get("/api/inventories/default/item/Repair Tools")
        .expect(200);

      expect(body.name).toBe("Repair Tools");
      expect(body.quantity).toBe(5);
      expect(body.description).toBe("");
    });

    it("should return quantity 0 for a non-existent item in default inventory", async () => {
      const { body } = await request(app)
        .get("/api/inventories/default/item/Non-existent Item")
        .expect(200);

      expect(body).toEqual({
        name: "Non-existent Item",
        quantity: 0,
      });
    });

    it("should handle URL-encoded item names", async () => {
      // Add an item with space in name first
      await Inventory.findOneAndUpdate(
        { category: "default" },
        { $push: { items: { name: "First Aid Kit", quantity: 15, description: "", icon: "Emergency" } } },
      );

      const { body } = await request(app)
        .get("/api/inventories/default/item/First%20Aid%20Kit")
        .expect(200);

      expect(body.name).toBe("First Aid Kit");
      expect(body.quantity).toBe(15);
      expect(body.description).toBe("");
    });

    it("should handle spaces in item names properly", async () => {
      // Add an item with space in name first
      await Inventory.findOneAndUpdate(
        { category: "default" },
        { $push: { items: { name: "First Aid Kit", quantity: 15, description: "", icon: "Emergency" } } },
      );

      const { body } = await request(app)
        .get("/api/inventories/default/item/First Aid Kit")
        .expect(200);

      expect(body.name).toBe("First Aid Kit");
      expect(body.quantity).toBe(15);
      expect(body.description).toBe("");
    });


    it("should return case-sensitive item match", async () => {
      const { body } = await request(app)
        .get("/api/inventories/default/item/medical kit") // lowercase
        .expect(200);

      // Should not find the item with lowercase name
      expect(body).toEqual({
        name: "medical kit",
        quantity: 0,
      });
    });


    it("should handle empty item name parameter", async () => {
      const { body } = await request(app)
        .get("/api/inventories/default/item/")
        .expect(404); // This will likely result in a 404 due to route not matching

      // Express might not even route this properly, but let's test it
      expect(body).toBeDefined();
    });
  });

describe("GET /api/inventories/non-default", () => {
    it("should return all inventories except the default one", async () => {
      const { body } = await request(app)
        .get("/api/inventories/non-default")
        .expect(200);

      expect(body).toHaveLength(1);
      
      expect(body[0].category).toBe("truck1");

    });

    it("should return empty array when only default inventory exists", async () => {
      // Remove all inventories except default
      await Inventory.deleteMany({ category: { $ne: "default" } });

      const { body } = await request(app)
        .get("/api/inventories/non-default")
        .expect(200);

      expect(body).toEqual([]);
    });

    it("should return empty array when no inventories exist", async () => {
      // Remove all inventories
      await Inventory.deleteMany({});

      const { body } = await request(app)
        .get("/api/inventories/non-default")
        .expect(200);

      expect(body).toEqual([]);
    });


});

});