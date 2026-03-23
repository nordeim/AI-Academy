/**
 * Mock Data for Frontend UI
 * 
 * Provides static data for initial UI rendering before API integration
 * Used by landing page sections (Hero, Features, etc.)
 */

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  courseCount: number;
  icon: string;
  color: string;
  description: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  modules: number;
  duration: string;
  level: CourseLevel;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  price: {
    amount: number;
    currency: string;
    original?: number;
  };
  categories: string[];
  categoryColor: string;
  skills: string[];
  nextCohort: string;
  spotsRemaining: number;
  waitlistAvailable: boolean;
  badge?: {
    text: string;
    variant: "popular" | "new" | "limited";
  };
}

export const courses: Course[] = [
  {
    id: "course-1",
    slug: "ai-engineering-bootcamp",
    title: "AI Engineering Bootcamp",
    subtitle: "Master the full AI lifecycle from data to production",
    description: "A comprehensive program designed for software engineers looking to pivot into AI. Learn LLM orchestration, vector databases, and production-grade deployment.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    modules: 12,
    duration: "12 Weeks",
    level: "Intermediate",
    rating: 4.9,
    reviewCount: 128,
    enrolledCount: 850,
    price: {
      amount: 2499,
      currency: "USD",
      original: 2999
    },
    categories: ["AI Engineering", "Production"],
    categoryColor: "#4f46e5",
    skills: ["LangChain", "OpenAI", "Python", "Docker"],
    nextCohort: "April 15, 2026",
    spotsRemaining: 8,
    waitlistAvailable: true,
    badge: {
      text: "FILLING FAST",
      variant: "limited"
    }
  },
  {
    id: "course-2",
    slug: "llm-ops-mastery",
    title: "LLMOps Mastery",
    subtitle: "Deploy, monitor and scale LLM applications",
    description: "Learn how to build reliable production systems for large language models. Focus on evaluation, monitoring, and efficient inference.",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    modules: 8,
    duration: "6 Weeks",
    level: "Advanced",
    rating: 4.8,
    reviewCount: 94,
    enrolledCount: 420,
    price: {
      amount: 1499,
      currency: "USD"
    },
    categories: ["DevOps", "AI Infrastructure"],
    categoryColor: "#2BBCB3",
    skills: ["MLflow", "Kubernetes", "GPU Optimization"],
    nextCohort: "May 3, 2026",
    spotsRemaining: 15,
    waitlistAvailable: true
  },
  {
    id: "course-3",
    slug: "data-science-fundamentals",
    title: "Data Science for Engineers",
    subtitle: "Prerequisite statistics and modeling for AI",
    description: "The essential mathematical and statistical foundation needed for modern AI engineering. From linear algebra to complex statistical inference.",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    modules: 10,
    duration: "8 Weeks",
    level: "Beginner",
    rating: 4.7,
    reviewCount: 215,
    enrolledCount: 1200,
    price: {
      amount: 999,
      currency: "USD",
      original: 1299
    },
    categories: ["Mathematics", "Data Science"],
    categoryColor: "#3B82F6",
    skills: ["NumPy", "Pandas", "Scikit-learn"],
    nextCohort: "April 28, 2026",
    spotsRemaining: 24,
    waitlistAvailable: true
  },
  {
    id: "course-4",
    slug: "agentic-workflows",
    title: "Building Agentic Workflows",
    subtitle: "Autonomous AI agents for complex business logic",
    description: "Go beyond simple chat interfaces. Learn how to build autonomous agents that can use tools, plan tasks, and execute multi-step workflows.",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
    modules: 6,
    duration: "4 Weeks",
    level: "Advanced",
    rating: 4.9,
    reviewCount: 56,
    enrolledCount: 180,
    price: {
      amount: 1899,
      currency: "USD"
    },
    categories: ["Agents", "Automation"],
    categoryColor: "#7C3AED",
    skills: ["AutoGPT", "CrewAI", "Multi-agent Systems"],
    nextCohort: "May 12, 2026",
    spotsRemaining: 5,
    waitlistAvailable: true,
    badge: {
      text: "NEW",
      variant: "new"
    }
  },
  {
    id: "course-5",
    slug: "computer-vision-pro",
    title: "Advanced Computer Vision",
    subtitle: "Object detection, segmentation and tracking",
    description: "Deep dive into CNNs, Transformers for vision, and real-time processing. Build systems for medical imaging, security, and autonomous vehicles.",
    thumbnail: "https://images.unsplash.com/photo-1527430253228-e9e688bd8275?q=80&w=800&auto=format&fit=crop",
    modules: 14,
    duration: "10 Weeks",
    level: "Intermediate",
    rating: 4.8,
    reviewCount: 82,
    enrolledCount: 310,
    price: {
      amount: 2199,
      currency: "USD"
    },
    categories: ["Vision", "Deep Learning"],
    categoryColor: "#4f46e5",
    skills: ["PyTorch", "OpenCV", "YOLO"],
    nextCohort: "June 1, 2026",
    spotsRemaining: 12,
    waitlistAvailable: true
  },
  {
    id: "course-6",
    slug: "natural-language-processing",
    title: "NLP Specialization",
    subtitle: "From word embeddings to transformer architectures",
    description: "Master the art of processing and generating human language. Build sentiment analysis, translation, and advanced summarization engines.",
    thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop",
    modules: 12,
    duration: "12 Weeks",
    level: "Intermediate",
    rating: 4.6,
    reviewCount: 142,
    enrolledCount: 560,
    price: {
      amount: 1799,
      currency: "USD"
    },
    categories: ["NLP", "Deep Learning"],
    categoryColor: "#F97316",
    skills: ["HuggingFace", "BERT", "Transformers"],
    nextCohort: "May 20, 2026",
    spotsRemaining: 18,
    waitlistAvailable: true
  }
];

export const categories: MockCategory[] = [
  {
    id: "cat-1",
    name: "AI Engineering",
    slug: "ai-engineering",
    courseCount: 15,
    icon: "Brain",
    color: "#4f46e5",
    description: "Foundational AI and machine learning engineering."
  },
  {
    id: "cat-2",
    name: "Infrastructure",
    slug: "infrastructure",
    courseCount: 8,
    icon: "Server",
    color: "#2BBCB3",
    description: "Deployment, monitoring and scaling AI systems."
  },
  {
    id: "cat-3",
    name: "Computer Vision",
    slug: "vision",
    courseCount: 12,
    icon: "Eye",
    color: "#3B82F6",
    description: "Processing and understanding visual data."
  }
];

export const stats = [
  { label: "Active Students", value: "12,000+" },
  { label: "Course Rating", value: "4.9/5.0" },
  { label: "Partner Companies", value: "150+" },
  { label: "Success Rate", value: "94%" }
];
