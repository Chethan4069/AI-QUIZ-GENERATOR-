"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getQuizDetails, submitQuizResult } from "@/lib/api";
import { Timer, CheckCircle, XCircle, ChevronRight, ChevronLeft, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setQuizId(p.id));
  }, [params]);

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{[key: number]: string}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    const loadQuiz = async () => {
      try {
        const data = await getQuizDetails(Number(quizId));
        if (!data) throw new Error("Empty Data");
        setQuiz(data);
        setQuestions(data.questions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Quiz not found!");
        router.push("/dashboard");
      }
    };
    loadQuiz();
  }, [quizId, router]);

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOptions(prev => ({ ...prev, [currentQIndex]: option }));
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    let newScore = 0;
    questions.forEach((q, index) => {
      const userAns = selectedOptions[index];
      if (userAns && userAns.trim() === q.correct_answer.trim()) {
        newScore += 4;
      } else if (userAns) {
        newScore -= 1;
      }
    });
    setScore(newScore);
    try {
      if (quizId) await submitQuizResult(Number(quizId), newScore, questions.length, selectedOptions);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-black font-bold"><Loader2 className="animate-spin" /> Loading Quiz...</div>;

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8 px-4 text-black">
      
      {/* Top Header with Back Button */}
      <div className="w-full max-w-3xl mb-6 flex justify-between items-center">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-black font-bold hover:underline">
            <ArrowLeft size={20}/> Dashboard
        </button>
        <div className="bg-black text-white px-4 py-2 rounded-lg font-mono font-bold">
          Q {currentQIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Main Title */}
      <div className="w-full max-w-3xl mb-6 text-center">
        <h1 className="text-2xl font-black text-black">{quiz.title}</h1>
        <p className="text-black font-medium">Topic: {quiz.topic}</p>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border-2 border-black">
        <h3 className="text-xl font-bold text-black mb-6">{currentQuestion.question}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option: string, idx: number) => {
            const isSelected = selectedOptions[currentQIndex] === option;
            const isCorrect = option === currentQuestion.correct_answer;
            
            let style = "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center font-bold text-lg ";
            
            if (isSubmitted) {
              if (isCorrect) style += "bg-green-100 border-green-600 text-black";
              else if (isSelected) style += "bg-red-100 border-red-600 text-black";
              else style += "border-gray-200 text-black opacity-50";
            } else {
              if (isSelected) style += "border-blue-600 bg-blue-50 text-black shadow-md";
              else style += "border-gray-300 text-black hover:border-black hover:bg-gray-50";
            }

            return (
              <button key={idx} onClick={() => handleOptionSelect(option)} className={style} disabled={isSubmitted}>
                {option}
                {isSubmitted && isCorrect && <CheckCircle className="text-green-600" size={24} />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="text-red-600" size={24} />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isSubmitted && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 text-black font-medium">
            <div className="flex items-center gap-2 font-black text-blue-800 mb-1"><AlertTriangle size={16}/> Explanation</div>
            {currentQuestion.explanation}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t-2 border-gray-100 flex justify-between items-center">
          
          <button 
            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQIndex === 0}
            className="bg-gray-200 text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
          >
             <ChevronLeft /> Previous
          </button>

          {isSubmitted ? (
            <div className="flex items-center gap-4">
               <span className="font-black text-2xl text-black">Score: {score}</span>
               <button onClick={() => router.push('/dashboard')} className="bg-black text-white px-6 py-3 rounded-xl font-bold">
                 Finish
               </button>
            </div>
          ) : (
             currentQIndex < questions.length - 1 ? (
               <button onClick={() => setCurrentQIndex(prev => prev + 1)} className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800">
                 Next <ChevronRight />
               </button>
             ) : (
               <button onClick={handleSubmit} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700">
                 Submit Quiz
               </button>
             )
          )}
        </div>
      </div>
    </div>
  );
}