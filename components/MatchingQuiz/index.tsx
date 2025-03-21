import { Flashcard } from "@/lib/schemas";
import { ChevronLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Match } from "../icons";

interface CardData {
  id: number;
  text: string;
  commonValue: string;
  isFlipped: boolean;
  isMatched: boolean;
}
interface Props {
  title: string;
  ResetAll: () => void;
  matchCards: Flashcard[];
}

const MatchingQuiz = ({ title, matchCards, ResetAll }: Props) => {
  // Create flashcards from the initial data
  const createFlashcards = (): CardData[] => {
    return matchCards.reduce<CardData[]>((acc, value, index) => {
      let el = [
        {
          id: index * 2,
          text: value.question,
          commonValue: "val" + index,
          isFlipped: false,
          isMatched: false,
        },
        {
          id: index * 2 + 1,
          text: value.answer,
          commonValue: "val" + index,
          isFlipped: false,
          isMatched: false,
        },
      ];
      return [...acc, ...el];
    }, []);
  };

  // State for cards, selected cards, and matches
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardData[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  // Initialize and shuffle cards
  useEffect(() => {
    const newCards = createFlashcards();
    // Shuffle cards
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    setCards(newCards);
  }, []);

  // Handle card click
  const handleCardClick = (clickedCard: CardData) => {
    // Prevent clicking if card is already flipped or matched
    if (
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      selectedCards.length >= 2
    ) {
      return;
    }

    // Flip the card
    const updatedCards = cards.map((card) =>
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);

    // Add to selected cards
    const newSelectedCards = [...selectedCards, clickedCard];
    setSelectedCards(newSelectedCards);

    // Check for matches if we have 2 cards selected
    if (newSelectedCards.length === 2) {
      setAttempts((prev) => prev + 1);

      // Check if the cards match (have the same commonValue)
      if (newSelectedCards[0].commonValue === newSelectedCards[1].commonValue) {
        // It's a match!
        setTimeout(() => {
          const matchedCards = cards.map((card) =>
            card.commonValue === newSelectedCards[0].commonValue
              ? { ...card, isMatched: true }
              : card
          );
          setCards(matchedCards);
          setSelectedCards([]);

          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);

          // Check if game is completed
          if (newMatchedPairs === matchedCards.length) {
            setGameCompleted(true);
          }
        }, 1000);
      } else {
        // Not a match, flip cards back
        setTimeout(() => {
          const resetCards = cards.map((card) =>
            selectedCards.some((selected) => selected.id === card.id)
              ? { ...card, isFlipped: false }
              : card
          );
          setCards(resetCards);
          setSelectedCards([]);
        }, 1500);
      }
    }
  };

  // Reset game
  const resetGame = () => {
    const newCards = createFlashcards();
    // Shuffle cards
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    setCards(newCards);
    setSelectedCards([]);
    setMatchedPairs(0);
    setGameCompleted(false);
    setAttempts(0);
  };

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-7xl mx-auto bg-red-0">
      <div className="w-full pt-2">
        <button
          onClick={ResetAll}
          className="pr-5 pl-3 py-1 bg-black/5 text-black/60 rounded-md border flex items-center justify-center gap-2"
        >
          <ChevronLeft className=" h-4 w-4" /> Back
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4 pt-4">{title}</h1>

      <div className="mb-4 w-full flex justify-between">
        <div className="text-lg">
          Pairs: {matchedPairs}/{matchCards.length}
        </div>
        <div className="text-lg">Attempts: {attempts}</div>
      </div>

      {gameCompleted && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Congratulations! You've completed the game in {attempts} attempts!
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 sm:gap-4 gap-3 w-full">
        {cards.map((card) => (
          <div
            key={card.id}
            className="md:min-h-40 min-h-56 h-full perspective-1000"
            onClick={() => handleCardClick(card)}
          >
            <div
              className={`relative w-full h-full cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${
                card.isFlipped || card.isMatched ? "rotate-y-180" : ""
              }`}
            >
              {/* Card Back */}
              <div className="absolute w-full h-full backface-hidden bg-blue-100 rounded-lg shadow-md flex items-center justify-center">
                <span className="font-medium text-xl">
                  <Match />
                </span>
              </div>

              {/* Card Front */}
              <div
                className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-lg shadow-md flex items-center justify-center p-4 text-center ${
                  card.isMatched
                    ? "bg-blue-100 ring-2 ring-green-500"
                    : "bg-blue-100"
                }`}
              >
                <span className="font-medium text-sm sm:text-base">
                  {card.text}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded mb-5 "
        onClick={resetGame}
      >
        Reset Game
      </button>
    </div>
  );
};

export default MatchingQuiz;
