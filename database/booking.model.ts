import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import { Event, EventDocument } from './event.model';

/**
 * Core Booking domain shape.
 */
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = IBooking & Document;

/**
 * Simple email format validator for application-level checks.
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailRegex.test(value),
        message: 'Booking.email must be a valid email address.',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Index on eventId for efficient queries by event.
bookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to:
 * - ensure the referenced Event exists
 * - validate email format defensively.
 */
bookingSchema.pre<BookingDocument>('save', async function (next) {
  const doc = this;

  if (!emailRegex.test(doc.email)) {
    return next(new Error('Invalid email format for Booking.email'));
  }

  try {
    const eventExists = await Event.exists<EventDocument>({ _id: doc.eventId });
    if (!eventExists) {
      return next(new Error('Cannot create Booking: referenced Event does not exist.'));
    }
  } catch (error) {
    return next(error as Error);
  }

  next();
});

export const Booking: Model<BookingDocument> =
  (mongoose.models.Booking as Model<BookingDocument> | undefined) ||
  mongoose.model<BookingDocument>('Booking', bookingSchema);

export default Booking;
