import LeadsPage from "@/app/leads-page";
import { AU_AREA_NAMES } from "@/lib/au-areas";

export default async function AUPage({ searchParams }) {
  const params = await searchParams;
  return (
    <LeadsPage
      csvFile="/leads_au.csv"
      cities={AU_AREA_NAMES}
      regionLabel="State"
      businessIdLabel="ABN"
      country="AU"
      countryName="Australia"
      initialFilterArea={params?.area || ""}
    />
  );
}
