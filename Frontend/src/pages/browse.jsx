import React, { useState, useEffect } from 'react';
import { useProblemContext } from '../contexts/ProblemContext';

const ComingSoonPlaceholder = () => (
    <div className="relative rounded-lg overflow-hidden bg-red-500 h-full w-1/4">
        <div className="absolute pointer-events-none bg-yellow-500 h-full" style={{ padding: 'calc(0.5 * var(--unit))' }}>
            <div className="bg-white/50 rounded-lg" style={{ padding: 'calc(1 * var(--unit))', marginBottom: 'calc(1 * var(--unit))' }}>
                <input type="text" placeholder="Filter by tags..." className="w-full bg-white/70 border-slate-300 rounded-md text-slate-600 focus:outline-none focus:ring focus:ring-blue-300" style={{ padding: 'calc(0.5 * var(--unit)) calc(0.75 * var(--unit))', fontSize: 'var(--text-sm)' }} disabled />
            </div>

            <div className="flex justify-between items-center" style={{ marginBottom: 'calc(0.5 * var(--unit))' }}>
                <h3 className="font-semibold text-slate-700" style={{ fontSize: 'var(--text-sm)' }}>Questions</h3>
                <select className="bg-white/70 border-slate-300 rounded-md text-slate-600 focus:outline-none focus:ring focus:ring-blue-300" style={{ padding: 'calc(0.25 * var(--unit)) calc(0.5 * var(--unit))', fontSize: 'var(--text-xs)' }} disabled>
                    <option>Newest</option>
                    <option>Most Stars</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(0.5 * var(--unit))' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/50 rounded-lg" style={{ padding: 'calc(0.75 * var(--unit))' }}>
                        <h4 className="font-semibold text-slate-700 line-clamp-1" style={{ fontSize: 'var(--text-sm)' }}>A Question Title Might Go Here</h4>
                        <div className="flex" style={{ gap: 'calc(0.5 * var(--unit))', marginTop: 'calc(0.25 * var(--unit))' }}>
                            <span className="bg-slate-100/70 text-slate-500 rounded-full" style={{ padding: 'calc(0.125 * var(--unit)) calc(0.375 * var(--unit))', fontSize: 'var(--text-xs)' }}>tag</span>
                            <span className="bg-slate-100/70 text-slate-500 rounded-full" style={{ padding: 'calc(0.125 * var(--unit)) calc(0.375 * var(--unit))', fontSize: 'var(--text-xs)' }}>another</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="relative flex items-center justify-center h-full backdrop-blur-3xl w-full" style={{ padding: 'calc(6 * var(--unit-sm))' }}>
            <div className="bg-white/95 w-full h-full backdrop-blur-2xl border border-slate-300 rounded-xl shadow-2xl text-center" style={{ padding: 'calc(2 * var(--unit-xs))', borderRadius:'calc(5 * var(--unit-xs))',paddingTop:'calc(8*var(--unit-xs))' }}>
                <h3 className="font-bold text-slate-800" style={{ fontSize: 'calc(3 * var(--text-xs))', marginBottom: 'calc(5 * var(--unit-xs))' }}>Launching Soon!</h3>
                <p className="text-slate-600" style={{ fontSize: 'calc(1.5* var(--text-xs))', margin: '0 auto' }}>
                    A new way to filter questions, create your own custom lists, and browse collections shared by other users based on stars and popularity.
                </p>
            </div>
        </div>
    </div>
);

const OwnerLists = () => {
    const [lists, setLists] = useState([]);
    const { addToList, recomList } = useProblemContext();

    useEffect(() => {
        const fetchRecomLists = async () => {
            const storedData = localStorage.getItem("recomLists");
            if (storedData) {
                try {
                    setLists(JSON.parse(storedData));
                    return;
                } catch (err) {
                    console.error("Error parsing data", err);
                }
            } else {
                try {
                    const response = await api.get('/data/recomLists');
                    setLists(response.data.data);
                    localStorage.setItem("recomLists", JSON.stringify(response.data.data));
                } catch (error) {
                    console.error("Error fetching recommended lists", error);
                    setLists([]);
                }
            }
        };
        fetchRecomLists();
    }, []);

    useEffect(() => {
        try {
            const storedLists = localStorage.getItem('recomLists');
            if (storedLists) {
                setLists(JSON.parse(storedLists));
            }
        } catch (error) {
            console.error("Failed to parse recomLists from localStorage:", error);
        }
    }, []);

    return (
        <div className="h-full w-3/4" >
            <div className="bg-white h-full overflow-scroll flex flex-col border border-slate-200" style={{ borderRadius:'calc(3 * var(--unit-xs))',boxShadow:'0 0 calc(3 * var(--unit-xs)) rgba(0, 0, 0, 0.1)', gap: 'calc(0.5 * var(--unit))', padding: 'calc(0.75 * var(--unit))' }}>
                <h3 className="font-extrabold text-slate-900" style={{ fontSize: 'calc(1.5 * var(--text-base))', height: 'calc(2 * var(--unit))' }}>Featured Lists</h3>
                <div className="flex flex-col overflow-y-auto custom-scrollbar" style={{ gap: 'calc(0.5 * var(--unit))', flex: '1' }}>
                    {recomList.length > 0 ? (
                        recomList.map(list => (
                            <div key={list._id} className="border-b flex justify-between items-center border-slate-200 h-2/5 w-full">
                                <div className='w-10/12' style={{ padding: 'calc(0.25 * var(--unit))' }}>
                                    <span className="font-bold text-slate-800" style={{ fontSize: 'calc(1.125 * var(--text-base))' }}>
                                        {list.title}
                                    </span>
                                    <div className="flex overflow-y-hidden overflow-x-hidden w-full relative" style={{ gap: 'calc(0.5 * var(--unit))', padding: 'calc(0.5 * var(--unit)) 0' }}>
                                        {list.categories.length > 0 ? (
                                            list.categories.map(cat => (
                                                <div key={cat.title} className="bg-slate-500 shrink-0 text-white rounded-lg" style={{fontSize:'calc(2 * var(--text-xs))', padding: 'calc(0.125 * var(--unit)) calc(0.5 * var(--unit))' }}>{cat.title}</div>
                                            ))
                                        ) : ("")}
                                        <div className="fading-overflow w-full absolute h-full"></div>
                                    </div>
                                    <p className="text-slate-500" style={{ fontSize: 'var(--text-sm)', padding: '0 calc(0.5 * var(--unit))' }}>
                                        by <span className="font-medium">{list.byAdmin ? "Admin" : "Anonymous"}</span>
                                    </p>
                                    <div className="flex relative w-full overflow-y-auto overflow-x-auto" style={{ gap: 'calc(0.5 * var(--unit))' }}>
                                        {Array.isArray(list.topics) && list.topics.map(topic => (
                                            <span key={topic} className="bg-slate-100 text-slate-700 font-medium rounded-full" style={{ fontSize: 'var(--text-xs)' }}>{topic}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex w-2/12 justify-center items-center">
                                    <button onClick={() => {
                                        addToList(list._id)
                                    }} className="border-1 border-black" style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'calc(2*var(--text-xs))' , borderRadius: 'calc(6 * var(--unit-xs))' }}>Add +</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500">No recommended lists found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function BrowsePage() {
    return (
        <div className="bg-slate-50 font-sans w-full h-9/10">
            <div className="mx-auto h-full w-full" style={{ padding: '0 calc(1.5 * var(--unit))' }}>
                <header className="text-center content-center h-1/4" style={{ height: 'calc(13.5 * var(--unit))' }}>
                    <h2 className="font-extrabold text-slate-900" style={{ fontSize: 'calc(3 * var(--text-base))' }}>Problem Library</h2>
                    <p className="text-slate-500" style={{ marginTop: 'calc(0.75 * var(--unit))', fontSize: 'calc(1.125 * var(--text-base))' }}>Discover curated problem lists</p>
                </header>
                <div className="flex flex-row content-center h-6/9" style={{ gap: 'calc(2 * var(--unit-sm))' }}>
                    <ComingSoonPlaceholder />
                    <OwnerLists />
                </div>
            </div>
        </div>
    );
}
