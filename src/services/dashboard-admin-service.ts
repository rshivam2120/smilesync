import mongoose from "mongoose";
import {
  Appointment,
  Branch,
  InventoryItem,
  Patient,
  Payment,
  Staff,
  Treatment,
} from "@/models";

export async function buildAdminAnalytics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const last7Dates: string[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7Dates.push(d.toISOString().slice(0, 10));
  }

  const [
    appointmentStatus,
    revenueAgg,
    patientsCount,
    treatmentsCount,
    staffCount,
    branches,
    lowStock,
    appointmentsRecent,
    revenueMonthly,
    apptsByBranch,
    apptsLast7,
  ] = await Promise.all([
    Appointment.aggregate<{ _id: string; count: number }>([
      { $match: { deletedAt: { $exists: false } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Payment.aggregate<{ total: number }>([
      { $match: { status: "paid", deletedAt: { $exists: false } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Patient.countDocuments({ deletedAt: { $exists: false } }),
    Treatment.countDocuments({ deletedAt: { $exists: false } }),
    Staff.countDocuments({ deletedAt: { $exists: false }, active: true }),
    Branch.find({ deletedAt: { $exists: false }, active: true }).lean(),
    InventoryItem.find({
      deletedAt: { $exists: false },
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    })
      .populate("branchId", "name code")
      .limit(25)
      .lean(),
    Appointment.find({ deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    Payment.aggregate<{ _id: { y: number; m: number }; total: number }>([
      {
        $match: {
          status: "paid",
          deletedAt: { $exists: false },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Appointment.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          deletedAt: { $exists: false },
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: "$branch", count: { $sum: 1 } } },
    ]),
    Appointment.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          deletedAt: { $exists: false },
          date: { $in: last7Dates },
        },
      },
      { $group: { _id: "$date", count: { $sum: 1 } } },
    ]),
  ]);

  const statusMap = Object.fromEntries(appointmentStatus.map((a) => [a._id, a.count])) as Record<string, number>;
  const totalAppts = appointmentStatus.reduce((s, a) => s + a.count, 0);
  const revenuePaise = revenueAgg[0]?.total ?? 0;

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth = revenueMonthly.map((r) => ({
    label: `${monthLabels[(r._id.m ?? 1) - 1]} ${r._id.y}`,
    value: Math.round(((r.total ?? 0) / 100) * 100) / 100,
  }));

  const countByDate = Object.fromEntries(apptsLast7.map((a) => [a._id, a.count])) as Record<string, number>;
  const appointmentsLast7Days = last7Dates.map((dateStr) => {
    const d = new Date(`${dateStr}T12:00:00`);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      value: countByDate[dateStr] ?? 0,
    };
  });

  return {
    kpis: {
      totalAppointments: totalAppts,
      booked: statusMap.booked ?? 0,
      completed: statusMap.completed ?? 0,
      cancelled: statusMap.cancelled ?? 0,
      patients: patientsCount,
      treatments: treatmentsCount,
      staffActive: staffCount,
      revenueInr: Math.round((revenuePaise / 100) * 100) / 100,
    },
    charts: {
      revenueByMonth,
      appointmentsByBranch: apptsByBranch.map((b) => ({ name: b._id || "Unassigned", count: b.count })),
      appointmentsLast7Days,
    },
    branches,
    lowStock,
    recentAppointments: appointmentsRecent,
  };
}

export function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}
