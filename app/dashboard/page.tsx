"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState,useEffect } from "react"

export default function DashboardPage(){

    const [currentTime,setCurrentTime] = useState(new Date());

    useEffect(()=>{
        const timer = setInterval(()=> setCurrentTime(new Date()),1000);
        return () => clearInterval(timer); //cleanup
    },[])

    return(
        <div className="min-h-screen bg-background p-8">
            <Container className="pt-20 pb-8 space-y-6">
                <div className="flex flex-col gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                    >
                        <h1 className="text-3xl font-bold">Welcome back</h1>
                        <p className="text-muted-foreground text-sm">{currentTime.toLocaleDateString("en-IN",{
                            weekday:"long",
                            month: "long",
                            day:"numeric",
                        })}</p>
                    </motion.div>
                </div>

                {/* main grid layout */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <Card className="border-primary/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" /> {/* Issue 1: Missing closing tag fixed */}
                            <CardContent className="p-6 relative">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-primary"/>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">Quick Actions</h3>
                                            <p className="text-sm text-muted-foreground">Start your wellness journey</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
}