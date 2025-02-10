import SocketIO from 'socket.io'
import { mock } from 'jest-mock-extended'

import UserConnections from '../../src/utils/UserConnections'
import * as TestDatabase from './TestDatabase'

describe('UserConnections', () => {
  beforeAll(TestDatabase.connect)

  const uid = 'fake-uid'
  const socket = mock<SocketIO.Socket>()

  it('can return user online correctly', () => {
    UserConnections.addUserConnection(uid, socket)

    const connected = UserConnections.isUserConnected(uid)
    const notConnected = UserConnections.isUserConnected('nonexist')

    expect(connected).toBe(true)
    expect(notConnected).toBe(false)
  })

  it('can list ids of all connected users', () => {
    UserConnections.addUserConnection(uid, socket)

    const uids = UserConnections.getConnectedUsers()

    expect(uids.length).toBe(1)
    expect(uids[0]).toBe(uid)
  })

  afterAll(TestDatabase.close)
})
