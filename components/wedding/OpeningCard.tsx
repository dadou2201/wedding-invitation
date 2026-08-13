import Image from "next/image";

interface OpeningCardProps {
  onDiscover: () => void;
}

export function OpeningCard({ onDiscover }: OpeningCardProps) {
  return (
    <main className="opening-page" lang="fr" dir="ltr">
      <div className="opening-page__glow" aria-hidden="true" />

      <article className="opening-card" aria-labelledby="opening-names">
        <div className="opening-card__inner">
          <div className="opening-monogram">
            <Image
              src="/images/monogram-cd.png"
              alt="Monogramme de Clara et David"
              fill
              priority
              sizes="(max-width: 600px) 48vw, 220px"
            />
          </div>

          <div className="opening-ornament" aria-hidden="true">
            <span />
            <i>◆</i>
            <span />
          </div>

          <blockquote className="opening-quote">
            Parce que ce jour ne serait pas le même sans vous, nous vous
            invitons à célébrer notre mariage à nos côtés.
          </blockquote>

          <h1 id="opening-names" className="opening-names">
            Clara <span>&amp;</span> David
          </h1>

          <p className="opening-date">Novembre 2026 <span>—</span> Israël</p>

          <button
            type="button"
            className="opening-discover focus-ring"
            onClick={onDiscover}
          >
            <span>Découvrir</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13m-5-5 5 5-5 5" />
            </svg>
          </button>
        </div>
      </article>
    </main>
  );
}
