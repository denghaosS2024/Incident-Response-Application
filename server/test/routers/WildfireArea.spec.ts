import request from "supertest";

import app from "../../src/app";
import * as TestDatabase from "../utils/TestDatabase";

describe("Router - WildfireArea", () => {
  beforeAll(TestDatabase.connect);
  afterAll(TestDatabase.close);

  const areaId: string = "jfos28So";
  const coordinates: number[][] = [
    [-122.123, -124.111],
    [-122.111, -124.148],
    [-122.893, -124.248],
  ];
  const name: string = "Area 001";
  //   const containment: number = 0.5

  const create = () => {
    return request(app).post("/api/wildfire/areas").send({
      areaId,
      coordinates,
      name,
      //   containment,
    });
  };

  it("can create a new wildfire area", async () => {
    create().expect(201);
    const { body: wildfireArea } = await create().expect(201);
    expect(wildfireArea).toMatchObject({
      areaId,
      coordinates,
      name,
      //   containment,
    });
  });

  it("will not allow to create a duplicated wildfire area", async () => {
    await create().expect(400);
  });

  it("can retrieve an existing wildfire area by ID", async () => {
    const { body: wildfireArea } = await request(app)
      .get(`/api/wildfire/areas?areaId=${areaId}`)
      .expect(200);

    expect(wildfireArea).toMatchObject({
      areaId,
      coordinates,
      name,
      //   containment,
    });
  });

  it("can retrieve all wildfire area", async () => {
    const { body: wildfireAreas } = await request(app)
      .get(`/api/wildfire/areas`)
      .expect(200);
    expect(wildfireAreas).toHaveLength(1);
    expect(wildfireAreas[0]).toMatchObject({
      areaId,
      coordinates,
      name,
      //   containment,
    });
  });

  it("returns 404 when retrieving a non-existent wildfire area", async () => {
    await request(app).get("/api/wildfire/areas?areaId=1123").expect(404);
  });

  it("can update an existing wildfire area", async () => {
    const updatedData = {
      areaId: areaId,
      name: "Updated Area Name",
      //   containment: 0.8,
    };

    const { body: updatedWildfireArea } = await request(app)
      .put(`/api/wildfire/areas`)
      .send(updatedData)
      .expect(200);

    expect(updatedWildfireArea).toMatchObject({
      areaId,
      coordinates,
      name: updatedData.name,
      //   containment: updatedData.containment,
    });
  });

  it("returns 404 when updating a non-existent wildfire area", async () => {
    const updatedData = {
      areaId: "1123",
      name: "Non-existent Area",
      //   containment: 0.8,
    };

    await request(app).put("/api/wildfire/areas").send(updatedData).expect(404);
  });

  it("returns 400 when areaId and name is not provided", async () => {
    const updatedData = {
      areaId: "1123",
    };

    await request(app).put("/api/wildfire/areas").send(updatedData).expect(400);
  });

  it("can delete an existing wildfire area", async () => {
    await request(app)
      .delete(`/api/wildfire/areas?areaId=${areaId}`)
      .expect(200);

    await request(app).get(`/api/wildfire/areas?areaId=${areaId}`).expect(404);
  });

  it("returns 404 when deleting a non-existent wildfire area", async () => {
    await request(app).delete("/api/wildfire/areas?areaId=11fsdaw").expect(404);
  });
});
