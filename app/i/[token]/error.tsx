"use client";

export default function InvitationError({ reset }: { reset: () => void }) {
  return (
    <main className="invitation-state-page">
      <div className="state-ornament" aria-hidden="true">
        C<span>&amp;</span>D
      </div>
      <section lang="fr" dir="ltr">
        <p className="eyebrow">Un petit contretemps</p>
        <h1>Connexion impossible</h1>
        <p>L’invitation ne peut pas être affichée pour le moment. Merci de réessayer dans quelques instants.</p>
      </section>
      <div className="state-divider" aria-hidden="true" />
      <section lang="he" dir="rtl">
        <p className="eyebrow">תקלה קטנה בדרך</p>
        <h2>לא ניתן להתחבר</h2>
        <p>לא ניתן להציג את ההזמנה כרגע. נסו שוב בעוד מספר רגעים.</p>
      </section>
      <button type="button" className="secondary-button focus-ring" onClick={reset}>
        Réessayer / ניסיון נוסף
      </button>
    </main>
  );
}
