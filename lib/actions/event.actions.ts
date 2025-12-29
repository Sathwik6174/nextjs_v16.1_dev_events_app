'use server'; //sensitive info kept safe server-side and not exposed...

import Event from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const event = await Event.findOne({ slug });
        return await Event.find({ _id: { $ne: event._id}, tags: {$in: event.tags}}).lean(); // .lean() is used to get those plain old JS objects which are way different than those mongoose objects

        // return similarEvents;
    } catch (e) {
        return [];
    }
}

