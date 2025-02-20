import request from 'supertest'

import app from '../../src/app'
import * as TestDatabase from '../utils/TestDatabase'
import ROLES from '../../src/utils/Roles'

describe('Router - User', () => {
  beforeAll(TestDatabase.connect)

  const username = 'some-username'
  const password = 'some-password'
  const phoneNumber = '1234567890'
  const role = ROLES.POLICE

  const register = () => {
    return request(app)
      .post('/api/users')
      .send({
        username,
        password,
        phoneNumber,
        role,
      })
  }

  it('can register a new user', async () => {
    const { body: user } = await register().expect(200)

    expect(user).toMatchObject({
      _id: /.+/,
      username,
      phoneNumber,
      role,
    })
    expect(user).not.toHaveProperty('password')
    expect(user).not.toHaveProperty('__v')
  })

  it('will not allow to register a duplicate user', async () => {
    await register().expect(400)
  })

  it('will list all users with their online status', async () => {
    const { body } = await request(app)
      .get('/api/users')
      .expect(200)

    expect(body.length).toBe(1)

    const user = body[0]

    expect(user).toMatchObject({
      _id: /.+/,
      online: false,
      username,
      phoneNumber,
      role,
    })
  })

  afterAll(TestDatabase.close)
})
