import { NextRequest, NextResponse } from "next/server";
import { getLifxToken, hexToLifxColor } from "@/lib/lifx";

/**
 * POST /api/lifx/lights/all/effects/breathe
 * Applies breathe effect to all lights
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
      color,
      period = 1,
      cycles = 3,
      power_on = true,
      persist = false,
      peak = 0.5,
    } = body;

    const effectParams: any = {
      period,
      cycles,
      power_on,
      persist,
      peak,
    };

    if (color) {
      effectParams.color = hexToLifxColor(color);
    }

    const response = await fetch(
      `https://api.lifx.com/v1/lights/all/effects/breathe`,
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
        { error: "Failed to apply breathe effect" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error applying breathe effect:", error);
    return NextResponse.json(
      { error: "An error occurred while applying effect" },
      { status: 500 }
    );
  }
}
