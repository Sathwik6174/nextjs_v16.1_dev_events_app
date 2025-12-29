import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";
import {cacheLife} from "next/cache";
// import { events } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {

    'use cache';
    cacheLife('hours')
    const response = await fetch(`${BASE_URL}/api/events`);
    //Now to destructure events from the response of the GET req
    const {events} = await response.json();

    return (
        <div>
            <section>
                <h1 className="text-center">The Hub For Every Dev<br/> Event You Can't Miss</h1>

                <p className="text-center mt-5">Hackathons, Meetups and Conferences, All In One Single Place</p>

                <ExploreBtn/>

                <div className="mt-20 space-y-7">
                    <h3>Featured Events</h3>

                    <ol className="events">
                        {events && events.length > 0 && events.map((event: IEvent) => (
                            <li key={event.slug}>
                                <EventCard {...event} />
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </div>
    );
};

export default Page;