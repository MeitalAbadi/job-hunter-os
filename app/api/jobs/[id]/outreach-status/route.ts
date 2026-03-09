export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/jobs/[id]/outreach-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { z } from "zod";
import type { OutreachStatus } from "@prisma/client";

const OutreachStatusUpdateSchema = z.object({
  outreachStatus: z.enum(["NOT_GENERATED", "DRAFTED", "SENT_MANUALLY", "REPLIED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = OutreachStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const updated = await db.job.update({
      where: { id: params.id },
      data: { outreachStatus: parsed.data.outreachStatus as OutreachStatus },
    });

    return NextResponse.json({ success: true, outreachStatus: updated.outreachStatus });
  } catch (error) {
    console.error("[PATCH /api/jobs/[id]/outreach-status]", error);
    return NextResponse.json({ error: "Failed to update outreach status" }, { status: 500 });
  }
}
