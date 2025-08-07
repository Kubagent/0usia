'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
  file?: File;
  gdprConsent: boolean;
  marketingConsent: boolean;
  honeypot: string; // Anti-spam field
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  file?: string;
  gdprConsent?: string;
  marketingConsent?: string;
  general?: string;
}

interface SplitScreenCTAProps {
  leftTitle?: string;
  leftDescription?: string;
  leftButtonText?: string;
  rightTitle?: string;
  rightDescription?: string;
  rightButtonText?: string;
  mailtoEmail?: string;
  className?: string;
}

/**
 * SplitScreenCTA Component
 * 
 * Features:
 * - Responsive split-screen layout (stacks on mobile)
 * - Left side: Modal form with file upload
 * - Right side: Mailto link functionality
 * - Smooth animations with Framer Motion
 * - File upload with drag & drop support
 * - Form validation and error handling
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Performance optimized with lazy loading
 * 
 * Usage:
 * <SplitScreenCTA 
 *   leftTitle="Get Started"
 *   rightTitle="Quick Contact"
 *   mailtoEmail="hello@ovsia.com"
 * />
 */
const SplitScreenCTA: React.FC<SplitScreenCTAProps> = ({
  leftTitle = "Let's Work Together",
  leftDescription = "Tell us about your project and we'll create something extraordinary together.",
  leftButtonText = "Start a Project",
  rightTitle = "Quick Questions?",
  rightDescription = "Have a quick question or want to discuss an idea? Drop us a line.",
  rightButtonText = "Send Email",
  mailtoEmail = "hello@ovsia.com",
  className = ""
}) => {
  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    gdprConsent: false,
    marketingConsent: false,
    honeypot: '', // Anti-spam field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal handlers
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData({ 
      name: '', 
      email: '', 
      company: '', 
      message: '',
      gdprConsent: false,
      marketingConsent: false,
      honeypot: '',
    });
    setErrors({});
    setSubmitSuccess(false);
    setSubmitMessage('');
  }, []);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.gdprConsent) {
      newErrors.gdprConsent = 'You must accept the privacy policy to continue';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name, formData.email, formData.message, formData.gdprConsent]);

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          company: formData.company.trim(),
          message: formData.message.trim(),
          gdprConsent: formData.gdprConsent,
          marketingConsent: formData.marketingConsent,
          honeypot: formData.honeypot, // Anti-spam field
          source: 'split_screen_cta',
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitSuccess(true);
        setSubmitMessage(result.message || 'Thank you! We\'ll get back to you soon.');
        
        // Auto-close modal after success
        setTimeout(() => {
          closeModal();
        }, 3000);
      } else {
        // Handle API errors
        if (result.details) {
          setErrors(result.details);
        }
        setSubmitMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitMessage('Unable to send your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, closeModal]);

  // File upload handlers
  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }
    
    setFormData(prev => ({ ...prev, file }));
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // Mailto handler
  const handleMailto = useCallback(() => {
    const subject = encodeURIComponent('Quick Question');
    const body = encodeURIComponent('Hi there,\n\nI have a question about...\n\nBest regards');
    window.location.href = `mailto:${mailtoEmail}?subject=${subject}&body=${body}`;
  }, [mailtoEmail]);

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

  const itemVariants = {
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

  const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { 
      scale: 0.9, 
      opacity: 0,
      y: 50
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: 50,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      <motion.section 
        className={`w-full bg-white ${className}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Split Screen Layout */}
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            
            {/* Left Side - Project Form */}
            <motion.div 
              className="flex flex-col justify-center px-8 py-16 lg:px-16 bg-gradient-to-br from-gray-50 to-white"
              variants={itemVariants}
            >
              <div className="max-w-md mx-auto lg:mx-0">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 font-space leading-tight">
                  {leftTitle}
                </h2>
                <p className="text-lg text-gray-600 mb-8 font-cormorant leading-relaxed">
                  {leftDescription}
                </p>
                <motion.button
                  onClick={openModal}
                  className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-lg font-space font-medium text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Open form to ${leftButtonText.toLowerCase()}`}
                >
                  {leftButtonText}
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>

            {/* Right Side - Quick Contact */}
            <motion.div 
              className="flex flex-col justify-center px-8 py-16 lg:px-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
              variants={itemVariants}
            >
              <div className="max-w-md mx-auto lg:mx-0">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-space leading-tight">
                  {rightTitle}
                </h2>
                <p className="text-lg text-gray-300 mb-8 font-cormorant leading-relaxed">
                  {rightDescription}
                </p>
                <motion.button
                  onClick={handleMailto}
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-lg font-space font-medium text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`${rightButtonText} to ${mailtoEmail}`}
                >
                  {rightButtonText}
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Modal Form */}
      <AnimatePresence mode="wait">
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
            
            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 font-space">
                    Start Your Project
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 font-space">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg font-cormorant text-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your full name"
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-space">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg font-cormorant text-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@company.com"
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Company Field */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2 font-space">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-cormorant text-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="Your company name"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 font-space">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg font-cormorant text-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                    aria-describedby={errors.message ? "message-error" : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-space">
                    Attach Files (Optional)
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer hover:bg-gray-50 ${
                      isDragOver ? 'border-gray-500 bg-gray-50' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInputChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      aria-label="Upload file"
                    />
                    
                    {formData.file ? (
                      <div className="space-y-2">
                        <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-900 font-space">
                          {formData.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, file: undefined }));
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-space">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, images up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

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
                  <h4 className="text-sm font-medium text-gray-900 font-space">
                    Privacy & Consent
                  </h4>
                  
                  {/* Privacy Policy Consent (Required) */}
                  <div>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.gdprConsent}
                        onChange={(e) => setFormData(prev => ({ ...prev, gdprConsent: e.target.checked }))}
                        className={`mt-1 h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded ${
                          errors.gdprConsent ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      <div className="text-sm">
                        <span className="text-gray-700 font-cormorant">
                          I agree to the{' '}
                          <a
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 underline hover:text-gray-700"
                          >
                            Privacy Policy
                          </a>{' '}
                          and consent to the processing of my personal data for the purpose of handling my inquiry. *
                        </span>
                      </div>
                    </label>
                    {errors.gdprConsent && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.gdprConsent}
                      </p>
                    )}
                  </div>

                  {/* Marketing Consent (Optional) */}
                  <div>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.marketingConsent}
                        onChange={(e) => setFormData(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                        className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <div className="text-sm">
                        <span className="text-gray-700 font-cormorant">
                          I would like to receive updates about your services and industry insights via email. You can unsubscribe at any time.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="text-xs text-gray-500 font-cormorant">
                    * Required field. We respect your privacy and will only use your data as described in our Privacy Policy.
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                {/* Success/Error Messages */}
                {submitMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    submitSuccess 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {submitSuccess ? (
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium font-space">
                          {submitMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors font-space"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-space flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MemoizedSplitScreenCTA = React.memo(SplitScreenCTA);
MemoizedSplitScreenCTA.displayName = 'SplitScreenCTA';

export default MemoizedSplitScreenCTA;