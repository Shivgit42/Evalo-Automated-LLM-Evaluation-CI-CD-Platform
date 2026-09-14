import { createSign, createHmac, timingSafeEqual } from "crypto";
import { Octokit } from "@octokit/rest";

export function verifyWebhookSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const hmac = createHmac("sha256", secret);
  hmac.update(body);
  const expected = `sha256=${hmac.digest("hex")}`;
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function b64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signAppJwt(appId: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = b64url(
    Buffer.from(
      JSON.stringify({
        iat: now - 60,
        exp: now + 9 * 60,
        iss: appId,
      }),
    ),
  );
  const data = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(data);
  sign.end();
  const sig = b64url(sign.sign(privateKey));
  return `${data}.${sig}`;
}

function getAppCredentials() {
  const appId = process.env.GITHUB_APP_ID;
  let key = process.env.GITHUB_APP_PRIVATE_KEY ?? "";
  key = key.replace(/\\n/g, "\n");
  if (!appId || !key) throw new Error("GitHub App not configured");
  return { appId, key };
}

export function appOctokit() {
  const { appId, key } = getAppCredentials();
  const token = signAppJwt(appId, key);
  return new Octokit({ auth: token });
}

export async function installationOctokit(installationId: number) {
  const app = appOctokit();
  const r = await app.request(
    "POST /app/installations/{installation_id}/access_tokens",
    { installation_id: installationId },
  );
  const token = (r.data as { token: string }).token;
  return new Octokit({ auth: token });
}

export async function postCheckRun(opts: {
  installationId: number;
  repoFullName: string;
  headSha: string;
  conclusion: "success" | "failure" | "neutral";
  title: string;
  summary: string;
  detailsUrl: string;
}) {
  const [owner, repo] = opts.repoFullName.split("/");
  const o = await installationOctokit(opts.installationId);
  await o.request("POST /repos/{owner}/{repo}/check-runs", {
    owner,
    repo,
    name: "evalo / quality",
    head_sha: opts.headSha,
    status: "completed",
    conclusion: opts.conclusion,
    details_url: opts.detailsUrl,
    output: {
      title: opts.title,
      summary: opts.summary,
    },
  });
}

export async function commentOnPr(opts: {
  installationId: number;
  repoFullName: string;
  prNumber: number;
  body: string;
}) {
  const [owner, repo] = opts.repoFullName.split("/");
  const o = await installationOctokit(opts.installationId);
  await o.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
    owner,
    repo,
    issue_number: opts.prNumber,
    body: opts.body,
  });
}
