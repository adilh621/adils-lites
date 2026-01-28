import { NextRequest, NextResponse } from "next/server";
import { getLifxToken, hexToLifxColor } from "@/lib/lifx";

/**
 * POST /api/lifx/lights/[selector]/state
 * Sets the state of a specific LIFX light or group
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ selector: string }> }
) {
  try {
    const { selector: rawSelector } = await context.params;
    const token = getLifxToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "LIFX API token not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      power,
      color,
      brightness,
      duration = 0.5,
    } = body;

    const stateUpdate: any = {};

    if (power !== undefined) {
      stateUpdate.power = power;
    }

    if (color !== undefined) {
      stateUpdate.color = hexToLifxColor(color);
    }

    if (brightness !== undefined) {
      stateUpdate.brightness = Math.max(0, Math.min(1, brightness));
    }

    if (duration !== undefined) {
      stateUpdate.duration = duration;
    }

    const selector = decodeURIComponent(rawSelector);
    const response = await fetch(
      `https://api.lifx.com/v1/lights/${selector}/state`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stateUpdate),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LIFX API error:", errorText);
      return NextResponse.json(
        { error: "Failed to update light" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating light:", error);
    return NextResponse.json(
      { error: "An error occurred while updating light" },
      { status: 500 }
    );
  }
}
