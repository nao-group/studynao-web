import { notFound } from "next/navigation";
import ClassDetailContent from "../../[classId]/components/ClassDetailContent";
import { positiveId } from "../../[classId]/data";
import type { DetailSearchParams } from "../../[classId]/types";

export const metadata = { title: "Class request | StudyNao" };

export default async function ClassRequestDetailPage({ params, searchParams }: {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<DetailSearchParams>;
}) {
  const [{ requestId }, query] = await Promise.all([params, searchParams]);
  const id = positiveId(requestId);
  if (!id) notFound();
  const role = query.role === "teacher" ? "teacher" : "student";
  return <ClassDetailContent key={`request:${id}:${role}`} id={id} kind="request" role={role} sessionId={null} from="classes" />;
}
