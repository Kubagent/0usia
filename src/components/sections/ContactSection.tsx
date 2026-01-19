'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getCalApi } from "@calcom/embed-react";

// Contact Form Modal Component
interface ContactFormModalProps {
  modalType: 'brief' | null;
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus management and keyboard navigation
  useEffect(() => {
    // Focus first input when modal opens
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Clear errors when user starts typing
    if (submitError) {
      setSubmitError(null);
    }

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
      setSubmitError('You must accept the privacy policy to continue');
      return;
    }

    // Reset any previous errors
    setSubmitError(null);

    // Basic validation
    if (!formData.name.trim()) {
      setSubmitError('Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      setSubmitError('Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Helper function to convert File to base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            // Extract base64 data from data URL (remove "data:mime/type;base64," prefix)
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = (error) => reject(error);
        });
      };

      // Prepare attachment data if file is present
      let attachmentData = undefined;
      if (formData.attachment) {
        const base64Content = await fileToBase64(formData.attachment);
        attachmentData = {
          filename: formData.attachment.name,
          content: base64Content,
          contentType: formData.attachment.type || 'application/octet-stream',
          size: formData.attachment.size,
        };
      }

      // Prepare JSON data for API
      const submitData = {
        name: formData.name,
        email: formData.email,
        company: formData.phone, // Using phone field as company for now
        message: formData.message,
        formType: 'Project Brief',
        gdprConsent: formData.gdprConsent,
        marketingConsent: formData.marketingConsent,
        honeypot: formData.honeypot,
        source: 'project_brief_cta',
        attachment: attachmentData,
      };

      // Submit to API with proper JSON format
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      // Check if response has content before parsing
      let result;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text.trim()) {
          try {
            result = JSON.parse(text);
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            throw new Error('Invalid response format from server');
          }
        } else {
          throw new Error('Empty response from server');
        }
      } else {
        // Non-JSON response
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(result?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit form');
      }

      setSubmitted(true);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          attachment: null,
          gdprConsent: false,
          marketingConsent: false,
          honeypot: ''
        });
      }, 2000);
    } catch (error: any) {
      console.error('Form submission error:', error);
      setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
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
      case 'brief':
        return {
          title: 'Submit Project Brief',
          fields: ['name', 'email', 'phone', 'message', 'attachment'],
          attachmentLabel: 'Attach project brief or relevant documents',
          required: ['name', 'email']
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
            <h3 className="text-ovsia-body-2xl font-cormorant mb-4">Thank You!</h3>
            <p className="text-ovsia-body-base text-gray-600 mb-6">
              We've received your project brief and will be in touch soon.
            </p>
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-ovsia-body-xl sm:text-ovsia-body-2xl font-cormorant" id="modal-title">{config.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Close form"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm" role="alert">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
          {config.fields.includes('name') && (
            <div>
              <label className="block text-ovsia-body-sm font-medium text-gray-700 mb-2">
                Name {config.required?.includes('name') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={config.required?.includes('name')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Your full name"
                aria-describedby={submitError && submitError.includes('name') ? 'name-error' : undefined}
                aria-invalid={submitError && submitError.includes('name') ? 'true' : 'false'}
                ref={firstInputRef}
                autoComplete="name"
              />
            </div>
          )}

          {config.fields.includes('email') && (
            <div>
              <label className="block text-ovsia-body-sm font-medium text-gray-700 mb-2">
                Email {config.required?.includes('email') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required={config.required?.includes('email')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="your@email.com"
                aria-describedby={submitError && submitError.includes('email') ? 'email-error' : undefined}
                aria-invalid={submitError && submitError.includes('email') ? 'true' : 'false'}
                autoComplete="email"
              />
            </div>
          )}

          {config.fields.includes('phone') && (
            <div>
              <label className="block text-ovsia-body-sm font-medium text-gray-700 mb-2">
                Company {config.required?.includes('phone') && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required={config.required?.includes('phone')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Your company name (optional)"
                aria-describedby={config.required?.includes('phone') ? 'company-help' : undefined}
                autoComplete="organization"
              />
            </div>
          )}

          {config.fields.includes('message') && (
            <div>
              <label className="block text-ovsia-body-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                placeholder="Tell us about your project or inquiry..."
                aria-describedby="message-help"
              />
              <p id="message-help" className="mt-1 text-ovsia-body-xs text-gray-500">
                Share any details about your project requirements and goals
              </p>
            </div>
          )}

          {config.fields.includes('attachment') && (
            <div>
              <label className="block text-ovsia-body-sm font-medium text-gray-700 mb-2">
                {config.attachmentLabel}
              </label>
              <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {formData.attachment ? (
                    <div className="text-center">
                      <p className="text-ovsia-body-sm font-medium text-black">{formData.attachment.name}</p>
                      <p className="text-ovsia-body-xs text-gray-500">Click to change file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-ovsia-body-sm text-gray-600">
                        <span className="font-medium text-black">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-ovsia-body-xs text-gray-500">PDF, DOC, DOCX, TXT, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
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
            <h4 className="text-ovsia-body-sm font-medium text-gray-900">
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
                <div className="text-ovsia-body-sm">
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
                <div className="text-ovsia-body-sm">
                  <span className="text-gray-700">
                    I would like to receive updates about your services and industry insights via email. You can unsubscribe at any time.
                  </span>
                </div>
              </label>
            </div>

            <div className="text-ovsia-body-xs text-gray-500">
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
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              aria-describedby={isSubmitting ? 'submit-status' : undefined}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="sr-only" id="submit-status">Submitting form...</span>
                </>
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
  action: 'modal' | 'cal';
  bgColor: 'light' | 'dark';
  calLink?: string;
}

const ctaCards: CTACard[] = [
  {
    id: 'schedule',
    title: 'Schedule a Call',
    description: 'The quickest way to explore working together. Book a time that suits you.',
    buttonText: 'Book a Call',
    action: 'cal',
    bgColor: 'light',
    calLink: '0usia/discovery'
  },
  {
    id: 'brief',
    title: 'Submit a Brief',
    description: 'Share your project details and we will get back to you with our thoughts.',
    buttonText: 'Submit Brief',
    action: 'modal',
    bgColor: 'dark'
  }
];

export default function ContactSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'brief' | null>(null);
  // Initialize Cal.com embed (EU instance)
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "discovery", origin: "https://app.cal.eu" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  const openCalModal = useCallback(async () => {
    const cal = await getCalApi({ namespace: "discovery", origin: "https://app.cal.eu" });
    cal("modal", {
      calLink: "0usia/discovery",
      calOrigin: "https://app.cal.eu",
      config: { layout: "month_view" }
    });
  }, []);

  const handleCardAction = useCallback((card: CTACard) => {
    if (card.action === 'cal') {
      openCalModal();
    } else if (card.action === 'modal') {
      setModalType('brief');
      setIsModalOpen(true);
    }
  }, [openCalModal]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalType(null);
  }, []);

  const getCardStyles = (bgColor: string) => {
    switch (bgColor) {
      case 'light':
        return 'bg-gradient-to-br from-white/90 to-gray-50/70 border-4 border-white text-black';
      case 'dark':
        return 'bg-gradient-to-br from-gray-800/90 to-gray-900/80 border-4 border-gray-600 text-white';
      default:
        return 'bg-gradient-to-br from-white/90 to-gray-50/70 border-4 border-white text-black';
    }
  };

  const getButtonStyles = (bgColor: string) => {
    switch (bgColor) {
      case 'light':
        return 'bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-gray-200';
      case 'dark':
        return 'bg-white text-black hover:bg-gray-100 focus:ring-2 focus:ring-gray-800';
      default:
        return 'bg-black text-white hover:bg-gray-900';
    }
  };

  // Simplified animation variants - only for hover effects
  const cardVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1, ease: "easeOut" }
    }
  };

  return (
    <>
      <section className="min-h-screen flex items-center justify-center py-20">
        <div className="w-full max-w-7xl mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-ovsia-header-4xl font-cormorant tracking-tight text-white mb-2 sm:mb-4">
              Get in Touch
            </h2>
            <p className="text-ovsia-body-xl text-gray-300 font-light max-w-4xl mx-auto px-4">
              Ready to explore working together? Choose your preferred way to connect.
            </p>
          </div>

          {/* Two Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 max-w-5xl mx-auto items-center justify-items-center px-4">
            {ctaCards.map((card) => (
              <motion.div
                key={card.id}
                className={`
                  flex flex-col justify-center items-center p-10 sm:p-12 lg:p-20
                  aspect-square rounded-full
                  ${getCardStyles(card.bgColor)}
                  backdrop-blur-sm
                  transition-all duration-300 hover:shadow-xl
                  cursor-pointer group
                  w-full h-full max-w-md lg:max-w-lg mx-auto
                `}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleCardAction(card)}
              >
                <div className="text-center flex flex-col items-center space-y-4 sm:space-y-6">
                  <h3 className="text-ovsia-body-xl sm:text-ovsia-body-2xl font-cormorant font-bold leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-ovsia-body-base sm:text-ovsia-body-lg leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300 max-w-[240px] sm:max-w-[280px]">
                    {card.description}
                  </p>
                  {card.action === 'cal' ? (
                    <button
                      className={`
                        inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg
                        font-medium text-ovsia-body-base sm:text-ovsia-body-lg transition-all duration-300
                        focus:outline-none focus:ring-4
                        ${getButtonStyles(card.bgColor)}
                        w-auto mx-auto min-h-[44px]
                      `}
                      onClick={(e) => e.stopPropagation()}
                      data-cal-namespace="discovery"
                      data-cal-link="0usia/discovery"
                      data-cal-origin="https://app.cal.eu"
                      data-cal-config='{"layout":"month_view"}'
                      aria-label={`${card.buttonText} - ${card.description}`}
                    >
                      {card.buttonText}
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      className={`
                        inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg
                        font-medium text-ovsia-body-base sm:text-ovsia-body-lg transition-all duration-300
                        focus:outline-none focus:ring-4
                        ${getButtonStyles(card.bgColor)}
                        w-auto mx-auto min-h-[44px]
                      `}
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
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {isModalOpen && <ContactFormModal modalType={modalType} onClose={closeModal} />}
    </>
  );
}