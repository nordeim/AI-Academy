/**
 * SearchDialog Component
 *
 * Global search for courses using Command palette pattern
 * Phase 5C - Task 5C.1
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, GraduationCap } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import type { Course } from "@/types/course";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Fetch courses when query changes
  const { data, isLoading } = useCourses(
    debouncedQuery.length >= 2
      ? { search: debouncedQuery, page: 1, page_size: 10 }
      : undefined
  );

  const courses: Course[] = Array.isArray(data?.data) ? data.data : [];

  // Handle keyboard shortcut (CMD+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  // Handle course selection
  const handleSelect = useCallback(
    (course: Course) => {
      onOpenChange(false);
      setQuery("");
      navigate(`/courses/${course.slug}`);
    },
    [navigate, onOpenChange]
  );

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Search Courses</DialogTitle>
      <DialogDescription className="sr-only">
        Search for courses by name, category, or description
      </DialogDescription>
      <CommandInput
        placeholder="Search courses... (type at least 2 characters)"
        value={query}
        onValueChange={setQuery}
        className="border-none focus:ring-0"
        onInput={(e) => {
          // Fallback: capture input changes directly
          const value = (e.target as HTMLInputElement).value;
          if (value !== query) {
            setQuery(value);
          }
        }}
        onChange={(e) => {
          // Additional fallback: capture change events
          const value = (e.target as HTMLInputElement).value;
          if (value !== query) {
            setQuery(value);
          }
        }}
      />
      <CommandList className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {query.length < 2 ? (
            <CommandEmpty key="empty-short">
              <div className="py-6 text-center">
                <Search className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)]" />
                <p className="text-sm text-[var(--text-secondary)]">
                  Type at least 2 characters to search
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Press ESC to close
                </p>
              </div>
            </CommandEmpty>
          ) : isLoading ? (
            <CommandEmpty key="loading">
              <div className="py-6 text-center">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-[var(--color-primary-600)]" />
                <p className="text-sm text-[var(--text-secondary)]">
                  Searching...
                </p>
              </div>
            </CommandEmpty>
          ) : courses.length === 0 ? (
            <CommandEmpty key="no-results">
              <div className="py-6 text-center">
                <X className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)]" />
                <p className="text-sm text-[var(--text-secondary)]">
                  No courses found
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Try different keywords
                </p>
              </div>
            </CommandEmpty>
          ) : (
            <CommandGroup key="results" heading={`${courses.length} courses found`}>
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CommandItem
                    onSelect={() => handleSelect(course)}
                    className="flex items-start gap-3 p-3 cursor-pointer hover:bg-[var(--color-surface-alt)] aria-selected:bg-[var(--color-surface-alt)]"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden bg-[var(--color-surface-alt)]">
                      <img
                        src={course.thumbnail || undefined}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-[var(--text-primary)] truncate">
                          {course.title}
                        </p>
                        {course.is_featured && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 bg-[var(--color-amber-500)]/10 text-[var(--color-amber-500)] text-[10px] font-medium rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {course.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-tertiary)]">
                        <span>{course.level}</span>
                        <span>•</span>
                        <span>{course.duration_weeks} weeks</span>
                        <span>•</span>
                        <span>${parseInt(course.price).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="flex-shrink-0">
                      <span className="px-2 py-1 bg-[var(--color-surface-alt)] text-[var(--text-secondary)] text-xs rounded">
                        {course.categories?.[0]?.name || 'General'}
                      </span>
                    </div>
                  </CommandItem>
                </motion.div>
              ))}
            </CommandGroup>
          )}
        </AnimatePresence>
      </CommandList>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--color-border)] text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-alt)] rounded border">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-alt)] rounded border">↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-alt)] rounded border">↵</kbd>
            to select
          </span>
        </div>
        <div className="flex items-center gap-1">
          <GraduationCap className="w-3 h-3" />
          AI Academy Search
        </div>
      </div>
    </CommandDialog>
  );
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
