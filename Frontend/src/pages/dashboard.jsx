import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Award, Target, Star, Calendar, BookOpen, Brain } from "lucide-react";
import api from "../api";
import { useProblemContext } from "../contexts/ProblemContext";
import { useAuth } from "../contexts/AuthContext";

const GOAL_REVISED = 20;
const DIFFICULTY_LEVELS = [
    { level: 0, label: "Easy", color: "green", icon: "🟢" },
    { level: 1, label: "Medium", color: "yellow", icon: "🟡" },
    { level: 2, label: "Hard", color: "red", icon: "🔴" },
];

const useDashboardData = (username) => {
    const [solved, setSolved] = useState(null);
    const [revised, setRevised] = useState(null);
    const [mastered, setMastered] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [easy, setEasy] = useState(0);
    const [medium, setMedium] = useState(0);
    const [hard, setHard] = useState(0);
    const [revisingProblems, setRevisingProblems] = useState([]);
    const [user,setUser] = useState(0);

    useEffect(() => {
        if (!username) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/user/dashboard/${username}`);
                
                console.log(response);
                setSolved(response.data.data.solvedStats);
                setRevised(response.data.data.revisedStats);
                setMastered(response.data.data.masteredStats);
                setEasy(response.data.data.easyProblems);
                setMedium(response.data.data.mediumProblems);
                setHard(response.data.data.hardProblems);
                setRevisingProblems(response.data.data.revisingProblems);
                setUser(response.data.data.user);

                console.log("Dashboard data loaded successfully", response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading dashboard");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [username]);

    return { solved, revised, mastered, error,user, isLoading, easy, medium, hard, revisingProblems };
};

const AnimatedCounter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        if (start === end) return;

        const incrementTime = duration / Math.max(end, 1);
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span className="font-bold">{count}</span>;
};

const MasteryChart = ({ solved, revised, mastered, easy, medium, hard }) => {
    if (!solved || !revised || !mastered) return null;
    const {totalProblems} = useProblemContext();
        
    const chartData = DIFFICULTY_LEVELS.map(({ label, color }) => {
        const masteredCount = mastered.find(item => item.difficulty === label)?.count || 0;
        const problemsPerDifficulty = label === "Easy" ? easy : label === "Medium" ? medium : hard;
        const percentage = ((masteredCount / problemsPerDifficulty) * 100).toFixed(1);
        
        return {
            difficulty: label,
            mastered: masteredCount,
            total: problemsPerDifficulty,
            percentage: parseFloat(percentage),
            color
        };
    });

    return (
        <div className="bg-white border border-gray-200 " style={{ padding: 'calc(1.5 * var(--unit))' }}>
            <div className="flex items-center" style={{ gap: 'calc(0.5 * var(--unit))', marginBottom: 'calc(1.5 * var(--unit))' }}>
                <TrendingUp style={{ width: 'calc(1.25 * var(--unit))', height: 'calc(1.25 * var(--unit))' }} className="text-indigo-600" />
                <h3 className="font-semibold" style={{ fontSize: 'var(--text-xl)' }}>Mastery Progress by Difficulty</h3>
            </div>
            
            <div style={{ gap: 'calc(1.5 * var(--unit))' }} className="space-y-6">
                {chartData.map((item, index) => {
                    const barColors = {
                        green: 'bg-green-500',
                        yellow: 'bg-yellow-500', 
                        red: 'bg-red-500'
                    };
                    
                    return (
                        <div key={index} style={{ gap: 'calc(0.5 * var(--unit))' }} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center" style={{ gap: 'calc(0.5 * var(--unit))' }}>
                                    <span className={`rounded-full ${barColors[item.color]}`} style={{ width: 'calc(0.75 * var(--unit))', height: 'calc(0.75 * var(--unit))' }}></span>
                                    <span className="font-medium text-gray-700" style={{ fontSize: 'var(--text-base)' }}>{item.difficulty}</span>
                                </div>
                                <div className="text-gray-600" style={{ fontSize: 'var(--text-sm)' }}>
                                    <AnimatedCounter value={item.mastered} /> / {Math.round(item.total)} 
                                    <span className="font-semibold text-gray-800" style={{ marginLeft: 'calc(0.5 * var(--unit))' }}>({item.percentage}%)</span>
                                </div>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height: 'calc(1 * var(--unit))' }}>
                                <div 
                                    className={`rounded-full transition-all duration-1500 ease-out ${barColors[item.color]}`}
                                    style={{ 
                                        height: 'calc(1 * var(--unit))',
                                        width: `${Math.min(item.percentage, 100)}%`,
                                        transitionDelay: `${index * 200}ms`
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="border-t border-gray-100" style={{ marginTop: 'calc(1.5 * var(--unit))', paddingTop: 'calc(1 * var(--unit))' }}>
                <div className="text-center">
                    <div className="text-gray-800" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginBottom: 'calc(0.25 * var(--unit))' }}>
                        <AnimatedCounter value={mastered.reduce((sum, item) => sum + (item.count || 0), 0)} /> 
                        <span className="text-gray-500" style={{ fontSize: 'var(--text-lg)' }}> / {totalProblems}</span>
                    </div>
                    <div className="text-gray-600" style={{ fontSize: 'var(--text-sm)' }}>Total Problems Mastered</div>
                    <div className="text-gray-500" style={{ fontSize: 'var(--text-xs)' }}>
                        {(((mastered.reduce((sum, item) => sum + (item.count || 0), 0)) / totalProblems) * 100).toFixed(1)}% of all problems
                    </div>
                </div>
            </div>
        </div>
    );
};

const OverallStatsBar = ({ solved, revised, mastered }) => {
    const {totalProblems} = useProblemContext();
    if (!solved || !revised || !mastered) return null;
    
    const totalSolved = solved.reduce((sum, item) => sum + (item.count || 0), 0) + 
                      revised.reduce((sum, item) => sum + (item.count || 0), 0) + 
                      mastered.reduce((sum, item) => sum + (item.count || 0), 0);
    const totalRevised = revised.reduce((sum, item) => sum + (item.count || 0), 0) + 
                        mastered.reduce((sum, item) => sum + (item.count || 0), 0);
    const totalMastered = mastered.reduce((sum, item) => sum + (item.count || 0), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'calc(1 * var(--unit))', marginBottom: 'calc(2 * var(--unit))' }}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg" style={{ padding: 'calc(1 * var(--unit))' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100" style={{ fontSize: 'var(--text-sm)' }}>Solved Problems</p>
                        <div className="font-bold" style={{ fontSize: 'var(--text-2xl)' }}>
                            <AnimatedCounter value={totalSolved} /> / {totalProblems}
                        </div>
                        <div className="text-blue-200" style={{ fontSize: 'var(--text-xs)' }}>
                            {((totalSolved / totalProblems) * 100).toFixed(1)}% Complete
                        </div>
                    </div>
                    <BookOpen style={{ width: 'calc(1.5 * var(--unit))', height: 'calc(1.5 * var(--unit))' }} className="text-blue-200" />
                </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl text-white shadow-lg" style={{ padding: 'calc(1 * var(--unit))' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-yellow-100" style={{ fontSize: 'var(--text-sm)' }}>Revised Problems</p>
                        <div className="font-bold" style={{ fontSize: 'var(--text-2xl)' }}>
                            <AnimatedCounter value={totalRevised} /> / {totalProblems}
                        </div>
                        <div className="text-yellow-200" style={{ fontSize: 'var(--text-xs)' }}>
                            {((totalRevised / totalProblems) * 100).toFixed(1)}% Complete
                        </div>
                    </div>
                    <Calendar style={{ width: 'calc(1.5 * var(--unit))', height: 'calc(1.5 * var(--unit))' }} className="text-yellow-200" />
                </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow-lg" style={{ padding: 'calc(1 * var(--unit))' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-100" style={{ fontSize: 'var(--text-sm)' }}>Mastered Problems</p>
                        <div className="font-bold" style={{ fontSize: 'var(--text-2xl)' }}>
                            <AnimatedCounter value={totalMastered} /> / {totalProblems}
                        </div>
                        <div className="text-green-200" style={{ fontSize: 'var(--text-xs)' }}>
                            {((totalMastered / totalProblems) * 100).toFixed(1)}% Complete
                        </div>
                    </div>
                    <Brain style={{ width: 'calc(1.5 * var(--unit))', height: 'calc(1.5 * var(--unit))' }} className="text-green-200" />
                </div>
            </div>
        </div>
    );
};

const ProgressSection = ({ totalMastered, goal }) => {
    const progress = useMemo(() => Math.min((totalMastered / goal) * 100, 100), [totalMastered, goal]);
    const isUnlocked = useMemo(() => totalMastered >= goal, [totalMastered, goal]);

    return (
        <section>
            <div className="flex items-center" style={{ gap: 'calc(0.5 * var(--unit))', marginBottom: 'calc(1 * var(--unit))' }}>
                <Target style={{ width: 'calc(1.25 * var(--unit))', height: 'calc(1.25 * var(--unit))' }} className="text-indigo-600" />
                <h3 className="font-semibold" style={{ fontSize: 'var(--text-xl)' }}>Premium Animation Unlock</h3>
            </div>
            <div className="flex items-center bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-indigo-100" style={{ gap: 'calc(1.5 * var(--unit))', padding: 'calc(1.5 * var(--unit))' }}>
                <div className={`relative flex-shrink-0 rounded-full border-4 transition-all duration-500 ${
                    isUnlocked ? 'border-yellow-400 shadow-lg shadow-yellow-200' : 'border-gray-300'
                } flex items-center justify-center bg-white`} style={{ width: 'calc(6 * var(--unit))', height: 'calc(6 * var(--unit))' }}>
                    <span className={`transition-all duration-500 ${
                        isUnlocked ? 'opacity-100' : 'opacity-40 grayscale'
                    }`} style={{ fontSize: 'var(--text-4xl)' }}>
                        {isUnlocked ? '🎉' : '🔥'}
                    </span>
                    {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-semibold" style={{ fontSize: 'var(--text-xs)' }}>
                            Locked
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center" style={{ marginBottom: 'calc(0.25 * var(--unit))' }}>
                        <div className="text-gray-600" style={{ fontSize: 'var(--text-sm)' }}>
                            Mastered <AnimatedCounter value={totalMastered} /> / {goal} questions
                        </div>
                        <div className="font-semibold text-indigo-600" style={{ fontSize: 'var(--text-sm)' }}>
                            {Math.round(progress)}%
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height: 'calc(1 * var(--unit))' }}>
                        <div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-1000"
                            style={{ height: 'calc(1 * var(--unit))', width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-gray-500" style={{ marginTop: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-xs)' }}>
                        {isUnlocked ? (
                            <span className="text-green-600 font-semibold flex items-center" style={{ gap: 'calc(0.25 * var(--unit))' }}>
                                <Star style={{ width: 'calc(0.75 * var(--unit))', height: 'calc(0.75 * var(--unit))' }} />
                                Premium animation unlocked!
                            </span>
                        ) : (
                            `Unlock at ${goal} mastered questions.`
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

const MedalsShowcase = ({ medals = [], solved, mastered }) => {
    const achievements = [];
    
    if (solved && mastered) {
        const totalSolved = solved.reduce((sum, item) => sum + (item.count || 0), 0);
        const totalMastered = mastered.reduce((sum, item) => sum + (item.count || 0), 0);
        
        if (totalSolved > 0) achievements.push({ name: "First Step", icon: "🎯" });
        if (totalSolved >= 10) achievements.push({ name: "Problem Solver", icon: "🧩" });
        if (totalMastered >= 5) achievements.push({ name: "Master", icon: "🏆" });
        if (totalSolved >= 50) achievements.push({ name: "Dedicated", icon: "💪" });
    }

    const displayMedals = medals.length > 0 ? medals : achievements;

    return (
        <section>
            <div className="flex items-center" style={{ gap: 'calc(0.5 * var(--unit))', marginBottom: 'calc(1 * var(--unit))' }}>
                <Award style={{ width: 'calc(1.25 * var(--unit))', height: 'calc(1.25 * var(--unit))' }} className="text-purple-600" />
                <h3 className="font-semibold" style={{ fontSize: 'var(--text-xl)' }}>Medals Showcase</h3>
            </div>
            <div className="flex flex-wrap bg-gray-50 rounded-xl" style={{ gap: 'calc(1 * var(--unit))', padding: 'calc(1 * var(--unit))' }}>
                {displayMedals.length === 0 ? (
                    <div className="text-gray-400 italic">No medals yet. Complete achievements to earn them!</div>
                ) : (
                    displayMedals.map((medal, idx) => (
                        <div 
                            key={idx} 
                            className="rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200" 
                            style={{ width: 'calc(5 * var(--unit))', height: 'calc(5 * var(--unit))' }}
                            title={medal.name}
                        >
                            <span style={{ fontSize: 'var(--text-2xl)' }}>{medal.icon || '🏅'}</span>
                            <span className="font-semibold text-yellow-700 text-center leading-tight" style={{ fontSize: 'var(--text-xs)', marginTop: 'calc(0.25 * var(--unit))' }}>
                                {medal.name}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};
const RevisingProblemsSection = ({ revisingProblems = [] }) => {
    const getDaysUntilRevision = (nextRevisionDate) => {
        const today = new Date();
        const revisionDate = new Date(nextRevisionDate);
        const diffTime = revisionDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getUrgencyColor = (days) => {
        if (days <= 0) return 'bg-red-100 border-red-300 text-red-700';
        if (days <= 2) return 'bg-orange-100 border-orange-300 text-orange-700';
        if (days <= 7) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
        return 'bg-green-100 border-green-300 text-green-700';
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200" style={{ padding: 'calc(1.5 * var(--unit))' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'calc(1.5 * var(--unit))' }}>
                <div className="flex items-center" style={{ gap: 'calc(0.5 * var(--unit))' }}>
                    <div className="text-blue-600" style={{ fontSize: 'var(--text-xl)' }}>🔄</div>
                    <h3 className="font-semibold text-gray-900" style={{ fontSize: 'var(--text-xl)' }}>
                        Problems in Revision
                    </h3>
                </div>
                <div className="text-gray-500" style={{ fontSize: 'var(--text-sm)' }}>
                    {revisingProblems.length} problems
                </div>
            </div>

            {revisingProblems.length === 0 ? (
                <div className="text-center text-gray-400 bg-gray-50 rounded-lg" style={{ padding: 'calc(2 * var(--unit))' }}>
                    <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'calc(0.5 * var(--unit))' }}>📚</div>
                    <div style={{ fontSize: 'var(--text-base)' }}>No problems in revision yet</div>
                    <div style={{ fontSize: 'var(--text-sm)', marginTop: 'calc(0.25 * var(--unit))' }}>
                        Solve some problems to start your revision journey!
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {revisingProblems.map(problem => {
                        const daysUntil = getDaysUntilRevision(problem.nextRevisionDate);
                        return (
                            <div 
                                key={problem._id}
                                className="flex items-center justify-between border rounded-lg hover:shadow-sm transition-shadow"
                                style={{ padding: 'calc(1 * var(--unit))' }}
                            >
                                <div className="flex items-center" style={{ gap: 'calc(1 * var(--unit))' }}>
                                    <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                    <div>
                                        <div className="font-medium text-gray-900" style={{ fontSize: 'var(--text-sm)' }}>
                                            #{problem.num} {problem.title}
                                        </div>
                                        <div className="text-gray-500" style={{ fontSize: 'var(--text-xs)' }}>
    Next review: {new Date(problem.nextRevisionDate).toLocaleDateString()}
</div>

                                    </div>
                                </div>
                                
                                <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getUrgencyColor(daysUntil)}`}>
                                    {daysUntil <= 0 ? 'Due now!' : 
                                     daysUntil === 1 ? 'Tomorrow' : 
                                     `${daysUntil} days`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

const LOGO_URL = "https://res.cloudinary.com/harshitbd/image/upload/v1755760194/ReviseCoder-modified_x58b5u.png";

import { useNavigate } from 'react-router-dom';

const UserProfileSection = ({ user }) => {
    const navigate = useNavigate();
    const {accessToken} = useAuth();
    
    if (!user) return null;

    const handleLogoClick = () => {
        if (accessToken) {
            console.log("User is logged in");
            navigate('/home');
        } else {
            console.log('user is not logged in')
            navigate('/');
        }
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200" style={{ padding: 'calc(1.5 * var(--unit))', marginBottom: 'calc(2 * var(--unit))' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: 'calc(1.5 * var(--unit))' }}>
                    <img 
                        src={user.avatar} 
                        alt={`${user.username}'s avatar`}
                        className="rounded-full border-4 border-indigo-200 shadow-lg"
                        style={{ width: 'calc(6 * var(--unit))', height: 'calc(6 * var(--unit))' }}
                    />
                    <div className="flex-1">
                        <h1 className="font-bold text-gray-900" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'calc(0.25 * var(--unit))' }}>
                            {user.username}
                        </h1>
                        <div className="flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200" style={{ padding: 'calc(0.75 * var(--unit))', gap: 'calc(0.5 * var(--unit))' }}>
                            <span style={{ fontSize: 'var(--text-lg)' }}>💠</span>
                            <span className="font-semibold text-indigo-700" style={{ fontSize: 'var(--text-lg)' }}>
                                {user.pixels} Pixels
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity">
                    <img
                        src={LOGO_URL}
                        alt="ReviseCoder"
                        className="object-cover"
                        style={{ 
                            imageRendering: 'pixelated', 
                            height: 'calc(4 * var(--unit))'
                        }}
                    />
                </button>
            </div>
        </section>
    );
};



const Dashboard = () => {
    const { username } = useParams();
    const { solved, revised, mastered, error, isLoading, easy, medium, hard, revisingProblems, user } = useDashboardData(username);

    const totalRevised = (revised?.[0]?.count || 0) + (revised?.[1]?.count || 0) + (revised?.[2]?.count || 0) +
        (mastered?.[0]?.count || 0) + (mastered?.[1]?.count || 0) + (mastered?.[2]?.count || 0);
    const totalMastered = (mastered?.[0]?.count || 0) + (mastered?.[1]?.count || 0) + (mastered?.[2]?.count || 0);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center" style={{ padding: 'calc(2.5 * var(--unit))' }}>
                <div className="animate-spin rounded-full border-b-2 border-indigo-600 mx-auto" style={{ height: 'calc(3 * var(--unit))', width: 'calc(3 * var(--unit))', marginBottom: 'calc(1 * var(--unit))' }}></div>
                <div style={{ fontSize: 'var(--text-lg)' }}>Loading Dashboard...</div>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center text-red-500 bg-red-50 rounded-xl border border-red-200" style={{ padding: 'calc(2.5 * var(--unit))' }}>
                <div className="font-semibold" style={{ fontSize: 'var(--text-lg)', marginBottom: 'calc(0.5 * var(--unit))' }}>Error Loading Dashboard</div>
                <div>{error}</div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50" style={{ paddingTop: 'calc(1.5 * var(--unit))', paddingBottom: 'calc(1.5 * var(--unit))' }}>
            <div className=" mx-auto" style={{ paddingLeft: 'calc(1 * var(--unit))', paddingRight: 'calc(1 * var(--unit))' }}>
                <UserProfileSection user={user} />
                
                <OverallStatsBar solved={solved} revised={revised} mastered={mastered} />

                <div style={{ gap: 'calc(2 * var(--unit))' }} className="space-y-8">
                    <MasteryChart solved={solved} revised={revised} mastered={mastered} easy={easy} medium={medium} hard={hard} />

                    <div className="bg-white" style={{ padding: 'calc(1.5 * var(--unit))', gap: 'calc(2 * var(--unit))' }}>
                        <div style={{ marginBottom: 'calc(2 * var(--unit))' }}>
                            <ProgressSection totalMastered={totalMastered} goal={GOAL_REVISED} />
                        </div>

                        {/* <MedalsShowcase medals={[]} solved={solved} mastered={mastered} /> */}
                    </div>
                </div>
                <RevisingProblemsSection revisingProblems={revisingProblems} />
            </div>
        </div>
    );
};

export default Dashboard;
