import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { createNodeWebSocket } from '@hono/node-ws'
import type { WSContext } from 'hono/ws'

const app = new Hono()

const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app })

const clients = new Set<WSContext>()

function broadcast(message: string) {
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
}

app.get('/ws', upgradeWebSocket(() => {
  return {
    onOpen(_evt, ws) {
      clients.add(ws)
      console.log(`Nouvelle connexion (${clients.size} connectes)`)
      broadcast(`Quelqu'un a rejoint le chat (${clients.size} connectes)`)
    },

    onMessage(evt, ws) {
      const message = typeof evt.data === 'string' ? evt.data : ''
      console.log(`Message recu : ${message}`)
      broadcast(message)
    },

    onClose(_evt, ws) {
      clients.delete(ws)
      console.log(`Deconnexion (${clients.size} connectes)`)
      broadcast(`Quelqu'un a quitte le chat (${clients.size} connectes)`)
    },

    onError(_evt, ws) {
      clients.delete(ws)
    },
  }
}))

const server = serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Serveur lance sur http://localhost:${info.port}`)
})

injectWebSocket(server)
