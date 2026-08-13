import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationExperience } from "@/components/wedding/InvitationExperience";
import { getInvitationByToken } from "@/lib/invitation";

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: InvitationPageProps): Promise<Metadata> {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  return {
    title: `${invitation.settings.brideName} & ${invitation.settings.groomName} — Notre mariage`,
    description: `Une invitation personnelle pour célébrer le mariage de ${invitation.settings.brideName} et ${invitation.settings.groomName}.`,
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  return <InvitationExperience invitation={invitation} token={token} />;
}
