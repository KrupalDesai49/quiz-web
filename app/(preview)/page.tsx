"use client";

import { useEffect, useState } from "react";
import { experimental_useObject } from "ai/react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import FileUploader from "@/components/FileUploader";
import { FlashCard, Match, QuizIcon } from "@/components/icons";
import Quiz from "@/components/quiz";
import {
  Flashcard,
  flashcardsSchema,
  Question,
  questionsSchema,
} from "@/lib/schemas";
import MatchingQuiz from "@/components/MatchingQuiz";
import Flashcards from "@/components/Flashcards";

type TestMode = "quiz" | "flashcard" | "match";

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [flashCards, setFlashCards] = useState<Flashcard[]>([]);
  const [matchCards, setMatchCards] = useState<Flashcard[]>([]);
  const [title, setTitle] = useState<string | undefined>("");
  const [testMode, setTestMode] = useState<TestMode>("quiz");
  const [isResultGenerated, setIsResultGenerated] = useState(false);

  const {
    submit,
    object: partialResult,
    isLoading,
  } = experimental_useObject({
    api:
      testMode === "quiz" ? "/api/generate-quiz" : "/api/generate-flashcards",
    schema: testMode === "quiz" ? questionsSchema : flashcardsSchema,
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

  const clearPDF = () => {
    setFiles([]);
    setQuestions([]);
    setFlashCards([]);
    setMatchCards([]);
    setIsResultGenerated(false);
  };

  // Calculate progress based on test mode and expected result length
  const expectedLength = testMode === "quiz" ? 4 : 3;
  const progress = partialResult
    ? (partialResult.length / expectedLength) * 100
    : 0;

  if (testMode === "quiz" && isResultGenerated) {
    return (
      <Quiz title={title || "Quiz"} questions={questions} clearPDF={clearPDF} />
    );
  }
  if (testMode === "match" && !isResultGenerated) {
    return (
      <MatchingQuiz
        title={title || "Match Card"}
        matchCards={matchCards}
        clearPDF={clearPDF}
      />
    );
  }
  if (testMode === "flashcard" && isResultGenerated) {
    return (
      <Flashcards
        title={title || "Flash Card"}
        flashCards={flashCards}
        clearPDF={clearPDF}
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
    <div className="w-full bg-white flex flex-col  items-center justify-center min-h-[100dvh] px-2">
      {/* Title & description  */}
      <div className="flex flex-col max-w-xl mx-auto text-center  gap-1 ">
        <h1 className="sm:text-3xl text-2xl font-bold">PDF Quiz Generator</h1>
        <h2 className="text-base text-black/60">
          Simply upload a PDF and AI will create custom quizzes, match cards, or
          flashcards to enhance your learning experience.
        </h2>
      </div>

      {/* Test Mode Selection */}
      <div className="text-black/60 sm:gap-3 gap-2 items-center justify-center grid grid-cols-3 max-w-xl pb-10 pt-8 ">
        {testModeOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => setTestMode(option.id)}
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
        />
      </div>
    </div>
  );
}
