"use client"

import * as React from "react"
import { Check, Zap } from "lucide-react"

import { Button } from "@buzz8n/ui/components/button"
import { Badge } from "@buzz8n/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@buzz8n/ui/components/card"
import { Switch } from "@buzz8n/ui/components/switch"
import { Label } from "@buzz8n/ui/components/label"

const plans = {
  community: {
    name: "Community",
    description: "Perfect for getting started with agent workflows",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 3 workflows",
      "100 executions/month", 
      "Basic integrations",
      "Community support",
      "Public workflow sharing",
    ],
    cta: "Start free",
    popular: false,
  },
  pro: {
    name: "Pro",
    description: "For teams building production agent workflows",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      "Unlimited workflows",
      "10,000 executions/month",
      "All integrations",
      "Priority support", 
      "Private workflows",
      "Team collaboration",
      "Advanced monitoring",
      "Custom environments",
    ],
    cta: "Start Pro trial",
    popular: true,
  },
}

export function Pricing() {
  const [isYearly, setIsYearly] = React.useState(false)

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Start free, scale as you grow. No hidden fees, no vendor lock-in.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <Label htmlFor="billing-toggle" className="text-slate-400">
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className="text-slate-400">
              Yearly
            </Label>
            {isYearly && (
              <Badge variant="secondary" className="bg-green-400/10 text-green-400 border-green-400/20 ml-2">
                -20% yearly
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => (
            <Card 
              key={key}
              className={`relative bg-slate-900/50 border-white/10 hover:bg-slate-900/70 transition-all duration-200 ${
                plan.popular ? 'ring-2 ring-cyan-400/20 border-cyan-400/30' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-cyan-400 text-slate-950 font-semibold px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-slate-100 text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-slate-400">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-slate-100">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-400 ml-1">/month</span>
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <div className="text-sm text-slate-500 mt-1">
                      ${plan.monthlyPrice}/month billed monthly
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/20'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400 mb-4">
            Need more executions or custom features?
          </p>
          <Button variant="outline" className="border-white/20 text-slate-100 hover:bg-white/5">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  )
}
