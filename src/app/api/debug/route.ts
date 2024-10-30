import { NextResponse } from 'next/server';

export const GET = async () => {
  // Check environment variables
  const envCheck = {
    hasUrl: !!process.env.POSTGRES_URL,
    urlPreview: process.env.POSTGRES_URL?.substring(0, 20) + '...',
    allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('POSTGRES')),
    nodeEnv: process.env.NODE_ENV
  };

  // Log to server console
  console.log('Environment Check:', envCheck);

  return NextResponse.json({
    check: envCheck,
    timestamp: new Date().toISOString()
  });
}; 