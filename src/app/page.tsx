'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import cardsData from '@/data/cards.json';

interface Category {
  id: string;
  name: string;
  color: string;
  gradient: string;
  prompts: string[];
}

interface Card {
  text: string;
  category: string;
  categoryColor: string;
  categoryGradient: string;
}

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['starter']);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [currentGradient, setCurrentGradient] = useState('from-blue-50 via-sky-50 to-blue-100');
  const [cardKey, setCardKey] = useState(0);

  const categories: Category[] = cardsData.categories;

  useEffect(() => {
    const saved = localStorage.getItem('nextcard-categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCategories(parsed);
        }
      } catch {
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
          categoryColor: category.color,
          categoryGradient: category.gradient
        }))
      );
  };

  const drawRandomCard = () => {
    const availableCards = getAvailableCards();
    if (availableCards.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const newCard = availableCards[randomIndex];
    setCurrentCard(newCard);
    setCurrentGradient(newCard.categoryGradient);
    setCardKey(prev => prev + 1);
  };

  useEffect(() => {
    if (selectedCategories.length > 0) {
      drawRandomCard();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const cardVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.8, 
      rotateY: -90,
      filter: 'blur(10px)'
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      filter: 'blur(0px)'
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      rotateY: 90,
      filter: 'blur(10px)'
    }
  };

  const cardTransition = {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
    opacity: { duration: 0.3 },
    scale: { duration: 0.4 },
    rotateY: { duration: 0.5 },
    filter: { duration: 0.3 }
  };


  return (
    <div className={clsx(
      'min-h-screen bg-gradient-to-br transition-all duration-1000 ease-in-out',
      currentGradient
    )}>
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 flex flex-col items-center justify-center min-h-screen max-w-6xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6">
            Next Card
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 mb-2 sm:mb-3 font-medium">
            Push the button. Start the conversation.
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            A game for connection.
          </p>
        </motion.div>

        {/* Category Toggles */}
        <motion.div 
          className="mb-4 sm:mb-6 md:mb-8 w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={clsx(
                  'px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full border-2 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg shadow-lg',
                  'transform hover:scale-110 hover:shadow-xl active:scale-95',
                  selectedCategories.includes(category.id)
                    ? `${category.color} shadow-lg scale-105`
                    : 'bg-white/90 backdrop-blur-sm border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-white'
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Card Area */}
        <div className="mb-4 sm:mb-6 md:mb-8 w-full max-w-3xl perspective-1000 flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={cardKey}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={cardTransition}
                className="bg-white/95 backdrop-blur-lg rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 lg:p-16 border border-white/20 relative overflow-hidden w-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.05)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="text-center relative z-10">
                  <motion.div 
                    className={clsx(
                      'inline-block px-5 py-2 rounded-full text-base font-bold mb-8 shadow-md',
                      currentCard.categoryColor
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {currentCard.category}
                  </motion.div>
                  <motion.p 
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-relaxed tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    style={{ fontFamily: '"Inter", "system-ui", sans-serif' }}
                  >
                    {currentCard.text}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <motion.div 
          className="flex gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            onClick={drawRandomCard}
            disabled={selectedCategories.length === 0}
            className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 sm:px-10 sm:py-4 md:px-12 md:py-5 rounded-full font-bold text-lg sm:text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl relative overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Next Card</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-3 sm:mt-4 md:mt-6 text-center text-gray-600 text-sm sm:text-base md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="font-medium">No accounts. No clutter. Just conversation.</p>
        </motion.div>
      </div>
    </div>
  );
}
