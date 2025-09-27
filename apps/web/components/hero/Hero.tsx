"use client"

import * as React from "react"
import { ArrowRight, Play } from "lucide-react"

import { Button } from "@buzz8n/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@buzz8n/ui/components/dialog"
import { EditorMock } from "../sections/EditorMock"

export function Hero() {
  const [showPreview, setShowPreview] = React.useState(false)

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-cyan-400/5" />
      
      <div className="container mx-auto max-w-[1200px] px-4 text-center relative">
        <div className="max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-100 mb-6 leading-tight">
            Build agent workflows{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
              visually
            </span>
            .
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            Orchestrate AI agents, tools, and APIs with a drag-and-connect editor.
            No code required—just connect, configure, and deploy.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold px-8 py-6 text-lg h-auto"
            >
              Start free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-slate-100 hover:bg-white/5 px-8 py-6 text-lg h-auto"
                >
                  <Play className="mr-2 h-5 w-5" />
                  See a sample workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-slate-950 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-slate-100 text-xl">
                    Sample Agent Workflow
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <EditorMock showToolbar={true} />
                  <div className="mt-4 text-sm text-slate-400">
                    This workflow demonstrates a typical agent orchestration: webhook trigger → 
                    GPT-4 processing → parallel tool execution → conditional branching → output delivery.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Visual indicator */}
          <div className="flex justify-center">
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/3 rounded-full blur-3xl" />
    </section>
  )
}
