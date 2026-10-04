"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Center, Checkbox, Group, Loader, MultiSelect, SegmentedControl, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { ColorToggle } from "@/components/color-toggle";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { IconArrowRight, IconSchool } from "@tabler/icons-react";
import { api, type Program, type StudyState } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/feedback";
import styles from "./onboarding.module.css";

const GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Others"];
const localWhatsApp = (value: string) => value.replace(/\D/g, "").replace(/^62/, "").replace(/^0+/, "");

export default function OnboardingPage() {
  const router = useRouter(); const [state, setState] = useState<StudyState | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]); const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]); const [role, setRole] = useState<"student" | "teacher">("student");
  const [busy, setBusy] = useState(false);
  const [whatsapp, setWhatsapp] = useState(""); const [studyLevel, setStudyLevel] = useState("Grade 12"); const [parentEmail, setParentEmail] = useState("");
  const [birthDate, setBirthDate] = useState(""); const [province, setProvince] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("single"); const [classTypes, setClassTypes] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]); const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [hskLevel, setHskLevel] = useState(""); const [bankName, setBankName] = useState(""); const [bankNumber, setBankNumber] = useState(""); const [bankOwner, setBankOwner] = useState("");
  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role") === "teacher" ? "teacher" : "student";
    Promise.all([api<StudyState>(`/api/studynao/me?role=${requestedRole}`), api<{ items: Program[]; subjects: { id: number; name: string }[] }>("/api/studynao/programs", {}, false)])
      .then(([profile, catalog]) => { setState(profile); setRole(requestedRole); setPrograms(catalog.items); setSubjects(catalog.subjects);
        if (profile.profile) {
          const saved = profile.profile;
          setWhatsapp(localWhatsApp(String(saved.whatsapp ?? ""))); setStudyLevel(saved.study_level === "Other" ? "Others" : String(saved.study_level || "Grade 12"));
          setParentEmail(String(saved.parent_email ?? "")); setBirthDate(String(saved.birth_date ?? ""));
          setProvince(String(saved.province ?? "")); setMaritalStatus(String(saved.marital_status ?? "single"));
          setClassTypes(Array.isArray(saved.class_types) ? saved.class_types.map(String) : []);
          setLanguages(Array.isArray(saved.teaching_languages) ? saved.teaching_languages.map(String) : []);
          setSubjectIds(Array.isArray(saved.subject_ids) ? saved.subject_ids.map(String) : []);
          setHskLevel(saved.hsk_level ? String(saved.hsk_level) : ""); setBankName(String(saved.bank_name ?? ""));
          setBankNumber(String(saved.bank_account_number ?? "")); setBankOwner(String(saved.bank_account_name ?? ""));
        } if (profile.membership && !["onboarding", "rejected"].includes(profile.membership.status)) router.replace(`/dashboard?role=${requestedRole}`); })
      .catch(() => router.replace("/login"));
  }, [router]);
  async function join() {
    setBusy(true);
    try { setState(await api<StudyState>("/api/studynao/join", { method: "POST", body: JSON.stringify({ role }) })); }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to select a role."); }
    finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try {
      const fullWhatsApp = `+62${whatsapp}`;
      const body = role === "student" ? { whatsapp: fullWhatsApp, study_level: studyLevel, parent_email: parentEmail || null } : {
        whatsapp: fullWhatsApp, birth_date: birthDate, province, marital_status: maritalStatus,
        class_types: classTypes, teaching_languages: languages, subject_ids: subjectIds.map(Number),
        hsk_level: hskLevel ? Number(hskLevel) : null, bank_name: bankName, bank_account_number: bankNumber, bank_account_name: bankOwner,
      };
      await api(`/api/studynao/${role}/onboarding`, { method: "PUT", body: JSON.stringify(body) });
      notifySuccess("Profile saved", role === "teacher" ? "Your profile is awaiting admin approval." : "Your StudyNao profile is ready.");
      router.replace(`/dashboard?role=${role}`);
    } catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to save your profile."); }
    finally { setBusy(false); }
  }
  if (!state) return <Center mih="100vh"><Loader aria-label="Loading onboarding" /></Center>;
  const profileStep = Boolean(state.membership);
  const availableSubjects = subjects.filter((subject) => programs.some((program) => classTypes.includes(program.class_type) && languages.includes(program.teaching_language) && program.subject_ids.includes(subject.id)));
  return <main className={styles.page}>
    <div className={styles.wash} aria-hidden="true" />
    <div className={styles.sky} aria-hidden="true"><span className={styles.cloudOne} /><span className={styles.cloudTwo} /><span className={styles.birdOne} /><span className={styles.birdTwo} /></div>
    <header className={styles.header}>
      <Link className={styles.logo} href="/" aria-label="StudyNao home" />
      <div className={styles.headerRight}><div className={styles.progress} aria-label={`Onboarding step ${profileStep ? 2 : 1} of 2`}><div className={styles.progressText}><span>YOUR STUDYNAO JOURNEY</span><strong>0{profileStep ? 2 : 1} / 02</strong></div><div className={styles.progressTrack}><span style={{ width: profileStep ? "100%" : "50%" }} /></div></div><ColorToggle /></div>
    </header>
    <section className={styles.stage} aria-label="StudyNao onboarding"><div className={styles.panel}>
      <div className={styles.hero}><p className={styles.eyebrow}>STUDYNAO · GETTING STARTED</p><h1>{profileStep ? "Make it yours." : "A new journey begins."}</h1><p>{profileStep ? "Tell us a little about yourself so we can prepare the right learning experience." : "First, choose how you’ll be part of StudyNao."}</p></div>
      <div className={styles.body}><div className={styles.stepLabel}><span>{profileStep ? "02" : "01"}</span><div><strong>{profileStep ? "Your profile" : "Choose your role"}</strong><small>{profileStep ? "A few details to get you started" : "How will you use StudyNao?"}</small></div></div>
        {!profileStep ? <div className={styles.roleForm}><SegmentedControl fullWidth size="md" value={role} onChange={(value) => setRole(value as "student" | "teacher")} data={[{ value: "student", label: "Student" }, { value: "teacher", label: "Teacher" }]} /><p className={styles.roleHint}>{role === "teacher" ? "Teacher accounts need admin approval before teaching access is enabled." : "Find classes that fit your goals and build your learning schedule."}</p><LandingActionButton loading={busy} onClick={() => void join()} rightSection={!busy && <IconArrowRight size={16} stroke={2.2} />}>Continue</LandingActionButton></div> :
        <form className={styles.form} onSubmit={submit}><Stack gap="lg">
          <TextInput label="WhatsApp number" placeholder="812 3456 7890" leftSection={<span className={styles.phonePrefix}>+62</span>} leftSectionWidth={58} type="tel" inputMode="numeric" autoComplete="tel-national" required minLength={8} value={whatsapp} onChange={(event) => setWhatsapp(localWhatsApp(event.currentTarget.value))} />
          {role === "student" ? <>
            <fieldset className={styles.gradeField}>
              <legend><IconSchool size={16} aria-hidden="true" /> Study level</legend>
              <div className={styles.gradePills}>
                {GRADES.map((grade) => <button key={grade} type="button" aria-pressed={studyLevel === grade} data-active={studyLevel === grade || undefined} onClick={() => setStudyLevel(grade)}>{grade}</button>)}
              </div>
            </fieldset>
            <TextInput label="Parent email" description="Optional" placeholder="e.g. parent@example.com" type="email" autoComplete="email" value={parentEmail} onChange={(event) => setParentEmail(event.currentTarget.value)} />
          </> : <>
            <SimpleGrid cols={{ base: 1, sm: 2 }}><TextInput label="Date of birth" type="date" required value={birthDate} onChange={(event) => setBirthDate(event.currentTarget.value)} /><TextInput label="Home province" required value={province} onChange={(event) => setProvince(event.currentTarget.value)} /></SimpleGrid>
            <Select label="Marital status" required data={[{ value: "single", label: "Single" }, { value: "married", label: "Married" }]} value={maritalStatus} onChange={(value) => setMaritalStatus(value ?? "single")} />
            <div className={styles.checkboxField}><Text fw={600} size="sm" mb={10}>Class types you teach</Text><Checkbox.Group value={classTypes} onChange={setClassTypes}><Group gap="md"><Checkbox value="private" label="Private" /><Checkbox value="group" label="Group" /></Group></Checkbox.Group></div>
            <MultiSelect label="Teaching languages" data={["English", "Chinese"]} value={languages} onChange={setLanguages} required />
            <Select label="Chinese proficiency (HSK)" description="Optional if you do not have an HSK certificate." clearable data={["1", "2", "3", "4", "5", "6"].map((level) => ({ value: level, label: `HSK ${level}` }))} value={hskLevel || null} onChange={(value) => setHskLevel(value ?? "")} />
            <MultiSelect label="Subjects you teach" data={availableSubjects.map((subject) => ({ value: String(subject.id), label: subject.name }))} value={subjectIds} onChange={setSubjectIds} required />
            <SimpleGrid cols={{ base: 1, sm: 2 }}><TextInput label="Bank" required value={bankName} onChange={(event) => setBankName(event.currentTarget.value)} /><TextInput label="Bank account number" required value={bankNumber} onChange={(event) => setBankNumber(event.currentTarget.value)} /></SimpleGrid>
            <TextInput label="Account holder name" required value={bankOwner} onChange={(event) => setBankOwner(event.currentTarget.value)} /><Alert color="yellow">After submission, your teacher profile will await admin approval before you can teach.</Alert>
          </>}
          <div className={styles.actions}><LandingActionButton type="submit" size="md" loading={busy} rightSection={!busy && <IconArrowRight size={16} stroke={2.2} />}>Save profile</LandingActionButton></div>
        </Stack></form>}
      </div>
    </div></section>
  </main>;
}
