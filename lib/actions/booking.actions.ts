'use server';

import Booking from '@/database/booking.model';
import connectDB from "@/lib/mongodb";
import mongoose from 'mongoose';

export const createBooking = async ({ eventId, slug, email }: { eventId: string; slug: string; email: string; }) => {
    console.log('🔵 Server: Received booking request:', { eventId, slug, email });

    try {
        // Validate inputs
        if (!eventId || !slug || !email) {
            console.error('❌ Missing fields');
            return { success: false, error: 'Missing required fields' };
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            console.error('❌ Invalid ObjectId format:', eventId);
            return { success: false, error: 'Invalid event ID' };
        }

        console.log('🔵 Connecting to database...');
        await connectDB();

        console.log('🔵 Creating booking in database...');
        const booking = await Booking.create({
            eventId: new mongoose.Types.ObjectId(eventId),
            slug,
            email
        });

        console.log('✅ Booking created successfully:', booking._id);
        return { success: true };

    } catch (e: any) {
        console.error('❌ Create booking failed:', e);
        console.error('Error name:', e.name);
        console.error('Error message:', e.message);
        console.error('Error code:', e.code);

        // Duplicate booking error
        if (e.code === 11000) {
            return { success: false, error: 'You have already booked this event' };
        }

        // Validation error
        if (e.name === 'ValidationError') {
            return { success: false, error: e.message };
        }

        // Generic error with message
        return { success: false, error: e.message || 'Failed to create booking' };
    }
}