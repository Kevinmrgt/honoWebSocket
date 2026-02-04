import WebSocket from 'ws'
import * as readline from 'readline'

const ws = new WebSocket('ws://localhost:3000/ws')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

ws.on('open', () => {
  console.log('Connecte au serveur')
  rl.prompt()
})

ws.on('message', (data) => {
  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)
  console.log(`> ${data.toString()}`)
  rl.prompt()
})

ws.on('close', () => {
  console.log('Deconnecte')
  process.exit(0)
})

rl.on('line', (line) => {
  const text = line.trim()
  if (text) {
    ws.send(text)
  }
  rl.prompt()
})
