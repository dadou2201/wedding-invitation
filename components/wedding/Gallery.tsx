import Image from "next/image";
import { getTranslations } from "@/lib/translations";
import type { GalleryImage, Language } from "@/lib/types";

interface GalleryProps {
  images: GalleryImage[];
  language: Language;
}

export function Gallery({ images, language }: GalleryProps) {
  const t = getTranslations(language).gallery;

  return (
    <section id="gallery" className="gallery-section" aria-labelledby="gallery-title">
      <div className="section-shell">
        <div className="gallery-heading section-heading--center reveal-section">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="gallery-title" className="section-title">
            {t.title}
          </h2>
          <p>{t.text}</p>
          <span className="paper-ornament" aria-hidden="true" />
        </div>

        <div className="editorial-gallery">
          {images.map((image, index) => (
            <figure
              className={`gallery-frame gallery-frame--${index + 1} reveal-section`}
              key={image.id}
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            >
              <Image
                src={image.src}
                alt={image.alt[language]}
                fill
                sizes={
                  index === 2
                    ? "(max-width: 767px) 92vw, 82vw"
                    : "(max-width: 767px) 84vw, 39vw"
                }
                className="gallery-image"
                style={{ objectPosition: image.focalPoint }}
              />
              <figcaption aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
