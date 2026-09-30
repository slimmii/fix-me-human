import { supabase } from "../account/supabase";
import { decodeProject, ENTRY_FILE, type CodeProject } from "../project";

export type HuntSummary = {
  id: string;
  revision: number;
  slug: string;
  title: string;
  brief: string;
  publishDateTime: string;
};
export type BugHunt = HuntSummary & {
  project: CodeProject;
  testCode: string;
  previewCss: string;
};
export const huntKey = (hunt: HuntSummary) => `${hunt.id}:${hunt.revision}`;
const fields = "id,revision,slug,title,brief,publishDateTime";
export const HUNT_PAGE_SIZE = 24;
function summary(row: Record<string, unknown>): HuntSummary {
  if (
    typeof row.id !== "string" ||
    !/^[0-9a-f-]{36}$/.test(row.id) ||
    !Number.isSafeInteger(row.revision) ||
    Number(row.revision) < 1 ||
    ![row.slug, row.title, row.brief, row.publishDateTime].every(
      (v) => typeof v === "string",
    ) ||
    !Number.isFinite(Date.parse(String(row.publishDateTime)))
  )
    throw new Error("A bug hunt has invalid details. Please try again later.");
  return row as HuntSummary;
}
export async function listHunts(
  offset = 0,
  signal?: AbortSignal,
): Promise<HuntSummary[]> {
  if (!supabase)
    throw new Error(
      "Bug hunts are not connected yet. Course assignments are still available.",
    );
  // RLS, using database time, is the authority for publication. Never rely on the device clock.
  const query = supabase
    .from("pfh_bug_hunts")
    .select(fields)
    .order("publishDateTime", { ascending: false })
    .order("id")
    .range(offset, offset + HUNT_PAGE_SIZE - 1);
  const { data, error } = await query.abortSignal(
    signal ?? AbortSignal.timeout(10000),
  );
  if (error)
    throw new Error(
      "Could not load the wanted board. Check your connection and retry.",
    );
  return (data ?? []).map(summary);
}
export async function loadHunt(
  id: string,
  signal?: AbortSignal,
): Promise<BugHunt> {
  if (!supabase) throw new Error("Bug hunts are not connected yet.");
  const { data, error } = await supabase
    .from("pfh_bug_hunts")
    .select(`${fields},starter_files,test_code,preview_css`)
    .eq("id", id)
    .abortSignal(signal ?? AbortSignal.timeout(10000))
    .single();
  if (error || !data)
    throw new Error(
      "This hunt is unavailable. Refresh the wanted board and try again.",
    );
  const project = decodeProject({
    files: data.starter_files,
    activeFile: ENTRY_FILE,
  });
  if (
    !project ||
    Object.values(project.files).some((code) => code.length > 16000) ||
    typeof data.test_code !== "string" ||
    !data.test_code.trim() ||
    data.test_code.length > 32000 ||
    typeof data.preview_css !== "string" ||
    data.preview_css.length > 16000
  )
    throw new Error(
      "This hunt needs an author correction before it can be played.",
    );
  return {
    ...summary(data),
    project,
    testCode: data.test_code,
    previewCss: data.preview_css,
  };
}
