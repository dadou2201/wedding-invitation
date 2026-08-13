import "server-only";

import { cache } from "react";
import {
  BaserowConfigurationError,
  getBaserowConfigurationStatus,
  getEvents,
  getGallery,
  getGuestByToken,
  getSettings,
} from "@/lib/baserow";
import {
  getInvitedEvents,
  getVisibleGallery,
} from "@/lib/invitation-utils";
import { getMockInvitationByToken } from "@/lib/mock-data";
import type { InvitationData } from "@/lib/types";

export const getInvitationByToken = cache(
  async (token: string): Promise<InvitationData | null> => {
    const configurationStatus = getBaserowConfigurationStatus();

    if (configurationStatus === "partial") {
      throw new BaserowConfigurationError();
    }

    if (configurationStatus === "unconfigured") {
      if (process.env.NODE_ENV !== "development") {
        return null;
      }

      const mockInvitation = getMockInvitationByToken(token);

      if (!mockInvitation) {
        return null;
      }

      return {
        ...mockInvitation,
        events: getInvitedEvents(mockInvitation.events, mockInvitation.guest),
        gallery: getVisibleGallery(mockInvitation.gallery),
      };
    }

    const guest = await getGuestByToken(token);

    if (!guest) {
      return null;
    }

    const [events, gallery, settings] = await Promise.all([
      getEvents(),
      getGallery(),
      getSettings(),
    ]);

    return {
      guest,
      events: getInvitedEvents(events, guest),
      gallery: getVisibleGallery(gallery),
      settings,
    };
  },
);
