import { LookupFormPage } from "@/components/settings/lookup-form-page";
import { SettingsGuard } from "@/components/auth/settings-guard";
import { getSettingsConfig } from "@/config/settings";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ resource: string; id: string }>;
}

export default async function EditLookupPage({ params }: PageProps) {
  const { resource, id } = await params;
  const config = getSettingsConfig(resource);

  if (!config) {
    notFound();
  }

  return (
    <SettingsGuard requireManage>
      <LookupFormPage config={config} mode="edit" id={id} />
    </SettingsGuard>
  );
}
