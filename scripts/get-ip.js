#!/usr/bin/env node

/**
 * Helper script to find your local IP address
 * Run: node scripts/get-ip.js
 */

import { networkInterfaces } from 'os';

const nets = networkInterfaces();
const results = {};

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === 'IPv4' && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

console.log('\n🌐 Your Local IP Addresses:\n');
for (const [interfaceName, addresses] of Object.entries(results)) {
  console.log(`${interfaceName}:`);
  addresses.forEach(ip => {
    console.log(`  → ${ip}`);
  });
}

if (Object.keys(results).length === 0) {
  console.log('No network interfaces found.');
} else {
  const firstIP = Object.values(results)[0][0];
  console.log(`\n💡 Recommended IP for physical devices: ${firstIP}`);
  console.log(`\nUpdate src/config/api.js with:`);
  console.log(`const IP_ADDRESS = '${firstIP}';`);
}

console.log('');
