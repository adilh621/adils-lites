import { NextRequest, NextResponse } from "next/server";
import { getLifxToken } from "@/lib/lifx";

/**
 * GET /api/lifx/scenes
 * Fetches list of LIFX scenes from the LIFX API
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

    const response = await fetch(
      `https://api.lifx.com/v1/scenes`,
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
        { error: "Failed to fetch scenes from LIFX" },
        { status: response.status }
      );
    }

    const scenes = await response.json();
    return NextResponse.json(scenes);
  } catch (error) {
    console.error("Error fetching scenes:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching scenes" },
      { status: 500 }
    );
  }
}
