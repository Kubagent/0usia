'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CTACard {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  action: 'modal' | 'mailto' | 'investment';
  bgColor: 'light' | 'dark' | 'medium';
  mailtoEmail?: string;
}

const ctaCards: CTACard[] = [
  {
    id: 'partner',
    title: 'Partner with Us',
    description: 'Ready to build something extraordinary together?',
    buttonText: 'Start Partnership',
    action: 'modal',
    bgColor: 'light'
  },
  {
    id: 'support',
    title: 'Get Support',
    description: 'Have a quick question or want to discuss an idea?',
    buttonText: 'Contact Support',
    action: 'mailto',
    bgColor: 'dark',
    mailtoEmail: 'support@ovsia.com'
  },
  {
    id: 'investment',
    title: 'Seek Investment',
    description: 'Looking for financing for your project?',
    buttonText: 'Get Money',
    action: 'investment',
    bgColor: 'medium'
  }
];

export default function ThreeCardCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'partnership' | 'investment' | null>(null);

  const handleCardAction = useCallback((card: CTACard) => {
    switch (card.action) {
      case 'modal':
        setModalType('partnership');
        setIsModalOpen(true);
        break;
      case 'mailto':
        if (card.mailtoEmail) {
          const subject = encodeURIComponent('Support Request');
          const body = encodeURIComponent('Hi there,\n\nI have a question about...\n\nBest regards');
          window.location.href = `mailto:${card.mailtoEmail}?subject=${subject}&body=${body}`;
        }
        break;
      case 'investment':
        setModalType('investment');
        setIsModalOpen(true);
        break;
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalType(null);
  }, []);

  const getCardStyles = (bgColor: string) => {
    switch (bgColor) {
      case 'light':
        return 'bg-gradient-to-br from-gray-50 to-white text-gray-900';
      case 'dark':
        return 'bg-gradient-to-br from-gray-900 to-gray-800 text-white';
      case 'medium':
        return 'bg-gradient-to-br from-gray-600 to-gray-700 text-white';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getButtonStyles = (bgColor: string) => {
    switch (bgColor) {
      case 'light':
        return 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-300';
      case 'dark':
        return 'bg-white text-gray-900 hover:bg-gray-100 focus:ring-white focus:ring-opacity-50';
      case 'medium':
        return 'bg-white text-gray-900 hover:bg-gray-100 focus:ring-white focus:ring-opacity-50';
      default:
        return 'bg-gray-900 text-white hover:bg-gray-800';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <>
      <section className="min-h-screen bg-white flex items-center justify-center py-20">
        <div className="w-full max-w-7xl mx-auto px-4">
          {/* Section Title */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-light tracking-tight text-black mb-4">
              Choose Your Path
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Every journey begins with a single step. Which path calls to you?
            </p>
          </motion.div>

          {/* Three Cards Layout */}
          <motion.div 
            className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {ctaCards.map((card, index) => (
              <motion.div
                key={card.id}
                className={`
                  flex flex-col justify-between min-h-[400px] p-8 lg:p-12 
                  ${getCardStyles(card.bgColor)}
                  transition-all duration-300 hover:scale-105 hover:shadow-xl
                  cursor-pointer group
                `}
                variants={cardVariants}
                onClick={() => handleCardAction(card)}
              >
                <div>
                  <h3 className="text-3xl lg:text-4xl font-light mb-6 leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-lg leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    {card.description}
                  </p>
                </div>

                <motion.button
                  className={`
                    inline-flex items-center justify-center px-8 py-4 rounded-lg 
                    font-medium text-lg transition-all duration-300 
                    transform group-hover:scale-105 focus:outline-none focus:ring-4 
                    ${getButtonStyles(card.bgColor)}
                    mt-8 w-full md:w-auto
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardAction(card);
                  }}
                  aria-label={`${card.buttonText} - ${card.description}`}
                >
                  {card.buttonText}
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Simple Modal Placeholder - You can integrate your existing modal logic here */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-2xl font-light mb-4">
                {modalType === 'partnership' ? 'Partnership Inquiry' : 'Investment Request'}
              </h3>
              <p className="text-gray-600 mb-6">
                {modalType === 'partnership' 
                  ? 'Thank you for your interest in partnering with us. Our team will be in touch soon.'
                  : 'Thank you for your interest in investment opportunities. Our team will review your request.'
                }
              </p>
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}