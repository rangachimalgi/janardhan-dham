import https from 'https';

// Only start keepAlive after server is ready (not during build/deployment)
// This should be called after the server starts listening.
export function startKeepAlive() {
  function pingServer() {
    const url = process.env.KEEPALIVE_URL || 'https://event-space-new.onrender.com';
    const req = https.get(url, { timeout: 10000 }, (res) => {
      console.log(
        `[${new Date().toISOString()}] Server pinged with response status code:`,
        res.statusCode
      );
      res.on('data', () => {});
      res.on('end', () => {});
    });

    req.on('error', (e) => {
      console.error(`[${new Date().toISOString()}] Error pinging server:`, e.message);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`[${new Date().toISOString()}] Ping request timed out`);
    });

    req.setTimeout(10000);
  }

  // Initial ping after 30 seconds (give server time to fully start)
  setTimeout(pingServer, 30000);

  // Ping every 9 minutes
  setInterval(pingServer, 540000);
  console.log('✅ KeepAlive started - will ping every 9 minutes to prevent Render spin-down');
}
