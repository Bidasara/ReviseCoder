import React from 'react';
import { FaBrain, FaCode, FaListAlt } from 'react-icons/fa';
import animationmp4 from '/animation.mp4';
import { useNavigate } from 'react-router-dom';

// --- Reusable Button Component ---
const Button = ({ children, primary = false, onClick }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2 text-md font-semibold rounded-lg transition-transform duration-200 ease-in-out ${primary
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 active:scale-95'
            }`}
    >
        {children}
    </button>
);

// --- Navigation Bar ---
const LOGO_URL = "https://res.cloudinary.com/harshitbd/image/upload/v1755760194/ReviseCoder-modified_x58b5u.png";

// --- Navigation Bar ---
const Navbar = () => {
    const handleNavigation = (path) => {
        window.location.href = path;
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <img
                            src={LOGO_URL}
                            alt="ReviseCoder"
                            className="h-10 object-cover"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-600 hover:text-indigo-600">How It Works</button>
                        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-600 hover:text-indigo-600">Features</button>
                    </div>
                    <div className="flex items-center space-x-4">
                         <button onClick={() => handleNavigation('#/login')} className="text-gray-600 hover:text-indigo-600 text-md ">Login</button>
                         <Button primary onClick={() => handleNavigation('#/register')}>Sign Up</Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Update all other buttons in the document:
const HeroSection = () => (
    <section className="bg-white text-center py-20 sm:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                Stop Solving. Start Remembering.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Break the cycle of solving hundreds of LeetCode problems only to forget them weeks later.
                Our spaced repetition system transforms temporary solutions into permanent patterns,
                making DSA mastery engaging with custom animations and personalized hints.
            </p>
            <div className="mt-8">
                <Button primary onClick={() => window.location.href = '#/register'}>Start Mastering DSA for Free</Button>
            </div>
        </div>
    </section>
);

const FinalCTASection = () => {
    const handleNavigation = (path) => {
        window.location.href = path;
    };
    return (
        <section className="bg-indigo-700 text-white py-20 sm:py-24">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Master DSA for Good?</h2>
                <p className="mt-4 text-lg text-indigo-200">
                    Stop the endless cycle of solving and forgetting. Build patterns that stick with spaced repetition,
                    custom hints, and an engaging interface that makes practice enjoyable.
                </p>
                <div className="flex mt-8 items-center justify-center space-x-4">
                    <Button onClick={() => handleNavigation('#/register')}>Start Free Today</Button>
                    <Button onClick={() => handleNavigation('#/login')}>Already have an account?</Button>
                </div>
                <p className="mt-4 text-sm text-indigo-300">
                    Join developers preparing for MAANG and beyond
                </p>
            </div>
        </section>
    );
}


// --- How It Works Section ---
const HowItWorksSection = () => (
    <section id="how-it-works" className="bg-gray-50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">Master DSA in 3 Simple Steps</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="flex flex-col items-center">
                    <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
                        <FaCode size={32} />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-gray-800">1. Solve & Learn</h3>
                    <p className="mt-2 text-gray-600">
                        Solve LeetCode problems with our curated hints and notes. No more confusing editorials -
                        get clear, personalized explanations that actually make sense.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
                        <FaBrain size={32} />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-gray-800">2. Spaced Revision</h3>
                    <p className="mt-2 text-gray-600">
                        Our algorithm schedules problems for revision at optimal intervals.
                        After several spaced reviews, problems become "mastered" - permanently etched in your memory.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
                        <FaListAlt size={32} />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-gray-800">3. Engaging Experience</h3>
                    <p className="mt-2 text-gray-600">
                        Forget boring interfaces. Enjoy custom animations, interactive elements,
                        and a gamified experience that makes DSA practice actually fun.
                    </p>
                </div>
            </div>
        </div>
    </section>
);

// --- Features Section ---
const FeaturesSection = () => (
    <section id="features" className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Why ReviseCoder Works</h2>
            <div className="space-y-16">
                {/* Feature 1 */}
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Spaced Repetition That Actually Works</h3>
                        <p className="mt-4 text-lg text-gray-600">
                            Based on proven memory science, our system schedules reviews at the perfect moments.
                            Watch problems transition from "learning" to "mastered" as patterns become second nature.
                        </p>
                    </div>
                    <div className="bg-gray-100 p-8 rounded-lg text-gray-400 text-center">
                        <img className='rounded-lg' src="https://res.cloudinary.com/harshitbd/image/upload/v1755734162/962cbbc2-77c9-4215-b6d5-68914beeaf2f.png" />
                    </div>
                </div>
                {/* Feature 2 */}
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div className="bg-gray-100 p-8 rounded-lg text-gray-400 text-center order-last md:order-first">
                        <img src="https://res.cloudinary.com/harshitbd/image/upload/v1755734366/444d4cc0-b067-40ff-bd07-fd693d6d16ea.png" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Custom Hints & Notes</h3>
                        <p className="mt-4 text-lg text-gray-600">
                            Get handcrafted hints, and make custom notes from it that break down complex patterns into digestible insights you'll actually remember.
                        </p>
                    </div>
                </div>
                {/* Feature 3 */}
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Animations & Gamification</h3>
                        <p className="mt-4 text-lg text-gray-600">
                            Transform boring practice into an engaging experience. Custom animations,
                            progress tracking, and interactive elements make learning DSA enjoyable.
                        </p>
                    </div>
                    <div className="bg-gray-100 p-8 rounded-lg text-gray-400 text-center">
                        <video src={animationmp4} autoPlay loop muted className="rounded-lg w-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// --- Problem Section ---
const ProblemSection = () => (
    <section className="bg-red-50 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">The Problem with Traditional DSA Practice</h2>
            <div className="mt-10 space-y-6 text-lg text-gray-700">
                <p>You solve 200+ LeetCode problems. You feel confident.</p>
                <p>Then interview day comes... and you blank out on problems you've solved before.</p>
                <p className="font-semibold text-red-600">Sound familiar?</p>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 italic">
                    "The forgetting curve shows we lose 50% of new information within an hour,
                    and 90% within a week - unless we review it strategically."
                </p>
                <p className="mt-4 font-semibold text-gray-800">- Memory Research</p>
            </div>
        </div>
    </section>
);

// --- Final CTA Section ---
// const FinalCTASection = () => (
//     <section className="bg-indigo-700 text-white py-20 sm:py-24">
//         <div className="max-w-4xl mx-auto px-4 text-center">
//             <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Master DSA for Good?</h2>
//             <p className="mt-4 text-lg text-indigo-200">
//                 Stop the endless cycle of solving and forgetting. Build patterns that stick with spaced repetition,
//                 custom hints, and an engaging interface that makes practice enjoyable.
//             </p>
//             <div className="mt-8 space-x-4">
//                 <Button onClick={() => window.location.href = '/register'}>Start Free Today</Button>
//                 <Button onClick={() => window.location.href = '/login'}>Already have an account?</Button>
//             </div>
//             <p className="mt-4 text-sm text-indigo-300">
//                 Join developers preparing for FAANG and beyond
//             </p>
//         </div>
//     </section>
// );

// --- Footer ---
const Footer = () => (
    <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 ReviseCoder. Built with ❤️ for developers who want to remember what they learn.</p>
        </div>
    </footer>
);

// --- Main Homepage Component ---
const Homepage = () => {
    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <main>
                <HeroSection />
                <ProblemSection />
                <HowItWorksSection />
                <FeaturesSection />
                <FinalCTASection />
            </main>
            <Footer />
        </div>
    );
};

export default Homepage;
