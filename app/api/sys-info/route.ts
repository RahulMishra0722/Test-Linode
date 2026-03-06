import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const info = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    uptime: os.uptime(),
    cpus: os.cpus().length,
    cpuModel: os.cpus()[0]?.model,
    totalMem: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
    freeMem: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
    loadAvg: os.loadavg(),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(info);
}
