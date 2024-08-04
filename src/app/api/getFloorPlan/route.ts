import fs from 'fs';
import { readFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const buildingCode = req.headers.get('buildingCode');
    const floorLevel = req.headers.get('floorLevel');

    const floorPlanPath = `public/json/${buildingCode}/${buildingCode}-${floorLevel}-outline.json`;

    if (!fs.existsSync(floorPlanPath)) {
      return NextResponse.json({ status: 200 });
    }

    const data = await readFile(floorPlanPath, 'utf8');
    const floorPlan = await JSON.parse(data);

    return new NextResponse(JSON.stringify({ floorPlan }), {
      status: 200,
    });
  } catch (e) {
    // Javascript Error Message
    // console.log(e);
    return new NextResponse(
      JSON.stringify({
        error: String(e),
        // error: String(e.stack),
      }),
      {
        status: 500,
      },
    );
  }
}
