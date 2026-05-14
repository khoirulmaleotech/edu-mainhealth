import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../../auth/[...nextauth]/authOptions";

export const allowedAdminRoles = ["admin", "superadmin", "school_admin"];

export const statusAlias = {
  pending: ["pending", "Pending"],
  reviewing: ["reviewing", "In Progress"],
  resolved: ["resolved", "Resolved"],
  rejected: ["rejected"],
};

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !allowedAdminRoles.includes(session.user.role)) {
    return null;
  }

  return session;
}

export function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export function getStatusMatch(status) {
  if (!status || status === "all") return {};

  return {
    status: {
      $in: statusAlias[status] || [status],
    },
  };
}

export function getEscapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const reporterLookupStage = {
  $lookup: {
    from: "users",
    localField: "reporter_id",
    foreignField: "_id",
    pipeline: [
      {
        $project: {
          _id: 0,
          fullname: 1,
        },
      },
    ],
    as: "reporter",
  },
};

export const reporterDetailLookupStage = {
  $lookup: {
    from: "users",
    localField: "reporter_id",
    foreignField: "_id",
    pipeline: [
      {
        $project: {
          _id: 0,
          fullname: 1,
          email: 1,
          role: 1,
        },
      },
    ],
    as: "reporter",
  },
};

export const reporterNameStage = {
  $set: {
    reporter_fullname: {
      $ifNull: [{ $arrayElemAt: ["$reporter.fullname", 0] }, null],
    },
    reporter_email: {
      $ifNull: [{ $arrayElemAt: ["$reporter.email", 0] }, null],
    },
    reporter_role: {
      $ifNull: [{ $arrayElemAt: ["$reporter.role", 0] }, null],
    },
  },
};
