export const GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Others"];
export const BANKS = [
  { value: "BCA", label: "BCA" }, { value: "BRI", label: "BRI" },
  { value: "Mandiri", label: "Mandiri" }, { value: "BNI", label: "BNI" },
  { value: "BTN", label: "BTN" }, { value: "BSI", label: "BSI" },
  { value: "CIMB Niaga", label: "CIMB Niaga" }, { value: "Permata", label: "Permata" },
  { value: "Danamon", label: "Danamon" }, { value: "OCBC", label: "OCBC" },
  { value: "Maybank", label: "Maybank" }, { value: "DBS", label: "DBS" },
  { value: "Panin", label: "Panin" }, { value: "Mega", label: "Mega" },
  { value: "Sinarmas", label: "Sinarmas" }, { value: "UOB", label: "UOB" },
  { value: "BTPN", label: "BTPN (Jenius)" },
  { value: "Bank Jago", label: "Bank Jago" },
  { value: "SeaBank", label: "SeaBank" },
  { value: "Bank Digital BCA", label: "blu by BCA Digital" },
  { value: "Bank Neo Commerce", label: "Bank Neo Commerce (neobank)" },
  { value: "Bank Raya", label: "Bank Raya" },
  { value: "Allo Bank", label: "Allo Bank" },
  { value: "Superbank", label: "Superbank" },
  { value: "Bank Aladin Syariah", label: "Bank Aladin Syariah" },
  { value: "Krom Bank", label: "Krom Bank" },
  { value: "Bank Jasa Jakarta", label: "Bank Saqu (Bank Jasa Jakarta)" },
  { value: "__other__", label: "Other bank" },
];
export const localWhatsApp = (value: string) => value.replace(/\D/g, "").replace(/^62/, "").replace(/^0+/, "");

