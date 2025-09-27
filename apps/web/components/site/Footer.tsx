'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Brain, 
  Zap, 
  ArrowRight,
  Sparkles,
  Globe,
  Shield,
  Rocket
} from "lucide-react"
import { Button } from "@buzz8n/ui/components/button"
import { Badge } from "@buzz8n/ui/components/badge"
import { Separator } from "@buzz8n/ui/components/separator"

const footerSections = {
  "AI Platform": [
    { name: "AI Features", href: "#features", icon: <Brain className="w-3 h-3" /> },
    { name: "Workflow Builder", href: "#demo", icon: <Zap className="w-3 h-3" /> },
    { name: "Intelligence Hub", href: "#showcase", icon: <Sparkles className="w-3 h-3" /> },
    { name: "AI Pricing", href: "#pricing", icon: <Rocket className="w-3 h-3" /> },
  ],
  Resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API Reference", href: "/docs/api" },
    { name: "AI Examples", href: "/examples" },
    { name: "Community", href: "/community" },
    { name: "Changelog", href: "/changelog" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "AI Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
    { name: "Partners", href: "/partners" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Security", href: "/security" },
    { name: "Status", href: "/status" },
    { name: "GDPR", href: "/gdpr" },
  ],
}

const socialLinks = [
  { name: "GitHub", href: "https://github.com", icon: Github },
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { name: "Email", href: "mailto:hello@buzz8n.com", icon: Mail },
]

const features = [
  { name: "99.9% Uptime", icon: <Shield className="w-4 h-4" /> },
  { name: "SOC 2 Compliant", icon: <Shield className="w-4 h-4" /> },
  { name: "Global CDN", icon: <Globe className="w-4 h-4" /> },
  { name: "24/7 AI Support", icon: <Brain className="w-4 h-4" /> },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.7214_0.1337_49.9802/0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.594_0.0443_196.0233/0.05),transparent_50%)]" />
      
      <div className="relative container mx-auto px-4 py-16">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Stay Updated
            </Badge>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Get AI Workflow Updates
            </h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for the latest AI features, workflow templates, and industry insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative">
                  <Brain className="h-8 w-8 text-primary" />
                  <Zap className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="text-xl font-bold text-foreground">Buzz8n</span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The most intelligent workflow builder powered by AI. Create, optimize, and scale your processes with artificial intelligence.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-3 mb-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.div
                      key={social.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-card border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/20 transition-all duration-200"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">{social.name}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-2 text-xs text-muted-foreground"
                  >
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                    <span>{feature.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Sections */}
          {Object.entries(footerSections).map(([title, links], sectionIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2">
                {title === "AI Platform" && <Brain className="w-4 h-4 text-primary" />}
                <span>{title}</span>
              </h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: linkIndex * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      {'icon' in link && link.icon}
                      <span>{link.name}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <Separator className="mb-8 bg-border" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0"
        >
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-muted-foreground">
            <p>&copy; 2024 Buzz8n. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>All systems operational</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select className="bg-card border border-border rounded-lg px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
            </select>
            
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
