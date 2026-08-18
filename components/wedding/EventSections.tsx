import { FramedEventInvitation } from "@/components/wedding/FramedEventInvitation";
import { getTranslations } from "@/lib/translations";
import type {
  EventKey,
  Language,
  WeddingEvent,
  WeddingSettings,
} from "@/lib/types";

interface EventSectionsProps {
  events: WeddingEvent[];
  language: Language;
  settings: WeddingSettings;
}

const DISPLAY_ORDER: Record<EventKey, number> = {
  wedding: 0,
  henna: 1,
  shabbat: 2,
};

export function EventSections({
  events,
  language,
  settings,
}: EventSectionsProps) {
  const t = getTranslations(language).events;
  const displayedEvents = [...events].sort(
    (first, second) => DISPLAY_ORDER[first.key] - DISPLAY_ORDER[second.key],
  );

  if (displayedEvents.length === 0) {
    return null;
  }

  return (
    <section
      id="events"
      className="events-section framed-events"
      aria-labelledby="events-title"
    >
      <h2 id="events-title" className="visually-hidden">
        {t.title}
      </h2>
      <div className="framed-events__list">
        {displayedEvents.map((event) => {
          return (
            <FramedEventInvitation
              key={event.key}
              event={event}
              language={language}
              settings={settings}
            />
          );
        })}
      </div>
    </section>
  );
}
