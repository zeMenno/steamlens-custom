"use client";

import { useState } from "react";
import { api } from "~/utils/api";

interface AIChatContentProps {
  appId: number;
}

export function AIChatContent({ appId }: AIChatContentProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const askQuestionMutation = api.ai.askQuestion.useMutation({
    onSuccess: (answer) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer },
      ]);
      setQuestion("");
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}`,
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    askQuestionMutation.mutate({ appId, question: question.trim() });
  };

  return (
    <>
      <div className="mb-4 h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-400 mb-2">Ask any question about this game</p>
            <p className="text-gray-500 text-sm">Get instant AI-powered answers!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white ml-auto max-w-[85%] rounded-br-none"
                  : "bg-gray-700 text-gray-100 mr-auto max-w-[85%] rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
        {askQuestionMutation.isPending && (
          <div className="bg-gray-700 text-gray-100 p-4 rounded-lg mr-auto max-w-[80%]">
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What is the gameplay like? Is it worth buying?"
          disabled={askQuestionMutation.isPending}
          className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={askQuestionMutation.isPending || !question.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {askQuestionMutation.isPending ? "..." : "Ask"}
        </button>
      </form>
    </>
  );
}

