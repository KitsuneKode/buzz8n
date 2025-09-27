import { Badge } from "@buzz8n/ui/components/badge"

const trustedCompanies = [
  "OpenAI",
  "Anthropic", 
  "Pinecone",
  "Supabase",
  "Vercel",
  "GitHub",
  "Slack",
  "Discord"
]

export function TrustBar() {
  return (
    <section className="py-16 border-b border-white/5">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="text-center mb-12">
          <p className="text-sm text-slate-400 uppercase tracking-wide font-medium">
            Trusted by teams using
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          {trustedCompanies.map((company) => (
            <Badge
              key={company}
              variant="secondary"
              className="bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 transition-colors px-4 py-2 text-sm font-medium"
            >
              {company}
            </Badge>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            Integrates seamlessly with your existing tools and workflows
          </p>
        </div>
      </div>
    </section>
  )
}
