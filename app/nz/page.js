import LeadsPage from "@/app/leads-page";
import { NZ_AREA_NAMES } from "@/lib/nz-areas";

export default async function NZPage({ searchParams }) {
  const params = await searchParams;
  return (
    <LeadsPage
      csvFile="/leads_nz.csv"
      cities={NZ_AREA_NAMES}
      regionLabel="Region"
      businessIdLabel="NZBN"
      country="NZ"
      countryName="New Zealand"
      initialFilterArea={params?.area || ""}
      initialFilterState={params?.state || params?.region || ""}
    />
  );
}
