PRODUCT REQUIREMENTS DOCUMENT

**AI Academy Website Clone**

Comprehensive UI/UX Clone Specification

Version 1.0

March 25, 2026

1. Executive Summary 3

2. Project Overview 3

2.1 Project Goals 3

2.2 Target Audience 4

2.3 Scope Definition 4

3. Design System Specification 5

3.1 Color Palette 5

3.2 Typography System 6

3.3 Spacing and Layout Grid 7

4. Page-by-Page Specifications 8

4.1 Homepage Layout 8

4.2 Navigation System 10

4.3 Authentication Pages 11

4.4 Footer Section 13

5. UI Component Library 14

6. Responsive Design Requirements 16

7. Technical Implementation Requirements 18

8. Recommended Project Structure 20

9. Acceptance Criteria 21

10. Appendix 23

*Note: Right-click the Table of Contents and select "Update Field" to refresh page numbers.*

# 1. Executive Summary

This Product Requirements Document (PRD) provides a comprehensive specification for cloning the AI Academy website (https://ai-academy.jesspete.shop/). The original website is a modern, professional e-learning platform focused on AI engineering education, featuring a clean UI design with purple/blue color scheme, responsive layout, and intuitive user experience. This document details all visual, functional, and technical requirements necessary to create an accurate clone of the website, including exact color specifications, typography guidelines, component designs, page layouts, and interactive behaviors.

The AI Academy platform represents a contemporary approach to educational technology websites, combining professional aesthetics with user-centered design principles. The site employs a minimalist approach with strategic use of color accents, generous whitespace, and clear visual hierarchy to guide users through the learning journey. Key differentiators include a command palette search system, multi-level navigation dropdowns, and carefully crafted authentication flows that maintain consistency with the overall design language.

# 2. Project Overview

## 2.1 Project Goals

The primary objective of this project is to create a pixel-perfect clone of the AI Academy website that accurately reproduces all visual elements, interactive components, and user flows. The clone should be fully functional, responsive across devices, and built using modern web development best practices. This project serves multiple purposes: demonstrating technical proficiency in frontend development, creating a reusable educational platform template, and providing a reference implementation for similar e-learning website designs.

* Create a visually identical clone of the AI Academy website with all UI components
* Implement responsive design that adapts seamlessly across desktop, tablet, and mobile devices
* Recreate all interactive elements including navigation menus, search functionality, and forms
* Build with modern technology stack (Next.js, React, Tailwind CSS, shadcn/ui)
* Ensure accessibility compliance following WCAG guidelines
* Optimize performance for fast loading and smooth interactions

## 2.2 Target Audience

The clone website targets engineering professionals seeking to upskill in AI technologies, as well as developers and designers looking for reference implementations of modern e-learning platforms. The platform should appeal to tech-savvy users who appreciate clean, professional interfaces and expect smooth, intuitive interactions. Secondary audiences include educational institutions considering similar platform implementations and development teams studying modern web design patterns.

## 2.3 Scope Definition

This project encompasses all frontend aspects of the website including static pages, interactive components, and user interface elements. The scope includes detailed reproduction of visual design, responsive behavior, and client-side interactivity. Backend functionality for data persistence, authentication, and API integrations are defined as requirements but may be implemented with mock data for demonstration purposes. The following items are included in scope:

1. Complete visual design clone including all pages and components
2. Navigation system with dropdown menus and mobile responsiveness
3. Command palette search overlay with keyboard navigation
4. Authentication flows (sign-in and registration forms)
5. Footer with newsletter subscription and site links
6. Responsive design for all screen sizes

# 3. Design System Specification

## 3.1 Color Palette

The AI Academy website employs a carefully curated color palette that balances professionalism with visual interest. The primary brand colors consist of vibrant purples and blues that convey innovation and technological sophistication, while neutral grays and whites provide clean backgrounds and ensure readability. The color system follows a hierarchical approach where accent colors draw attention to interactive elements and calls-to-action, while supporting colors maintain visual harmony throughout the interface.

| **Color Name** | **Hex Value** | **Usage** |
| --- | --- | --- |
| Primary Purple | #6366F1 | Primary CTA buttons, brand accents, links |
| Dark Purple | #4B0082 | Badge text, hover states |
| Deep Blue | #1E3A8A | Headline text accents ("AI" in hero) |
| Lavender | #E6E6FA | Badge backgrounds, subtle highlights |
| Success Green | #22C55E | Success indicators, checkmarks, certifications |
| Dark Navy | #1E293B | Code snippet backgrounds, dark mode elements |
| Text Black | #000000 | Primary headings, body text |
| Text Gray | #666666 | Secondary text, descriptions |
| White | #FFFFFF | Backgrounds, button text on colored backgrounds |

*Table 1: Complete Color Palette Specification*

## 3.2 Typography System

The typography system employs a modern sans-serif font family (Inter or Poppins) throughout the interface, creating a clean, tech-forward appearance that enhances readability across all device sizes. The type scale follows a modular approach where heading sizes progress logically from largest to smallest, ensuring clear visual hierarchy. Font weights are used strategically to differentiate between headings, body text, and emphasis without requiring color changes, maintaining accessibility while preserving design intent.

| **Element** | **Size** | **Weight** | **Usage** |
| --- | --- | --- | --- |
| Hero Headline | 48px | Bold (700) | Main hero section headline |
| Section Heading | 32px | Bold (700) | Major section titles (H2) |
| Card Heading | 20px | Semi-Bold (600) | Feature cards, subsection titles (H3) |
| Body Text | 16-18px | Regular (400) | Paragraphs, descriptions, content |
| Badge Text | 14px | Medium (500) | Uppercase badges, labels |
| Navigation | 15px | Medium (500) | Header nav items, footer links |

*Table 2: Typography Scale and Specifications*

## 3.3 Spacing and Layout Grid

The layout system follows a responsive grid approach with consistent spacing increments based on an 8px base unit. This modular spacing system ensures visual rhythm and alignment consistency throughout the interface. The website utilizes generous whitespace to create breathing room between elements, enhancing readability and creating a premium, uncluttered aesthetic. Section padding typically ranges from 4rem (64px) to 6rem (96px) vertically, providing clear visual separation between major content areas.

The grid system employs a 12-column layout on desktop, adapting to fewer columns on smaller screens. Container widths are capped at approximately 1280px to maintain optimal reading line lengths, with content centered within the viewport. Gutters between columns maintain consistent spacing at 24px, ensuring content alignment while allowing flexibility for various content types and component arrangements.

* Base unit: 8px (all spacing values are multiples of this unit)
* Component padding: 16px (small), 24px (medium), 32px (large)
* Section padding: 64px (mobile), 96px (desktop) vertical spacing
* Grid columns: 12 columns (desktop), 6 columns (tablet), 4 columns (mobile)
* Container max-width: 1280px with auto margins for centering

# 4. Page-by-Page Specifications

## 4.1 Homepage Layout

### 4.1.1 Hero Section

The hero section represents the most critical visual element of the homepage, designed to immediately communicate the platform's value proposition while encouraging user engagement. The section employs a two-column layout on desktop, with the left column containing textual content and the right column featuring visual elements. This asymmetric balance creates visual interest while ensuring the primary message receives appropriate emphasis.

The hero headline "Master AI Engineering in 12 Weeks" uses a sophisticated color treatment where specific words are highlighted in brand colors. "Master" appears in black, "AI" is rendered in deep blue (#1E3A8A), "Engineering" in purple (#6366F1), and "in 12 Weeks" returns to black. This selective color emphasis draws attention to key concepts while maintaining overall readability. The headline is followed by a subheadline that elaborates on the value proposition and includes social proof ("Join 50,000+ engineers").

* Badge component: "NOW ENROLLING: APRIL COHORTS" with lavender background (#E6E6FA), uppercase text, and purple bullet indicator
* Primary CTA: "Explore Programs" button with purple background and white text
* Secondary CTA: "Watch Demo" button with outlined style (transparent background, purple border)
* Statistics row: Three metric cards showing 94% Completion Rate, 89% Placement Rate, 42% Avg. Salary Increase
* Visual element: Abstract AI-themed image with 3D "AI" logo and swirling gradient background
* "Certified" badge overlay: White pill-shaped badge with green checkmark on the image
* Code snippet: Dark navy background box with syntax-highlighted Python code showing OpenAI import

### 4.1.2 Trust Indicators Section

Below the hero section, a horizontal band displays company logos of partner organizations under the heading "TRUSTED BY ENGINEERS AT LEADING TECH COMPANIES." This section builds credibility through association with recognized technology brands. The logos are displayed in grayscale to avoid visual competition with the main content, maintaining a professional and cohesive appearance. This section spans the full width of the container and includes logos for Google, Microsoft, Amazon, Meta, OpenAI, and Anthropic.

### 4.1.3 Features Section ("Why Choose Us")

The features section presents six key differentiators in a responsive grid layout. Each feature card follows a consistent structure: an icon at the top, a bold heading, and a brief description. The section header reads "Everything You Need to Succeed" with a supporting subtitle explaining the target audience. The design uses subtle borders or background differentiation to distinguish cards while maintaining overall cohesion. Features include Live Instruction, Hands-on Projects, Career Support, Industry Certification, Community Access, and Lifetime Materials.

### 4.1.4 Enterprise Section

The enterprise section targets B2B customers with a dedicated block featuring the headline "Train Your Team at Scale." The layout combines a descriptive content area with bullet-pointed benefits alongside statistical highlights. A two-button CTA group includes "Talk to Sales" (primary style) and "Download Brochure" (secondary style). The section uses a differentiated background color or border to visually separate it from adjacent content. Statistics displayed include 200+ Enterprise Clients, 50K+ Engineers Trained, and 94% Completion Rate.

## 4.2 Navigation System

### 4.2.1 Header Navigation

The fixed header navigation provides persistent access to key areas of the site while maintaining visual consistency across all pages. The navigation bar features a white background with subtle shadow or border for separation from content. The layout follows a three-zone structure: logo on the left, primary navigation in the center, and utility actions on the right. This conventional placement pattern ensures intuitive navigation for users familiar with standard web conventions.

The logo area features a purple square icon containing the letters "AI" in white, followed by "Academy" in black text. The primary navigation includes "Courses" (link), "Learning Paths" (dropdown), "Enterprise" (dropdown), and "Resources" (dropdown). Dropdown menus reveal additional options on click with smooth animations. The utility zone contains a search button with keyboard shortcut indicator ("K"), a "Sign In" button, and a prominent "Get Started" button styled with the primary purple color.

* Logo: Purple square (#6366F1) with "AI" text, followed by "Academy" in black
* Navigation items: Gray default state, blue/purple accent on hover or active state
* Dropdown menus: White background with shadow, list-style layout, hover highlights
* Search button: Magnifying glass icon with "K" keyboard shortcut badge
* Get Started button: Purple filled button with white text, rounded corners

### 4.2.2 Command Palette Search

The search functionality implements a command palette pattern triggered by clicking the search button or pressing the "K" key. This modal overlay appears centered on screen with a darkened backdrop behind it. The command palette features a clean white card design with a prominent search input field at the top. The design includes helpful instructions for keyboard navigation (arrows to navigate, Enter to select, ESC to close) and shows a minimum character requirement message ("Type at least 2 characters to search"). This pattern provides a fast, keyboard-accessible search experience that power users expect from modern web applications.

## 4.3 Authentication Pages

### 4.3.1 Sign-In Page

The sign-in page presents a centered authentication form with a clean, focused design that minimizes distractions. The page maintains the site header and footer for navigation consistency while centering the form content in the main area. The form card features a white background with subtle shadow or border definition, creating visual separation from the page background. A large "A" icon (referencing the logo) appears at the top, followed by "Welcome back" heading and a descriptive subtitle.

The form includes email and password fields with clear labels positioned above each input. The password field includes a visibility toggle button (eye icon) allowing users to show or hide their password. A "Forgot password?" link appears below the password field for account recovery. The primary action is a full-width "Sign in" button with purple styling. Below the form, a toggle link allows navigation to the registration page with the text "Don't have an account? Sign up."

1. Email input: Standard text input with placeholder example (e.g., "name@company.com")
2. Password input: Masked input with eye icon toggle for visibility
3. "Forgot password?" link: Subtle styling, positioned right-aligned below password field
4. Sign in button: Full-width, purple background, white text, rounded corners
5. Footer link: "Don't have an account? Sign up" with "Sign up" as clickable link

### 4.3.2 Registration Page

The registration page follows the same layout pattern as the sign-in page but includes additional form fields required for new account creation. The page header reads "Create an account" with subtitle "Join AI Academy and start learning today." The extended form captures all necessary information for account setup while maintaining a streamlined appearance through thoughtful field grouping and consistent styling.

Registration fields include email, username, password, and password confirmation. Each field follows the established input styling with labels above and appropriate placeholder text. Both password fields include visibility toggles for user convenience. A required checkbox for Terms of Service and Privacy Policy agreement appears before the submit button, with inline links to the respective policy documents. The form concludes with a full-width "Create account" button and a link to the sign-in page for existing users.

1. Email input: Standard text input with placeholder "email@example.com"
2. Username input: Standard text input with placeholder "johndoe"
3. Password inputs: Two fields with visibility toggles, masked by default
4. Terms checkbox: "I agree to the Terms of Service and Privacy Policy" with links
5. Create account button: Full-width, purple background, white text, rounded corners

## 4.4 Footer Section

The footer provides comprehensive site navigation, company information, and engagement opportunities. The section uses a light background color (light gray or off-white) to differentiate it from the main content area while maintaining visual cohesion. The footer is organized into multiple columns for different link categories, plus a newsletter subscription area. The design maintains generous padding to create a spacious, organized appearance.

The footer structure includes four main content areas arranged in a responsive grid. The first column displays the logo and company description with a brief mission statement. The second through fourth columns organize links by category: Courses (AI Engineering, Data Science, Cloud Computing, Cybersecurity, DevOps & SRE), Company (About Us, Careers, Blog, Press, Partners), and Resources (Documentation, Community, Help Center, Webinars, Podcast). A newsletter subscription form occupies a prominent position with an email input and submit button.

* Newsletter section: "SUBSCRIBE TO OUR NEWSLETTER" heading, email input with arrow submit button
* Social media icons: Twitter, LinkedIn, GitHub, YouTube with subtle hover states
* Legal links: Privacy Policy, Terms of Service, Cookie Policy, Accessibility
* Copyright notice: "© 2026 AI Academy. All rights reserved."

# 5. UI Component Library

## 5.1 Button Components

The button system provides multiple variants to accommodate different visual hierarchy needs across the interface. All buttons share consistent structural properties including rounded corners (typically 8px radius), appropriate padding for touch targets (minimum 44px height), and clear visual feedback for interactive states. The design system defines three primary button variants: primary, secondary, and outline styles.

| **Button Type** | **Visual Style** | **Use Cases** |
| --- | --- | --- |
| Primary | Purple fill (#6366F1), white text | Main CTAs: Get Started, Explore Programs, Sign In submit |
| Secondary | Transparent fill, purple border, purple text | Alternative actions: Watch Demo, Download Brochure |
| Ghost/Text | No background or border, text only | Navigation links, tertiary actions: Sign In in header |
| Icon Button | Circular or square, icon-only content | Password visibility toggle, search button, close buttons |

*Table 3: Button Component Variants*

## 5.2 Form Components

Form components maintain a consistent design language that prioritizes clarity and ease of use. All input fields feature clearly visible borders, appropriate sizing for touch interaction, and intuitive feedback mechanisms. The form system is designed to minimize user friction while maintaining visual consistency with the overall design system. Labels are positioned above inputs for clear association, and helper text or error messages appear below inputs when needed.

* Text Input: White background, gray border (1-2px), rounded corners (6px), consistent height (40-48px)
* Focus state: Purple border highlight (#6366F1), subtle shadow or ring effect
* Error state: Red border (#EF4444), error message below in red text
* Checkbox: Custom styled with purple check color, 20px size
* Password visibility toggle: Eye icon inside input field on the right

## 5.3 Card Components

Card components serve as containers for related content, providing visual grouping and hierarchy. Cards throughout the site maintain consistent styling including white backgrounds, subtle borders or shadows for depth, and appropriate padding. The card system supports various content types from feature highlights to statistical displays, scaling appropriately while maintaining design consistency. Cards typically include rounded corners (8-12px radius) and subtle drop shadows for a modern, elevated appearance.

## 5.4 Badge and Tag Components

Badge components highlight important information or status indicators throughout the interface. The design system includes several badge variants for different use cases. The enrollment badge uses a lavender background with dark purple text for promotional announcements. Certification badges appear as white pills with green checkmarks to indicate verified status. Statistics badges display large numbers with percentage signs and descriptive labels below. All badges use consistent rounded corners and appropriate sizing relative to their context.

# 6. Responsive Design Requirements

## 6.1 Breakpoint Strategy

The website employs a mobile-first responsive design approach with defined breakpoints for different device categories. This strategy ensures optimal user experience across all device sizes by adapting layouts, component sizes, and interactions to suit each context. The responsive system uses CSS media queries and flexible grid layouts to achieve smooth transitions between breakpoints without jarring layout shifts. Critical content and functionality remain accessible at all sizes, with progressive enhancement for larger screens.

| **Breakpoint** | **Width Range** | **Layout Adaptations** |
| --- | --- | --- |
| Mobile | < 640px | Single column, hamburger menu, stacked hero elements |
| Tablet | 640px - 1024px | Two-column layouts, condensed navigation, adjusted spacing |
| Desktop | > 1024px | Full navigation, multi-column layouts, hero side-by-side |

*Table 4: Responsive Breakpoint Definitions*

## 6.2 Mobile-Specific Adaptations

Mobile layouts require specific adaptations to ensure usability on smaller screens and touch interfaces. The navigation transforms into a hamburger menu accessible via icon tap, with a slide-out drawer or full-screen overlay for menu options. The hero section stacks vertically with text above and image below. Feature cards display as single-column scrollable content. Forms maintain full-width inputs with appropriate touch target sizes (minimum 44px). The footer collapses into a more compact format while maintaining all link accessibility.

# 7. Technical Implementation Requirements

## 7.1 Recommended Technology Stack

The clone should be built using modern web technologies that support component-based architecture, responsive design, and optimal performance. The recommended stack leverages industry-standard tools with strong community support and extensive documentation. This combination enables rapid development while producing maintainable, performant code that matches the quality expectations of the original design.

1. Framework: Next.js 16 with App Router for server components and routing
2. UI Library: React 18+ with TypeScript for type-safe component development
3. Styling: Tailwind CSS 4 for utility-first styling with custom configuration
4. Component Library: shadcn/ui for accessible, customizable base components
5. State Management: React Context or Zustand for global state
6. Form Handling: React Hook Form with Zod for validation
7. Icons: Lucide React for consistent iconography

## 7.2 Performance Requirements

Performance optimization is critical for user experience and search engine ranking. The clone should meet or exceed industry benchmarks for web performance metrics. Key performance indicators include First Contentful Paint (FCP) under 1.8 seconds, Largest Contentful Paint (LCP) under 2.5 seconds, and Cumulative Layout Shift (CLS) under 0.1. These metrics should be measured and validated using tools like Lighthouse and WebPageTest during development and before deployment.

* Image optimization: Next.js Image component for automatic optimization and lazy loading
* Code splitting: Dynamic imports for route-based and component-based splitting
* Font optimization: Next.js font optimization or self-hosted fonts
* Caching: Appropriate cache headers for static assets

## 7.3 Accessibility Requirements

The clone must meet WCAG 2.1 Level AA compliance to ensure accessibility for users with disabilities. This includes proper semantic HTML structure, keyboard navigation support, screen reader compatibility, and sufficient color contrast ratios. All interactive elements must be focusable and operable via keyboard. Images must include appropriate alt text. Form fields must have associated labels. Color should not be the only means of conveying information.

# 8. Recommended Project Structure

A well-organized project structure facilitates maintainability, collaboration, and scalability. The following structure follows Next.js App Router conventions while organizing components and utilities logically. This organization separates concerns clearly, making it easy to locate and modify specific functionality. The structure also supports the component-based architecture recommended for this project.

1. /app - Next.js App Router pages and layouts (page.tsx, layout.tsx)
2. /components - Reusable React components organized by category
3. /components/ui - Base UI components from shadcn/ui
4. /lib - Utility functions, API clients, and shared logic
5. /styles - Global styles and Tailwind configuration
6. /public - Static assets including images and fonts
7. /types - TypeScript type definitions and interfaces

# 9. Acceptance Criteria

## 9.1 Visual Accuracy

The clone must accurately reproduce all visual elements of the original website. Acceptance testing will compare screenshots side-by-side to verify pixel-level accuracy for critical elements. Minor variations in font rendering due to system differences are acceptable, but overall design fidelity must be maintained. The following criteria define acceptable visual accuracy thresholds.

1. Color values match specifications within acceptable tolerance (exact hex values)
2. Typography matches specified font families, sizes, and weights
3. Spacing follows 8px grid system with consistent application
4. Component styling (borders, shadows, rounded corners) matches specifications
5. Layout structure matches original at all breakpoints

## 9.2 Functional Requirements

All interactive elements must function as expected, providing appropriate feedback and navigation. Forms should validate input and display appropriate error messages. Navigation should correctly route to designated pages. Dropdowns should open and close with appropriate animations. The search overlay should respond to keyboard shortcuts and provide search functionality.

* Navigation links route to correct pages
* Dropdown menus open on click with smooth animations
* Search command palette opens with "K" key or button click
* Form validation provides clear feedback for errors
* Password visibility toggles function correctly
* All external links open in new tabs where appropriate

# 10. Appendix

## 10.1 Reference Screenshots

The following screenshots were captured during website evaluation and serve as visual reference for implementation. These images document the actual rendered appearance of the original website and should be consulted during development to verify accuracy. Screenshots include the homepage hero section, full page layout, sign-in page, registration page, search overlay, and dropdown menu examples.

* screenshot-hero.png - Homepage hero section with main CTA and statistics
* screenshot-full.png - Complete homepage layout including all sections
* screenshot-signin-page.png - Authentication sign-in form design
* screenshot-register-page.png - User registration form design
* screenshot-search-overlay.png - Command palette search interface
* screenshot-learning-paths-dropdown.png - Navigation dropdown example

## 10.2 Design Analysis Reports

Detailed design analysis reports generated through AI vision analysis provide comprehensive documentation of visual design elements. These reports include color specifications, typography details, layout observations, and component styling notes extracted from screenshot analysis. The reports supplement this PRD with additional context and specific design observations that may not be fully captured in the specifications above.

* hero-analysis.json - Detailed hero section design analysis
* signin-analysis.json - Sign-in page design analysis
* register-analysis.json - Registration page design analysis
* search-analysis.json - Command palette design analysis
* dropdown-analysis.json - Navigation component analysis