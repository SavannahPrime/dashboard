
export interface ServiceOption {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: 'month' | 'year' | 'one-time';
  icon: string;
  features: string[];
}

export const serviceOptions: ServiceOption[] = [
  {
    id: 'website-development',
    title: 'Website Development & Hosting',
    description: 'Professional website creation with reliable hosting solutions.',
    price: 149,
    priceUnit: 'month',
    icon: 'globe',
    features: [
      'Custom website design & development',
      'Mobile-responsive layouts',
      'High-performance hosting',
      'SSL certificate included',
      'Regular backups & maintenance',
      'CMS integration'
    ]
  },
  {
    id: 'cms-development',
    title: 'CMS Development',
    description: 'Powerful content management systems for easy website updates.',
    price: 199,
    priceUnit: 'month',
    icon: 'layout-grid',
    features: [
      'Custom CMS development',
      'User-friendly admin interface',
      'Content workflow management',
      'Multi-user access controls',
      'Media library integration',
      'API development for headless CMS'
    ]
  },
  {
    id: 'ai-automation',
    title: 'AI Automation & Business Solutions',
    description: 'Smart AI solutions to optimize your business operations.',
    price: 299,
    priceUnit: 'month',
    icon: 'cpu',
    features: [
      'Custom AI solution development',
      'Business process automation',
      'Data analysis & reporting',
      'Chatbot development',
      'Machine learning integration',
      'AI-powered decision support'
    ]
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing & SEO',
    description: 'Comprehensive digital marketing strategies to grow your business.',
    price: 249,
    priceUnit: 'month',
    icon: 'bar-chart',
    features: [
      'SEO optimization',
      'Content marketing',
      'Social media management',
      'Email marketing campaigns',
      'Analytics & performance tracking',
      'Conversion rate optimization'
    ]
  },
  {
    id: 'branding-design',
    title: 'Branding & UI/UX Design',
    description: 'Professional branding and user experience design services.',
    price: 199,
    priceUnit: 'month',
    icon: 'paintbrush',
    features: [
      'Brand identity development',
      'Logo design & visual assets',
      'UI/UX design for web & mobile',
      'Design system creation',
      'User research & testing',
      'Interactive prototyping'
    ]
  }
];

export const getServiceById = (id: string): ServiceOption | undefined => {
  return serviceOptions.find(service => service.id === id);
};

export const getServiceByTitle = (title: string): ServiceOption | undefined => {
  return serviceOptions.find(service => service.title === title);
};
