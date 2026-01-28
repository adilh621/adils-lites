import { NextRequest, NextResponse } from "next/server";
import { getLifxToken } from "@/lib/lifx";

/**
 * PUT /api/lifx/scenes/[uuid]/activate
 * Activates a LIFX scene by UUID
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await context.params;
    const token = getLifxToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "LIFX API token not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      duration = 1,
      fast = false,
    } = body;

    const response = await fetch(
      `https://api.lifx.com/v1/scenes/scene_id:${uuid}/activate`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration,
          fast,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LIFX API error:", errorText);
      return NextResponse.json(
        { error: "Failed to activate scene" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error activating scene:", error);
    return NextResponse.json(
      { error: "An error occurred while activating scene" },
      { status: 500 }
    );
  }
}
