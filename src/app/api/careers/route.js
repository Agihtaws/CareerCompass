import { NextResponse } from "next/server";
import { getCareerInfo, getJobs } from "@/lib/careers";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function mapSort(v) {
  if (v === "newest") return "date";
  if (v === "salary") return "salary";
  if (v === "relevant") return "relevance";
  return undefined;
}

function buildFilters(searchParams) {
  const type = searchParams.get("type");
  const days = searchParams.get("days");
  return {
    sortBy: mapSort(searchParams.get("sort")),
    fullTime: type === "full",
    partTime: type === "part",
    maxDaysOld: days === "7" || days === "30" ? Number(days) : undefined,
    remote: searchParams.get("remote") === "1",
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const job = (searchParams.get("q") || "").trim();
  const where = (searchParams.get("where") || "").trim() || undefined;
  const country = (searchParams.get("country") || "").trim() || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const jobsOnly = searchParams.get("mode") === "jobs";
  const jobFilters = buildFilters(searchParams);

  if (!job) {
    return NextResponse.json({ error: "Add a job title, e.g. ?q=data analyst" }, { status: 400 });
  }
  if (job.length > 100) {
    return NextResponse.json({ error: "Job title is too long." }, { status: 400 });
  }

  try {
    if (jobsOnly) {
      const r = await getJobs({ job, where, country, page, jobFilters });
      return NextResponse.json({
        jobs: r.jobs, jobsCount: r.count, page: r.page, perPage: r.perPage, jobsError: r.error,
      });
    }
    const data = await getCareerInfo({ job, where, country, page, jobFilters });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load career info.", detail: e.message }, { status: 502 });
  }
}
