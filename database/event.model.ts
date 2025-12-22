import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Core Event domain shape used throughout the application.
 */
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date string (YYYY-MM-DD)
  time: string; // stored as 24h time string (HH:MM)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = IEvent & Document;

/**
 * Helper to build a URL-safe slug from a title.
 */
const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

/**
 * Normalize a date string to ISO format (YYYY-MM-DD).
 * Throws on invalid input so we fail fast.
 */
const normalizeDate = (value: string): string => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date format for Event.date');
  }

  // Only keep the calendar date part.
  return parsed.toISOString().slice(0, 10);
};

/**
 * Normalize time to 24-hour HH:MM format.
 * Accepts common inputs like "9:00", "09:00", "9:00 pm".
 */
const normalizeTime = (value: string): string => {
  const trimmed = value.trim().toLowerCase();

  // Match optional meridiem (am/pm)
  const match = trimmed.match(/^([0-1]?\d|2[0-3]):([0-5]\d)\s*(am|pm)?$/);
  if (!match) {
    throw new Error('Invalid time format for Event.time');
  }

  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3];

  if (meridiem === 'pm' && hours < 12) {
    hours += 12;
  }
  if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  const hh = hours.toString().padStart(2, '0');
  return `${hh}:${minutes}`;
};

/**
 * Shared validator to ensure required string fields are not just whitespace.
 */
const requiredString = {
  type: String,
  required: true as const,
  trim: true,
};

const eventSchema = new Schema<EventDocument>(
  {
    title: { ..
            
            .requiredString },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: { ...requiredString },
    overview: { ...requiredString },
    image: { ...requiredString },
    venue: { ...requiredString },
    location: { ...requiredString },
    date: { ...requiredString },
    time: { ...requiredString },
    mode: { ...requiredString },
    audience: { ...requiredString },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) && value.length > 0 && value.every((item) => item.trim().length > 0),
        message: 'Event.agenda must contain at least one non-empty entry.',
      },
    },
    organizer: { ...requiredString },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) && value.length > 0 && value.every((tag) => tag.trim().length > 0),
        message: 'Event.tags must contain at least one non-empty tag.',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Unique index on slug for fast lookups and to enforce uniqueness at the DB level.
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook to:
 * - ensure required string fields are non-empty
 * - generate or regenerate `slug` when `title` changes
 * - normalize `date` and `time` into consistent formats.
 */
eventSchema.pre<EventDocument>('save', function (next) {
  const doc = this;

  const requiredFields: Array<keyof IEvent> = [
    'title',
    'description',
    'overview',
    'image',
    'venue',
    'location',
    'date',
    'time',
    'mode',
    'audience',
    'organizer',
  ];

  for (const field of requiredFields) {
    const value = doc[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      return next(new Error(`Event.${String(field)} is required and cannot be empty.`));
    }
  }

  // Only regenerate the slug if the title changed or slug is missing.
    if (doc.isModified('title') || !doc.slug) {
       const generatedSlug = generateSlug(doc.title);
    if (!generatedSlug) {
       return next(new Error('Event.title must contain at least one alphanumeric character.'));
    }
       doc.slug = generatedSlug;
  }

  try {
    doc.date = normalizeDate(doc.date);
    doc.time = normalizeTime(doc.time);
  } catch (error) {
    return next(error as Error);
  }

  next();
});

export const Event: Model<EventDocument> =
  (mongoose.models.Event as Model<EventDocument> | undefined) ||
  mongoose.model<EventDocument>('Event', eventSchema);

export default Event;
