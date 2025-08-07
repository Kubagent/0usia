import { CapabilityCard } from '@/types/capability';

/**
 * Sample Capability Cards Data
 * Configure your capability cards here
 */
export const capabilityCards: CapabilityCard[] = [
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    description: 'Modern React applications with exceptional user experiences',
    icon: '⚛️',
    color: 'bg-gradient-to-br from-blue-100 to-blue-200',
    modalContent: {
      title: 'Frontend Development',
      description: 'We craft modern, responsive web applications using cutting-edge technologies. Our focus is on creating exceptional user experiences that are fast, accessible, and scalable.',
      features: [
        'React & Next.js applications with TypeScript',
        'Responsive design with Tailwind CSS',
        'State management with Redux/Zustand',
        'Progressive Web Apps (PWAs)',
        'Performance optimization and code splitting',
        'Accessibility compliance (WCAG 2.1)',
        'Component-driven development'
      ],
      examples: [
        'E-commerce platforms',
        'SaaS dashboards',
        'Marketing websites',
        'Corporate applications'
      ],
      technologies: [
        'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 
        'Framer Motion', 'Redux', 'Zustand', 'Vite'
      ]
    }
  },
  {
    id: 'backend-architecture',
    title: 'Backend Architecture',
    description: 'Scalable server solutions and robust API development',
    icon: '🏗️',
    color: 'bg-gradient-to-br from-green-100 to-green-200',
    modalContent: {
      title: 'Backend Architecture',
      description: 'We design and implement scalable backend systems that handle millions of requests efficiently. Our architectures are built for reliability, performance, and maintainability.',
      features: [
        'RESTful and GraphQL API development',
        'Microservices architecture',
        'Database design and optimization',
        'Cloud-native solutions',
        'Real-time data processing',
        'Security implementation',
        'DevOps and CI/CD pipelines'
      ],
      examples: [
        'API gateways',
        'Payment processing systems',
        'Real-time chat applications',
        'Data analytics platforms'
      ],
      technologies: [
        'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 
        'Redis', 'Docker', 'Kubernetes', 'AWS'
      ]
    }
  },
  {
    id: 'mobile-development',
    title: 'Mobile Development',
    description: 'Native and cross-platform mobile applications',
    icon: '📱',
    color: 'bg-gradient-to-br from-purple-100 to-purple-200',
    modalContent: {
      title: 'Mobile Development',
      description: 'We create native and cross-platform mobile applications that deliver exceptional performance and user experience across iOS and Android devices.',
      features: [
        'Native iOS and Android development',
        'React Native cross-platform apps',
        'Flutter development',
        'Mobile-first design principles',
        'Offline-first architecture',
        'Push notifications',
        'App store optimization'
      ],
      examples: [
        'Social media apps',
        'E-commerce mobile apps',
        'Health & fitness trackers',
        'Business productivity tools'
      ],
      technologies: [
        'React Native', 'Flutter', 'Swift', 'Kotlin', 
        'Firebase', 'SQLite', 'GraphQL', 'Push Services'
      ]
    }
  },
  {
    id: 'cloud-solutions',
    title: 'Cloud Solutions',
    description: 'Scalable cloud infrastructure and deployment strategies',
    icon: '☁️',
    color: 'bg-gradient-to-br from-orange-100 to-orange-200',
    modalContent: {
      title: 'Cloud Solutions',
      description: 'We provide comprehensive cloud solutions that scale with your business needs. From infrastructure setup to deployment automation, we handle the complexity of modern cloud architectures.',
      features: [
        'AWS, Azure, and GCP expertise',
        'Infrastructure as Code (IaC)',
        'Serverless architectures',
        'Container orchestration',
        'Auto-scaling solutions',
        'Monitoring and logging',
        'Cost optimization'
      ],
      examples: [
        'Serverless applications',
        'Container deployments',
        'Multi-region architectures',
        'Data lakes and warehouses'
      ],
      technologies: [
        'AWS', 'Azure', 'GCP', 'Terraform', 
        'Docker', 'Kubernetes', 'Lambda', 'CloudFormation'
      ]
    }
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    description: 'Business intelligence and data-driven insights',
    icon: '📊',
    color: 'bg-gradient-to-br from-pink-100 to-pink-200',
    modalContent: {
      title: 'Data Analytics',
      description: 'We transform your data into actionable insights through advanced analytics, machine learning, and business intelligence solutions that drive strategic decision-making.',
      features: [
        'Data pipeline development',
        'Real-time analytics dashboards',
        'Machine learning models',
        'Predictive analytics',
        'Data visualization',
        'ETL/ELT processes',
        'Big data processing'
      ],
      examples: [
        'Sales forecasting systems',
        'Customer behavior analysis',
        'Performance dashboards',
        'Recommendation engines'
      ],
      technologies: [
        'Python', 'R', 'Apache Spark', 'Tableau', 
        'Power BI', 'TensorFlow', 'PyTorch', 'Airflow'
      ]
    }
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Intelligent systems powered by artificial intelligence',
    icon: '🤖',
    color: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
    modalContent: {
      title: 'AI & Machine Learning',
      description: 'We develop AI-powered solutions that automate processes, provide intelligent insights, and create personalized experiences using state-of-the-art machine learning techniques.',
      features: [
        'Custom ML model development',
        'Natural Language Processing',
        'Computer vision solutions',
        'Recommendation systems',
        'Chatbots and virtual assistants',
        'AutoML implementations',
        'MLOps and model deployment'
      ],
      examples: [
        'Document processing automation',
        'Image recognition systems',
        'Fraud detection models',
        'Personalization engines'
      ],
      technologies: [
        'TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 
        'scikit-learn', 'MLflow', 'Kubeflow', 'FastAPI'
      ]
    }
  }
];