import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "OWNER") {
    redirect("/owner/dashboard");
  }

  if (session.user.role === "CLIENT") {
    redirect("/client/dashboard");
  }

  redirect("/unauthorized");
}
