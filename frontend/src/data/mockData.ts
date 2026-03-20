export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  badge?: { text: string; variant: "new" | "popular" | "urgent" | "bestseller" };
  modules: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  price: { amount: number; currency: string; original?: number };
  nextCohort: string;
  spotsRemaining?: number;
  waitlistAvailable: boolean;
  categories: string[];
  categoryColor: string;
  skills: string[];
}

export interface Cohort {
  id: string;
  courseId: string;
  courseName: string;
  startDate: string;
  endDate: string;
  timezone: string;
  format: "Live Online" | "In-Person" | "Hybrid";
  location?: string;
  instructor: { id: string; name: string; title: string; avatar?: string; company?: string };
  availability: { status: "available" | "filling-fast" | "waitlist" | "closed"; spotsTotal: number; spotsRemaining: number };
  pricing: { earlyBird?: { amount: number; deadline: string }; standard: number };
  schedule: { days: string[]; time: string };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  courseCount: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

export const courses: Course[] = [
  {
    id: "1",
    slug: "ai-engineering-bootcamp",
    title: "AI Engineering Bootcamp",
    subtitle: "Build production-grade AI systems with LLMs, vector databases, and modern ML pipelines",
    description: "Master the complete AI engineering stack from prompt engineering to deploying scalable AI applications. Learn from industry experts who built AI systems at top tech companies.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    badge: { text: "Most Popular", variant: "bestseller" },
    modules: 12,
    duration: "12 weeks",
    level: "Advanced",
    rating: 4.9,
    reviewCount: 2847,
    enrolledCount: 15234,
    price: { amount: 2499, currency: "USD", original: 3499 },
    nextCohort: "2026-04-14",
    spotsRemaining: 8,
    waitlistAvailable: true,
    categories: ["AI/ML", "Engineering"],
    categoryColor: "#4f46e5",
    skills: ["Python", "PyTorch", "LangChain", "Vector DBs", "MLOps"],
  },
  {
    id: "2",
    slug: "data-science-fundamentals",
    title: "Data Science Fundamentals",
    subtitle: "From statistics to machine learning: build a solid foundation in data science",
    description: "Comprehensive data science program covering statistics, Python, SQL, and machine learning fundamentals. Perfect for career switchers and analysts looking to level up.",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    badge: { text: "New Cohort", variant: "new" },
    modules: 10,
    duration: "10 weeks",
    level: "Beginner",
    rating: 4.8,
    reviewCount: 1923,
    enrolledCount: 8934,
    price: { amount: 1899, currency: "USD", original: 2499 },
    nextCohort: "2026-04-21",
    spotsRemaining: 15,
    waitlistAvailable: true,
    categories: ["Data Science", "Analytics"],
    categoryColor: "#2BBCB3",
    skills: ["Python", "Pandas", "SQL", "Statistics", "Scikit-learn"],
  },
  {
    id: "3",
    slug: "cloud-architecture-mastery",
    title: "Cloud Architecture Mastery",
    subtitle: "Design and deploy scalable cloud infrastructure across AWS, Azure, and GCP",
    description: "Learn multi-cloud architecture patterns, infrastructure as code, and DevOps best practices. Build production-ready systems that scale to millions of users.",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop",
    modules: 14,
    duration: "14 weeks",
    level: "Intermediate",
    rating: 4.7,
    reviewCount: 1456,
    enrolledCount: 6789,
    price: { amount: 2199, currency: "USD" },
    nextCohort: "2026-05-05",
    spotsRemaining: 22,
    waitlistAvailable: true,
    categories: ["Cloud", "DevOps"],
    categoryColor: "#3B82F6",
    skills: ["AWS", "Terraform", "Kubernetes", "Docker", "CI/CD"],
  },
  {
    id: "4",
    slug: "cybersecurity-professional",
    title: "Cybersecurity Professional",
    subtitle: "Protect organizations from modern threats with hands-on security training",
    description: "Comprehensive cybersecurity program covering network security, ethical hacking, incident response, and compliance. Prepare for industry-recognized certifications.",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop",
    badge: { text: "High Demand", variant: "popular" },
    modules: 16,
    duration: "16 weeks",
    level: "Intermediate",
    rating: 4.8,
    reviewCount: 987,
    enrolledCount: 4567,
    price: { amount: 2799, currency: "USD", original: 3299 },
    nextCohort: "2026-04-28",
    spotsRemaining: 5,
    waitlistAvailable: true,
    categories: ["Security", "Compliance"],
    categoryColor: "#7C3AED",
    skills: ["Penetration Testing", "SIEM", "Compliance", "Incident Response"],
  },
  {
    id: "5",
    slug: "llm-application-development",
    title: "LLM Application Development",
    subtitle: "Build intelligent applications powered by large language models",
    description: "Deep dive into LLM application development with hands-on projects. Learn prompt engineering, RAG systems, fine-tuning, and production deployment strategies.",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop",
    badge: { text: "Trending", variant: "urgent" },
    modules: 8,
    duration: "8 weeks",
    level: "Advanced",
    rating: 4.9,
    reviewCount: 2156,
    enrolledCount: 12345,
    price: { amount: 1999, currency: "USD", original: 2499 },
    nextCohort: "2026-04-07",
    spotsRemaining: 3,
    waitlistAvailable: true,
    categories: ["AI/ML", "LLM"],
    categoryColor: "#4f46e5",
    skills: ["OpenAI API", "LangChain", "RAG", "Fine-tuning", "Prompt Engineering"],
  },
  {
    id: "6",
    slug: "devops-engineering",
    title: "DevOps Engineering",
    subtitle: "Master the tools and practices that power modern software delivery",
    description: "Complete DevOps training covering CI/CD pipelines, infrastructure automation, monitoring, and site reliability engineering. Learn from practitioners at leading tech companies.",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-c8f473882e8e?w=800&h=450&fit=crop",
    modules: 12,
    duration: "12 weeks",
    level: "Intermediate",
    rating: 4.7,
    reviewCount: 1234,
    enrolledCount: 5678,
    price: { amount: 2099, currency: "USD" },
    nextCohort: "2026-05-12",
    spotsRemaining: 18,
    waitlistAvailable: true,
    categories: ["DevOps", "SRE"],
    categoryColor: "#F97316",
    skills: ["Jenkins", "GitLab CI", "Prometheus", "Grafana", "Ansible"],
  },
];

export const cohorts: Cohort[] = [
  {
    id: "c1",
    courseId: "1",
    courseName: "AI Engineering Bootcamp",
    startDate: "2026-04-14",
    endDate: "2026-07-07",
    timezone: "America/New_York",
    format: "Live Online",
    instructor: {
      id: "i1",
      name: "Dr. Sarah Chen",
      title: "Former AI Lead at Google",
      company: "Google",
    },
    availability: { status: "filling-fast", spotsTotal: 30, spotsRemaining: 8 },
    pricing: { earlyBird: { amount: 2199, deadline: "2026-03-31" }, standard: 2499 },
    schedule: { days: ["Tue", "Thu"], time: "7:00 PM - 10:00 PM ET" },
  },
  {
    id: "c2",
    courseId: "2",
    courseName: "Data Science Fundamentals",
    startDate: "2026-04-21",
    endDate: "2026-06-30",
    timezone: "America/New_York",
    format: "Live Online",
    instructor: {
      id: "i2",
      name: "Michael Rodriguez",
      title: "Principal Data Scientist at Netflix",
      company: "Netflix",
    },
    availability: { status: "available", spotsTotal: 40, spotsRemaining: 15 },
    pricing: { earlyBird: { amount: 1599, deadline: "2026-04-07" }, standard: 1899 },
    schedule: { days: ["Mon", "Wed"], time: "6:00 PM - 9:00 PM ET" },
  },
  {
    id: "c3",
    courseId: "5",
    courseName: "LLM Application Development",
    startDate: "2026-04-07",
    endDate: "2026-06-02",
    timezone: "America/Los_Angeles",
    format: "Live Online",
    instructor: {
      id: "i3",
      name: "Alex Kim",
      title: "AI Research Engineer at OpenAI",
      company: "OpenAI",
    },
    availability: { status: "filling-fast", spotsTotal: 25, spotsRemaining: 3 },
    pricing: { earlyBird: { amount: 1699, deadline: "2026-03-24" }, standard: 1999 },
    schedule: { days: ["Mon", "Wed", "Fri"], time: "5:00 PM - 7:00 PM PT" },
  },
  {
    id: "c4",
    courseId: "4",
    courseName: "Cybersecurity Professional",
    startDate: "2026-04-28",
    endDate: "2026-08-18",
    timezone: "Europe/London",
    format: "Hybrid",
    location: "London, UK",
    instructor: {
      id: "i4",
      name: "Emma Thompson",
      title: "CISO at Financial Services Firm",
      company: "Finance",
    },
    availability: { status: "filling-fast", spotsTotal: 20, spotsRemaining: 5 },
    pricing: { earlyBird: { amount: 2499, deadline: "2026-04-14" }, standard: 2799 },
    schedule: { days: ["Sat"], time: "10:00 AM - 6:00 PM BST" },
  },
  {
    id: "c5",
    courseId: "3",
    courseName: "Cloud Architecture Mastery",
    startDate: "2026-05-05",
    endDate: "2026-08-11",
    timezone: "America/New_York",
    format: "Live Online",
    instructor: {
      id: "i5",
      name: "James Wilson",
      title: "Cloud Architect at AWS",
      company: "AWS",
    },
    availability: { status: "available", spotsTotal: 35, spotsRemaining: 22 },
    pricing: { standard: 2199 },
    schedule: { days: ["Tue", "Thu"], time: "8:00 PM - 11:00 PM ET" },
  },
];

export const categories: Category[] = [
  {
    id: "cat1",
    name: "AI/ML Engineering",
    description: "Build intelligent systems with cutting-edge AI technologies",
    color: "#4f46e5",
    icon: "Brain",
    courseCount: 12,
  },
  {
    id: "cat2",
    name: "Data Science",
    description: "Transform data into actionable insights and predictions",
    color: "#2BBCB3",
    icon: "BarChart3",
    courseCount: 8,
  },
  {
    id: "cat3",
    name: "Cloud Computing",
    description: "Design and deploy scalable cloud infrastructure",
    color: "#3B82F6",
    icon: "Cloud",
    courseCount: 10,
  },
  {
    id: "cat4",
    name: "Cybersecurity",
    description: "Protect organizations from evolving cyber threats",
    color: "#7C3AED",
    icon: "Shield",
    courseCount: 6,
  },
  {
    id: "cat5",
    name: "DevOps & SRE",
    description: "Master modern software delivery and reliability",
    color: "#F97316",
    icon: "Settings",
    courseCount: 9,
  },
  {
    id: "cat6",
    name: "LLM Development",
    description: "Create applications powered by large language models",
    color: "#06b6d4",
    icon: "MessageSquare",
    courseCount: 5,
  },
];

export const features: Feature[] = [
  {
    id: "f1",
    title: "Live Instruction",
    description: "Learn from industry experts in real-time with interactive sessions and immediate feedback",
    icon: "Video",
  },
  {
    id: "f2",
    title: "Hands-on Labs",
    description: "Practice in cloud-based environments with real-world projects and scenarios",
    icon: "Laptop",
  },
  {
    id: "f3",
    title: "Career Support",
    description: "Get resume reviews, interview prep, and connections to our hiring partner network",
    icon: "Briefcase",
  },
  {
    id: "f4",
    title: "Certification",
    description: "Earn industry-recognized certificates to validate your skills to employers",
    icon: "Award",
  },
  {
    id: "f5",
    title: "Community Access",
    description: "Join a vibrant community of learners and alumni for networking and support",
    icon: "Users",
  },
  {
    id: "f6",
    title: "Lifetime Content",
    description: "Access course materials, recordings, and updates even after graduation",
    icon: "BookOpen",
  },
];

export const partners: Partner[] = [
  { id: "p1", name: "Google", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg" },
  { id: "p2", name: "Microsoft", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg" },
  { id: "p3", name: "Amazon", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg" },
  { id: "p4", name: "Meta", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/meta.svg" },
  { id: "p5", name: "Netflix", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg" },
  { id: "p6", name: "Spotify", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg" },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Jennifer Park",
    role: "ML Engineer",
    company: "Stripe",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    content: "The AI Engineering Bootcamp completely transformed my career. Within 3 months of graduating, I landed my dream job at Stripe with a 40% salary increase.",
    rating: 5,
  },
  {
    id: "t2",
    name: "David Kumar",
    role: "Senior Data Scientist",
    company: "Airbnb",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    content: "The hands-on approach and real-world projects gave me the confidence to tackle complex problems. The instructor quality is unmatched.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Lisa Chen",
    role: "Cloud Architect",
    company: "Salesforce",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    content: "Best investment I've made in my professional development. The curriculum is current, practical, and directly applicable to my work.",
    rating: 5,
  },
  {
    id: "t4",
    name: "Marcus Johnson",
    role: "Security Engineer",
    company: "JPMorgan Chase",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    content: "The cybersecurity program prepared me for real-world challenges. The certification helped me transition from IT support to security engineering.",
    rating: 5,
  },
];

export const stats = {
  students: 50000,
  completionRate: 94,
  placementRate: 92,
  averageSalaryIncrease: 45,
  partnerCompanies: 200,
};
