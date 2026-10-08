"use client";
import { useEffect, useRef, useState } from "react";
import { Anchor, Badge, FileInput, Group, NumberInput, Pagination, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { StudyShell } from "@/components/study-shell";
import { StudyPageLoading } from "@/components/study-page-loading";
import { StudyCard } from "@/components/ui/study-surface";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { getStudyState } from "@/lib/studynao-api";
import { notifyError, notifySuccess } from "@/lib/feedback";
import type { StudyState } from "@/lib/types";
import { getReimbursements, submitReimbursement } from "../api";
import type { ReimbursementList } from "../types";
import { PurchaseLink } from "./PurchaseLink";
const money = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export default function ReimbursementsContent() {
 const [profile, setProfile] = useState<StudyState | null>(null);
 const [data, setData] = useState<ReimbursementList | null>(null);
 const [reload, setReload] = useState(0);
 const [page, setPage] = useState(1), [loading, setLoading] = useState(true), [error, setError] = useState("");
 const [date, setDate] = useState<string | null>(null), [amount, setAmount] = useState<string | number>("");
 const [file, setFile] = useState<File | null>(null), [notes, setNotes] = useState(""), [busy, setBusy] = useState(false);
 const key = useRef<string | null>(null);
 useEffect(() => {
  let current = true;
  Promise.all([getStudyState("teacher"), getReimbursements(page)]).then(([state, result]) => { if (current) { setProfile(state); setData(result); setError(""); } }).catch((e) => { if (current) setError(e instanceof Error ? e.message : "Unable to load reimbursements."); }).finally(() => { if (current) setLoading(false); });
  return () => { current = false; };
 }, [page, reload]);
 async function submit(event: React.FormEvent) {
  event.preventDefault(); if (!date || !file || !Number(amount) || busy) return;
  if (file.size > 10 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) return notifyError("Choose a PDF, JPEG, or PNG file up to 10 MB.");
  setBusy(true); key.current ??= crypto.randomUUID();
  const body = new FormData(); body.set("request_key", key.current); body.set("purchase_date", date); body.set("amount", String(amount)); body.set("notes", notes); body.set("evidence", file);
  try { await submitReimbursement(body); setDate(null); setAmount(""); setFile(null); setNotes(""); key.current = null; setPage(1); setReload(n => n + 1); notifySuccess("Request submitted", "An admin will review your Zoom purchase reimbursement."); }
  catch (e) { notifyError(e instanceof Error ? e.message : "Unable to submit reimbursement."); }
  finally { setBusy(false); }
 }
 return <StudyShell state={profile} role="teacher">{loading ? <StudyPageLoading label="Loading reimbursements" /> : <Stack p={{ base: "md", sm: "xl" }} maw={1100} mx="auto" gap="lg">
 <Title>Zoom reimbursements</Title><Text c="dimmed">Purchase Zoom through the link provided by your admin and submit your proof for review.</Text>
 {error && <StudyCard p="lg"><Text c="red" role="alert">{error}</Text><LandingActionButton mt="md" onClick={() => { setLoading(true); setReload(n => n + 1); }}>Try again</LandingActionButton></StudyCard>}
 {data && <><StudyCard p="lg"><form onSubmit={submit}><Stack gap="md"><Title order={2} size="h3">Request reimbursement</Title>
 {data.zoom_shopee_url ? <PurchaseLink url={data.zoom_shopee_url} /> : <Text c="dimmed">Your admin has not configured the purchase link yet.</Text>}
 <SimpleGrid cols={{ base: 1, sm: 2 }}><DatePickerInput label="Purchase date" required value={date} maxDate={today()} valueFormat="DD MMMM YYYY" disabled={busy} onChange={v => {setDate(v);key.current=null;}} /><NumberInput label="Amount paid (IDR)" required min={1} max={100000000} allowDecimal={false} thousandSeparator="," value={amount} disabled={busy} onChange={v => {setAmount(v);key.current=null;}} /></SimpleGrid>
 <FileInput label="Purchase proof" description="PDF, JPEG, or PNG, up to 10 MB. Include the purchase receipt." required accept="application/pdf,image/jpeg,image/png" value={file} disabled={busy} onChange={v => {setFile(v);key.current=null;}} clearable />
 <Textarea label="Notes (optional)" maxLength={2000} value={notes} disabled={busy} onChange={e => {setNotes(e.currentTarget.value);key.current=null;}} />
 <Group justify="flex-end"><LandingActionButton type="submit" loading={busy} disabled={!data.zoom_shopee_url || !date || !file || Number(amount) <= 0}>Submit request</LandingActionButton></Group></Stack></form></StudyCard>
 <Title order={2} size="h3">Your requests</Title>{data.items.length === 0 && <StudyCard p="lg"><Text c="dimmed">No reimbursement requests yet.</Text></StudyCard>}
 {data.items.map(item => <StudyCard p="lg" key={item.id}><Stack gap="sm"><Group justify="space-between"><Text fw={600}>{money(item.amount)} · {item.purchase_date}</Text><Badge size="lg" color={item.status === "approved" ? "teal" : item.status === "rejected" ? "red" : "yellow"}>{item.status}</Badge></Group>
 {item.notes && <Text size="sm">{item.notes}</Text>}{item.review_note && <Text size="sm">Admin note: {item.review_note}</Text>}
 {item.status === "approved" && <Text size="sm" c="dimmed">{item.finance_expenses?.status === "done" ? "Paid" : "Approved · Payment pending"}</Text>}
 <Group>{item.evidence_url && <Anchor size="sm" href={item.evidence_url} target="_blank" rel="noopener noreferrer">View purchase proof</Anchor>}<PurchaseLink url={item.purchase_url} /></Group></Stack></StudyCard>)}
 {data.total > 10 && <Pagination total={Math.ceil(data.total / 10)} value={page} onChange={setPage} />}</>}
 </Stack>}</StudyShell>;
}
