'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Contact Form Modal Component
interface ContactFormModalProps {
  modalType: 'partnership' | 'project' | 'investment' | null;
  onClose: () => void;
}

function ContactFormModal({ modalType, onClose }: ContactFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    attachment: null as File | null,
    gdprConsent: false,
    marketingConsent: false,
    honeypot: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setFormData(prev => ({ ...prev, attachment: file }));
    } else if (file) {
      alert('File size must be less than 10MB');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate GDPR consent
    if (!formData.gdprConsent) {
      alert('You must accept the privacy policy to continue');
      return;
    }

    // Special validation for investment forms (require attachment)
    if (modalType === 'investment' && !formData.attachment) {
      alert('Please attach your pitch deck for investment inquiries');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare form data
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      if (formData.phone) submitData.append('phone', formData.phone);
      if (formData.message) submitData.append('message', formData.message);
      submitData.append('formType', modalType === 'partnership' ? 'Partnership' : modalType === 'project' ? 'Project' : 'Investment');
      submitData.append('gdprConsent', formData.gdprConsent.toString());
      submitData.append('marketingConsent', formData.marketingConsent.toString());
      submitData.append('honeypot', formData.honeypot); // Anti-spam field
      if (formData.attachment) submitData.append('attachment', formData.attachment);

      // Submit to API
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit form');
      }

      setSubmitted(true);
    } catch (error: any) {
      console.error('Form submission error:', error);
      alert(`Error submitting form: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormConfig = (): {
    title: string;
    fields: string[];
    attachmentLabel?: string;
    required?: string[];
  } => {
    switch (modalType) {
      case 'partnership':
        return {
          title: 'Start Partnership',
          fields: ['name', 'email', 'phone', 'message', 'attachment'],
          attachmentLabel: 'Attachment (optional, max 10MB)'
        };
      case 'project':
        return {
          title: 'Start Project',
          fields: ['name', 'email', 'phone', 'message', 'attachment'],
          attachmentLabel: 'Project brief (optional, max 10MB)'
        };
      case 'investment':
        return {
          title: 'Submit Pitch',
          fields: ['name', 'email', 'attachment'],
          attachmentLabel: 'Pitch deck (required, max 10MB)',
          required: ['name', 'email', 'attachment']
        };
      default:
        return { title: '', fields: [] };
    }
  };

  const config = getFormConfig();

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-cormorant mb-4">Thank You!</h3>
            <p className="text-lg text-gray-600 mb-6">
              We've received your {modalType === 'investment' ? 'pitch' : 'inquiry'} and will be in touch soon.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-2xl sm:text-3xl font-cormorant">{config.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {config.fields.includes('name') && (
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Name {config.required?.includes('name') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={config.required?.includes('name')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors"
                placeholder="Your full name"
              />
            </div>
          )}

          {config.fields.includes('email') && (
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Email {config.required?.includes('email') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required={config.required?.includes('email')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors"
                placeholder="your@email.com"
              />
            </div>
          )}

          {config.fields.includes('phone') && (
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          )}

          {config.fields.includes('message') && (
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
                placeholder="Tell us about your project or inquiry..."
              />
            </div>
          )}

          {config.fields.includes('attachment') && (
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                {config.attachmentLabel} {config.required?.includes('attachment') && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="attachment"
                  onChange={handleFileChange}
                  required={config.required?.includes('attachment')}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                />
                {formData.attachment && (
                  <p className="text-base text-gray-600 mt-1">
                    Selected: {formData.attachment.name} ({Math.round(formData.attachment.size / 1024)}KB)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Anti-spam honeypot field (hidden) */}
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={(e) => setFormData(prev => ({ ...prev, honeypot: e.target.value }))}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* GDPR Consent Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="text-base font-medium text-gray-900">
              Privacy & Consent
            </h4>
            
            {/* Privacy Policy Consent (Required) */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.gdprConsent}
                  onChange={(e) => setFormData(prev => ({ ...prev, gdprConsent: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  required
                />
                <div className="text-base">
                  <span className="text-gray-700">
                    I agree to the{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black underline hover:text-gray-700"
                    >
                      Privacy Policy
                    </a>{' '}
                    and consent to the processing of my personal data for the purpose of handling my inquiry. *
                  </span>
                </div>
              </label>
            </div>

            {/* Marketing Consent (Optional) */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.marketingConsent}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <div className="text-base">
                  <span className="text-gray-700">
                    I would like to receive updates about your services and industry insights via email. You can unsubscribe at any time.
                  </span>
                </div>
              </label>
            </div>

            <div className="text-sm text-gray-500">
              * Required field. We respect your privacy and will only use your data as described in our Privacy Policy.
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

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
    title: 'Start Project',
    description: 'Have a project you want to bring to life?',
    buttonText: 'Start Project',
    action: 'modal',
    bgColor: 'dark'
  },
  {
    id: 'investment',
    title: 'Seek Investment',
    description: 'Looking for financing for your venture?',
    buttonText: 'Submit Pitch',
    action: 'investment',
    bgColor: 'medium'
  }
];

export default function ThreeCardCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'partnership' | 'project' | 'investment' | null>(null);

  const handleCardAction = useCallback((card: CTACard) => {
    switch (card.id) {
      case 'partner':
        setModalType('partnership');
        setIsModalOpen(true);
        break;
      case 'support':
        setModalType('project');
        setIsModalOpen(true);
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
        return 'bg-gradient-to-br from-white/80 to-gray-50/60 border border-gray-200/30 text-black';
      case 'dark':
        return 'bg-gradient-to-br from-black/90 to-gray-900/80 border border-gray-800/30 text-white';
      case 'medium':
        return 'bg-gradient-to-br from-gray-100/90 to-gray-200/60 border border-gray-300/30 text-black';
      default:
        return 'bg-gradient-to-br from-white/80 to-gray-50/60 text-black';
    }
  };

  const getButtonStyles = (bgColor: string) => {
    switch (bgColor) {
      case 'light':
        return 'bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-gray-200';
      case 'dark':
        return 'bg-white text-black hover:bg-gray-100 focus:ring-2 focus:ring-gray-800';
      case 'medium':
        return 'bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-gray-200';
      default:
        return 'bg-black text-white hover:bg-gray-900';
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
      <section className="min-h-screen flex items-center justify-center py-20">
        <div className="w-full max-w-7xl mx-auto px-4">
          {/* Section Title */}
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cormorant tracking-tight text-black mb-2 sm:mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto px-4">
              Every journey begins with a single step. Which path calls to you?
            </p>
          </motion.div>

          {/* Three Cards Layout */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 md:gap-20 lg:gap-24 xl:gap-32 max-w-7xl mx-auto items-center justify-items-center px-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {ctaCards.map((card, index) => (
              <motion.div
                key={card.id}
                className={`
                  flex flex-col justify-between p-6 sm:p-8 lg:p-12 
                  aspect-square rounded-full
                  ${getCardStyles(card.bgColor)}
                  backdrop-blur-sm
                  transition-all duration-300 hover:scale-105 hover:shadow-xl
                  cursor-pointer group
                  w-full h-full max-w-md mx-auto
                  ${index === 1 && 'md:col-span-2 lg:col-span-1'}
                `}
                variants={cardVariants}
                onClick={() => handleCardAction(card)}
              >
                <div className="text-center flex flex-col items-center justify-center h-full">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-cormorant mb-3 sm:mb-4 leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-base sm:text-lg leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300 max-w-[200px] sm:max-w-[220px]">
                    {card.description}
                  </p>
                </div>

                <motion.button
                  className={`
                    inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg 
                    font-medium text-sm sm:text-base transition-all duration-300 
                    transform group-hover:scale-105 focus:outline-none focus:ring-4 
                    ${getButtonStyles(card.bgColor)}
                    mt-4 sm:mt-6 w-auto mx-auto min-h-[44px]
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
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {isModalOpen && <ContactFormModal modalType={modalType} onClose={closeModal} />}
    </>
  );
}