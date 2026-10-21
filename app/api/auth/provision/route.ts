import { NextResponse } from 'next/server';
export const dynamic='force-dynamic';
export const POST=async()=>NextResponse.json({success:false,error:'PROVISIONING_NOT_APPROVED',connected:false,courseDeliveryEnabled:false,automationEligible:false,tradingEnabled:false},{status:403,headers:{'Cache-Control':'private, no-store'}});
