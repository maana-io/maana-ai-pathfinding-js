//
// External imports
//

// load .env into process.env.*
// routing engine
import express from 'express'
// middleware to allow cross-origin requests
import cors from 'cors'
// middleware to support GraphQL
import { ApolloServer } from 'apollo-server-express'
// GraphQL schema compilation
import { makeExecutableSchema } from 'graphql-tools'
// Auth0 Authentication client
import { AuthenticationClient } from 'auth0'
// Keep GraphQL stuff nicely factored
import glue from 'schemaglue'
import path from 'path'
import http from 'http'

//
// Internal imports
//
import {
  log,
  print,
  initMetrics,
  counter
} from 'io.maana.shared'


const options = {
  mode: 'js' // default
  // ignore: '**/somefileyoudonotwant.js'
}
const schemaPath = path.join(
  '.',
  `${__dirname}`.replace(process.cwd(), ''),
  'graphql/'
)
const glueRes = glue(schemaPath, options)

// Compile schema
export const schema = makeExecutableSchema({
  typeDefs: glueRes.schema,
  resolvers: glueRes.resolver
})

//
// Server setup
//
// Our service identity
const SELF = 'maana-ai-pathfinding'
const PORT = 8050
const HOSTNAME = '0.0.0.0'
const PUBLICNAME = '0.0.0.0'
const app = express()

//
// CORS
//
const corsOptions = {
  origin: `http://${PUBLICNAME}:3000`,
  credentials: true // <-- REQUIRED backend setting
}

app.use(cors(corsOptions)) // enable all CORS requests
app.options('*', cors()) // enable pre-flight for all routes

app.get('/', (req, res) => {
  res.send(`${SELF}\n`)
})

const defaultSocketMiddleware = (connectionParams, webSocket) => {
  return new Promise(function(resolve, reject) {
    log(SELF).warn(
      'Socket Authentication is disabled. This should not run in production.'
    )
    resolve()
  })
}

initMetrics(SELF.replace(/[\W_]+/g, ''))
const graphqlRequestCounter = counter('graphqlRequests', 'it counts')

const initServer = options => {
  let { httpAuthMiddleware, socketAuthMiddleware } = options

  let socketMiddleware = socketAuthMiddleware || defaultSocketMiddleware

  const server = new ApolloServer({
    schema,
    subscriptions: {
      onConnect: socketMiddleware
    }
  })

  server.applyMiddleware({
    app
  })

  const httpServer = http.createServer(app)
  server.installSubscriptionHandlers(httpServer)

  httpServer.listen({ port: PORT }, () => {
    log(SELF).info(
      `listening on ${print.external(`http://${HOSTNAME}:${PORT}/graphql`)}`
    )


  })
}

export default initServer
