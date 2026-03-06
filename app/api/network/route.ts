import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate some "work" to check latency
  const start = Date.now();

  // Real check: Let's see how long a request takes to a global endpoint
  let latency = 0;
  try {
    const res = await fetch('https://1.1.1.1', {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000),
    });
    latency = Date.now() - start;
  } catch (e) {
    latency = -1;
  }

  return NextResponse.json({
    status: 'online',
    latency: latency + 'ms',
    endpoint: 'Cloudflare (1.1.1.1)',
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION || 'local-linode',
  });
}
