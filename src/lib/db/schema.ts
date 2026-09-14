import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
  pgEnum,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Auth.js tables ----------

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) }),
);

// ---------- App tables ----------

export const planEnum = pgEnum("plan", ["free", "pro", "team"]);

export const projects = pgTable(
  "project",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    plan: planEnum("plan").default("free").notNull(),
    traceCount: integer("trace_count").default(0).notNull(),
    traceCountResetAt: timestamp("trace_count_reset_at").defaultNow().notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    ownerSlug: uniqueIndex("project_owner_slug_idx").on(t.ownerId, t.slug),
  }),
);

export const apiKeys = pgTable(
  "api_key",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    hashedKey: text("hashed_key").notNull().unique(),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  (t) => ({
    byProject: index("api_key_project_idx").on(t.projectId),
  }),
);

export const datasets = pgTable("dataset", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  itemCount: integer("item_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const datasetItems = pgTable(
  "dataset_item",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    datasetId: text("dataset_id").notNull().references(() => datasets.id, { onDelete: "cascade" }),
    input: jsonb("input").notNull(),
    expectedOutput: jsonb("expected_output"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ byDataset: index("ds_item_dataset_idx").on(t.datasetId) }),
);

export const traces = pgTable(
  "trace",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    environment: text("environment").default("production").notNull(),
    status: text("status").default("ok").notNull(), // ok|error
    durationMs: integer("duration_ms"),
    tokensInput: integer("tokens_input"),
    tokensOutput: integer("tokens_output"),
    costUsd: doublePrecision("cost_usd"),
    input: jsonb("input"),
    output: jsonb("output"),
    metadata: jsonb("metadata"),
    error: text("error"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    byProject: index("trace_project_idx").on(t.projectId, t.createdAt),
  }),
);

export const spans = pgTable(
  "span",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    traceId: text("trace_id").notNull().references(() => traces.id, { onDelete: "cascade" }),
    parentSpanId: text("parent_span_id"),
    name: text("name").notNull(),
    kind: text("kind").default("span").notNull(), // llm|tool|retrieval|span
    model: text("model"),
    input: jsonb("input"),
    output: jsonb("output"),
    metadata: jsonb("metadata"),
    tokensInput: integer("tokens_input"),
    tokensOutput: integer("tokens_output"),
    costUsd: doublePrecision("cost_usd"),
    latencyMs: integer("latency_ms"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
  },
  (t) => ({ byTrace: index("span_trace_idx").on(t.traceId) }),
);

export const evalKindEnum = pgEnum("eval_kind", [
  "exact_match",
  "contains",
  "json_match",
  "llm_judge",
]);

export const evalDefinitions = pgTable("eval_definition", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: evalKindEnum("kind").notNull(),
  config: jsonb("config").notNull(), // { rubric?, threshold?, field? }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evalRunStatusEnum = pgEnum("eval_run_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
]);

export const evalRuns = pgTable(
  "eval_run",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    datasetId: text("dataset_id").notNull().references(() => datasets.id, { onDelete: "cascade" }),
    evalDefinitionId: text("eval_definition_id")
      .notNull()
      .references(() => evalDefinitions.id, { onDelete: "cascade" }),
    status: evalRunStatusEnum("status").default("queued").notNull(),
    model: text("model").default("gpt-4o-mini").notNull(),
    total: integer("total").default(0).notNull(),
    passed: integer("passed").default(0).notNull(),
    failed: integer("failed").default(0).notNull(),
    passRate: doublePrecision("pass_rate").default(0).notNull(),
    targetBranch: text("target_branch"),
    commitSha: text("commit_sha"),
    prNumber: integer("pr_number"),
    repoFullName: text("repo_full_name"),
    githubCheckRunId: text("github_check_run_id"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    byProject: index("eval_run_project_idx").on(t.projectId, t.createdAt),
  }),
);

export const evalResults = pgTable(
  "eval_result",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    evalRunId: text("eval_run_id").notNull().references(() => evalRuns.id, { onDelete: "cascade" }),
    datasetItemId: text("dataset_item_id")
      .notNull()
      .references(() => datasetItems.id, { onDelete: "cascade" }),
    output: jsonb("output"),
    passed: boolean("passed").notNull(),
    score: doublePrecision("score"),
    reason: text("reason"),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ byRun: index("eval_result_run_idx").on(t.evalRunId) }),
);

export const githubInstallations = pgTable(
  "github_installation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    installationId: integer("installation_id").notNull(),
    repoFullName: text("repo_full_name").notNull(),
    datasetId: text("dataset_id").references(() => datasets.id),
    evalDefinitionId: text("eval_definition_id").references(() => evalDefinitions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    byRepo: uniqueIndex("gh_install_repo_idx").on(t.installationId, t.repoFullName),
  }),
);

// ---------- Relations ----------

export const projectsRelations = relations(projects, ({ many, one }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  apiKeys: many(apiKeys),
  datasets: many(datasets),
  traces: many(traces),
}));

export const tracesRelations = relations(traces, ({ many, one }) => ({
  project: one(projects, { fields: [traces.projectId], references: [projects.id] }),
  spans: many(spans),
}));

export const datasetsRelations = relations(datasets, ({ many, one }) => ({
  project: one(projects, { fields: [datasets.projectId], references: [projects.id] }),
  items: many(datasetItems),
}));

export const evalRunsRelations = relations(evalRuns, ({ many, one }) => ({
  project: one(projects, { fields: [evalRuns.projectId], references: [projects.id] }),
  dataset: one(datasets, { fields: [evalRuns.datasetId], references: [datasets.id] }),
  definition: one(evalDefinitions, {
    fields: [evalRuns.evalDefinitionId],
    references: [evalDefinitions.id],
  }),
  results: many(evalResults),
}));

export type Project = typeof projects.$inferSelect;
export type Trace = typeof traces.$inferSelect;
export type Span = typeof spans.$inferSelect;
export type Dataset = typeof datasets.$inferSelect;
export type DatasetItem = typeof datasetItems.$inferSelect;
export type EvalRun = typeof evalRuns.$inferSelect;
export type EvalResult = typeof evalResults.$inferSelect;
export type EvalDefinition = typeof evalDefinitions.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
