import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function requireRole(allowedRoles = []) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(session.user.role)
  ) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
