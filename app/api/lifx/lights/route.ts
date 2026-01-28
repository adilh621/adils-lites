import { NextRequest, NextResponse } from "next/server";
import { getLifxToken, getDefaultSelector } from "@/lib/lifx";

/**
 * GET /api/lifx/lights
 * Fetches list of LIFX lights from the LIFX API
 * Accepts optional ?selector query parameter
 */
export async function GET(request: NextRequest) {
  try {
    const token = getLifxToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "LIFX API token not configured" },
        { status: 500 }
      );
    }

    // Get selector from query params or use default
    const { searchParams } = new URL(request.url);
    const selector = searchParams.get("selector") || getDefaultSelector();

    // Call LIFX API
    const response = await fetch(
      `https://api.lifx.com/v1/lights/${selector}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LIFX API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch lights from LIFX" },
        { status: response.status }
      );
    }

    const lights = await response.json();
    return NextResponse.json(lights);
  } catch (error) {
    console.error("Error fetching lights:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching lights" },
      { status: 500 }
    );
  }
}
