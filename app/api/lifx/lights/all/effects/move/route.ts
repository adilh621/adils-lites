import { NextRequest, NextResponse } from "next/server";
import { getLifxToken } from "@/lib/lifx";

/**
 * POST /api/lifx/lights/all/effects/move
 * Applies move effect to all lights (zones)
 */
export async function POST(request: NextRequest) {
  try {
    const token = getLifxToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "LIFX API token not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      direction = "forward",
      period = 1,
      cycles = null,
      power_on = true,
      fast = false,
    } = body;

    const effectParams: any = {
      direction,
      period,
      power_on,
      fast,
    };

    if (cycles !== null) {
      effectParams.cycles = cycles;
    }

    const response = await fetch(
      `https://api.lifx.com/v1/lights/all/effects/move`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(effectParams),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LIFX API error:", errorText);
      return NextResponse.json(
        { error: "Failed to apply move effect" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error applying move effect:", error);
    return NextResponse.json(
      { error: "An error occurred while applying effect" },
      { status: 500 }
    );
  }
}
