import React, { useState } from 'react';
import { ArrowLeft, BookOpen, TrendingUp, AlertTriangle, Target, ChevronRight, BarChart2, Activity, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';

interface GuidesProps {
    onBack: () => void;
}

type GuideId = 'alligator' | 'candlesticks' | 'support-resistance' | 'rsi' | 'quiz';

interface GuideMeta {
    id: GuideId;
    title: string;
    description: string;
    icon: React.ReactNode;
    readTime: string;
}

const GUIDES_LIST: GuideMeta[] = [
    {
        id: 'alligator',
        title: 'Mastering Technical Analysis: Williams Alligator',
        description: 'A comprehensive guide to understanding chart patterns, indicators, and risk management strategies used by institutional traders.',
        icon: <Target className="w-6 h-6 text-blue-500" />,
        readTime: '5 min read'
    },
    {
        id: 'candlesticks',
        title: 'The Battle of the Bulls and Bears: Reading "Candles"',
        description: 'Learn how to read Japanese Candlesticks and understand the psychology behind every price move.',
        icon: <BarChart2 className="w-6 h-6 text-green-500" />,
        readTime: '4 min read'
    },
    {
        id: 'support-resistance',
        title: 'The Bouncy Ball Game: Understanding Floors and Ceilings',
        description: 'Why prices get trapped in invisible rooms and how to use gravity to your advantage.',
        icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
        readTime: '4 min read'
    },
    {
        id: 'rsi',
        title: 'The Speedometer: How Fast Are We Going?',
        description: 'Learn to spot when the market engine is overheating or running on empty using RSI.',
        icon: <Activity className="w-6 h-6 text-pink-500" />,
        readTime: '3 min read'
    },
    {
        id: 'quiz',
        title: 'Final Exam: Test Your Knowledge',
        description: 'Think you are ready to trade? Prove it by scoring 100% on this quick 4-question quiz.',
        icon: <BrainCircuit className="w-6 h-6 text-yellow-500" />,
        readTime: '2 min'
    }
];

export const Guides: React.FC<GuidesProps> = ({ onBack }) => {
    const [selectedGuide, setSelectedGuide] = useState<GuideId | null>(null);

    // List View
    if (!selectedGuide) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold">Back to Analyzer</span>
                    </button>

                    <div className="mb-12 text-center animate-fade-in-up">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white">
                            Trading Academy
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Master the markets with our in-depth educational resources.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {GUIDES_LIST.map((guide) => (
                            <button
                                key={guide.id}
                                onClick={() => setSelectedGuide(guide.id)}
                                className={`group p-6 rounded-2xl shadow-sm border transition-all text-left flex items-center gap-6 ${guide.id === 'quiz' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800/30' : 'bg-white dark:bg-neutral-900 border-slate-100 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500'}`}
                            >
                                <div className={`p-4 rounded-xl transition-colors ${guide.id === 'quiz' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-slate-100 dark:bg-neutral-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}`}>
                                    {guide.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-xl font-bold mb-2 transition-colors ${guide.id === 'quiz' ? 'text-yellow-900 dark:text-yellow-100' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                                        {guide.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-gray-400 mb-3">
                                        {guide.description}
                                    </p>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        {guide.readTime}
                                    </span>
                                </div>
                                <ChevronRight className={`w-6 h-6 transition-all transform group-hover:translate-x-1 ${guide.id === 'quiz' ? 'text-yellow-400 group-hover:text-yellow-600' : 'text-slate-300 group-hover:text-blue-500'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Article View
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <button
                    onClick={() => setSelectedGuide(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Guide List</span>
                </button>

                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-neutral-800 animate-fade-in">
                    {selectedGuide === 'alligator' && <AlligatorArticle />}
                    {selectedGuide === 'candlesticks' && <CandlesticksArticle />}
                    {selectedGuide === 'support-resistance' && <SupportResistanceArticle />}
                    {selectedGuide === 'rsi' && <RSIArticle />}
                    {selectedGuide === 'quiz' && <QuizComponent onComplete={() => setSelectedGuide(null)} />}
                </div>
            </div>
        </div>
    );
};

const QuizComponent: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const questions = [
        {
            question: "When looking at the Williams Alligator, what does it mean when the three lines are tangled together like spaghetti?",
            options: [
                "The Alligator is hungry (Buy Now!)",
                "The Alligator is sleeping (Do Nothing)",
                "The Alligator is angry (Sell Everything)",
                "The trend is extremely strong"
            ],
            correct: 1,
            explanation: "Tangled lines mean the market is sideways or 'sleeping'. This is a dangerous time to trade because there is no clear trend."
        },
        {
            question: "You see a price candle shaped like a 'Hammer' (small body at top, long wick at bottom). What does this usually signal?",
            options: [
                "The price is about to crash",
                "The Bears have won the fight",
                "The price hit a 'trampoline' and is likely to bounce UP",
                "The market is closed"
            ],
            correct: 2,
            explanation: "A Hammer shows that Bears tried to push the price down, but Bulls pushed it all the way back up. It is a strong bullish signal."
        },
        {
            question: "In the 'Bouncy Ball' game (Support & Resistance), what happens when a price breaks through a 'Ceiling'?",
            options: [
                "The Ceiling disappears forever",
                "The Ceiling becomes a new Floor",
                "The price immediately falls back down",
                "The chart is broken"
            ],
            correct: 1,
            explanation: "When a resistance level (Ceiling) is broken, it often flips to become a new support level (Floor). Imagine climbing to the second story of a house."
        },
        {
            question: "The RSI (Speedometer) reads 75. What does this mean?",
            options: [
                "Class Dismissed. It's time to buy!",
                "The car is out of gas (Oversold)",
                "The engine is overheating (Overbought) - Be careful!",
                "The speed limit is 50"
            ],
            correct: 2,
            explanation: "An RSI over 70 is 'Overbought'. The price has moved up too fast and is likely to pull back or slow down."
        }
    ];

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
        setIsAnswered(true);
        if (index === questions[currentQuestion].correct) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    if (showResults) {
        return (
            <div className="text-center py-12">
                <div className="mb-8">
                    {score === questions.length ? (
                        <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                            <Target className="w-16 h-16 text-green-600 dark:text-green-400" />
                        </div>
                    ) : (
                        <div className="inline-flex p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-6">
                            <Activity className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    )}
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                        You Scored {score} / {questions.length}
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                        {score === questions.length
                            ? "Perfect score! You are officially ready to read the charts. 🚀"
                            : "Good effort! Review the guides and try again to get a perfect score."}
                    </p>
                    <button
                        onClick={onComplete}
                        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform"
                    >
                        Return to Guides
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="text-sm font-bold text-slate-400">Score: {score}</span>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-8">
                    {questions[currentQuestion].question}
                </h2>

                <div className="space-y-4">
                    {questions[currentQuestion].options.map((option, index) => {
                        let buttonStyle = "border-slate-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-neutral-800";
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === questions[currentQuestion].correct;

                        if (isAnswered) {
                            if (isCorrect) {
                                buttonStyle = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
                            } else if (isSelected && !isCorrect) {
                                buttonStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                            } else {
                                buttonStyle = "opacity-50 border-slate-200 dark:border-neutral-800";
                            }
                        } else if (isSelected) {
                            buttonStyle = "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={isAnswered}
                                className={`w-full p-6 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${buttonStyle}`}
                            >
                                <span className="font-semibold text-lg">{option}</span>
                                {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                                {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {isAnswered && (
                <div className="animate-fade-in-up">
                    <div className="bg-slate-100 dark:bg-neutral-800 p-6 rounded-xl mb-8 border border-slate-200 dark:border-neutral-700">
                        <p className="font-bold text-slate-900 dark:text-white mb-2">Explanation:</p>
                        <p className="text-slate-600 dark:text-slate-300">{questions[currentQuestion].explanation}</p>
                    </div>
                    <button
                        onClick={nextQuestion}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

const AlligatorArticle = () => (
    <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">

        {/* Header */}
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-6 shadow-sm">
                <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white">
                Mastering Technical Analysis
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                A comprehensive guide to understanding chart patterns, indicators, and risk management strategies used by institutional traders.
            </p>
        </div>

        {/* Hero Image */}
        <div className="not-prose mb-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-neutral-800">
            <img
                src="/alligator-diagram.png"
                alt="Williams Alligator Indicator Diagram"
                className="w-full h-auto object-cover"
            />
        </div>

        <p className="lead text-xl text-slate-600 dark:text-slate-300">
            Imagine you are an explorer in a thick, swampy jungle. You’re looking for treasure, but you have to be careful because there’s a giant alligator hiding in the water.
        </p>

        <p>
            In the world of money and trading (like buying and selling stocks or crypto), looking at a computer screen full of squiggly lines can feel like that swamp. It’s messy and confusing. But years ago, a smart guy named Bill Williams invented a cool way to read these maps. He didn't use fancy math words; he used a story about a hungry animal.
        </p>

        <p className="font-semibold text-blue-600 dark:text-blue-400">
            He called it the Alligator.
        </p>

        <p>
            Here is how you can spot the monster and figure out where the treasure is going, without needing a calculator.
        </p>

        <hr className="my-8 border-slate-200 dark:border-neutral-800" />

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-12 mb-6 tracking-tight">The Three Lines (The Alligator’s Face)</h2>
        <p>
            When you turn on the "Alligator" tool on a trading screen, three colored lines appear over the price chart. Think of these lines as parts of the Alligator’s mouth:
        </p>
        <ul className="space-y-4 my-6">
            <li className="flex items-start">
                <span className="w-4 h-4 mt-1.5 mr-3 rounded-full bg-blue-500 flex-shrink-0 shadow-sm" />
                <span className="text-lg"><strong className="font-black text-blue-600 dark:text-blue-400">The Blue Line (The Jaw)</strong>: This is the slowest line. It’s like the heavy, strong jaw of the alligator. It moves slowly because jaws don’t wiggle around much.</span>
            </li>
            <li className="flex items-start">
                <span className="w-4 h-4 mt-1.5 mr-3 rounded-full bg-red-500 flex-shrink-0 shadow-sm" />
                <span className="text-lg"><strong className="font-black text-red-500">The Red Line (The Teeth)</strong>: This is right in the middle.</span>
            </li>
            <li className="flex items-start">
                <span className="w-4 h-4 mt-1.5 mr-3 rounded-full bg-green-500 flex-shrink-0 shadow-sm" />
                <span className="text-lg"><strong className="font-black text-green-500">The Green Line (The Lips)</strong>: This is the fastest line. Think of how fast you can smack your lips compared to moving your whole jaw.</span>
            </li>
        </ul>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-2">
            <span className="text-slate-400">01.</span> Phase 1: The Nap (Don’t Touch!)
        </h3>
        <p>Most of the time, the Alligator is lazy.</p>
        <div className="bg-slate-100 dark:bg-neutral-800 p-6 rounded-2xl border-l-4 border-slate-500 my-6 shadow-sm">
            <p className="m-0 font-medium italic text-lg text-slate-700 dark:text-gray-300">
                When you look at the chart, if the Blue, Red, and Green lines are all twisted together like a bowl of spaghetti, <strong>the Alligator is sleeping</strong>.
            </p>
        </div>
        <p>
            This means the market is boring. The price isn't really going up or down; it’s just wandering sideways. When the alligator is sleeping, <strong>you should stay away</strong>. If you try to grab the treasure while the lines are tangled, you might get tricked. The longer the alligator sleeps, the hungrier he wakes up.
        </p>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-2">
            <span className="text-slate-400">02.</span> Phase 2: Waking Up (The Yawn)
        </h3>
        <p>
            Eventually, the Alligator gets hungry.
        </p>
        <p>
            You will see the Green line (Lips) start to move away from the Red line (Teeth), and the Red line move away from the Blue line (Jaw). The lines stop crossing over each other and start pointing in the same direction - usually up or down.
        </p>
        <p>This looks like an animal opening its mouth wide.</p>
        <ul className="my-6 space-y-2">
            <li className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
                <span><strong>If the mouth opens UP</strong> (Green on top, Blue on bottom): The Alligator is trying to eat prices that are going higher. This is usually when traders want to <strong>buy</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-slate-400 mt-1 rotate-180" />
                <span><strong>If the mouth opens DOWN</strong> (Blue on top, Green on bottom): The Alligator is chasing prices going <strong>lower</strong>.</span>
            </li>
        </ul>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-2">
            <span className="text-slate-400">03.</span> Phase 3: The Feast (Chomp Time!)
        </h3>
        <p>
            Now the Alligator is eating. The three lines are spread far apart, nice and wide. The price candles are running away, but the Alligator keeps chasing them.
        </p>
        <p>
            This is the <strong>"trend."</strong> This is where the easy money is made. As long as the Alligator’s mouth is wide open and the lines aren't touching, the trend is strong. You just ride the wave.
        </p>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-2">
            <span className="text-slate-400">04.</span> Phase 4: Full Tummy (Time to Go)
        </h3>
        <p>
            After a big meal, the Alligator gets sleepy again.
        </p>
        <p>
            You’ll notice the Green line starts to curve back toward the Red line. The lines get closer together. The mouth is closing. This tells you the trend is over. The animal is full.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-700/50 my-6 flex items-start gap-4 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" />
            <p className="m-0 text-base font-medium text-yellow-800 dark:text-yellow-200 leading-relaxed">
                When the mouth closes and the lines start tangling up into spaghetti again, the show is over. It’s time to take your profit and walk away before the Alligator goes back to sleep.
            </p>
        </div>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-16 mb-6">Why It Works</h2>
        <p>
            The reason this works isn't magic. It’s just a way to teach you <strong>patience</strong>.
        </p>
        <p>
            Most people lose money because they try to trade when the market is sleeping (the spaghetti phase). The Alligator teaches you to sit on your hands and wait until the monster is actually hungry.
        </p>
        <p className="text-lg font-bold text-center mt-8">
            So, next time you see a chart, look for the green lips, red teeth, and blue jaw. If they’re tangled, take a nap. If the mouth is open, it’s dinner time!
        </p>
    </article>
);

const CandlesticksArticle = () => (
    <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        {/* Header */}
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl mb-6 shadow-sm">
                <BarChart2 className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-green-800 to-slate-900 dark:from-white dark:via-green-200 dark:to-white">
                The Battle of the Bulls and Bears: Reading "Candles"
            </h1>
        </div>

        {/* Hero Image */}
        <div className="not-prose mb-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-neutral-800">
            <img
                src="/candlestick-diagram.png"
                alt="Japanese Candlestick Anatomy Diagram"
                className="w-full h-auto object-cover"
            />
        </div>

        <p className="lead text-xl text-slate-600 dark:text-slate-300">
            If you look at a price chart on the news, it usually looks like a simple line going up and down. That line is okay, but it’s kind of boring. It doesn't tell you how the price moved; it only tells you where it ended up.
        </p>

        <p>
            To really see what’s happening, traders use <strong>Japanese Candlesticks</strong>.
        </p>

        <p>
            They look like little rectangles with sticks poking out of them. They might look weird at first, but once you learn to read them, they turn the chart into an action movie. They tell you a story about a fight between two teams:
        </p>

        <ul className="space-y-3 my-6">
            <li className="flex items-start">
                <span className="w-4 h-4 mt-2 mr-3 rounded-full bg-green-500 flex-shrink-0 shadow-sm" />
                <span className="text-lg"><strong>The Bulls</strong>: The team that wants the price to go <strong className="text-green-500">UP</strong> (like a bull striking upward with its horns).</span>
            </li>
            <li className="flex items-start">
                <span className="w-4 h-4 mt-2 mr-3 rounded-full bg-red-500 flex-shrink-0 shadow-sm" />
                <span className="text-lg"><strong>The Bears</strong>: The team that wants the price to go <strong className="text-red-500">DOWN</strong> (like a bear swiping downward with its paws).</span>
            </li>
        </ul>

        <p className="italic font-medium text-slate-600 dark:text-slate-400">
            Here is how to watch the match.
        </p>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-12 mb-6 tracking-tight">The Body (The Scoreboard)</h2>
        <p>
            Every candle represents a specific amount of time. Let's say one candle equals one day.
        </p>
        <p>
            The thick, colored part in the middle is called the <strong>Body</strong>.
        </p>

        <ul className="my-6 space-y-4">
            <li className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                <strong className="text-green-600 dark:text-green-400 text-lg block mb-1">Green Candle</strong>
                The Bulls won. The price started at the bottom of the body in the morning and finished at the top of the body at night.
            </li>
            <li className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800/30">
                <strong className="text-red-500 text-lg block mb-1">Red Candle</strong>
                The Bears won. The price started at the top and crashed down to the bottom by the end of the day.
            </li>
        </ul>

        <div className="bg-slate-100 dark:bg-neutral-800 p-6 rounded-2xl border-l-4 border-slate-500 my-6 shadow-sm">
            <p className="m-0 font-medium italic text-lg text-slate-700 dark:text-gray-300">
                If the body is really long, it means one team totally dominated the other. If the body is tiny, it means the fight was a tie, and nobody really moved anywhere.
            </p>
        </div>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-12 mb-6 tracking-tight">The Wicks (The Clues)</h2>
        <p>
            This is the secret sauce. You will see thin lines poking out of the top or bottom of the candle. These are called <strong>Wicks</strong> (or shadows).
        </p>
        <p>
            The wicks show you where the price tried to go during the fight but got pushed back.
        </p>
        <p className="font-bold text-lg">
            Imagine a game of tug-of-war.
        </p>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-2">
            <span className="text-slate-400">01.</span> The Long Top Wick (The "Bonk")
        </h3>
        <p>
            Imagine a green candle with a super long stick poking out the top.
        </p>
        <p>
            This means the <strong className="text-green-500">Bulls</strong> tried really hard to push the price up high. They got all the way to the top of that stick! But then, the <strong className="text-red-500">Bears</strong> stepped in, beat them up, and pushed the price back down before the day ended.
        </p>
        <div className="flex items-center gap-3 mt-4 text-slate-700 dark:text-slate-200 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span><strong>What it means:</strong> The Bulls are tired. The price might fall soon because the Bears are taking over.</span>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-2">
            <span className="text-slate-400">02.</span> The Long Bottom Wick (The "Trampoline")
        </h3>
        <p>
            Imagine a candle with a long stick poking out the bottom.
        </p>
        <p>
            This means the <strong className="text-red-500">Bears</strong> tried to crash the price. They pushed it way down low. But suddenly, the <strong className="text-green-500">Bulls</strong> woke up, stomped their feet, and pushed the price all the way back up.
        </p>
        <div className="flex items-center gap-3 mt-4 text-slate-700 dark:text-slate-200 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span><strong>What it means:</strong> The Bears failed. The price hit a "trampoline" and bounced. It will probably go up soon.</span>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-2">
            The "Hammer" Trick
        </h3>
        <p>
            There is one special shape you should look for. It’s the easiest one to spot.
        </p>
        <p>
            It has a small body at the top and a long wick at the bottom. It looks exactly like a <strong>Hammer</strong>.
        </p>
        <p>
            If you see a Hammer after the price has been dropping for a while, pay attention. It tells you the Bears tried to push the price into the dirt, but the Bulls said, "NOPE!" and hammered the price back up.
        </p>
        <p className="font-bold text-lg text-green-600 dark:text-green-400 mt-4">
            When you see a Hammer, it usually means the bad times are over and the price is about to climb.
        </p>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-16 mb-6">The Big Secret</h2>
        <p>
            Most people just look at the price and say, "Oh, it went up."
        </p>
        <p>
            But candlesticks help you understand the mood. Are the traders scared? Are they greedy? Is one team getting tired?
        </p>
        <p>
            If you see big <strong>Green bodies</strong>, the Bulls are strong - stick with them. If you see lots of long wicks on top of the candles, be careful - the Bears are hiding in the bushes, waiting to smack the price down.
        </p>
        <p className="text-lg font-bold text-center mt-12 mb-8">
            So, don't just look at the line. Look at the shapes, and see who is winning the tug-of-war.
        </p>
    </article>
);

const SupportResistanceArticle = () => (
    <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        {/* Header */}
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl mb-6 shadow-sm">
                <Target className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-white dark:via-purple-200 dark:to-white">
                The Bouncy Ball Game: Understanding Floors and Ceilings
            </h1>
        </div>

        {/* Hero Image */}
        <div className="not-prose mb-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-neutral-800">
            <img
                src="/support-resistance-diagram.png"
                alt="Support and Resistance Diagram"
                className="w-full h-auto object-cover"
            />
        </div>

        <p className="lead text-xl text-slate-600 dark:text-slate-300">
            If you watch a price chart for long enough, it can look like total chaos. The line wiggles up and down like a crazy fly buzzing around your screen.
        </p>

        <p>
            But if you squint your eyes a little bit, you will notice something strange. The price usually isn't moving randomly. It is actually trapped inside a room. It keeps hitting the same invisible walls over and over again.
        </p>

        <p>
            In the grown-up trading world, they call this <strong>"Support and Resistance."</strong> But that sounds boring. It is much easier to think of it as <strong>Floors and Ceilings</strong>.
        </p>

        <p className="font-semibold text-purple-600 dark:text-purple-400">
            Here is how you can use gravity to win the game.
        </p>

        <hr className="my-8 border-slate-200 dark:border-neutral-800" />

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-12 mb-6 tracking-tight">
            01. The Floor (The Safety Net)
        </h2>
        <p>
            Imagine you are holding a super bouncy rubber ball. You drop it. What happens?
        </p>
        <p>
            It falls fast, but eventually, it hits the ground. It goes boing and bounces back up. It doesn't crash through the floor into the basement because the floor is solid.
        </p>
        <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border-l-4 border-green-500 my-6 shadow-sm">
            <p className="m-0 font-medium text-lg text-slate-700 dark:text-gray-300">
                In the stock market, the <strong>"Floor"</strong> is a specific price where people think something is cheap.
            </p>
        </div>
        <p>
            Let’s say there is a popular video game that usually costs $50. If the price drops down to $30, everyone gets excited. They think it is a great deal. So many people rush in to buy it at $30 that the price stops falling and bounces back up.
        </p>
        <p>
            When you look at a chart, look for a spot at the bottom where the price keeps touching and bouncing up. Draw a straight line there. That is your <strong>Floor</strong>.
        </p>
        <p className="flex items-center gap-2 mt-4 font-bold text-green-600 dark:text-green-400">
            <Target className="w-5 h-5" />
            The Strategy: When the price gets close to the Floor, you get ready to buy. You are betting that the floor is solid and the ball will bounce.
        </p>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-16 mb-6 tracking-tight">
            02. The Ceiling (The Bonk)
        </h2>
        <p>
            Now imagine you take that same ball and throw it as hard as you can straight up in your living room.
        </p>
        <p>
            It flies up, but then it hits the roof. It goes bonk, hits its head, and falls back down to the ground. It cannot fly into outer space because the roof is in the way.
        </p>
        <p className="font-bold text-lg">
            This is the "Ceiling."
        </p>
        <p>
            This happens when the price gets too expensive. If that video game goes from $50 up to $100, people stop buying it. They say it costs too much money. People who already own it decide to sell it so they can make a profit. Because everyone is selling and nobody is buying, the price hits the ceiling and crashes back down.
        </p>
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border-l-4 border-red-500 my-6 shadow-sm">
            <p className="flex items-center gap-2 m-0 font-bold text-lg text-red-700 dark:text-red-300">
                <AlertTriangle className="w-5 h-5" />
                The Strategy: When the price hits the Ceiling, be careful. That is usually a good time to sell and take your money.
            </p>
        </div>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-16 mb-6 tracking-tight">
            03. The Magic Trick: Changing Levels
        </h2>
        <p>
            Here is the coolest part of this strategy.
        </p>
        <p>
            Sometimes, the market gets super strong. It is like the Hulk threw the ball. The price flies up to the Ceiling, but instead of bouncing down, it smashes right through it.
        </p>
        <p>
            When the price breaks a Ceiling, something magical happens.
        </p>
        <div className="bg-slate-100 dark:bg-neutral-800 p-6 rounded-2xl my-6 shadow-sm">
            <p className="m-0 italic text-lg text-slate-700 dark:text-gray-300">
                Imagine you are in a two-story house. You smash through the ceiling of the first floor and climb up. Now you are standing on the second floor.
                <br /><br />
                <strong>What used to be your ceiling is now under your feet. It has become your new floor.</strong>
            </p>
        </div>
        <p>
            This happens on charts all the time. A price breaks through a Ceiling, flies high, and then comes back down to land on that same line. It bounces off it and goes even higher.
        </p>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-16 mb-6 tracking-tight">How to Play</h2>
        <p>
            You don't need to be a math genius to do this. You just need a ruler.
        </p>
        <ul className="space-y-4 my-6">
            <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                <span>Look at the chart and find the places where the price bounced before.</span>
            </li>
            <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                <span>Draw a line connecting the bottoms (<strong>The Floor</strong>).</span>
            </li>
            <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                <span>Draw a line connecting the tops (<strong>The Ceiling</strong>).</span>
            </li>
        </ul>
        <p className="text-lg font-bold text-center mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-900 dark:text-purple-100">
            Now you have a map. You know exactly where the ball is going to bounce. Buy at the floor, sell at the ceiling, and watch out if the ball gets thrown too hard!
        </p>
    </article>
);

const RSIArticle = () => (
    <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        {/* Header */}
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl mb-6 shadow-sm">
                <Activity className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-pink-600 to-slate-900 dark:from-white dark:via-pink-300 dark:to-white">
                The Speedometer: How Fast Are We Going?
            </h1>
        </div>

        {/* Hero Image */}
        <div className="not-prose mb-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-neutral-800">
            <img
                src="/rsi-diagram.png"
                alt="RSI Speedometer Diagram"
                className="w-full h-auto object-cover"
            />
        </div>

        <p className="lead text-xl text-slate-600 dark:text-slate-300">
            Most people look at a chart and only see the price. They can see <strong>where</strong> the car is, but they can't see <strong>how fast</strong> the engine is spinning.
        </p>

        <p>
            Imagine you are driving a Ferrari down the highway at 200 mph. The car looks amazing. It's winning the race. But under the hood, the engine is screaming. It’s glowing red hot. If you don't slow down, the engine is going to blow up.
        </p>

        <p>
            In trading, we use a tool to check the engine temperature. It is called the <strong>RSI</strong> (Relative Strength Index).
        </p>

        <p className="font-semibold text-pink-600 dark:text-pink-400">
            Think of it as your Speedometer.
        </p>

        <hr className="my-8 border-slate-200 dark:border-neutral-800" />

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-12 mb-6 tracking-tight">
            01. Redlining (Overbought)
        </h2>
        <p>
            The RSI is just a line that moves between 0 and 100.
        </p>
        <p>
            When the line goes <strong>above 70</strong>, it enters the "Red Zone."
        </p>
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border-l-4 border-red-500 my-6 shadow-sm">
            <p className="m-0 font-medium text-lg text-slate-700 dark:text-gray-300">
                This means the car is going <strong>too fast</strong>. Everyone got too excited and bought the stock all at once. The engine is overheating.
            </p>
        </div>
        <p>
            Just like a car can't drive at max speed forever, a price usually can't stay in the Red Zone for long. It needs to take a break. It needs to slow down or even pull over (price drop) to let the engine cool off.
        </p>
        <p className="flex items-center gap-2 mt-4 font-bold text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            The Strategy: If the RSI is above 70, DO NOT BUY. It is too expensive. It might be a good time to sell.
        </p>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-16 mb-6 tracking-tight">
            02. Stalled (Oversold)
        </h2>
        <p>
            Now imagine the car has been driving for hours. It runs out of gas. It rolls to a stop on the side of the road.
        </p>
        <p>
            When the RSI line drops <strong>below 30</strong>, it enters the "Green Zone."
        </p>
        <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border-l-4 border-green-500 my-6 shadow-sm">
            <p className="m-0 font-medium text-lg text-slate-700 dark:text-gray-300">
                This means the selling is <strong>exhausted</strong>. Everyone who wanted to sell has already sold. There is nobody left to push the price down.
            </p>
        </div>
        <p>
            When a car stops on the highway, a tow truck usually comes to pick it up. In the market, this is when the buyers show up to scoop up the cheap deals.
        </p>
        <p className="flex items-center gap-2 mt-4 font-bold text-green-600 dark:text-green-400">
            <Target className="w-5 h-5" />
            The Strategy: If the RSI is below 30, it is a great time to look for a "Buy" signal. The price is cheap and the sellers are tired.
        </p>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-16 mb-6 tracking-tight">
            03. The Cruising Speed (50)
        </h2>
        <p>
            The line in the middle (50) is the speed limit.
        </p>
        <ul className="space-y-4 my-6">
            <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">🚀</span>
                <span>If the RSI is <strong>above 50</strong>, the bulls are driving. The trend is generally UP.</span>
            </li>
            <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">🐻</span>
                <span>If the RSI is <strong>below 50</strong>, the bears are driving. The trend is generally DOWN.</span>
            </li>
        </ul>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-16 mb-6 tracking-tight">How to Win</h2>
        <p>
            Don't overcomplicate it. Use the RSI to keep yourself safe.
        </p>
        <p className="text-lg font-bold text-center mt-8 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-pink-900 dark:text-pink-100">
            If the speedometer says 200mph (Over 70), don't jump in the car. Wait for it to slow down. If the car is parked (Under 30), that's the best time to hop in for a ride!
        </p>
    </article>
);
