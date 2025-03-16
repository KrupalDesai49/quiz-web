import { Flashcard } from "@/lib/schemas";
import React, { useState } from "react";

interface FlashcardData {
  question: string;
  answer: string;
}
interface Props {
  title: string;
  clearPDF: () => void;
  flashCards: Flashcard[];
}

const Flashcards = ({ title, flashCards, clearPDF }: Props) => {
  // Sample flashcard data
  //   const flashcardsData: FlashcardData[] = [
  //     { question: "What is the boarding location?", answer: "AMRELI" },
  //     {
  //       question: "What is the arrival location?",
  //       answer: "SURAT KAMREJ BUS STAND",
  //     },
  //     { question: "What is the total fare?", answer: "686.00" },
  //   ];

  // State variables
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Current card based on index
  const currentCard = flashCards[currentCardIndex];

  // Toggle flip state
  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  // Go to previous card
  const handlePrevious = () => {
    setIsFlipped(false); // Reset to question side
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? flashCards.length - 1 : prevIndex - 1
    );
  };

  // Go to next card
  const handleNext = () => {
    setIsFlipped(false); // Reset to question side
    setCurrentCardIndex((prevIndex) =>
      prevIndex === flashCards.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">{title}</h1>

      {/* Card counter */}
      <div className="mb-4 text-lg">
        Card {currentCardIndex + 1} of {flashCards.length}
      </div>

      {/* Flashcard with 3D flip effect */}
      <div
        className="w-full h-64 perspective-1000 mb-8 cursor-pointer"
        onClick={handleCardClick}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Question Side (Front) */}
          <div className="absolute w-full h-full backface-hidden bg-blue-50 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500 mb-2">Question:</div>
            <div className="text-xl text-center font-medium">
              {currentCard.question}
            </div>
            <div className="text-sm text-gray-400 mt-4">Click to flip</div>
          </div>

          {/* Answer Side (Back) */}
          <div className="absolute w-full h-full backface-hidden bg-green-50 rotate-y-180 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500 mb-2">Answer:</div>
            <div className="text-xl text-center font-medium">
              {currentCard.answer}
            </div>
            <div className="text-sm text-gray-400 mt-4">Click to flip back</div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between w-full max-w-md">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg flex items-center"
          onClick={handlePrevious}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg flex items-center"
          onClick={handleNext}
        >
          Next
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* CSS for 3D flip effect */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Flashcards;
