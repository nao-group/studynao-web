"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Center, Loader, SegmentedControl, Stack, TextInput } from "@mantine/core";
import { ColorToggle } from "@/components/color-toggle";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { IconArrowRight } from "@tabler/icons-react";
import type { Program, Role, StudyState, Subject } from "@/lib/types";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { joinStudyNao } from "@/lib/studynao-api";
import { getOnboardingData, getProvinces, saveOnboarding, uploadTeacherPhoto } from "../api";
import { BANKS, localWhatsApp } from "../data";
import type { ProvinceOption, StudentOnboarding, TeacherOnboarding } from "../types";
import styles from "../onboarding.module.css";
import { StudentFields } from "./StudentFields";
import { TeacherFields } from "./TeacherFields";

export default function OnboardingContent() {
  const router = useRouter();
  const [state, setState] = useState<StudyState | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [role, setRole] = useState<Role>("student");
  const [busy, setBusy] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [studyLevel, setStudyLevel] = useState("Grade 12");
  const [parentEmail, setParentEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [province, setProvince] = useState("");
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provincesFailed, setProvincesFailed] = useState(false);
  const [provinceAttempt, setProvinceAttempt] = useState(0);
  const [maritalStatus, setMaritalStatus] = useState("single");
  const [classTypes, setClassTypes] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [hskLevel, setHskLevel] = useState("");
  const [bankName, setBankName] = useState("");
  const [otherBank, setOtherBank] = useState(false);
  const [bankNumber, setBankNumber] = useState("");
  const [bankOwner, setBankOwner] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [hasSavedPhoto, setHasSavedPhoto] = useState(false);
  useEffect(() => {
    let active = true;
    getProvinces()
      .then((result) => { if (active) setProvinces(result); })
      .catch(() => { if (active) { setProvincesFailed(true); notifyError("Unable to load provinces. Please try again.", "Province list unavailable"); } })
      .finally(() => { if (active) setProvincesLoading(false); });
    return () => { active = false; };
  }, [provinceAttempt]);
  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role") === "teacher" ? "teacher" : "student";
    getOnboardingData(requestedRole)
      .then(({ profile, catalog }) => { setState(profile); setRole(requestedRole); setPrograms(catalog.items); setSubjects(catalog.subjects);
        if (profile.profile) {
          const saved = profile.profile;
          setWhatsapp(localWhatsApp(String(saved.whatsapp ?? ""))); setStudyLevel(saved.study_level === "Other" ? "Others" : String(saved.study_level || "Grade 12"));
          setParentEmail(String(saved.parent_email ?? "")); setBirthDate(String(saved.birth_date ?? ""));
          setProvince(String(saved.province ?? "")); setMaritalStatus(String(saved.marital_status ?? "single"));
          setClassTypes(Array.isArray(saved.class_types) ? saved.class_types.map(String) : []);
          setLanguages(Array.isArray(saved.teaching_languages) ? saved.teaching_languages.map(String) : []);
          setSubjectIds(Array.isArray(saved.subject_ids) ? saved.subject_ids.map(String) : []);
          setHskLevel(saved.hsk_level ? String(saved.hsk_level) : "");
          const savedBank = String(saved.bank_name ?? "");
          setBankName(savedBank); setOtherBank(Boolean(savedBank && !BANKS.some((bank) => bank.value === savedBank)));
          setBankNumber(String(saved.bank_account_number ?? "")); setBankOwner(String(saved.bank_account_name ?? ""));
          setHasSavedPhoto(Boolean(saved.has_photo)); setPhotoPreview(String(saved.photo_url ?? ""));
        } if (profile.membership && !["onboarding", "rejected"].includes(profile.membership.status)) router.replace(`/dashboard?role=${requestedRole}`); })
      .catch(() => router.replace("/login"));
  }, [router]);
  async function join() {
    setBusy(true);
    try { setState(await joinStudyNao(role)); }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to select a role."); }
    finally { setBusy(false); }
  }
  function matchingSubjectIds(types: string[], teachingLanguages: string[]) {
    return new Set(programs.filter((program) =>
      (!types.length || types.includes(program.class_type)) &&
      (!teachingLanguages.length || teachingLanguages.includes(program.teaching_language))
    ).flatMap((program) => program.subject_ids));
  }
  function changeClassTypes(next: string[]) {
    setClassTypes(next);
    const eligible = matchingSubjectIds(next, languages);
    setSubjectIds((current) => current.filter((id) => eligible.has(Number(id))));
  }
  function changeLanguages(next: string[]) {
    setLanguages(next);
    const eligible = matchingSubjectIds(classTypes, next);
    setSubjectIds((current) => current.filter((id) => eligible.has(Number(id))));
  }
  function changePhoto(file: File | null) {
    if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0)) {
      notifyError("Choose a JPEG, PNG, or WEBP photo smaller than 5 MB.", "Invalid photo");
      return;
    }
    setPhotoFile(file);
    if (!file) { setPhotoPreview(hasSavedPhoto ? String(state?.profile?.photo_url ?? "") : ""); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (role === "teacher" && !photoFile && !hasSavedPhoto) { notifyError("Please upload a profile photo before submitting.", "Photo required"); return; }
    setBusy(true);
    try {
      const fullWhatsApp = `+62${whatsapp}`;
      const body: StudentOnboarding | TeacherOnboarding = role === "student" ? { whatsapp: fullWhatsApp, study_level: studyLevel, parent_email: parentEmail || null } : {
        whatsapp: fullWhatsApp, birth_date: birthDate, province, marital_status: maritalStatus,
        class_types: classTypes, teaching_languages: languages, subject_ids: subjectIds.map(Number),
        hsk_level: hskLevel ? Number(hskLevel) : null, bank_name: bankName, bank_account_number: bankNumber, bank_account_name: bankOwner,
      };
      let saved = await saveOnboarding(role, body);
      if (role === "teacher" && photoFile) saved = await uploadTeacherPhoto(photoFile);
      const privateAvailabilityNeeded = saved.membership?.status === "availability_required";
      notifySuccess("Profile saved", privateAvailabilityNeeded ? "Choose your weekly availability to submit your application for admin approval." : role === "teacher" ? "Your complete application is awaiting admin approval." : "Your StudyNao profile is ready.");
      router.replace(privateAvailabilityNeeded ? "/availability?role=teacher" : `/dashboard?role=${role}`);
    } catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to save your profile."); }
    finally { setBusy(false); }
  }
  if (!state) return <Center mih="100vh"><Loader aria-label="Loading onboarding" /></Center>;
  const profileStep = Boolean(state.membership);
  const eligibleSubjectIds = matchingSubjectIds(classTypes, languages);
  const availableSubjects = subjects.filter((subject) => eligibleSubjectIds.has(subject.id));
  const selectedProvince = provinces.find((item) => item.value.toLowerCase() === province.toLowerCase())?.value ?? province;
  const provinceOptions = selectedProvince && !provinces.some((item) => item.value === selectedProvince)
    ? [{ value: selectedProvince, label: selectedProvince }, ...provinces] : provinces;
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
          {role === "student" ? <StudentFields studyLevel={studyLevel} onStudyLevelChange={setStudyLevel} parentEmail={parentEmail} onParentEmailChange={setParentEmail} /> : <TeacherFields
            photoPreview={photoPreview} photoFile={photoFile} hasSavedPhoto={hasSavedPhoto} onPhotoChange={changePhoto}
            birthDate={birthDate} onBirthDateChange={setBirthDate} provinceOptions={provinceOptions} selectedProvince={selectedProvince}
            onProvinceChange={setProvince} provincesLoading={provincesLoading} provincesFailed={provincesFailed}
            onRetryProvinces={() => { setProvincesLoading(true); setProvincesFailed(false); setProvinceAttempt((attempt) => attempt + 1); }}
            maritalStatus={maritalStatus} onMaritalStatusChange={setMaritalStatus} classTypes={classTypes} onClassTypesChange={changeClassTypes}
            languages={languages} onLanguagesChange={changeLanguages} hskLevel={hskLevel} onHskLevelChange={setHskLevel}
            availableSubjects={availableSubjects} subjectIds={subjectIds} onSubjectIdsChange={setSubjectIds}
            bankName={bankName} otherBank={otherBank} onBankChoiceChange={(value) => { setOtherBank(value === "__other__"); setBankName(value === "__other__" ? "" : value ?? ""); }}
            onBankNameChange={setBankName} bankNumber={bankNumber} onBankNumberChange={setBankNumber} bankOwner={bankOwner} onBankOwnerChange={setBankOwner}
          />}
          <div className={styles.actions}><LandingActionButton type="submit" size="md" loading={busy} rightSection={!busy && <IconArrowRight size={16} stroke={2.2} />}>{role === "teacher" && classTypes.includes("private") ? "Continue to availability" : role === "teacher" ? "Submit for approval" : "Save profile"}</LandingActionButton></div>
        </Stack></form>}
      </div>
    </div></section>
  </main>;
}
