"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyQuizzes, deleteQuiz } from '@/lib/api'; // Add deleteQuiz
import { PlusCircle, BarChart2, Eye, Trash2, BookText } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  topic: string;
  questions: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const data = await getMyQuizzes();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId: number) => {
    if (window.confirm("Are you sure you want to delete this quiz? This action is permanent.")) {
      try {
        await deleteQuiz(quizId);
        // Refresh the list of quizzes after deletion
        fetchQuizzes(); 
      } catch (error) {
        console.error("Failed to delete quiz", error);
        alert("Could not delete the quiz.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => router.push('/create')}
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <PlusCircle size={20} />
            Create New Quiz
          </button>
        </header>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Quizzes</h3>
            <p className="text-3xl font-bold text-gray-800">{quizzes.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
             <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                <BookText size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-800">AI Quiz Generator</h3>
                <p className="text-sm text-gray-600">Upload your notes, and let our AI create challenging quizzes to test your knowledge.</p>
             </div>
          </div>
        </div>

        {/* Your Quizzes List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Quizzes</h2>
          <div className="space-y-4">
            {isLoading ? <p>Loading...</p> : quizzes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't created any quizzes yet.</p>
                <button
                  onClick={() => router.push('/create')}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Create Your First Quiz
                </button>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-800">{quiz.title}</h3>
                    <p className="text-sm text-gray-500">{quiz.questions.length} Questions | Topic: {quiz.topic}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => router.push(`/analytics/${quiz.id}`)} className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200">
                      <BarChart2 size={16} />
                    </button>
                    <button onClick={() => router.push(`/quiz/${quiz.id}`)} className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleDelete(quiz.id)} className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}