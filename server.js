const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

console.log('Starting Famoly Drive server...')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', process.env.PORT)

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 8080

console.log('Server configuration:', { dev, hostname, port })

// Next.jsアプリケーション初期化
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

console.log('Preparing Next.js app...')

app.prepare()
  .then(() => {
    console.log('Next.js app prepared successfully')
    
    createServer(async (req, res) => {
      try {
        console.log(`Request: ${req.method} ${req.url}`)
        
        // Parse the request URL
        const parsedUrl = parse(req.url, true)
        
        // Handle the request with Next.js
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        console.error('Stack trace:', err.stack)
        
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          error: 'Internal Server Error',
          message: dev ? err.message : 'Something went wrong',
          timestamp: new Date().toISOString()
        }))
      }
    })
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, hostname, () => {
      console.log(`✅ Famoly Drive server ready on http://${hostname}:${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to prepare Next.js app:', err)
    console.error('Stack trace:', err.stack)
    process.exit(1)
  })