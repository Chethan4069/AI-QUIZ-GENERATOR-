"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuizAnalytics } from "@/lib/api";
import { BarChart, Users, Target, ArrowLeft, Loader2 } from "lucide-react";

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [quizId, setQuizId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { params.then((p) => setQuizId(p.id)); }, [params]);

  useEffect(() => {
    if (!quizId) return;
    const loadData = async () => {
      try {
        const stats = await getQuizAnalytics(Number(quizId));
        setData(stats);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadData();
  }, [quizId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-black"><Loader2 className="animate-spin" /> Loading Analytics...</div>;
  if (!data) return <div className="text-center p-10 text-black font-bold">Error loading data.</div>;

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 text-black">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-200 rounded-full text-black">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-black">{data.title}</h1>
            <p className="text-black font-bold">Performance Analytics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-black flex items-center gap-4">
            <div className="p-3 bg-blue-200 text-blue-900 rounded-full"><Users size={24} /></div>
            <div>
              <p className="text-sm text-black font-bold">Total Attempts</p>
              <h3 className="text-3xl font-black text-black">{data.total_attempts}</h3>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-black flex items-center gap-4">
            <div className="p-3 bg-green-200 text-green-900 rounded-full"><Target size={24} /></div>
            <div>
              <p className="text-sm text-black font-bold">Average Score</p>
              <h3 className="text-3xl font-black text-black">{data.average_score}</h3>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-black flex items-center gap-4">
            <div className="p-3 bg-purple-200 text-purple-900 rounded-full"><BarChart size={24} /></div>
            <div>
              <p className="text-sm text-black font-bold">Completion</p>
              <h3 className="text-3xl font-black text-black">100%</h3>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl border-2 border-black overflow-hidden">
          <div className="p-6 border-b-2 border-black bg-gray-100">
            <h2 className="text-lg font-black text-black">Question Performance</h2>
          </div>
          
          <div className="divide-y-2 divide-gray-200">
            {data.question_stats.map((q: any, index: number) => (
              <div key={index} className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-black text-lg">Question {index + 1}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-black border-2 border-black ${q.pass_rate > 70 ? 'bg-green-300 text-black' : 'bg-red-300 text-black'}`}>
                    {q.pass_rate}% Correct
                  </span>
                </div>
                <p className="text-black font-medium mb-3 text-lg">{q.question}</p>
                
                <div className="w-full bg-gray-300 rounded-full h-4 border border-black mb-3">
                  <div className={`h-full rounded-full border-r border-black ${q.pass_rate > 70 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${q.pass_rate}%` }}></div>
                </div>

                {/* Correct Answer Display */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-300">
                    <p className="text-sm font-black text-green-800">CORRECT ANSWER:</p>
                    <p className="text-base font-bold text-black">{q.correct_answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}