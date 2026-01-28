import { NextRequest, NextResponse } from "next/server";
import { getLifxToken, getDefaultSelector, hexToLifxColor } from "@/lib/lifx";

/**
 * POST /api/lifx/state
 * Sets the state of LIFX lights (power, color, brightness)
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
      selector = getDefaultSelector(),
      power,
      color,
      brightness,
      duration = 0.5,
    } = body;

    // Build the state object for LIFX API
    const stateUpdate: any = {};

    if (power !== undefined) {
      stateUpdate.power = power;
    }

    if (color !== undefined) {
      // Convert hex color to LIFX format
      stateUpdate.color = hexToLifxColor(color);
    }

    if (brightness !== undefined) {
      // Ensure brightness is between 0 and 1
      stateUpdate.brightness = Math.max(0, Math.min(1, brightness));
    }

    if (duration !== undefined) {
      stateUpdate.duration = duration;
    }

    // Call LIFX API
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
        { error: "Failed to update light state" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating light state:", error);
    return NextResponse.json(
      { error: "An error occurred while updating light state" },
      { status: 500 }
    );
  }
}
