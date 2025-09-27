import { ArrowRight, BookOpen } from "lucide-react"

import { Button } from "@buzz8n/ui/components/button"

export function CTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-cyan-400/5 to-cyan-400/10 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-transparent rounded-2xl" />
          
          <div className="relative text-center py-16 px-8">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-100 mb-6 leading-tight">
              Ready to build your first{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                agent workflow
              </span>
              ?
            </h2>
            
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of teams already automating their workflows with AI agents. 
              Start building in minutes, no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold px-8 py-6 text-lg h-auto"
              >
                Open Builder
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-slate-100 hover:bg-white/5 px-8 py-6 text-lg h-auto"
                asChild
              >
                <a href="/docs">
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Docs
                </a>
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-slate-500">
              Free tier • No credit card required • 2 minute setup
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-400/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-cyan-400/3 rounded-full blur-2xl" />
        </div>
      </div>
    </section>
  )
}
