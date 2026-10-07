import { notFound } from "next/navigation";
import ClassDetailContent from "./components/ClassDetailContent";
import { positiveId } from "./data";
import type { DetailSearchParams } from "./types";

export const metadata = { title: "Class details | StudyNao" };

export default async function ClassDetailPage({ params, searchParams }: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<DetailSearchParams>;
}) {
  const [{ classId }, query] = await Promise.all([params, searchParams]);
  const id = positiveId(classId);
  if (!id) notFound();
  const role = query.role === "teacher" ? "teacher" : "student";
  return <ClassDetailContent key={`class:${id}:${role}`} id={id} kind="class" role={role}
    sessionId={query.session === undefined ? null : positiveId(query.session) ?? -1}
    from={query.from === "dashboard" ? "dashboard" : "classes"} />;
}
