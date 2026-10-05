import type { Metadata } from "next";
import localFont from "next/font/local";
import { mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = { title: "StudyNao", description: "Classes and learning schedules with NAO Group." };
const poppins = localFont({
  src: [
    { path: "../fonts/poppins-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/poppins-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/poppins-latin-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/poppins-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});
const script = `(function(){try{var v=localStorage.getItem('nao-color-scheme');document.documentElement.setAttribute('data-mantine-color-scheme',v==='dark'?'dark':'light')}catch(e){}})()`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" {...mantineHtmlProps} className={poppins.variable}><head><script data-mantine-script dangerouslySetInnerHTML={{ __html: script }} /></head><body suppressHydrationWarning><Providers>{children}</Providers></body></html>;
}
