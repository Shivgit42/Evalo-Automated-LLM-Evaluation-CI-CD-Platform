import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { ProjectNav } from "@/components/app/ProjectNav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const { projectId } = await params;

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  });
  if (!project) notFound();

  return (
    <div className="flex">
      <aside className="w-56 border-r border-[color:var(--color-border)] min-h-[calc(100vh-3rem)] bg-[color:var(--color-surface)]">
        <div className="p-4 border-b border-[color:var(--color-border)]">
          <Link href="/app" className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-faint)] hover:text-white">
            ← All projects
          </Link>
          <div className="font-semibold mt-1 truncate">{project.name}</div>
          <div className="text-[10px] text-[color:var(--color-text-faint)] truncate">{project.slug}</div>
        </div>
        <ProjectNav projectId={project.id} />
      </aside>
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}
