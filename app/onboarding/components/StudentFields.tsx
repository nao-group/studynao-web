import { TextInput } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { GRADES } from "../data";
import type { StudentFieldsProps } from "../types";
import styles from "../onboarding.module.css";

export function StudentFields({ studyLevel, onStudyLevelChange, parentEmail, onParentEmailChange }: StudentFieldsProps) {
  return <>
    <fieldset className={styles.gradeField}>
      <legend><IconSchool size={16} aria-hidden="true" /> Study level</legend>
      <div className={styles.gradePills}>
        {GRADES.map((grade) => <button key={grade} type="button" aria-pressed={studyLevel === grade} data-active={studyLevel === grade || undefined} onClick={() => onStudyLevelChange(grade)}>{grade}</button>)}
      </div>
    </fieldset>
    <TextInput label="Parent email" description="Optional" placeholder="e.g. parent@example.com" type="email" autoComplete="email" value={parentEmail} onChange={(event) => onParentEmailChange(event.currentTarget.value)} />
  </>;
}
