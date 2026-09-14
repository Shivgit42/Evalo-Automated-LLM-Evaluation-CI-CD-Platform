import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { appOctokit } from "@/lib/github";
import { db } from "@/lib/db";
import { githubInstallations, projects } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

// GitHub redirects here after the user installs the Evalo GitHub App.
// Query: ?installation_id=...&setup_action=install&state=<projectId>
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  const url = new URL(req.url);
  const installationId = Number(url.searchParams.get("installation_id"));
  const projectId = url.searchParams.get("state");
  if (!installationId || !projectId) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  });
  if (!project) return NextResponse.json({ error: "project_not_found" }, { status: 404 });

  // List repos accessible to this installation; first one wins for the MVP.
  let repoFullName = "";
  try {
    const app = appOctokit();
    const r = await app.request(
      "POST /app/installations/{installation_id}/access_tokens",
      { installation_id: installationId },
    );
    const token = (r.data as { token: string }).token;
    const repos = await fetch("https://api.github.com/installation/repositories", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }).then((res) => res.json());
    repoFullName = repos?.repositories?.[0]?.full_name ?? "";
  } catch (e) {
    console.error("setup failed", e);
  }

  if (!repoFullName) {
    return NextResponse.redirect(
      new URL(`/app/${projectId}/settings?gh=missing_repo`, req.url),
    );
  }

  await db
    .insert(githubInstallations)
    .values({ projectId, installationId, repoFullName })
    .onConflictDoNothing();

  return NextResponse.redirect(
    new URL(`/app/${projectId}/settings?gh=connected`, req.url),
  );
}
