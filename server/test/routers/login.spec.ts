import request from "supertest";

import app from "../../src/app";
import * as TestDatabase from "../utils/TestDatabase";
import UserController from "../../src/controllers/UserController";
import ROLES from "../../src/utils/Roles";
import { IUser } from "../../src/models/User";
import * as Token from "../../src/utils/Token";

describe("Router - Login", () => {
  const username = "some-username";
  const password = "some-password";
  const role = ROLES.POLICE;
  let user: IUser;

  beforeAll(async () => {
    await TestDatabase.connect();

    user = await UserController.register(username, password, role);
  });

  it("rejects invalid username", async () => {
    await request(app)
      .post("/api/login")
      .send({
        username: "non-exist-user",
        password,
      })
      .expect(400, {
        message: 'User "non-exist-user" does not exist or incorrect password',
      });
  });

  it("rejects incorrect password", async () => {
    await request(app)
      .post("/api/login")
      .send({
        username,
        password: "fake-password",
      })
      .expect(400, {
        message: 'User "some-username" does not exist or incorrect password',
      });
  });

  it("logs in the user with correct username and password", async () => {
    const { body } = await request(app)
      .post("/api/login")
      .send({
        username,
        password,
      })
      .expect(200);

    expect(body).toMatchObject({
      token: /.+/, // not empty
      _id: user.id,
      role,
    });
    expect(body).not.toHaveProperty("password");
    expect(Token.validate(user.id, body.token)).toBeTruthy();
  });

  afterAll(TestDatabase.close);
});
