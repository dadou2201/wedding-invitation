export default function LoadingInvitation() {
  return (
    <main className="invitation-loading" aria-busy="true" aria-label="Chargement de l’invitation">
      <div className="loading-monogram" aria-hidden="true">
        C<span>&amp;</span>D
      </div>
      <div className="loading-line" aria-hidden="true" />
      <p>Un instant précieux se prépare…</p>
      <p lang="he" dir="rtl">
        רגע מיוחד מתכונן עבורכם…
      </p>
    </main>
  );
}
