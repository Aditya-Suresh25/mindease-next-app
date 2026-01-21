"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTestimonials, Testimonial } from "@/lib/api/review";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { Quote, Heart, RefreshCw, Sparkles } from "lucide-react";

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedTestimonials, setDisplayedTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      const result = await getTestimonials(9);
      if (result.success && result.testimonials) {
        setTestimonials(result.testimonials);
        // Initially show first 3
        setDisplayedTestimonials(result.testimonials.slice(0, 3));
      }
      setIsLoading(false);
    };

    fetchTestimonials();
  }, []);

  // Rotate testimonials every 10 seconds if we have more than 3
  useEffect(() => {
    if (testimonials.length <= 3) return;

    const interval = setInterval(() => {
      setDisplayedTestimonials((current) => {
        // Get the next set of 3 testimonials
        const currentStartIndex = testimonials.findIndex(
          (t) => t._id === current[0]?._id
        );
        const nextStartIndex = (currentStartIndex + 3) % testimonials.length;
        
        // Handle wrap-around
        const nextSet: Testimonial[] = [];
        for (let i = 0; i < 3 && i < testimonials.length; i++) {
          const index = (nextStartIndex + i) % testimonials.length;
          nextSet.push(testimonials[index]);
        }
        
        return nextSet;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [testimonials]);

  // Don't render section if no testimonials
  if (!isLoading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -top-32 -right-32" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl bottom-0 left-0" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-foreground/90">Community Voices</span>
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
            These are shared with consent and displayed anonymously.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-8 h-8 text-primary/50" />
            </motion.div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {displayedTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative"
                >
                  {/* Animated glow effect */}
                  <motion.div 
                    className="absolute -inset-px bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  />
                  
                  <div className="relative p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/25 transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-lg hover:shadow-primary/5">
                    {/* Quote Icon with subtle animation */}
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Quote className="w-5 h-5 text-primary" />
                    </motion.div>

                    {/* Star Rating (if available) */}
                    {testimonial.rating && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                        className="mb-3"
                      >
                        <StarRatingDisplay rating={testimonial.rating} size="sm" />
                      </motion.div>
                    )}

                    {/* Testimonial Text */}
                    <blockquote className="flex-1">
                      <p className="text-foreground/90 text-sm leading-relaxed italic">
                        "{testimonial.text}"
                      </p>
                    </blockquote>

                    {/* Author */}
                    <div className="mt-6 pt-4 border-t border-primary/10 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        — {testimonial.authorLabel}
                      </p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.15 + 0.3 }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary/40" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Indicator Dots (if more than 3 testimonials) */}
        {testimonials.length > 3 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => {
              const isActive = displayedTestimonials[0]?._id === testimonials[i * 3]?._id;
              return (
                <button
                  key={i}
                  onClick={() => {
                    const startIndex = i * 3;
                    const nextSet: Testimonial[] = [];
                    for (let j = 0; j < 3 && startIndex + j < testimonials.length; j++) {
                      nextSet.push(testimonials[startIndex + j]);
                    }
                    setDisplayedTestimonials(nextSet);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? "w-6 bg-primary" 
                      : "bg-primary/30 hover:bg-primary/50"
                  }`}
                  aria-label={`Show testimonials ${i * 3 + 1} to ${Math.min((i + 1) * 3, testimonials.length)}`}
                />
              );
            })}
          </div>
        )}

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          All testimonials are shared voluntarily with user consent. 
          Names are anonymized to protect privacy.
        </motion.p>
      </div>
    </section>
  );
}
