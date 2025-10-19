'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import cardsData from '@/data/cards.json';

interface Category {
  id: string;
  name: string;
  color: string;
  prompts: string[];
}

interface Card {
  text: string;
  category: string;
  categoryColor: string;
}

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['starter']);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [backgroundGradient, setBackgroundGradient] = useState(0);

  const categories: Category[] = cardsData.categories;

  useEffect(() => {
    const saved = localStorage.getItem('nextcard-categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCategories(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved categories');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nextcard-categories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  const getAvailableCards = (): Card[] => {
    return categories
      .filter(category => selectedCategories.includes(category.id))
      .flatMap(category => 
        category.prompts.map(prompt => ({
          text: prompt,
          category: category.name,
          categoryColor: category.color
        }))
      );
  };

  const drawRandomCard = () => {
    const availableCards = getAvailableCards();
    if (availableCards.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const newCard = availableCards[randomIndex];
    setCurrentCard(newCard);
    setBackgroundGradient(prev => (prev + 1) % 5);
  };

  useEffect(() => {
    if (selectedCategories.length > 0) {
      drawRandomCard();
    }
  }, [selectedCategories]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        const newCategories = prev.filter(id => id !== categoryId);
        return newCategories.length > 0 ? newCategories : ['starter'];
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const gradients = [
    'from-blue-50 to-indigo-100',
    'from-purple-50 to-pink-100', 
    'from-green-50 to-emerald-100',
    'from-yellow-50 to-orange-100',
    'from-rose-50 to-red-100'
  ];

  return (
    <div className={clsx(
      'min-h-screen bg-gradient-to-br transition-all duration-1000 ease-in-out',
      gradients[backgroundGradient]
    )}>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Next Card
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Push the button. Start the conversation.
          </p>
          <p className="text-lg text-gray-500">
            A game for connection.
          </p>
        </div>

        {/* Category Toggles */}
        <div className="mb-12 w-full max-w-4xl">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={clsx(
                  'px-4 py-2 rounded-full border-2 transition-all duration-200 font-medium',
                  selectedCategories.includes(category.id)
                    ? category.color
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Card Area */}
        <div className="mb-12 w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={currentCard.text}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200"
              >
                <div className="text-center">
                  <div className={clsx(
                    'inline-block px-3 py-1 rounded-full text-sm font-medium mb-6',
                    currentCard.categoryColor
                  )}>
                    {currentCard.category}
                  </div>
                  <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed">
                    {currentCard.text}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={drawRandomCard}
            disabled={selectedCategories.length === 0}
            className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            Next Card
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>No accounts. No clutter. Just conversation.</p>
        </div>
      </div>
    </div>
  );
}
