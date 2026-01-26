"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTestimonials, Testimonial } from "@/lib/api/review";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { Quote, ChevronLeft, ChevronRight, Sparkles, Heart, RefreshCw } from "lucide-react";

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      const result = await getTestimonials(9);
      if (result.success && result.testimonials) {
        setTestimonials(result.testimonials);
      }
      setIsLoading(false);
    };
    fetchTestimonials();
  }, []);

  const nextSlide = useCallback(() => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, [testimonials.length]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  const getVisibleTestimonials = () => {
    if (testimonials.length === 0) return [];
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return visible;
  };

  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-background/50">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-foreground/90 font-medium">Community Voices</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              What Our Community
            </span>
            <br />
            <span className="text-foreground">Is Saying</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real reflections from people using MindEase on their wellness journey.
          </p>
        </motion.div>

        <div className="relative group">
          <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-20">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-sm hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-20">
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-sm hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-primary/40" />
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileTap={{ cursor: "grabbing" }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {getVisibleTestimonials().map((testimonial, idx) => (
                  <motion.div
                    key={`${testimonial._id}-${currentIndex}-${idx}`}
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className={`h-full ${idx === 1 ? "hidden md:block" : idx === 2 ? "hidden lg:block" : "block"}`}
                  >
                    <div className="h-full p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 shadow-sm flex flex-col relative pointer-events-none select-none">
                      <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/5" />
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {testimonial.authorLabel?.charAt(0) || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground/90 leading-none mb-1.5">
                            {testimonial.authorLabel}
                          </span>
                          {testimonial.rating && (
                            // CHANGED: "xs" to "sm" to resolve the TypeScript error
                            <StarRatingDisplay rating={testimonial.rating} size="sm" />
                          )}
                        </div>
                      </div>

                      <blockquote className="flex-1">
                        <p className="text-sm md:text-[15px] leading-relaxed text-muted-foreground italic">
                          "{testimonial.text}"
                        </p>
                      </blockquote>

                      <div className="mt-4 pt-4 border-t border-border/30 flex justify-end">
                        <Sparkles className="w-3.5 h-3.5 text-primary/20" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center gap-1.5 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/20"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}