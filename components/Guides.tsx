import React, { useState } from 'react';
import { ArrowLeft, BookOpen, TrendingUp, AlertTriangle, Target, ChevronRight, BarChart2 } from 'lucide-react';

interface GuidesProps {
    onBack: () => void;
}

type GuideId = 'alligator' | 'candlesticks';

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
                            Trading Guides
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
                                className="group bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left flex items-center gap-6"
                            >
                                <div className="p-4 bg-slate-100 dark:bg-neutral-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    {guide.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {guide.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-gray-400 mb-3">
                                        {guide.description}
                                    </p>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        {guide.readTime}
                                    </span>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
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
                    <span className="font-semibold">Back to Guides</span>
                </button>

                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-neutral-800 animate-fade-in">
                    {selectedGuide === 'alligator' ? <AlligatorArticle /> : <CandlesticksArticle />}
                </div>
            </div>
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
