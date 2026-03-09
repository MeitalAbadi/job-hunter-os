export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { ApplicationUpdateSchema } from "../../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = ApplicationUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const context = await getOrCreateSingleUserContext();

    const existing = await db.application.findFirst({
      where: { id: params.id, candidateProfileId: context.candidateProfileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = parsed.data;
    const statusChanged = data.status && data.status !== existing.status;

    const updated = await db.application.update({
      where: { id: params.id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.recruiterName && { recruiterName: data.recruiterName }),
        ...(data.recruiterEmail && { recruiterEmail: data.recruiterEmail }),
        ...(data.nextAction !== undefined && { nextAction: data.nextAction }),
        ...(data.followUpDueAt && { followUpDueAt: new Date(data.followUpDueAt) }),
        ...(data.salaryExpected && { salaryExpected: data.salaryExpected }),
        ...(data.rejectionReason && { rejectionReason: data.rejectionReason }),
        ...(data.offerAmount && { offerAmount: data.offerAmount }),
        ...(data.status === "APPLIED" && !existing.appliedAt && { appliedAt: new Date() }),
      },
      include: {
        company: true,
        job: true,
        stageEvents: { orderBy: { eventAt: "desc" }, take: 10 },
      },
    });

    // Log stage change
    if (statusChanged && data.status) {
      await db.applicationStageEvent.create({
        data: {
          applicationId: params.id,
          stageName: data.status,
          notes: body.stageNote || null,
        },
      });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error(`[PATCH /api/applications/${params.id}]`, error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getOrCreateSingleUserContext();

    const existing = await db.application.findFirst({
      where: { id: params.id, candidateProfileId: context.candidateProfileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.application.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/applications/${params.id}]`, error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
