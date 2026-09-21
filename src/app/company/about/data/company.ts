import { Brain, Target, Users, Sparkles, Code, Trophy, Rocket, Star } from "lucide-react";

export interface TeamMember {
  name: string;
  role: string;
  description: string;
}

export interface Milestone {
  year: number;
  title: string;
  description: string;
}

export interface Value {
  icon: any;
  title: string;
  description: string;
}

export const companyStats = [
  {
    icon: Users,
    label: "Active Users",
    value: "50K+",
  },
  {
    icon: Trophy,
    label: "Success Rate",
    value: "96%",
  },
  {
    icon: Brain,
    label: "Mock Interviews",
    value: "100K+",
  },
  {
    icon: Star,
    label: "User Rating",
    value: "4.9/5",
  },
];

export const companyMilestones: Milestone[] = [
  {
    year: 2024,
    title: "Platform Launch",
    description: "Sameer founded InterviewMaster.AI to make technical interview preparation accessible through AI",
  },
  {
    year: 2024,
    title: "Beta Release",
    description: "Launched beta version with core features including AI-powered mock interviews",
  },
  {
    year: 2024,
    title: "Feature Expansion",
    description: "Added comprehensive interview preparation tools and real-time feedback system",
  },
  {
    year: 2024,
    title: "Platform Growth",
    description: "Enhanced platform capabilities and expanded user base across multiple countries",
  },
];

export const companyValues: Value[] = [
  {
    icon: Brain,
    title: "AI Innovation",
    description: "Leveraging cutting-edge AI technology to provide the most realistic and effective interview practice.",
  },
  {
    icon: Target,
    title: "Personalized Growth",
    description: "Tailoring interview preparation to each user's unique goals and career path.",
  },
  {
    icon: Code,
    title: "Technical Excellence",
    description: "Ensuring comprehensive coverage of technical concepts and industry best practices.",
  },
  {
    icon: Rocket,
    title: "Career Acceleration",
    description: "Empowering users to fast-track their career growth through expert interview preparation.",
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: "Sameer",
    role: "Founder & CEO",
    description: "Founder of InterviewMaster.ai, focused on making high-quality interview preparation accessible through AI.",
  },
  {
    name: "Technical Team",
    role: "Engineering Excellence",
    description: "Dedicated engineers building robust and scalable interview preparation solutions.",
  },
  {
    name: "Product Team",
    role: "User Experience",
    description: "Creating intuitive and effective learning experiences for interview success.",
  },
];

export const companyDescription = {
  mission: "To revolutionize technical interview preparation through AI-powered technology, making quality practice accessible to everyone.",
  vision: "To become the world's leading platform for interview preparation, helping millions of professionals achieve their career goals.",
  about: "InterviewMaster.AI is owned by Sameer. It is an interview preparation platform that combines AI with practical interview coaching. The platform offers personalized mock interviews, real-time feedback, and learning resources for technical interviews.",
  features: [
    "AI-Powered Mock Interviews with Real-time Feedback",
    "Personalized Learning Paths and Progress Tracking",
    "Comprehensive Technical Interview Coverage",
    "Performance Analytics and Improvement Insights",
    "Industry-Standard Coding Challenges",
    "Behavioral Interview Preparation",
    "System Design Interview Practice",
    "Expert-Curated Question Bank",
  ],
};
