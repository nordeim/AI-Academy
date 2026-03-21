import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { TrustSignals } from "@/sections/TrustSignals";
import { CourseCategories } from "@/sections/CourseCategories";
import { Features } from "@/sections/Features";
import { FeaturedCourse } from "@/sections/FeaturedCourse";
import { TrainingSchedule } from "@/sections/TrainingSchedule";
import { ConsultingCTA } from "@/sections/ConsultingCTA";
import { CoursesPage } from "@/pages/CoursesPage";
import { CourseDetailPage } from "@/pages/CourseDetailPage";

// HomePage component with existing sections
function HomePage() {
  return (
    <>
      <Hero />
      <TrustSignals />
      <CourseCategories />
      <Features />
      <FeaturedCourse />
      <TrainingSchedule />
      <ConsultingCTA />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
