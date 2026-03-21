/**
 * CoursesPage Component
 *
 * Full courses listing page with filtering, search, and pagination
 * Phase 5A - Task 5A.3
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Star, Clock, Users, AlertCircle } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
import { Course, CourseFilters } from "@/types/course";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { staggerContainer, fadeUpItem } from "@/lib/animations";

export function CoursesPage() {
  const [filters, setFilters] = useState<CourseFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categoriesData } = useCategories();
  const { data: coursesData, isLoading, isError } = useCourses({
    ...filters,
    search: searchQuery || undefined,
    ordering: sortBy === "price_low" ? "price" : sortBy === "price_high" ? "-price" : sortBy === "rating" ? "-rating" : undefined,
  });

  const categories = categoriesData?.data.results || [];
  const courses: Course[] = coursesData?.data.results || [];

  // Handle category filter
  const handleCategoryClick = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory(null);
      setFilters({ ...filters, category: undefined });
    } else {
      setSelectedCategory(slug);
      setFilters({ ...filters, category: slug });
    }
  };

  // Parse price for display
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="section-padding bg-[var(--color-background)] min-h-screen">
        <div className="max-w-[1140px] mx-auto px-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Category Pills Skeleton */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-28" />
            ))}
          </div>

          {/* Course Grid Skeleton */}
          <div data-testid="courses-loading" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] overflow-hidden">
                <Skeleton className="aspect-video" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="section-padding bg-[var(--color-background)] min-h-screen">
        <div className="max-w-[1140px] mx-auto px-6">
          <Alert variant="destructive" data-testid="courses-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load courses. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <div className="section-padding bg-[var(--color-background)] min-h-screen">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
              All Courses
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Browse our comprehensive selection of AI and technology courses
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? "bg-[var(--color-primary-600)] text-white"
                    : "bg-white border border-[var(--color-border)] text-[var(--text-secondary)] hover:border-[var(--color-primary-600)]"
                }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-70">({category.course_count})</span>
              </button>
            ))}
          </div>

          {/* Empty Message */}
          <div data-testid="courses-empty" className="text-center py-20">
            <p className="text-xl text-[var(--text-secondary)] mb-4">
              No courses found
            </p>
            <p className="text-[var(--text-tertiary)]">
              Try adjusting your filters or search query
            </p>
            {selectedCategory && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedCategory(null);
                  setFilters({});
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="section-padding bg-[var(--color-background)] min-h-screen"
    >
      <div className="max-w-[1140px] mx-auto px-6">
        {/* Header */}
        <motion.div variants={fadeUpItem} className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
            All Courses
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Browse our comprehensive selection of AI and technology courses
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={fadeUpItem} className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <span className="text-sm">Sort by</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Category Pills */}
        <motion.div variants={fadeUpItem} className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.slug
                  ? "bg-[var(--color-primary-600)] text-white"
                  : "bg-white border border-[var(--color-border)] text-[var(--text-secondary)] hover:border-[var(--color-primary-600)]"
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-70">({category.course_count})</span>
            </button>
          ))}
        </motion.div>

        {/* Course Count */}
        <motion.div variants={fadeUpItem} className="mb-6 text-sm text-[var(--text-tertiary)]">
          Showing {courses.length} course{courses.length !== 1 ? "s" : ""}
        </motion.div>

        {/* Course Grid */}
        <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div key={course.id} variants={fadeUpItem}>
              <Link to={`/courses/${course.slug}`}>
                <div className="group bg-white border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary-600)] transition-colors h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {course.is_featured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-[var(--color-amber-500)] text-white text-xs font-semibold label-mono">
                          Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 bg-[var(--color-primary-600)]/90 text-white text-xs font-medium">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 flex-1">
                      {course.subtitle}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)] mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrolled_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[var(--color-amber-400)] text-[var(--color-amber-400)]" />
                        {course.rating} ({course.review_count.toLocaleString()})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border)]">
                      <span className="text-xl font-bold text-[var(--color-primary-600)]">
                        {formatPrice(course.price)}
                      </span>
                      {course.compare_at_price && parseFloat(course.compare_at_price) > parseFloat(course.price) && (
                        <span className="text-sm text-[var(--text-tertiary)] line-through">
                          {formatPrice(course.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
