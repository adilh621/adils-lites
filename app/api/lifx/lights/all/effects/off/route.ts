import { NextRequest, NextResponse } from "next/server";
import { getLifxToken } from "@/lib/lifx";

/**
 * POST /api/lifx/lights/all/effects/off
 * Stops any running effects on all lights
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

    const body = await request.json().catch(() => ({}));
    const { power_off = false } = body;

    const effectParams: any = {
      power_off,
    };

    const response = await fetch(
      `https://api.lifx.com/v1/lights/all/effects/off`,
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
        { error: "Failed to stop effects" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error stopping effects:", error);
    return NextResponse.json(
      { error: "An error occurred while stopping effects" },
      { status: 500 }
    );
  }
}
