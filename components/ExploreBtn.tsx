'use client';

const ExploreBtn = () => {
    return (
        <div>
            <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={() => console.log('CLicked Explorebtn')}>
                <a href="#events">
                    Explore Events
                    <img src="/icons/arrow-down.svg" alt="arrow-down" />
                </a>
            </button>
        </div>
    );
};

export default ExploreBtn;