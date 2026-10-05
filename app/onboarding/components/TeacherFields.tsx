import { Alert, Avatar, Checkbox, FileInput, Group, MultiSelect, Select, SimpleGrid, Text, TextInput } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { BANKS } from "../data";
import type { TeacherFieldsProps } from "../types";
import styles from "../onboarding.module.css";

export function TeacherFields(props: TeacherFieldsProps) {
  return <>
    <div className={styles.photoField}>
      <Group gap="md" align="center" wrap="nowrap"><Avatar src={props.photoPreview || undefined} size={72} radius="xl" color="yellow"><IconPhoto size={28} /></Avatar><div><Text fw={650} size="sm">Profile photo <span aria-hidden="true">*</span></Text><Text size="xs" c="dimmed">Use a clear portrait. JPEG, PNG, or WEBP; up to 5 MB.</Text></div></Group>
      <FileInput mt="sm" accept="image/jpeg,image/png,image/webp" placeholder={props.hasSavedPhoto ? "Replace your photo" : "Choose a photo"} value={props.photoFile} onChange={props.onPhotoChange} clearable aria-label="Upload teacher profile photo" />
    </div>
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      <DatePickerInput label="Date of birth" placeholder="Choose your birth date" valueFormat="DD MMMM YYYY" required value={props.birthDate || null} onChange={(value) => props.onBirthDateChange(value ?? "")} maxDate={new Date()} />
      <div><Select label="Home province" placeholder={props.provincesLoading ? "Loading provinces..." : "Select province"} data={props.provinceOptions} value={props.selectedProvince || null} onChange={(value) => props.onProvinceChange(value ?? "")} searchable nothingFoundMessage="No province found" disabled={props.provincesLoading} required />{props.provincesFailed && <LandingActionButton type="button" tone="secondary" size="xs" mt={6} onClick={props.onRetryProvinces}>Retry loading provinces</LandingActionButton>}</div>
    </SimpleGrid>
    <Select label="Marital status" required data={[{ value: "single", label: "Single" }, { value: "married", label: "Married" }]} value={props.maritalStatus} onChange={(value) => props.onMaritalStatusChange(value ?? "single")} />
    <div className={styles.checkboxField}><Text fw={600} size="sm" mb={10}>Class types you teach</Text><Checkbox.Group value={props.classTypes} onChange={props.onClassTypesChange}><Group gap="md"><Checkbox value="private" label="Private" /><Checkbox value="group" label="Group" /></Group></Checkbox.Group></div>
    <MultiSelect label="Teaching languages" data={["English", "Chinese"]} value={props.languages} onChange={props.onLanguagesChange} required />
    <Select label="Chinese proficiency (HSK)" description="Optional if you do not have an HSK certificate." clearable data={["1", "2", "3", "4", "5", "6"].map((level) => ({ value: level, label: `HSK ${level}` }))} value={props.hskLevel || null} onChange={(value) => props.onHskLevelChange(value ?? "")} />
    <MultiSelect label="Subjects you teach" placeholder="Select subjects" description="Choose class types and teaching languages to narrow the options." nothingFoundMessage="No subjects match these choices" searchable data={props.availableSubjects.map((subject) => ({ value: String(subject.id), label: subject.name }))} value={props.subjectIds} onChange={props.onSubjectIdsChange} required />
    <SimpleGrid cols={{ base: 1, sm: 2 }}><Select label="Bank" placeholder="Search for your bank" searchable nothingFoundMessage="No match. Clear search and choose Other bank." data={BANKS} value={props.otherBank ? "__other__" : props.bankName || null} onChange={props.onBankChoiceChange} required /><TextInput label="Bank account number" required value={props.bankNumber} onChange={(event) => props.onBankNumberChange(event.currentTarget.value)} /></SimpleGrid>
    {props.otherBank && <TextInput label="Other bank name" placeholder="Enter your bank name" required value={props.bankName} onChange={(event) => props.onBankNameChange(event.currentTarget.value)} />}
    <TextInput label="Account holder name" required value={props.bankOwner} onChange={(event) => props.onBankOwnerChange(event.currentTarget.value)} />
    <Alert color="yellow">After submission, your teacher profile will await admin approval before you can teach.</Alert>
  </>;
}
