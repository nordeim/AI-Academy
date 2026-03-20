import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { TrustSignals } from "@/sections/TrustSignals";
import { CourseCategories } from "@/sections/CourseCategories";
import { Features } from "@/sections/Features";
import { FeaturedCourse } from "@/sections/FeaturedCourse";
import { TrainingSchedule } from "@/sections/TrainingSchedule";
import { ConsultingCTA } from "@/sections/ConsultingCTA";

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navigation />
      <main>
        <Hero />
        <TrustSignals />
        <CourseCategories />
        <Features />
        <FeaturedCourse />
        <TrainingSchedule />
        <ConsultingCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
