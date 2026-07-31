import { LookupTablePage } from "@/components/settings/lookup-table-page";
import { getSettingsConfig } from "@/config/settings";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ resource: string }>;
}

export default async function SettingsResourcePage({ params }: PageProps) {
  const { resource } = await params;
  const config = getSettingsConfig(resource);

  if (!config) {
    notFound();
  }

  return <LookupTablePage config={config} />;
}
