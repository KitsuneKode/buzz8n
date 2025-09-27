import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@buzz8n/ui/components/accordion"
import { Badge } from "@buzz8n/ui/components/badge"

const faqs = [
  {
    question: "Can I self-host Buzz8n?",
    answer: "Yes! Buzz8n offers both cloud and self-hosted deployment options. Our self-hosted version gives you complete control over your data and infrastructure while maintaining all the features of our cloud offering.",
  },
  {
    question: "How secure are my credentials and data?",
    answer: "Security is our top priority. All credentials are encrypted at rest using AES-256 encryption. API keys and sensitive data are stored in our secure credential vault with role-based access controls. We are SOC 2 Type II compliant and undergo regular security audits.",
  },
  {
    question: "What are the rate limits for API calls?",
    answer: "Rate limits depend on your plan and the specific integration. Community plans have generous limits for getting started, while Pro plans include higher limits and priority queuing. We also support custom rate limiting for enterprise customers.",
  },
  {
    question: "How long are execution logs retained?",
    answer: "Execution logs are retained for 30 days on Community plans and 90 days on Pro plans. Enterprise customers can configure custom retention periods. All logs include detailed execution traces, error messages, and performance metrics.",
  },
  {
    question: "Can I use on-premise vector databases?",
    answer: "Absolutely! Buzz8n supports connections to self-hosted vector databases including Pinecone, Weaviate, Qdrant, and Chroma. You can also connect to databases running in your private cloud or on-premise infrastructure.",
  },
  {
    question: "What's on the roadmap?",
    answer: "We are constantly adding new features based on user feedback. Upcoming releases include advanced workflow templates, more AI provider integrations, enhanced monitoring dashboards, and workflow marketplace for sharing templates.",
  },
]

export function FAQ() {
  return (
    <section className="py-20 md:py-28 bg-slate-950/50">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 mb-4">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Buzz8n. Cannot find what you are looking for?
            <a href="/contact" className="text-cyan-400 hover:text-cyan-300 ml-1">
              Contact our team
            </a>
            .
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-slate-900/50 border border-white/10 rounded-lg px-6 data-[state=open]:bg-slate-900/70"
              >
                <AccordionTrigger className="text-slate-100 hover:text-cyan-400 text-left py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-slate-400">
            <span>Still have questions?</span>
            <a 
              href="/docs" 
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Check our docs →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
