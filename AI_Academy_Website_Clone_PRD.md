PRODUCT REQUIREMENTS DOCUMENT

**AI Academy Website Clone**

Comprehensive UI/UX Design & Development Specification

Version 1.0

March 27, 2026

Source: https://ai-academy.jesspete.shop/

1. Executive Summary 1

2. Website Analysis Overview 2

3. Detailed Component Analysis 3

4. UI/UX Design Specifications 6

5. Page Specifications 9

6. Technical Requirements 11

7. Implementation Roadmap 13

8. Success Metrics 14

9. Appendix: Screenshots Reference 14

*Note: Right-click the Table of Contents and select "Update Field" to refresh page numbers.*

# 1. Executive Summary

This Product Requirements Document (PRD) provides a comprehensive specification for developing a clone of the AI Academy website located at https://ai-academy.jesspete.shop/. The website is a modern, professional e-learning platform focused on AI education and professional development, targeting engineers and technology professionals seeking to advance their careers in artificial intelligence and machine learning.

The platform demonstrates sophisticated UI/UX design principles with a clean, modern aesthetic that effectively communicates credibility and professionalism. The website features responsive design, intuitive navigation, and a comprehensive course catalog system. This document outlines all functional and non-functional requirements, design specifications, technical architecture, and implementation guidelines necessary to replicate this platform with fidelity.

# 2. Website Analysis Overview

## 2.1 Platform Purpose and Target Audience

AI Academy is a professional e-learning platform specializing in AI and machine learning education for working professionals. The platform targets software engineers, data scientists, and technology professionals who want to upskill or transition into AI-related roles. The design language reflects this professional focus through sophisticated typography, restrained color usage, and clear information hierarchy that respects the user's time and intelligence.

The platform's value proposition centers on live instruction from industry experts, production-grade hands-on projects, and career support services. This positions it as a premium offering in the competitive online education market, justifying its price point and targeting professionals who are serious about career advancement rather than casual learners.

## 2.2 Page Structure Overview

The website comprises several key pages and sections that work together to create a cohesive user experience:

* Homepage: Full-featured landing page with hero section, trust indicators, learning paths, features, featured courses, upcoming cohorts, and enterprise solutions
* Courses Page: Course catalog with search, filtering, and sorting capabilities
* Course Detail Page: Individual course information with tabs for Overview, Curriculum, and Instructor
* Authentication Pages: Sign In and Sign Up pages with form validation
* Footer Section: Comprehensive footer with newsletter signup, course links, company information, resources, and social media links

# 3. Detailed Component Analysis

## 3.1 Navigation Header

The navigation header serves as the primary orientation and navigation tool for users throughout the website. It implements a sticky positioning pattern that remains visible during scrolling, ensuring users always have access to navigation controls. The header adapts responsively between desktop and mobile views, with a hamburger menu appearing on smaller screens.

**Table 1: Navigation Header Components**

| **Component** | **Description & Specifications** |
| --- | --- |
| Logo | "AI Academy" wordmark with "AI" highlighted in accent color; links to homepage |
| Courses Link | Direct navigation to course catalog page |
| Learning Paths | Dropdown menu with AI Engineering, Data Science, Machine Learning specializations |
| Enterprise | Dropdown menu for enterprise training solutions |
| Resources | Dropdown with Documentation, Community, Help Center, Webinars, Podcast links |
| Search Button | Opens search modal; keyboard shortcut "K" displayed as hint |
| Sign In Button | Secondary button style; navigates to login page |
| Get Started Button | Primary CTA button; prominent styling for conversion |

## 3.2 Hero Section

The hero section is the most visually prominent element of the homepage, designed to immediately communicate the platform's value proposition and capture user attention. It employs a sophisticated split-layout design combining textual content with dynamic visual elements.

**Content Structure:**

1. Announcement Badge: "NOW ENROLLING: APRIL COHORTS" - creates urgency and timeliness
2. Main Headline: "Master AI Engineering in 12 Weeks" - clear, benefit-focused value proposition
3. Supporting Copy: Builds credibility with "50,000+ engineers" social proof
4. Dual CTA Buttons: "Explore Programs" (secondary) and "Watch Demo" (tertiary)
5. Stats Section: Three key metrics (94% Completion Rate, 89% Placement Rate, 42% Avg. Salary Increase)

## 3.3 Trust Indicators Section

Below the hero section, a dedicated trust indicators bar displays logos of prominent tech companies (Google, Microsoft, Amazon, Meta, OpenAI, Anthropic). This section reinforces credibility and suggests that professionals from leading technology companies trust and use the platform. The logos are displayed in a clean horizontal arrangement with subtle grayscale treatment that maintains visual hierarchy without overwhelming the page design.

## 3.4 Learning Paths Section

The Learning Paths section presents the platform's curriculum specializations in an engaging card-based layout. Each card represents a distinct learning track with consistent visual treatment and hover interactions. The section includes a section label ("LEARNING PATHS"), a compelling heading ("Choose Your Specialization"), and supporting descriptive text.

**Table 2: Learning Path Categories**

| **Path Name** | **Course Count** | **Description** |
| --- | --- | --- |
| AI Engineering | 1 course | Production-grade AI development and deployment |
| Data Science | 0 courses | Data analysis and visualization fundamentals |
| Machine Learning | 0 courses | ML theory to production deployment |

## 3.5 Features/Why Choose Us Section

This section presents six key value propositions in a grid layout, each with an icon, heading, and brief description. The features communicate the platform's comprehensive learning experience designed specifically for working professionals. The section uses a consistent card-style presentation that maintains visual cohesion while allowing each feature to stand out independently.

**Feature List:**

* Live Instruction: Learn directly from industry experts in real-time sessions
* Hands-on Projects: Build portfolio-worthy AI systems with guided projects
* Career Support: Get personalized coaching and job placement assistance
* Industry Certification: Earn recognized credentials valued by top employers
* Community Access: Join a network of 12,000+ AI professionals
* Lifetime Materials: Access course updates and resources indefinitely

## 3.6 Featured Program Section

The Featured Program section showcases the platform's flagship course (AI Engineering Bootcamp) in a detailed, conversion-focused layout. This section is designed to provide comprehensive course information while driving enrollment decisions. The layout splits between course image and detailed information, including pricing, ratings, skills covered, and included features.

**Table 3: Featured Course Details**

| **Attribute** | **Value** |
| --- | --- |
| Course Name | AI Engineering Bootcamp |
| Level | Intermediate |
| Duration | 8 weeks / 12 modules |
| Rating | 4.8 (127 reviews) |
| Price | $2,499 |
| Skills Covered | Python, PyTorch, LangChain, Vector DBs, MLOps |

## 3.7 Upcoming Cohorts Section

The Upcoming Cohorts section displays scheduled course start dates in a clean, informative format. This section creates urgency and helps prospective students plan their enrollment. Each cohort card displays the date, course name, status (e.g., "OPEN"), time zone, and format (online), along with an "Enroll Now" CTA button.

## 3.8 Enterprise Solutions Section

This section targets B2B customers with enterprise training solutions. It presents compelling statistics (200+ Enterprise Clients, 50K+ Engineers Trained, 94% Completion Rate) and key benefits including custom curriculum, flexible scheduling, dedicated account management, volume discounts, and progress tracking. Two CTAs are provided: "Talk to Sales" and "Download Brochure".

## 3.9 Footer Section

The comprehensive footer provides extensive navigation and engagement opportunities. It includes the brand identity with tagline, newsletter subscription form with email input, three link columns (Courses, Company, Resources), legal links (Privacy Policy, Terms of Service, Cookie Policy, Accessibility), and social media links (Twitter, LinkedIn, GitHub, YouTube).

# 4. UI/UX Design Specifications

## 4.1 Color Palette

The website employs a sophisticated, professional color scheme that conveys trust, expertise, and modern technology aesthetics. The palette is dominated by deep slate tones with strategic use of accent colors for calls-to-action and interactive elements.

**Table 4: Color Palette Specifications**

| **Color Name** | **Hex Code** | **Usage** |
| --- | --- | --- |
| Primary Dark | #0F172A | Primary text, headings, dark backgrounds |
| Slate Gray | #64748B | Secondary text, muted elements |
| Accent Blue | #3B82F6 | Primary CTA buttons, links, accents |
| Background Light | #F8FAFC | Page backgrounds, card backgrounds |
| Success Green | #10B981 | Success states, badges, positive indicators |
| Border Gray | #E2E8F0 | Card borders, dividers, subtle separations |

## 4.2 Typography

The typography system employs a modern sans-serif approach that prioritizes readability and professional aesthetics. The font hierarchy creates clear visual distinction between different content types while maintaining consistency across the platform.

**Table 5: Typography Specifications**

| **Element** | **Size** | **Weight** | **Usage** |
| --- | --- | --- | --- |
| H1 | 48-60px | Bold (700) | Hero headlines, major section titles |
| H2 | 32-36px | Bold (700) | Section headings |
| H3 | 20-24px | Semibold (600) | Card titles, subsection headings |
| Body | 16px | Regular (400) | Paragraphs, descriptions |
| Small | 14px | Regular (400) | Labels, metadata, captions |

## 4.3 Layout and Spacing

The website employs a responsive grid system with consistent spacing that creates visual harmony and improves usability. The layout adapts fluidly across device sizes while maintaining design integrity.

* Container Max Width: 1280px with centered alignment
* Grid System: 12-column responsive grid
* Section Spacing: 80-120px vertical padding between major sections
* Card Padding: 24px internal padding
* Card Border Radius: 12-16px for rounded corners
* Button Border Radius: 8px

## 4.4 Component Design Patterns

The website uses consistent component patterns throughout for buttons, cards, forms, and interactive elements. These patterns establish user expectations and create a cohesive experience.

### Button Styles

* Primary Button: Solid accent blue background (#3B82F6), white text, hover darkens by 10%
* Secondary Button: Transparent background with border, primary text color, hover fills with light background
* Tertiary Button: Minimal styling, text-only with optional icon, used for less prominent actions

### Card Design

* Background: White (#FFFFFF) with subtle shadow or border
* Hover Effect: Subtle lift with enhanced shadow
* Border: 1px solid border gray (#E2E8F0) or shadow-based separation
* Content: Image (optional), title, description, metadata, CTA

## 4.5 Responsive Breakpoints

The responsive design implements a mobile-first approach with strategic breakpoints that optimize the layout for different device categories. Each breakpoint introduces layout adjustments that maintain usability and visual appeal.

**Table 6: Responsive Breakpoints**

| **Breakpoint** | **Width Range** | **Layout Behavior** |
| --- | --- | --- |
| Mobile | < 640px | Single column, hamburger menu, stacked elements |
| Tablet | 640px - 1024px | 2-3 column grids, compact navigation |
| Desktop | > 1024px | Full navigation, multi-column layouts, sidebars |

# 5. Page Specifications

## 5.1 Homepage

The homepage serves as the primary entry point and central hub for the entire platform. It combines marketing content, course information, and conversion elements in a single, scrollable experience.

**Section Order:**

1. Hero Section - Main value proposition and primary CTAs
2. Trust Indicators - Company logos for social proof
3. Learning Paths - Course specializations
4. Features/Why Choose Us - Value propositions
5. Featured Program - Flagship course showcase
6. Upcoming Cohorts - Schedule and availability
7. Enterprise Solutions - B2B offerings

## 5.2 Courses Page

The courses page provides a browsable catalog of all available courses with filtering and search capabilities. It serves as a discovery interface for users exploring educational options.

* Header: "All Courses" title with descriptive subtitle
* Search: Text input with search icon for course filtering
* Sort: Dropdown for sorting options (relevance, price, duration)
* Results: Grid layout of course cards with count indicator
* Course Card: Image, level badge, title, description, duration, rating, price

## 5.3 Course Detail Page

The course detail page provides comprehensive information about a specific course, organized through a tabbed interface. It combines informational content with conversion elements to drive enrollment.

* Breadcrumb: "Back to Courses" navigation link
* Header: Level badge, category tag, course title, tagline
* Meta Info: Rating, duration, student count
* Sidebar: Price, enroll button, guarantee, included features
* Tabs: Overview, Curriculum (12 modules), Instructor

## 5.4 Authentication Pages

The authentication pages (Sign In and Sign Up) provide clean, focused interfaces for user authentication. They employ a centered card layout that minimizes distractions.

### Sign In Page

* Header: "Welcome back" greeting with subtitle
* Form Fields: Email, Password (with show/hide toggle)
* Links: "Forgot password?" recovery link
* CTA: "Sign in" primary button
* Footer: "Don't have an account? Sign up" link

### Sign Up Page

1. Header: "Create an account" with inviting subtitle
2. Form Fields: Email, Username, Password, Confirm Password
3. Checkbox: Terms of Service and Privacy Policy agreement
4. CTA: "Create account" primary button
5. Footer: "Already have an account? Sign in" link

# 6. Technical Requirements

## 6.1 Recommended Technology Stack

Based on the website's characteristics and modern development practices, the following technology stack is recommended for development:

**Table 7: Technology Stack**

| **Layer** | **Technology** | **Purpose** |
| --- | --- | --- |
| Framework | Next.js 14+ | React framework with SSR/SSG |
| Language | TypeScript | Type-safe JavaScript |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Components | shadcn/ui | Accessible component library |
| Database | PostgreSQL + Prisma | Relational database with ORM |
| Authentication | NextAuth.js | Authentication for Next.js |
| Icons | Lucide React | Beautiful open-source icons |

## 6.2 Performance Requirements

Performance is critical for user experience and SEO. The following metrics should be achieved:

1. First Contentful Paint (FCP): < 1.8 seconds
2. Largest Contentful Paint (LCP): < 2.5 seconds
3. Time to Interactive (TTI): < 3.8 seconds
4. Cumulative Layout Shift (CLS): < 0.1
5. Lighthouse Performance Score: > 90

## 6.3 Accessibility Requirements

The website must be accessible to users with disabilities, complying with WCAG 2.1 AA standards:

1. Semantic HTML: Use appropriate heading hierarchy, landmarks, and semantic elements
2. Keyboard Navigation: All interactive elements accessible via keyboard
3. Color Contrast: Minimum 4.5:1 for normal text, 3:1 for large text
4. Alt Text: All images must have meaningful alternative text
5. Focus Indicators: Visible focus states for all interactive elements
6. Screen Reader Support: ARIA labels where needed, proper form labeling

# 7. Implementation Roadmap

The development process should follow an iterative approach, building core functionality first and then adding enhancements. The recommended phases are outlined below:

## 7.1 Phase 1: Foundation (Weeks 1-2)

* Project setup with Next.js, TypeScript, and Tailwind CSS
* Design system implementation (colors, typography, spacing)
* Core component library (buttons, cards, inputs)
* Layout components (header, footer, navigation)

## 7.2 Phase 2: Homepage (Weeks 3-4)

* Hero section with responsive design
* Trust indicators section
* Learning paths section with interactive cards
* Features section with grid layout
* Featured program and upcoming cohorts sections
* Enterprise solutions section

## 7.3 Phase 3: Course Pages (Weeks 5-6)

* Courses listing page with search and filter
* Course detail page with tabbed interface
* Curriculum accordion component
* Instructor profile section

## 7.4 Phase 4: Authentication & Polish (Weeks 7-8)

* Sign in and sign up pages
* Authentication integration
* Search modal implementation
* Responsive testing and optimization
* Performance optimization and testing
* Accessibility audit and fixes

# 8. Success Metrics

The success of the website clone should be measured against the following criteria:

1. Visual Fidelity: Pixel-perfect match with original design (>95% similarity)
2. Performance: Lighthouse scores > 90 for all categories
3. Accessibility: WCAG 2.1 AA compliance with no critical violations
4. Responsive: Proper rendering across all device sizes
5. Functionality: All interactive elements working as expected

# 9. Appendix: Screenshots Reference

The following screenshots were captured during the website analysis and are available for reference:

1. ai-academy-homepage.png - Full homepage screenshot
2. ai-academy-courses.png - Courses listing page
3. ai-academy-course-detail-page.png - Course detail page
4. ai-academy-curriculum.png - Curriculum tab view
5. ai-academy-signin.png - Sign in page
6. ai-academy-signup.png - Sign up page
7. ai-academy-mobile-homepage.png - Mobile responsive view
8. ai-academy-mobile-menu.png - Mobile navigation menu
9. ai-academy-search-modal.png - Search modal interface
10. ai-academy-dropdown-\*.png - Navigation dropdown menus