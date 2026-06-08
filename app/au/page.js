import LeadsPage from "@/app/leads-page";
import { AU_AREA_NAMES } from "@/lib/au-areas";

export default function AUPage() {
  return (
    <LeadsPage
      title="Buyers Agents - Australia 🇦🇺"
      csvFile="/leads_au.csv"
      cities={AU_AREA_NAMES}
      regionLabel="State"
      businessIdLabel="ABN"
      country="AU"
      countryName="Australia"
    />
  );
}
