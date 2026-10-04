import Link from "next/link";
import { ColorToggle } from "@/components/color-toggle";
import styles from "./auth-frame.module.css";

type Mode = "home" | "login" | "register" | "reset";

const copy: Record<Mode, { kicker: string; title: string; body: string }> = {
  home: { kicker: "Learn with purpose", title: "Find your next step in learning.", body: "The right classes, supportive teachers, and a clear schedule—all in one place." },
  login: { kicker: "Your next breakthrough starts here", title: "Keep growing. Your next step starts here.", body: "Pick up where you left off and find every class in one clear schedule." },
  register: { kicker: "A new learning journey awaits", title: "Open the door to everything you can achieve.", body: "Learn with purpose, meet the right teacher, and move forward one lesson at a time." },
  reset: { kicker: "Get back to your journey", title: "Every learning journey can begin again.", body: "Reset your account access and return to the classes waiting for you." },
};

const eyebrow: Record<Mode, string> = {
  home: "GET STARTED",
  login: "WELCOME BACK",
  register: "GET STARTED",
  reset: "RESET PASSWORD",
};

function Logo() {
  return (
    <Link href="/" className={styles.logoLink} aria-label="StudyNao home">
      <span className={styles.logo} aria-hidden="true" />
    </Link>
  );
}

function AmbientSky() {
  return (
    <div className={styles.ambientSky} aria-hidden="true">
      <span className={`${styles.cloud} ${styles.cloudOne}`} />
      <span className={`${styles.cloud} ${styles.cloudTwo}`} />
      <span className={`${styles.cloud} ${styles.cloudThree}`} />
      <span className={`${styles.bird} ${styles.birdOne}`} />
      <span className={`${styles.bird} ${styles.birdTwo}`} />
      <span className={`${styles.bird} ${styles.birdThree}`} />
    </div>
  );
}

export function AuthFrame({ title, description, children, mode = "home" }: { title: string; description: string; children: React.ReactNode; mode?: Mode }) {
  const hero = copy[mode];
  return (
    <main className={styles.shell}>
      <div className={styles.hero}>
        <div className={styles.wash} />
        <AmbientSky />
        <div className={styles.heroHeader}><Logo /><span className={styles.chapter}>LEARN · CONNECT · GROW</span></div>
        <div className={styles.heroCopy}><p className={styles.kicker}>{hero.kicker}</p><p className={styles.heroTitle}>{hero.title}</p><p className={styles.heroBody}>{hero.body}</p></div>
      </div>
      <section className={styles.formPanel} aria-label={title}>
        <div className={styles.mobileBrand}><Logo /></div>
        <div className={styles.formCard}>
          <p className={styles.eyebrow}>{eyebrow[mode]}</p>
          <h1 className={styles.formTitle}>{title}</h1>
          <p className={styles.formDescription}>{description}</p>
          {children}
        </div>
      </section>
      <div className={styles.themeToggle}><ColorToggle /></div>
    </main>
  );
}
