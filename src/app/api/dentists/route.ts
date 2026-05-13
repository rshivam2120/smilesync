import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { Dentist } from "@/models";

/** Public list for booking UI */
export async function GET() {
  try {
    await connectDb();
    const rows = await Dentist.find({ deletedAt: { $exists: false } })
      .populate("userId", "name email")
      .lean();

    const dentists = rows.map((d) => ({
      id: String(d._id),
      name: (d.userId as { name?: string })?.name ?? "Dentist",
      branch: d.branch ?? "",
      specialization: d.specialization ?? "",
    }));

    return ok({ dentists });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load dentists", 500);
  }
}
