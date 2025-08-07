import { CarouselItem } from '@/components/ThreeItemCarousel';

/**
 * Sample carousel data with alternating contrast slides
 * Features black backgrounds with high-contrast content
 */
export const carouselData: CarouselItem[] = [
  {
    id: 'slide-1',
    title: 'Innovation',
    subtitle: 'Pushing Boundaries',
    description: 'We create cutting-edge solutions that transform industries and redefine what\'s possible in the digital landscape.',
    backgroundColor: '#000000', // Pure black
    textColor: 'text-white',
    overlayContent: {
      title: 'Innovation at Our Core',
      details: [
        'Our innovation process begins with deep market research and user insights, ensuring every solution addresses real-world challenges.',
        'We employ agile methodologies and cutting-edge technologies to deliver products that not only meet current needs but anticipate future demands.',
        'Our multidisciplinary team combines expertise in design, engineering, and strategy to create holistic solutions.',
        'Through continuous experimentation and iteration, we transform bold ideas into market-leading products and services.'
      ],
      callToAction: 'Explore Our Innovations'
    }
  },
  {
    id: 'slide-2',
    title: 'Excellence',
    subtitle: 'Uncompromising Quality',
    description: 'Every project reflects our commitment to excellence, delivering results that exceed expectations and drive meaningful impact.',
    backgroundColor: '#1a1a1a', // Very dark gray
    textColor: 'text-white',
    overlayContent: {
      title: 'Excellence in Every Detail',
      details: [
        'Our quality assurance process involves rigorous testing at every stage of development, ensuring flawless execution.',
        'We maintain the highest standards through peer reviews, automated testing, and continuous monitoring of performance metrics.',
        'Client satisfaction is measured not just by delivery, but by long-term success and sustained value creation.',
        'Our commitment to excellence extends beyond project completion, with ongoing support and optimization services.'
      ],
      callToAction: 'See Our Track Record'
    }
  },
  {
    id: 'slide-3',
    title: 'Impact',
    subtitle: 'Meaningful Results',
    description: 'Our work creates lasting positive change, empowering businesses and communities to achieve their full potential.',
    backgroundColor: '#0a0a0a', // Almost black
    textColor: 'text-white',
    overlayContent: {
      title: 'Creating Lasting Impact',
      details: [
        'We measure success not just in metrics, but in the real-world impact our solutions have on people\'s lives and businesses.',
        'Our data-driven approach ensures that every decision is backed by insights and contributes to measurable outcomes.',
        'We build sustainable solutions that grow with our clients, creating long-term value and competitive advantages.',
        'Through strategic partnerships and community engagement, we amplify our impact beyond individual projects.'
      ],
      callToAction: 'View Our Impact Stories'
    }
  }
];

/**
 * Alternative carousel data with more diverse content
 */
export const alternativeCarouselData: CarouselItem[] = [
  {
    id: 'alt-slide-1',
    title: 'Design',
    subtitle: 'Beautiful & Functional',
    description: 'We craft experiences that are not only visually stunning but also intuitive and user-centered.',
    backgroundColor: '#000000',
    textColor: 'text-white',
    overlayContent: {
      title: 'Design Philosophy',
      details: [
        'Human-centered design principles guide every creative decision we make.',
        'We balance aesthetic appeal with functional requirements to create memorable experiences.',
        'Our design process involves extensive user research and iterative prototyping.'
      ],
      callToAction: 'View Our Portfolio'
    }
  },
  {
    id: 'alt-slide-2',
    title: 'Technology',
    subtitle: 'Future-Ready Solutions',
    description: 'Leveraging the latest technologies to build scalable, secure, and maintainable systems.',
    backgroundColor: '#111111',
    textColor: 'text-white',
    overlayContent: {
      title: 'Technical Expertise',
      details: [
        'Full-stack development with modern frameworks and best practices.',
        'Cloud-native architecture designed for scalability and resilience.',
        'Security-first approach with comprehensive testing and monitoring.'
      ],
      callToAction: 'Explore Our Tech Stack'
    }
  },
  {
    id: 'alt-slide-3',
    title: 'Partnership',
    subtitle: 'Your Success is Our Mission',
    description: 'We work as an extension of your team, committed to your long-term success and growth.',
    backgroundColor: '#050505',
    textColor: 'text-white',
    overlayContent: {
      title: 'True Partnership',
      details: [
        'Collaborative approach with transparent communication throughout every project.',
        'Dedicated support and maintenance to ensure continued success.',
        'Strategic consulting to help you navigate digital transformation challenges.'
      ],
      callToAction: 'Start a Partnership'
    }
  }
];

export default carouselData;