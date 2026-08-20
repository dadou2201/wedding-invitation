import "server-only";

import {
  BASEROW_FIELDS,
  normalizeBoolean,
  normalizeDate,
  normalizeLanguage,
  normalizeNumber,
  normalizeRsvpStatus,
  normalizeSelectionValue,
  normalizeSelectionValues,
  normalizeText,
  normalizeUrl,
  toPublicImagePath,
} from "@/lib/baserow-fields";
import { isValidPublicToken } from "@/lib/invitation-tokens";
import {
  type EventKey,
  type GalleryImage,
  type Guest,
  type GuestMember,
  type RsvpStatus,
  SHUTTLE_CITIES,
  type ShuttleCity,
  type WeddingEvent,
  type WeddingSettings,
} from "@/lib/types";

type BaserowRow = Record<string, unknown> & { id: number };

interface BaserowRowsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BaserowRow[];
}

interface BaserowFieldSchema {
  id: number;
  name: string;
  type?: string;
  selectOptions: BaserowSelectOption[];
  dateIncludeTime: boolean;
  linkRowTableId: number | null;
  linkRowRelatedFieldId: number | null;
}

interface BaserowSelectOption {
  id: number;
  value: string;
}

interface BaserowConfig {
  apiUrl: string;
  apiToken: string;
  tableIds: {
    guests: string;
    events: string;
    gallery: string;
    settings: string;
  };
}

type CachePolicy =
  | { kind: "private" }
  | { kind: "global"; revalidate: number };

export type BaserowConfigurationStatus =
  | "configured"
  | "unconfigured"
  | "partial";

export interface UpdateGuestRsvpInput {
  token: string;
  guestMembers: GuestMember[];
  people: Array<{
    id: string;
    responses: Partial<Record<EventKey, RsvpStatus>>;
  }>;
  guestsCount: number;
  shuttleInterest: ShuttleCity[];
  message: string;
}

export class BaserowConfigurationError extends Error {
  constructor() {
    super("Baserow is not fully configured.");
    this.name = "BaserowConfigurationError";
  }
}

export class BaserowRequestError extends Error {
  readonly status: number | null;

  constructor(status: number | null = null) {
    super("The Baserow request could not be completed.");
    this.name = "BaserowRequestError";
    this.status = status;
  }
}

export class BaserowDataError extends Error {
  constructor() {
    super("The Baserow response does not match the expected schema.");
    this.name = "BaserowDataError";
  }
}

const DEFAULT_API_URL = "https://api.baserow.io";
const GLOBAL_DATA_REVALIDATE_SECONDS = 300;
const FIELD_SCHEMA_REVALIDATE_SECONDS = 3600;
const PAGE_SIZE = 200;
const MAX_PAGES = 100;
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 10_000;

const IMAGE_METADATA: Record<
  string,
  { width: number; height: number; focalPoint?: string }
> = {
  "hero.jpg": { width: 2316, height: 3088, focalPoint: "50% 58%" },
  "nous2.jpg": { width: 1536, height: 2048, focalPoint: "50% 42%" },
  "nous3.jpg": { width: 2048, height: 1536, focalPoint: "50% 50%" },
};

function requiredEnvironmentValues() {
  return [
    process.env.BASEROW_API_TOKEN,
    process.env.BASEROW_GUESTS_TABLE_ID,
    process.env.BASEROW_EVENTS_TABLE_ID,
    process.env.BASEROW_GALLERY_TABLE_ID,
    process.env.BASEROW_SETTINGS_TABLE_ID,
  ].map((value) => value?.trim() ?? "");
}

export function getBaserowConfigurationStatus(): BaserowConfigurationStatus {
  const values = requiredEnvironmentValues();
  const configuredValues = values.filter(Boolean).length;

  if (configuredValues === 0) {
    return "unconfigured";
  }

  if (configuredValues === values.length) {
    return "configured";
  }

  return "partial";
}

export function isBaserowConfigured(): boolean {
  return getBaserowConfigurationStatus() === "configured";
}

function getBaserowConfig(): BaserowConfig {
  if (!isBaserowConfigured()) {
    throw new BaserowConfigurationError();
  }

  const apiUrl = (process.env.BASEROW_API_URL?.trim() || DEFAULT_API_URL).replace(
    /\/+$/,
    "",
  );
  const apiToken = process.env.BASEROW_API_TOKEN!.trim();
  const tableIds = {
    guests: process.env.BASEROW_GUESTS_TABLE_ID!.trim(),
    events: process.env.BASEROW_EVENTS_TABLE_ID!.trim(),
    gallery: process.env.BASEROW_GALLERY_TABLE_ID!.trim(),
    settings: process.env.BASEROW_SETTINGS_TABLE_ID!.trim(),
  };

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(apiUrl);
  } catch {
    throw new BaserowConfigurationError();
  }

  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    throw new BaserowConfigurationError();
  }

  if (Object.values(tableIds).some((tableId) => !/^\d+$/.test(tableId))) {
    throw new BaserowConfigurationError();
  }

  return { apiUrl, apiToken, tableIds };
}

function createRequestInit(
  apiToken: string,
  cachePolicy: CachePolicy,
): RequestInit {
  const baseInit: RequestInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Token ${apiToken}`,
    },
  };

  if (cachePolicy.kind === "private") {
    return { ...baseInit, cache: "no-store" };
  }

  return {
    ...baseInit,
    next: { revalidate: cachePolicy.revalidate },
  };
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

async function delay(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function baserowGet(
  pathname: string,
  searchParams: URLSearchParams,
  cachePolicy: CachePolicy,
): Promise<unknown> {
  const config = getBaserowConfig();
  const url = new URL(pathname, `${config.apiUrl}/`);
  url.search = searchParams.toString();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...createRequestInit(config.apiToken, cachePolicy),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) {
        return (await response.json()) as unknown;
      }

      if (attempt < MAX_RETRIES && isRetryableStatus(response.status)) {
        await delay(250 * 2 ** attempt);
        continue;
      }

      throw new BaserowRequestError(response.status);
    } catch (error) {
      if (error instanceof BaserowRequestError) {
        throw error;
      }

      if (attempt === MAX_RETRIES) {
        throw new BaserowRequestError();
      }

      await delay(250 * 2 ** attempt);
    }
  }

  throw new BaserowRequestError();
}

function isBaserowRow(value: unknown): value is BaserowRow {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as { id?: unknown }).id === "number"
  );
}

function parseRowsResponse(value: unknown): BaserowRowsResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !Array.isArray((value as { results?: unknown }).results)
  ) {
    throw new BaserowDataError();
  }

  const rawResponse = value as {
    count?: unknown;
    next?: unknown;
    previous?: unknown;
    results: unknown[];
  };
  const results = rawResponse.results.filter(isBaserowRow);

  if (results.length !== rawResponse.results.length) {
    throw new BaserowDataError();
  }

  return {
    count:
      typeof rawResponse.count === "number"
        ? rawResponse.count
        : rawResponse.results.length,
    next: typeof rawResponse.next === "string" ? rawResponse.next : null,
    previous:
      typeof rawResponse.previous === "string" ? rawResponse.previous : null,
    results,
  };
}

async function getFieldId(tableId: string, fieldName: string): Promise<number> {
  const fields = await getFieldSchemas(tableId);
  const field = fields.find((candidate) => candidate.name === fieldName);

  if (!field) {
    throw new BaserowDataError();
  }

  return field.id;
}

async function getFieldSchemas(tableId: string): Promise<BaserowFieldSchema[]> {
  const response = await baserowGet(
    `api/database/fields/table/${tableId}/`,
    new URLSearchParams(),
    { kind: "global", revalidate: FIELD_SCHEMA_REVALIDATE_SECONDS },
  );

  if (!Array.isArray(response)) {
    throw new BaserowDataError();
  }

  return response.flatMap((field): BaserowFieldSchema[] => {
    if (typeof field !== "object" || field === null) {
      return [];
    }

    const candidate = field as {
      id?: unknown;
      name?: unknown;
      type?: unknown;
      select_options?: unknown;
      date_include_time?: unknown;
      link_row_table_id?: unknown;
      link_row_related_field_id?: unknown;
    };

    if (
      typeof candidate.id !== "number" ||
      typeof candidate.name !== "string"
    ) {
      return [];
    }

    const selectOptions = Array.isArray(candidate.select_options)
      ? candidate.select_options.flatMap((option): BaserowSelectOption[] => {
          if (typeof option !== "object" || option === null) {
            return [];
          }

          const parsedOption = option as { id?: unknown; value?: unknown };

          return typeof parsedOption.id === "number" &&
            typeof parsedOption.value === "string"
            ? [{ id: parsedOption.id, value: parsedOption.value }]
            : [];
        })
      : [];

    return [
      {
        id: candidate.id,
        name: candidate.name,
        type: typeof candidate.type === "string" ? candidate.type : undefined,
        selectOptions,
        dateIncludeTime: candidate.date_include_time === true,
        linkRowTableId:
          typeof candidate.link_row_table_id === "number"
            ? candidate.link_row_table_id
            : null,
        linkRowRelatedFieldId:
          typeof candidate.link_row_related_field_id === "number"
            ? candidate.link_row_related_field_id
            : null,
      },
    ];
  });
}

async function getRowsPage(
  tableId: string,
  page: number,
  cachePolicy: CachePolicy,
  additionalParams?: Record<string, string>,
): Promise<BaserowRowsResponse> {
  const searchParams = new URLSearchParams({
    user_field_names: "true",
    size: String(PAGE_SIZE),
    page: String(page),
    ...additionalParams,
  });
  const response = await baserowGet(
    `api/database/rows/table/${tableId}/`,
    searchParams,
    cachePolicy,
  );

  return parseRowsResponse(response);
}

async function getAllRows(tableId: string): Promise<BaserowRow[]> {
  const rows: BaserowRow[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await getRowsPage(
      tableId,
      page,
      { kind: "global", revalidate: GLOBAL_DATA_REVALIDATE_SECONDS },
    );
    rows.push(...response.results);

    if (!response.next || rows.length >= response.count) {
      return rows;
    }
  }

  throw new BaserowDataError();
}

async function getAllPrivateRows(
  tableId: string,
  additionalParams: Record<string, string>,
): Promise<BaserowRow[]> {
  const rows: BaserowRow[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await getRowsPage(
      tableId,
      page,
      { kind: "private" },
      additionalParams,
    );
    rows.push(...response.results);

    if (!response.next || rows.length >= response.count) {
      return rows;
    }
  }

  throw new BaserowDataError();
}

async function updateBaserowRow(
  tableId: string,
  rowId: number,
  body: Record<string, unknown>,
): Promise<BaserowRow> {
  const config = getBaserowConfig();
  const url = new URL(
    `api/database/rows/table/${tableId}/${rowId}/`,
    `${config.apiUrl}/`,
  );
  url.searchParams.set("user_field_names", "true");

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) {
        const row = (await response.json()) as unknown;

        if (!isBaserowRow(row)) {
          throw new BaserowDataError();
        }

        return row;
      }

      if (attempt < MAX_RETRIES && isRetryableStatus(response.status)) {
        await delay(250 * 2 ** attempt);
        continue;
      }

      throw new BaserowRequestError(response.status);
    } catch (error) {
      if (
        error instanceof BaserowRequestError ||
        error instanceof BaserowDataError
      ) {
        throw error;
      }

      if (attempt === MAX_RETRIES) {
        throw new BaserowRequestError();
      }

      await delay(250 * 2 ** attempt);
    }
  }

  throw new BaserowRequestError();
}

function normalizeEventKey(value: unknown): EventKey | null {
  const normalized = normalizeSelectionValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("en-US");

  if (["wedding", "mariage", "חתונה"].includes(normalized)) {
    return "wedding";
  }

  if (["henna", "henne", "hina", "חינה"].includes(normalized)) {
    return "henna";
  }

  if (["shabbat", "chabbat", "שבת", "שבת חתן"].includes(normalized)) {
    return "shabbat";
  }

  return null;
}

function normalizeShuttleInterest(value: unknown): ShuttleCity[] {
  const values = normalizeSelectionValues(value).map((candidate) =>
    candidate.toLocaleLowerCase("en-US"),
  );

  return SHUTTLE_CITIES.filter((city) =>
    values.includes(city.toLocaleLowerCase("en-US")),
  );
}

function normalizeLinkedRowIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((candidate): number[] => {
    if (typeof candidate === "number" && Number.isInteger(candidate)) {
      return [candidate];
    }

    if (
      typeof candidate === "object" &&
      candidate !== null &&
      typeof (candidate as { id?: unknown }).id === "number"
    ) {
      return [(candidate as { id: number }).id];
    }

    return [];
  });
}

function mapGuestRow(row: BaserowRow): Guest {
  const fields = BASEROW_FIELDS.guests;
  const maxGuests = Math.max(
    1,
    Math.floor(normalizeNumber(row[fields.maxGuests], 1)),
  );
  const guestsCount = Math.min(
    maxGuests,
    Math.max(1, Math.floor(normalizeNumber(row[fields.guestsCount], 1))),
  );

  return {
    firstName: normalizeText(row[fields.firstName]) || "Invité",
    lastName: normalizeText(row[fields.lastName]),
    preferredLanguage: normalizeLanguage(
      row[fields.preferredLanguage] ?? row["Sélection multiple"],
    ),
    invited: {
      wedding: normalizeBoolean(row[fields.weddingInvited]),
      henna: normalizeBoolean(row[fields.hennaInvited]),
      shabbat: normalizeBoolean(row[fields.shabbatInvited]),
    },
    maxGuests,
    rsvp: {
      wedding: normalizeRsvpStatus(row[fields.weddingRsvp]),
      henna: normalizeRsvpStatus(row[fields.hennaRsvp]),
      shabbat: normalizeRsvpStatus(row[fields.shabbatRsvp]),
    },
    rsvpSecond: {
      wedding: normalizeRsvpStatus(row[fields.weddingRsvpSecond]),
      henna: normalizeRsvpStatus(row[fields.hennaRsvpSecond]),
      shabbat: normalizeRsvpStatus(row[fields.shabbatRsvpSecond]),
    },
    guestsCount,
    shuttleInterest: normalizeShuttleInterest(
      row[fields.shuttleInterest] ?? row[fields.dietaryRequirements],
    ),
    message: normalizeText(row[fields.message]),
    answeredAt: normalizeDate(row[fields.answeredAt]),
  };
}

function mapGuestMemberRow(row: BaserowRow): GuestMember {
  const fields = BASEROW_FIELDS.guestMembers;

  return {
    id: row.id,
    name: normalizeText(row[fields.name]) || "Invité",
    rsvp: {
      wedding: normalizeRsvpStatus(row[fields.weddingRsvp]),
      henna: normalizeRsvpStatus(row[fields.hennaRsvp]),
      shabbat: normalizeRsvpStatus(row[fields.shabbatRsvp]),
    },
  };
}

function mapEventRow(row: BaserowRow): WeddingEvent | null {
  const fields = BASEROW_FIELDS.events;
  const key = normalizeEventKey(row[fields.name]);
  const date = normalizeDate(row[fields.date]);

  if (!key || !date) {
    return null;
  }

  const fallbackTitle = normalizeText(row[fields.name]);
  const address = normalizeText(row[fields.address]);

  return {
    key,
    title: {
      fr: normalizeText(row[fields.titleFr]) || fallbackTitle,
      he: normalizeText(row[fields.titleHe]) || fallbackTitle,
    },
    date,
    venue: { fr: "", he: "" },
    address: { fr: address, he: address },
    wazeUrl: normalizeUrl(row[fields.wazeUrl]),
    googleMapsUrl: normalizeUrl(row[fields.googleMapsUrl]),
    visible: normalizeBoolean(row[fields.visible]),
  };
}

function mapGalleryRow(row: BaserowRow): GalleryImage | null {
  const fields = BASEROW_FIELDS.gallery;
  const src = toPublicImagePath(row[fields.imageFile]);

  if (!src) {
    return null;
  }

  const fileName = decodeURIComponent(src.replace(/^\/images\//, ""));
  const metadata = IMAGE_METADATA[fileName.toLocaleLowerCase("en-US")] ?? {
    width: 1600,
    height: 1200,
  };

  return {
    id: String(row.id),
    src,
    alt: {
      fr: normalizeText(row[fields.altFr]),
      he: normalizeText(row[fields.altHe]),
    },
    order: normalizeNumber(row[fields.order], row.id),
    visible: normalizeBoolean(row[fields.visible]),
    section:
      normalizeSelectionValue(row[fields.section]).toLocaleLowerCase("en-US") ||
      "gallery",
    width: metadata.width,
    height: metadata.height,
    focalPoint: metadata.focalPoint,
  };
}

function mapSettingsRow(row: BaserowRow): WeddingSettings {
  const fields = BASEROW_FIELDS.settings;

  return {
    groomName: normalizeText(row[fields.groomName]) || "David",
    brideName: normalizeText(row[fields.brideName]) || "Clara",
    welcome: {
      fr: normalizeText(row[fields.welcomeFr]),
      he: normalizeText(row[fields.welcomeHe]),
    },
    heroImage: toPublicImagePath(row[fields.heroImage]) ?? "/images/hero.jpg",
    finalMessage: {
      fr: normalizeText(row[fields.finalMessageFr]),
      he: normalizeText(row[fields.finalMessageHe]),
    },
    contactPhone: normalizeText(row[fields.contactPhone]),
    rsvpEnabled: normalizeBoolean(row[fields.rsvpEnabled]),
  };
}

async function getGuestRowByToken(token: string): Promise<BaserowRow | null> {
  if (!isValidPublicToken(token)) {
    return null;
  }

  const config = getBaserowConfig();
  const tokenFieldId = await getFieldId(
    config.tableIds.guests,
    BASEROW_FIELDS.guests.token,
  );
  const response = await getRowsPage(
    config.tableIds.guests,
    1,
    { kind: "private" },
    {
      size: "2",
      [`filter__field_${tokenFieldId}__equal`]: token,
    },
  );

  if (response.results.length === 0) {
    return null;
  }

  if (response.results.length > 1) {
    throw new BaserowDataError();
  }

  return response.results[0];
}

interface GuestMemberTableContext {
  tableId: string;
  schemas: BaserowFieldSchema[];
  linkToGuestsField: BaserowFieldSchema;
}

async function getGuestMemberTableContext(): Promise<GuestMemberTableContext> {
  const config = getBaserowConfig();
  const guestSchemas = await getFieldSchemas(config.tableIds.guests);
  const guestMembersRelation = guestSchemas.find(
    (field) =>
      field.name === BASEROW_FIELDS.guests.guestMembers &&
      field.type === "link_row" &&
      field.linkRowTableId !== null,
  );

  if (!guestMembersRelation?.linkRowTableId) {
    throw new BaserowDataError();
  }

  const tableId = String(guestMembersRelation.linkRowTableId);
  const schemas = await getFieldSchemas(tableId);
  const linkToGuestsField = schemas.find(
    (field) =>
      field.name === BASEROW_FIELDS.guestMembers.linkToGuests &&
      field.type === "link_row" &&
      field.linkRowTableId === Number(config.tableIds.guests) &&
      field.id === guestMembersRelation.linkRowRelatedFieldId,
  );

  if (!linkToGuestsField) {
    throw new BaserowDataError();
  }

  return { tableId, schemas, linkToGuestsField };
}

async function getGuestMembersForGuestRow(
  guestRow: BaserowRow,
): Promise<GuestMember[]> {
  const linkedIds = normalizeLinkedRowIds(
    guestRow[BASEROW_FIELDS.guests.guestMembers],
  );

  if (linkedIds.length === 0) {
    return [];
  }

  const context = await getGuestMemberTableContext();
  const rows = await getAllPrivateRows(context.tableId, {
    [`filter__field_${context.linkToGuestsField.id}__link_row_has`]: String(
      guestRow.id,
    ),
  });
  const rowById = new Map(rows.map((row) => [row.id, row]));

  if (
    rowById.size !== linkedIds.length ||
    linkedIds.some((rowId) => !rowById.has(rowId))
  ) {
    throw new BaserowDataError();
  }

  return linkedIds.map((rowId) => mapGuestMemberRow(rowById.get(rowId)!));
}

export interface GuestWithMembers {
  guest: Guest;
  guestMembers: GuestMember[];
}

export async function getGuestWithMembersByToken(
  token: string,
): Promise<GuestWithMembers | null> {
  const row = await getGuestRowByToken(token);

  if (!row) {
    return null;
  }

  const guestMembers = await getGuestMembersForGuestRow(row);

  return {
    guest: mapGuestRow(row),
    guestMembers,
  };
}

export async function getGuestByToken(token: string): Promise<Guest | null> {
  const row = await getGuestRowByToken(token);
  return row ? mapGuestRow(row) : null;
}

export async function getEvents(): Promise<WeddingEvent[]> {
  const config = getBaserowConfig();
  const rows = await getAllRows(config.tableIds.events);
  return rows
    .map(mapEventRow)
    .filter((event): event is WeddingEvent => event !== null);
}

export async function getGallery(): Promise<GalleryImage[]> {
  const config = getBaserowConfig();
  const rows = await getAllRows(config.tableIds.gallery);
  return rows
    .map(mapGalleryRow)
    .filter((image): image is GalleryImage => image !== null);
}

export async function getSettings(): Promise<WeddingSettings> {
  const config = getBaserowConfig();
  const response = await getRowsPage(
    config.tableIds.settings,
    1,
    { kind: "private" },
    { size: "1" },
  );
  const row = response.results[0];

  if (!row) {
    throw new BaserowDataError();
  }

  return mapSettingsRow(row);
}

export async function updateGuestRSVP(
  input: UpdateGuestRsvpInput,
): Promise<Guest> {
  const config = getBaserowConfig();
  const row = await getGuestRowByToken(input.token);

  if (!row) {
    throw new BaserowDataError();
  }

  const guest = mapGuestRow(row);
  const guestMembers = input.guestMembers;
  const linkedMemberIds = normalizeLinkedRowIds(
    row[BASEROW_FIELDS.guests.guestMembers],
  );
  const loadedMemberIds = new Set(guestMembers.map((member) => member.id));
  const guestsCount = Math.floor(input.guestsCount);

  if (
    loadedMemberIds.size !== guestMembers.length ||
    linkedMemberIds.length !== loadedMemberIds.size ||
    linkedMemberIds.some((memberId) => !loadedMemberIds.has(memberId)) ||
    !Number.isFinite(guestsCount) ||
    guestsCount < 1 ||
    guestsCount > guest.maxGuests ||
    input.shuttleInterest.length > SHUTTLE_CITIES.length ||
    input.shuttleInterest.some((city) => !SHUTTLE_CITIES.includes(city)) ||
    input.message.length > 600 ||
    input.people.length === 0 ||
    new Set(input.people.map((person) => person.id)).size !== input.people.length
  ) {
    throw new BaserowDataError();
  }

  const fields = BASEROW_FIELDS.guests;
  const schemas = await getFieldSchemas(config.tableIds.guests);
  const shuttleInterestSchema = findFieldSchema(
    schemas,
    fields.shuttleInterest,
    fields.dietaryRequirements,
  );

  if (!shuttleInterestSchema) {
    throw new BaserowDataError();
  }

  const payload: Record<string, unknown> = {
    [fields.guestsCount]: guestsCount,
    [fields.message]: input.message.trim(),
  };
  payload[shuttleInterestSchema.name] = getShuttleInterestPayload(
    shuttleInterestSchema,
    input.shuttleInterest,
  );
  const primaryRsvpFieldByEvent: Record<EventKey, string> = {
    wedding: fields.weddingRsvp,
    henna: fields.hennaRsvp,
    shabbat: fields.shabbatRsvp,
  };
  const secondaryRsvpFieldByEvent: Record<EventKey, string> = {
    wedding: fields.weddingRsvpSecond,
    henna: fields.hennaRsvpSecond,
    shabbat: fields.shabbatRsvpSecond,
  };
  const optionNameByStatus: Record<Exclude<RsvpStatus, "pending">, string> = {
    yes: "Yes",
    no: "No",
  };

  const addResponsesToPayload = (
    targetPayload: Record<string, unknown>,
    responses: Partial<Record<EventKey, RsvpStatus>>,
    fieldByEvent: Record<EventKey, string>,
    targetSchemas: BaserowFieldSchema[],
  ) => {
    for (const [eventKey, status] of Object.entries(responses) as Array<
      [EventKey, RsvpStatus | undefined]
    >) {
      if (
        (status !== "yes" && status !== "no") ||
        !["wedding", "henna", "shabbat"].includes(eventKey) ||
        !guest.invited[eventKey]
      ) {
        throw new BaserowDataError();
      }

      const fieldName = fieldByEvent[eventKey];
      const schema = targetSchemas.find(
        (candidate) => candidate.name === fieldName,
      );
      const option = schema?.selectOptions.find(
        (candidate) => candidate.value === optionNameByStatus[status],
      );

      if (!schema || !option) {
        throw new BaserowDataError();
      }

      targetPayload[fieldName] =
        schema.type === "multiple_select" ? [option.id] : option.id;
    }
  };

  if (guestMembers.length > 0) {
    const expectedIds = new Set(
      guestMembers.map((member) => `member:${member.id}`),
    );

    if (
      input.people.length !== expectedIds.size ||
      input.people.some((person) => !expectedIds.has(person.id))
    ) {
      throw new BaserowDataError();
    }

    const memberContext = await getGuestMemberTableContext();
    const memberFields = BASEROW_FIELDS.guestMembers;
    const memberRsvpFieldByEvent: Record<EventKey, string> = {
      wedding: memberFields.weddingRsvp,
      henna: memberFields.hennaRsvp,
      shabbat: memberFields.shabbatRsvp,
    };

    await Promise.all(
      input.people.map((person) => {
        const memberId = Number(person.id.slice("member:".length));
        const memberPayload: Record<string, unknown> = {};

        if (!Number.isInteger(memberId) || !expectedIds.has(person.id)) {
          throw new BaserowDataError();
        }

        addResponsesToPayload(
          memberPayload,
          person.responses,
          memberRsvpFieldByEvent,
          memberContext.schemas,
        );

        return updateBaserowRow(
          memberContext.tableId,
          memberId,
          memberPayload,
        );
      }),
    );
  } else {
    const hasSecondaryGuest = Boolean(guest.lastName.trim());
    const expectedIds = new Set(
      hasSecondaryGuest ? ["primary", "secondary"] : ["primary"],
    );

    if (
      input.people.length !== expectedIds.size ||
      input.people.some((person) => !expectedIds.has(person.id))
    ) {
      throw new BaserowDataError();
    }

    for (const person of input.people) {
      addResponsesToPayload(
        payload,
        person.responses,
        person.id === "secondary"
          ? secondaryRsvpFieldByEvent
          : primaryRsvpFieldByEvent,
        schemas,
      );
    }
  }

  const answeredAtSchema = schemas.find(
    (candidate) => candidate.name === fields.answeredAt,
  );

  if (!answeredAtSchema) {
    throw new BaserowDataError();
  }

  const answeredAt = new Date().toISOString();
  payload[fields.answeredAt] = answeredAtSchema.dateIncludeTime
    ? answeredAt
    : answeredAt.slice(0, 10);

  const updatedRow = await updateBaserowRow(
    config.tableIds.guests,
    row.id,
    payload,
  );

  return mapGuestRow(updatedRow);
}

function findFieldSchema(
  schemas: BaserowFieldSchema[],
  ...names: string[]
): BaserowFieldSchema | undefined {
  return schemas.find((schema) => names.includes(schema.name));
}

function getSelectOptionId(
  schema: BaserowFieldSchema | undefined,
  value: string,
): number | null {
  const option = schema?.selectOptions.find(
    (candidate) =>
      candidate.value.toLocaleLowerCase("en-US") ===
      value.toLocaleLowerCase("en-US"),
  );

  return option?.id ?? null;
}

function getShuttleInterestPayload(
  schema: BaserowFieldSchema,
  cities: ShuttleCity[],
): string | number[] {
  if (schema.type !== "multiple_select") {
    return cities.join(", ");
  }

  return cities.map((city) => {
    const optionId = getSelectOptionId(schema, city);

    if (optionId === null) {
      throw new BaserowDataError();
    }

    return optionId;
  });
}
