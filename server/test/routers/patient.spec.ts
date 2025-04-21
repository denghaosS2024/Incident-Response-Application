import request from "supertest";

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import app from "../../src/app";
import Patient from "../../src/models/Patient";
import PatientVisitEvent from "../../src/models/PatientVisitEvent";
import * as TestDatabase from "../utils/TestDatabase";

describe.skip("Router - Patient", () => {
  beforeAll(TestDatabase.connect);
  beforeEach(async () => {
    await Patient.deleteMany({});
  });

  // const createPatient = () => {
  //   return request(app)
  //     .post('/api/patients')
  //     .set('x-application-uid', new mongoose.Types.ObjectId().toString())
  //     .send({
  //       patientId: new mongoose.Types.ObjectId().toString(),
  //       name: 'Zoe1',
  //       nameLower: 'zoe',
  //       hospitalId: 'hospital123',
  //       priority: 'e',
  //       status: 'to_er',
  //       location: 'ER',
  //     })
  // }

  // const createPatient2 = () => {
  //   return request(app)
  //     .post('/api/patients')
  //     .set('x-application-uid', new mongoose.Types.ObjectId().toString())
  //     .send({
  //       patientId: new mongoose.Types.ObjectId().toString(),
  //       name: 'Zoe2',
  //       nameLower: 'zoet',
  //       hospitalId: 'hospital1299t3',
  //       priority: 'e',
  //       status: 'to_er',
  //       location: 'ER',
  //     })
  // }

  const createPatient3 = () => {
    return request(app)
      .post("/api/patients")
      .set("x-application-uid", new mongoose.Types.ObjectId().toString())
      .send({
        patientId: new mongoose.Types.ObjectId().toString(),
        name: "Zoe zzzz",
        nameLower: "zoet",
        hospitalId: "hospital1299t3",
        priority: "e",
        status: "at_er",
        location: "ER",
      });
  };

  // it('should be able to search for a patient who belongs to a certain hospital', async () => {
  //   await createPatient().expect(201)
  //   await createPatient2().expect(201)
  //   const response = await request(app)
  //     .get('/api/patients?hospitalId=hospital123')
  //     .expect(200)

  //   console.log(response.body.name)
  //   expect(response.body[0].hospitalId).toBe('hospital123')
  // })

  // it('should be able to change the location of a patient', async () => {
  //   const patient = await createPatient3()
  //   const updatedPatient = await request(app)
  //     .put(`/api/patients/${patient.body.patientId}/location`)
  //     .send({ location: 'Road' })
  //     .expect(200)

  //   expect(updatedPatient.body.location).toBe('Road')
  // })

  it("should return 400 when the location is not valid", async () => {
    const patient = await createPatient3();
    await request(app)
      .put(`/api/patients/${patient.body.patientId}/location`)
      .send({ location: "Invalid" })
      .expect(400);
  });

  it("should return 404 when the patient is not found", async () => {
    await request(app)
      .put(`/api/patients/Invalid/location`)
      .send({ location: "Road" })
      .expect(404);
  });

  afterAll(TestDatabase.close);
});

describe("GET /api/patients/timeline/:patientId", () => {
  beforeAll(TestDatabase.connect);

  afterEach(async () => {
    await Patient.deleteMany({});
    await PatientVisitEvent.deleteMany({});
  });

  afterAll(TestDatabase.close);

  it("should return 404 if patient does not exist", async () => {
    const res = await request(app)
      .get("/api/patients/timeline/nonexistent")
      .expect(404);

    expect(res.body.message).toMatch(/not found/);
  });

  it("should return 200 with correct visitLogId and events", async () => {
    const visitLogId = uuidv4();
    const patientId = "timeline-patient";

    await Patient.create({
      patientId,
      username: "user-a",
      visitLog: [
        {
          _id: visitLogId,
          incidentId: "i1",
          priority: "E",
          location: "Road",
          dateTime: new Date(),
          active: true,
        },
      ],
    });

    await PatientVisitEvent.create({
      patientId,
      visitLogId,
      changes: [
        {
          field: "priority",
          newValue: "1",
        },
        {
          field: "location",
          newValue: "ER",
        },
      ],
      snapshot: {
        _id: visitLogId,
        incidentId: "i1",
        priority: "1",
        location: "ER",
        dateTime: new Date(),
        active: true,
      },
      updatedBy: "nurse-xyz",
      timestamp: new Date(),
    });

    const res = await request(app)
      .get(`/api/patients/timeline/${patientId}`)
      .expect(200);

    expect(res.body.visitLogId).toBe(visitLogId);
    expect(res.body.events.length).toBe(1);
    expect(res.body.events[0].changes.map((c) => c.field)).toEqual(
      expect.arrayContaining(["priority", "location"]),
    );
  });
});
