import type { IconType } from "react-icons";
import {
  FaFile,
  FaUserTie,
  FaRobot,
  FaChartLine,
  FaCircleQuestion,
  FaClipboard,
  FaComments,
  FaPen,
  FaChalkboard,
  FaCircleUser,
  FaHandshake,
  FaBook,
  FaNewspaper,
  FaVideo,
  FaDesktop,
  FaEnvelope,
  FaUsers,
  FaCalendar,
  FaUserGraduate,
  FaTrophy,
  FaCode,
  FaBuilding,
  FaInfo,
  FaBriefcase,
  FaCube,
  FaGear,
  FaBrain,
  FaListCheck,
  FaMagnifyingGlassChart,
  FaXTwitter,
  FaLinkedin,
  FaGithub,
  FaDiscord,
} from "react-icons/fa6";

export type NavLinkItem = {
  href: string;
  label: string;
  description: string;
  icon: IconType;
  /** Shown on the section index page but kept out of the header dropdown. */
  indexOnly?: boolean;
};

export type NavSection = {
  key: "products" | "services" | "resources" | "community" | "company";
  title: string;
  href: string;
  eyebrow: string;
  tagline: string;
  icon: IconType;
  links: NavLinkItem[];
};

export const navigationSections: NavSection[] = [
  {
    key: "products",
    title: "Products",
    href: "/products",
    eyebrow: "Practice tools",
    tagline: "Rehearse the interview before it happens. Every tool gives you a transcript, a score and a next step.",
    icon: FaCube,
    links: [
      { href: "/products/mock-interviews", label: "Mock Interviews", icon: FaUserTie, description: "Talk to an AI interviewer that listens, scores and follows up" },
      { href: "/products/resume-builder", label: "Resume Builder", icon: FaFile, description: "Build an ATS-ready resume and get line-by-line suggestions" },
      { href: "/products/aptitude-ai", label: "Aptitude AI", icon: FaBrain, description: "Adaptive logical, numerical and verbal practice" },
      { href: "/products/interview-generator", label: "AI Interview Generator", icon: FaRobot, description: "Generate questions for a specific role and company" },
      { href: "/products/Practice-Tests", label: "Practice Tests", icon: FaClipboard, description: "Timed, industry-specific tests with explanations" },
      { href: "/products/skills-analyzer", label: "Skills Analyzer", icon: FaMagnifyingGlassChart, description: "Map your skills against a target role", indexOnly: true },
      { href: "/products/interview-questions", label: "Interview Questions", icon: FaCircleQuestion, description: "A curated bank of questions by role and topic", indexOnly: true },
      { href: "/products/coding-practice", label: "Coding Practice", icon: FaCode, description: "Solve real-world problems in the browser", indexOnly: true },
      { href: "/products/ai-feedback", label: "AI Feedback", icon: FaListCheck, description: "Paste an answer, get a structured critique", indexOnly: true },
    ],
  },
  {
    key: "services",
    title: "Services",
    href: "/services",
    eyebrow: "Work with a coach",
    tagline: "When you want a human in the loop. Each service pairs an expert with the same AI tools you practise with.",
    icon: FaGear,
    links: [
      { href: "/services/consultation", label: "Career Consultation", icon: FaComments, description: "A one-to-one session to plan your next move" },
      { href: "/services/cv-revision", label: "CV Revision", icon: FaPen, description: "A reviewer rewrites your CV with you, line by line" },
      { href: "/services/interview-coaching", label: "Interview Coaching", icon: FaChalkboard, description: "Live mock rounds with feedback you can act on" },
      { href: "/services/personal-branding", label: "Personal Branding", icon: FaCircleUser, description: "LinkedIn, portfolio and the story you tell" },
      { href: "/services/salary-negotiation", label: "Salary Negotiation", icon: FaHandshake, description: "Scripts and numbers for the offer conversation" },
      { href: "/services/mock-tests", label: "Mock Tests", icon: FaListCheck, description: "Proctored practice tests with a debrief", indexOnly: true },
    ],
  },
  {
    key: "resources",
    title: "Resources",
    href: "/resources",
    eyebrow: "Learn",
    tagline: "Guides, recordings and answers from people who sit on the other side of the table.",
    icon: FaBook,
    links: [
      { href: "/resources/blog", label: "Blog", icon: FaNewspaper, description: "Articles on preparation, hiring and careers" },
      { href: "/resources/faq", label: "FAQ", icon: FaCircleQuestion, description: "Answers to the questions we hear most" },
      { href: "/resources/ebooks", label: "Ebooks and Guides", icon: FaBook, description: "Long-form preparation material" },
      { href: "/resources/tutorials", label: "Tutorials", icon: FaVideo, description: "Step-by-step walkthroughs of each tool" },
      { href: "/resources/webinars", label: "Webinars", icon: FaDesktop, description: "Live and recorded sessions with recruiters" },
      { href: "/resources/newsletters", label: "Newsletter", icon: FaEnvelope, description: "One email a week, no filler" },
    ],
  },
  {
    key: "community",
    title: "Community",
    href: "/community",
    eyebrow: "Practise together",
    tagline: "Other candidates, mentors and alumni. Find a practice partner or share what worked.",
    icon: FaUsers,
    links: [
      { href: "/community/forums", label: "Forums", icon: FaComments, description: "Ask, answer and compare notes" },
      { href: "/community/events", label: "Events", icon: FaCalendar, description: "Upcoming sessions and workshops" },
      { href: "/community/mentorship", label: "Mentorship", icon: FaUserGraduate, description: "Pair with someone who has done the job" },
      { href: "/community/success-stories", label: "Success Stories", icon: FaTrophy, description: "How members landed their offers" },
      { href: "/community/meetups", label: "Meetups", icon: FaHandshake, description: "In-person gatherings near you" },
      { href: "/community/hackathons", label: "Hackathons", icon: FaCode, description: "Build something with other members" },
    ],
  },
  {
    key: "company",
    title: "Company",
    href: "/company",
    eyebrow: "About us",
    tagline: "Who builds InterviewMaster.ai, how to reach us and how to work with us.",
    icon: FaBuilding,
    links: [
      { href: "/company/about", label: "About", icon: FaInfo, description: "Our story and what we are building" },
      { href: "/company/careers", label: "Careers", icon: FaBriefcase, description: "Open roles on the team" },
      { href: "/company/partners", label: "Partners", icon: FaHandshake, description: "Universities, bootcamps and employers" },
      { href: "/company/contact", label: "Contact", icon: FaEnvelope, description: "Get in touch" },
      { href: "/company/press", label: "Press", icon: FaNewspaper, description: "Coverage and media kit" },
      { href: "/company/investors", label: "Investors", icon: FaChartLine, description: "Investor information" },
    ],
  },
];

export const socialLinks = [
  { href: "https://x.com/interviewmaster", icon: FaXTwitter, label: "X" },
  { href: "https://linkedin.com/company/interviewmaster", icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://github.com/interviewmaster", icon: FaGithub, label: "GitHub" },
  { href: "https://discord.gg/interviewmaster", icon: FaDiscord, label: "Discord" },
];

export const legalLinks = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/disclosure", label: "Disclosure" },
];

export function getSection(key: NavSection["key"]) {
  return navigationSections.find((s) => s.key === key)!;
}
