import { Query } from "mongoose";
import request from "supertest";
import app from "../../src/app";
import MissingFollowUp, { IMissingFollowUp } from "../../src/models/MissingFollowUp";
import { Gender, Race } from "../../src/models/MissingPerson";
import * as TestDatabase from "../utils/TestDatabase";

describe("Router - MissingPesonFollowUp", () => {
  beforeAll(TestDatabase.connect);
  afterAll(TestDatabase.close);

  const createMissingPersonReport = async () => {
    const response = await request(app)
      .post("/api/missingPerson/register") // Changed endpoint
      .send({
        name: "John Doe",
        age: 30,
        race: Race.White,
        gender: Gender.Male,
        dateLastSeen: new Date().toISOString(),
        // Optional fields
        weight: 180,
        height: 175,
        eyeColor: "blue",
        description: "Last seen wearing blue jeans and white t-shirt",
        locationLastSeen: "Central Park, New York",
      });
    
    return response.body._id;
  };

  it("should not create follow up if reference report not exist: 404", async () => {
    const newFollowUp = {
      reportId: "661f8c7e2c2a4a8f4b1d7e9a",
      isSpotted: true,
      locationSpotted: "some location",
      datetimeSpotted: "2025-10-25T19:03",
      additionalComment: "some comment",
    };
    await request(app)
      .post("/api/missing-person-followup/")
      .send(newFollowUp)
      .expect(404);
  });

  it("should return 400 if reportId is not valid format (mongo _id hexstring)", async () => {
    const newFollowUp = {
      reportId: "",
      isSpotted: true,
      locationSpotted: "some location",
      datetimeSpotted: "2025-10-25T19:03",
      additionalComment: "some comment",
    };
    await request(app)
      .post("/api/missing-person-followup/")
      .send(newFollowUp)
      .expect(400);
  });

  it("should add Followup info when reference report exist: 201", async () => {
    // add a reference report
    const reportId = await createMissingPersonReport();
    console.log("reportId", reportId);

    // add follow up
    const newFollowUp = {
      reportId: reportId,
      isSpotted: true,
      locationSpotted: "some location",
      datetimeSpotted: "2025-10-25T19:03",
      additionalComment: "some comment",
    };
    const res = await request(app)
      .post("/api/missing-person-followup/")
      .send(newFollowUp)
      .expect(201);

    expect(res.body.isSpotted).toBe(true);
    expect(res.body.additionalComment).toBe("some comment");
  });

  it("should return 500 on any server error", async () => {
    // add a reference report
    const reportId = await createMissingPersonReport();

    jest
      .spyOn(MissingFollowUp.prototype, "save")
      .mockRejectedValueOnce(new Error("Simulated database failure"));

    // add follow up
    const newFollowUp = {
      reportId: reportId,
      isSpotted: true,
      locationSpotted: "some location",
      datetimeSpotted: "2025-10-25T19:03",
      additionalComment: "some comment",
    };
    await request(app)
      .post("/api/missing-person-followup/")
      .send(newFollowUp)
      .expect(500);
  });

  it('should return 200 and all followups for a reportId', async() => {
    const reportId = await createMissingPersonReport();
        
    const newFollowUp = {
        reportId: reportId,
        isSpotted: true,
        locationSpotted: "some location",
        datetimeSpotted: "2025-10-25T19:03",
        additionalComment: "some comment",
      };

    await request(app)
        .post("/api/missing-person-followup/")
        .send(newFollowUp)
        .expect(201);

    const getResult = await request(app)
        .get(`/api/missing-person-followup/report/${reportId}`)
        .expect(200)

    expect(getResult).toBeDefined();
    expect(getResult.body[0].reportId).toStrictEqual(reportId);
  })

  it('should return 500 on server/db error for get all followups', async() => {
    const reportId = "notexist";

    const fakeQuery: Partial<Query<IMissingFollowUp[], IMissingFollowUp>> = {
        exec: () => Promise.reject(new Error("Mocked MongoDB error")),
      };
  
      // Mock MissingFollowup.find to return the fake query
      jest
        .spyOn(MissingFollowUp, "find")
        .mockReturnValue(
          fakeQuery as Query<IMissingFollowUp[], IMissingFollowUp>,
        );

    await request(app)
        .get(`/api/missing-person-followup/report/${reportId}`)
        .expect(500)
  })

  it('should return 200 and individual followup', async()=>{
    const reportId = await createMissingPersonReport();
        
    const newFollowUp = {
        reportId: reportId,
        isSpotted: true,
        locationSpotted: "some location",
        datetimeSpotted: "2025-10-25T19:03",
        additionalComment: "some comment",
      };

    const res = await request(app)
        .post("/api/missing-person-followup/")
        .send(newFollowUp)
        .expect(201);

    const id = res.body._id

    const singleGetResult = await request(app)
      .get(`/api/missing-person-followup/single/${id}`)
      .expect(200);
    
    expect(singleGetResult).toBeDefined();
    expect(singleGetResult.body.reportId).toStrictEqual(reportId);
  })

  it('should return 500 on server/db error for get single followup', async() => {
    const id = "someid";

    const fakeQuery: Partial<Query<IMissingFollowUp[], IMissingFollowUp>> = {
        exec: () => Promise.reject(new Error("Mocked MongoDB error")),
      };
  
      // Mock MissingFollowup.find to return the fake query
      jest
        .spyOn(MissingFollowUp, "findOne")
        .mockReturnValue(
          fakeQuery as Query<IMissingFollowUp[], IMissingFollowUp>,
        );

    await request(app)
        .get(`/api/missing-person-followup/single/${id}`)
        .expect(500)
  })
});
