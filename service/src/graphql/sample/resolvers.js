require('dotenv').config()

import uuid from 'uuid'
import pubsub from '../../pubsub'

import { log, print } from 'io.maana.shared'

const SELF = process.env.SERVICE_ID || 'io.maana.template'

// dummy in-memory store
const people = {}

export const resolver = {
  Query: {
    info: async () => {
      return {
        id: 'e5614056-8aeb-4008-b0dc-4f958a9b753a',
        name: 'io.maana.template',
        description: 'Maana Q Knowledge Service template'
      }
    }
  }
}
