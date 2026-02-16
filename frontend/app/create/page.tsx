"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPDF, generateQuiz, saveQuiz } from "@/lib/api"; 
import { Upload, Play, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function CreateQuizPage() {
  const router = useRouter(); 
  
  // State
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadSuccess(false);
    try {
      const response = await uploadPDF(file);
      setFileId(response.file_id);
      setUploadSuccess(true);
      alert("PDF Processed Successfully! Now choose your settings below.");
    } catch (error) {
      console.error(error);
      alert("Upload Failed!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateAndSaveQuiz = async () => {
    if (!fileId) {
      alert("Please upload and process a PDF first!");
      return;
    }
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    setIsLoadingQuiz(true);
    try {
      const quizGenerationData = await generateQuiz(topic, difficulty, questionCount, fileId);

      const quizToSave = {
        title: file?.name?.replace('.pdf', '') || "Untitled Quiz",
        topic: topic,
        questions: quizGenerationData.questions 
      };

      await saveQuiz(quizToSave);
      
      alert("Quiz generated and saved! Redirecting to dashboard...");
      router.push(`/dashboard`);

    } catch (error) {
      console.error(error);
      alert("Failed to generate quiz. Check the backend console for details.");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 text-black">
      <div className="max-w-xl w-full">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push('/dashboard')} 
          className="flex items-center gap-2 text-black font-bold mb-4 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700">Create New Quiz</h1>
            <p className="text-black mt-2 font-medium">Upload notes, configure settings, and generate.</p>
          </div>

          {/* Step 1: Upload Box */}
          <div className={`mb-4 p-6 border-2 border-dashed rounded-xl transition-all ${uploadSuccess ? 'border-green-500 bg-green-50' : 'border-black hover:border-blue-600'}`}>
            <label className="flex flex-col items-center cursor-pointer">
              <div className={`p-4 rounded-full mb-3 ${uploadSuccess ? 'bg-green-200 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {uploadSuccess ? <CheckCircle size={32} /> : <Upload size={32} />}
              </div>
              <span className="text-sm font-bold text-black text-center">
                {file ? file.name : "Click to Upload PDF"}
              </span>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setUploadSuccess(false);
                }}
              />
            </label>
          </div>

          {/* Process PDF Button (Always Visible, Blue) */}
          <div className="mb-6">
            <button 
              onClick={handleFileUpload}
              disabled={!file || isUploading}
              className={`w-full py-3 rounded-lg text-sm font-bold transition shadow-md ${
                !file ? 'bg-blue-300 cursor-not-allowed text-white' :
                uploadSuccess ? 'bg-green-600 text-white' : 
                'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUploading ? <><Loader2 className="inline animate-spin mr-2"/> Processing PDF...</> : 
               !file ? "Select a File to Process" :
               uploadSuccess ? "PDF Processed Successfully!" : "Process PDF"}
            </button>
          </div>

          {/* Step 2: Settings */}
          <div className={`space-y-5 transition-opacity duration-500 ${uploadSuccess ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Quiz Topic</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white font-medium placeholder-gray-400"
                placeholder="e.g., Photosynthesis..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-black bg-white font-medium"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Questions</label>
                <select 
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-black bg-white font-medium"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleGenerateAndSaveQuiz}
              disabled={isLoadingQuiz || !uploadSuccess}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex justify-center items-center gap-2 shadow-lg disabled:opacity-70"
            >
              {isLoadingQuiz ? (
                <><Loader2 className="animate-spin" /> Generating...</>
              ) : (
                <>Generate Quiz <Play fill="white" size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}