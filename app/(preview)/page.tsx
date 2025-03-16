"use client";

import { experimental_useObject } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import FileUploader from "@/components/FileUploader";
import Flashcards from "@/components/Flashcards";
import { FlashCard, Match, QuizIcon } from "@/components/icons";
import MatchingQuiz from "@/components/MatchingQuiz";
import Quiz from "@/components/quiz";
import {
  createFlashcardsSchema,
  createQuestionsSchema,
  Flashcard,
  Question,
} from "@/lib/schemas";

type TestMode = "quiz" | "flashcard" | "match";

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [flashCards, setFlashCards] = useState<Flashcard[]>([]);
  const [matchCards, setMatchCards] = useState<Flashcard[]>([]);
  const [title, setTitle] = useState<string | undefined>("");
  const [testMode, setTestMode] = useState<TestMode>("quiz");
  const [isResultGenerated, setIsResultGenerated] = useState(false);
  const [questionsCount, setQuestionsCount] = useState<number>(5);

  const {
    submit,
    object: partialResult,
    isLoading,
  } = experimental_useObject({
    api:
      testMode === "quiz" ? "/api/generate-quiz" : "/api/generate-flashcards",
    schema:
      testMode === "quiz"
        ? createQuestionsSchema(questionsCount)
        : createFlashcardsSchema(questionsCount),

    initialValue: undefined,
    onError: () => {
      toast.error("Failed to generate content. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      if (!object) {
        toast.error("Received empty response. Please try again.");
        return;
      }
      if (!Array.isArray(object)) {
        console.warn("Received quiz data but incorrect format:", object);
        toast.error("Quiz format incorrect. Please try again.");
      }

      try {
        if (testMode === "quiz") {
          setQuestions(object as Question[]);
        } else if (testMode === "flashcard") {
          setFlashCards(object as Flashcard[]);
        } else if (testMode === "match") {
          setMatchCards(object as Flashcard[]);
        }
        setIsResultGenerated(true);
      } catch (err) {
        console.error("Error processing result:", err);
        toast.error("Error processing result. Please try again.");
      }
    },
  });

  const ResetAll = () => {
    setQuestions([]);
    setFlashCards([]);
    setMatchCards([]);
    setIsResultGenerated(false);
  };
  const clearPDF = () => {
    setFiles([]);
  };

  const progress = partialResult
    ? (partialResult.length / questionsCount) * 100
    : 0;

  if (testMode === "quiz" && isResultGenerated) {
    return (
      <Quiz title={title || "Quiz"} questions={questions} ResetAll={ResetAll} />
    );
  }
  if (testMode === "match" && isResultGenerated) {
    return (
      <MatchingQuiz
        title={title || "Match Card"}
        matchCards={matchCards}
        ResetAll={ResetAll}
      />
    );
  }
  if (testMode === "flashcard" && isResultGenerated) {
    return (
      <Flashcards
        title={title || "Flash Card"}
        flashCards={flashCards}
        ResetAll={ResetAll}
      />
    );
  }

  const testModeOptions: {
    id: TestMode;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "flashcard", label: "Flashcards", icon: <FlashCard /> },
    { id: "match", label: "Match", icon: <Match /> },
    { id: "quiz", label: "Quiz", icon: <QuizIcon /> },
  ];

  return (
    <div className="w-full bg-white flex flex-col  items-center justify-start md:pt-20 pt-14 min-h-[100dvh] px-2">
      {/* Title & description  */}
      <div className="flex flex-col max-w-xl mx-auto text-center  gap-1 ">
        <h1 className="sm:text-3xl text-2xl font-bold">PDF Quiz Generator</h1>
        <h2 className="text-base text-black/60">
          Simply upload a PDF and AI will create custom quizzes, match cards, or
          flashcards to enhance your learning experience.
        </h2>
      </div>

      {/* Test Mode Selection */}
      <div className="text-black/60 sm:gap-3 gap-2 items-center justify-center grid grid-cols-3 max-w-xl pb-5 pt-8 ">
        {testModeOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => {
              if (isLoading) {
                return toast.error(
                  "You can't change test mode while Q&A generating"
                );
              }
              setTestMode(option.id);
            }}
            className={twMerge(
              "flex flex-col items-center justify-center bg-blue-50 cursor-pointer px-10 gap-1 py-6 border transition-all ring-transparent border-blue-100 rounded-xl",
              testMode === option.id && "ring-2 ring-blue-300"
            )}
          >
            {option.icon}
            <p className="sm:text-base text-sm">{option.label}</p>
          </div>
        ))}
      </div>

      {/* Count Control */}
      <div className="w-full max-w-lg mb-5">
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of {testMode === "quiz" ? "questions" : "cards"} to generate:
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="1"
              max="12"
              value={questionsCount}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                setQuestionsCount(newValue);
              }}
              className="w-full h-2 bg-blue-200 rounded-lg  cursor-pointer"
            />
            <span className="ml-3 w-8 text-center">{questionsCount}</span>
          </div>
        </div>
      </div>

      {/* File Upload Card */}
      <div className="text-black w-full ">
        <FileUploader
          files={files}
          setFiles={setFiles}
          submit={submit}
          setTitle={setTitle}
          progress={progress}
          partialResultLenght={partialResult ? partialResult.length : undefined}
          isLoading={isLoading}
          testMode={testMode}
          questionsCount={questionsCount}
          clearPdf={clearPDF}
        />
      </div>
    </div>
  );
}
