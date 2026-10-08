import { api } from "@/lib/api";
import type { Reimbursement, ReimbursementList } from "./types";
export const getReimbursements = (page: number) => api<ReimbursementList>(`/api/studynao/teacher/reimbursements?page=${page}&page_size=10`);
export const submitReimbursement = (body: FormData) => api<Reimbursement>("/api/studynao/teacher/reimbursements", { method: "POST", body });
