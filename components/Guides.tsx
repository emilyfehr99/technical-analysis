import React from 'react';
import { ArrowLeft, BookOpen, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface GuidesProps {
    onBack: () => void;
}

export const Guides: React.FC<GuidesProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Analyzer</span>
                </button>

                {/* Header */}
                <div className="mb-12 text-center animate-fade-in-up">
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

                {/* Content Container */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-neutral-800 animate-fade-in">

                    {/* Article Content */}
                    <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
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

                        <h2>The Three Lines (The Alligator’s Face)</h2>
                        <p>
                            When you turn on the "Alligator" tool on a trading screen, three colored lines appear over the price chart. Think of these lines as parts of the Alligator’s mouth:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="w-3 h-3 mt-2 mr-3 rounded-full bg-blue-500 flex-shrink-0" />
                                <span><strong className="text-blue-500">The Blue Line (The Jaw)</strong>: This is the slowest line. It’s like the heavy, strong jaw of the alligator. It moves slowly because jaws don’t wiggle around much.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-3 h-3 mt-2 mr-3 rounded-full bg-red-500 flex-shrink-0" />
                                <span><strong className="text-red-500">The Red Line (The Teeth)</strong>: This is right in the middle.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-3 h-3 mt-2 mr-3 rounded-full bg-green-500 flex-shrink-0" />
                                <span><strong className="text-green-500">The Green Line (The Lips)</strong>: This is the fastest line. Think of how fast you can smack your lips compared to moving your whole jaw.</span>
                            </li>
                        </ul>

                        <h3>Phase 1: The Nap (Don’t Touch!)</h3>
                        <p>Most of the time, the Alligator is lazy.</p>
                        <div className="bg-slate-100 dark:bg-neutral-800 p-4 rounded-xl border-l-4 border-slate-500 my-4">
                            <p className="m-0 font-medium italic">
                                When you look at the chart, if the Blue, Red, and Green lines are all twisted together like a bowl of spaghetti, <strong>the Alligator is sleeping</strong>.
                            </p>
                        </div>
                        <p>
                            This means the market is boring. The price isn't really going up or down; it’s just wandering sideways. When the alligator is sleeping, <strong>you should stay away</strong>. If you try to grab the treasure while the lines are tangled, you might get tricked. The longer the alligator sleeps, the hungrier he wakes up.
                        </p>

                        <h3>Phase 2: Waking Up (The Yawn)</h3>
                        <p>
                            Eventually, the Alligator gets hungry.
                        </p>
                        <p>
                            You will see the Green line (Lips) start to move away from the Red line (Teeth), and the Red line move away from the Blue line (Jaw). The lines stop crossing over each other and start pointing in the same direction - usually up or down.
                        </p>
                        <p>This looks like an animal opening its mouth wide.</p>
                        <ul>
                            <li><strong>If the mouth opens UP</strong> (Green on top, Blue on bottom): The Alligator is trying to eat prices that are going higher. This is usually when traders want to <strong>buy</strong>.</li>
                            <li><strong>If the mouth opens DOWN</strong> (Blue on top, Green on bottom): The Alligator is chasing prices going <strong>lower</strong>.</li>
                        </ul>

                        <h3>Phase 3: The Feast (Chomp Time!)</h3>
                        <p>
                            Now the Alligator is eating. The three lines are spread far apart, nice and wide. The price candles are running away, but the Alligator keeps chasing them.
                        </p>
                        <p>
                            This is the <strong>"trend."</strong> This is where the easy money is made. As long as the Alligator’s mouth is wide open and the lines aren't touching, the trend is strong. You just ride the wave.
                        </p>

                        <h3>Phase 4: Full Tummy (Time to Go)</h3>
                        <p>
                            After a big meal, the Alligator gets sleepy again.
                        </p>
                        <p>
                            You’ll notice the Green line starts to curve back toward the Red line. The lines get closer together. The mouth is closing. This tells you the trend is over. The animal is full.
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700/50 my-4 flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                            <p className="m-0 text-sm text-yellow-800 dark:text-yellow-200">
                                When the mouth closes and the lines start tangling up into spaghetti again, the show is over. It’s time to take your profit and walk away before the Alligator goes back to sleep.
                            </p>
                        </div>

                        <h2>Why It Works</h2>
                        <p>
                            The reason this works isn't magic. It’s just a way to teach you <strong>patience</strong>.
                        </p>
                        <p>
                            Most people lose money because they try to trade when the market is sleeping (the spaghetti phase). The Alligator teaches you to sit on your hands and wait until the monster is actually hungry.
                        </p>
                        <p className="text-lg font-bold text-center mt-8">
                            So, next time you see a chart, look for the green lips, red teeth, and blue jaw. If they’re tangled, take a nap. If the mouth is open, it’s dinner time!
                        </p>
                    </article>              </div>


            </div>
        </div>

    );
};
