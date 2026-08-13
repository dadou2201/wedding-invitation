import Link from "next/link";

export default function InvitationNotFound() {
  return (
    <main className="invitation-state-page">
      <div className="state-ornament" aria-hidden="true">
        C<span>&amp;</span>D
      </div>
      <section lang="fr" dir="ltr">
        <p className="eyebrow">Clara &amp; David</p>
        <h1>Invitation introuvable</h1>
        <p>Ce lien ne correspond à aucune invitation. Vérifiez-le ou contactez directement les mariés.</p>
      </section>
      <div className="state-divider" aria-hidden="true" />
      <section lang="he" dir="rtl">
        <p className="eyebrow">קלרה ודוד</p>
        <h2>ההזמנה לא נמצאה</h2>
        <p>הקישור אינו תואם להזמנה קיימת. בדקו אותו או צרו קשר ישירות עם בני הזוג.</p>
      </section>
      <Link href="/" className="secondary-button focus-ring">
        Retour / חזרה
      </Link>
    </main>
  );
}
