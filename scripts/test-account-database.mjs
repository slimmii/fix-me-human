import { spawn, spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";

const name = `pfh-account-test-${process.pid}`;
function docker(args, input) {
  const result = spawnSync("docker", args, { input, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
}
const sql = (input) =>
  docker(
    [
      "exec",
      "-i",
      name,
      "psql",
      "-U",
      "postgres",
      "-At",
      "-v",
      "ON_ERROR_STOP=1",
    ],
    input,
  );
function concurrentSql(input) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", [
      "exec",
      "-i",
      name,
      "psql",
      "-U",
      "postgres",
      "-At",
      "-v",
      "ON_ERROR_STOP=1",
    ]);
    let error = "";
    child.stdout.resume();
    child.stderr.on("data", (chunk) => {
      error += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, error }));
    child.stdin.end(input);
  });
}
const asUser = (id, statement) =>
  `begin; set local role authenticated; select set_config('request.jwt.claim.sub', '${id}', true); ${statement}; commit;`;
let started = false;
try {
  docker([
    "run",
    "--detach",
    "--rm",
    "--name",
    name,
    "-e",
    "POSTGRES_PASSWORD=local-test-only",
    "postgres:17-alpine",
  ]);
  started = true;
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    const check = spawnSync(
      "docker",
      ["exec", name, "pg_isready", "-h", "127.0.0.1", "-U", "postgres"],
      { stdio: "ignore" },
    );
    if (check.status === 0) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error("PostgreSQL did not become ready.");
  for (const path of [
    "supabase/tests/bootstrap.sql",
    ...readdirSync("supabase/migrations")
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => `supabase/migrations/${name}`),
    "supabase/tests/account_policies.sql",
    "supabase/tests/account_reset.sql",
    "supabase/tests/workstation_ids.sql",
    "supabase/tests/bug_hunts.sql",
  ])
    sql(readFileSync(path, "utf8"));
  const first = "11111111-1111-4111-8111-111111111111";
  const second = "22222222-2222-4222-8222-222222222222";
  const third = "33333333-3333-4333-8333-333333333333";
  sql(
    `insert into auth.users(id) values ('${first}'), ('${second}'), ('${third}');`,
  );
  const claims = await Promise.all(
    [first, second].map((id) =>
      concurrentSql(
        asUser(
          id,
          "insert into public.pfh_profiles(user_id,username) values(auth.uid(),'same_handle'); select pg_sleep(0.2)",
        ),
      ),
    ),
  );
  if (
    claims.filter((result) => result.code === 0).length !== 1 ||
    !claims.some((result) => /duplicate key/.test(result.error))
  )
    throw new Error("Concurrent username claims were not constrained.");
  sql(
    asUser(
      third,
      "insert into public.pfh_profiles(user_id,username) values(auth.uid(),'sync_human')",
    ),
  );
  const writes = await Promise.all([
    concurrentSql(
      asUser(
        third,
        `select * from public.pfh_sync_progress('{"version":4,"draft":"new"}', '2026-09-20T12:00:00Z'); select pg_sleep(0.2)`,
      ),
    ),
    concurrentSql(
      asUser(
        third,
        `select * from public.pfh_sync_progress('{"version":4,"draft":"old"}', '2026-09-20T11:00:00Z')`,
      ),
    ),
  ]);
  if (writes.some((result) => result.code !== 0))
    throw new Error(JSON.stringify(writes));
  if (
    sql(
      `select state->>'draft' from public.pfh_progress where user_id='${third}';`,
    ).trim() !== "new"
  )
    throw new Error("Concurrent writes replaced newer progress.");
  const resetting = await Promise.all([
    concurrentSql(
      asUser(
        third,
        `select * from public.pfh_reset_progress('{"version":4,"draft":"reset"}', 0); select pg_sleep(0.2)`,
      ),
    ),
    concurrentSql(
      asUser(
        third,
        `select * from public.pfh_sync_progress('{"version":4,"draft":"stale device"}', '2100-01-01', 0)`,
      ),
    ),
  ]);
  if (resetting.some((result) => result.code !== 0))
    throw new Error(JSON.stringify(resetting));
  if (
    sql(
      `select state->>'draft' from public.pfh_progress where user_id='${third}' and reset_version=1;`,
    ).trim() !== "reset"
  )
    throw new Error("Concurrent stale upload undid an account reset.");

  const fourth = "44444444-4444-4444-8444-444444444444";
  const fifth = "55555555-5555-4555-8555-555555555555";
  sql(
    `insert into auth.users(id) values ('${fourth}'), ('${fifth}');` +
      asUser(
        fourth,
        "insert into public.pfh_profiles(user_id,username) values(auth.uid(),'workstation_four')",
      ) +
      asUser(
        fifth,
        "insert into public.pfh_profiles(user_id,username) values(auth.uid(),'workstation_five')",
      ),
  );
  const allocations = await Promise.all(
    [fourth, fifth].map((id) =>
      concurrentSql(
        asUser(
          id,
          `select * from public.pfh_sync_progress('{"version":4,"workstationId":"A–001"}', now(), 0)`,
        ),
      ),
    ),
  );
  if (allocations.some((result) => result.code !== 0))
    throw new Error(JSON.stringify(allocations));
  if (
    sql(
      `select count(distinct workstation_id) from public.pfh_progress where user_id in ('${fourth}', '${fifth}') and state->>'workstationId'=workstation_id;`,
    ).trim() !== "2"
  )
    throw new Error("Concurrent workstation allocations were not unique.");
  console.log(
    "Passed: migrations, RLS, constraints, account deletion, username races, save ordering, reset idempotence, concurrent reset/stale-upload protection, concurrent unique workstation allocation, bug-hunt publication and revisions.",
  );
} finally {
  if (started) docker(["stop", name]);
}
