'use client';

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import { usePostHog } from 'posthog-js/react';

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string;}) => {
    const posthog = usePostHog();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        console.log('🔵 Submitting with:', { eventId, slug, email });

        try {
            const result = await createBooking({ eventId, slug, email });

            console.log('📬 Server response:', result);

            if(result.success) {
                console.log('✅ Success! Setting submitted to true');
                setSubmitted(true);
                posthog?.capture('event_booked', { eventId, slug, email });
            } else {
                console.error('❌ Booking failed:', result.error);
                alert(`Booking failed: ${result.error || 'Unknown error'}`);
                posthog?.capture('booking_failed', { eventId, slug, email, error: result.error });
            }
        } catch (err) {
            console.error('❌ Exception:', err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                            required
                        />
                    </div>

                    <button type="submit" className="button-submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    )
}
export default BookEvent