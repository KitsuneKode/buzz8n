"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Github } from "lucide-react"

import { Button } from "@buzz8n/ui/components/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@buzz8n/ui/components/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@buzz8n/ui/components/sheet"
import { cn } from "@buzz8n/ui/lib/utils"

const navigationItems = [
  { name: "Product", href: "#features" },
  { name: "How it works", href: "#how-it-works" },
  { name: "Integrations", href: "#integrations" },
  { name: "Pricing", href: "#pricing" },
  { name: "Docs", href: "/docs" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto max-w-[1200px] flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600" />
            <span className="text-xl font-bold text-slate-100">Buzz8n</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    href={item.href}
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-100 focus:text-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    )}
                  >
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Link>
          </Button>
          <Button size="sm" className="bg-cyan-400 hover:bg-cyan-300 text-slate-950">
            Open Builder
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-slate-950 border-white/10">
            <div className="flex flex-col space-y-4 mt-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 hover:text-slate-100 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Link>
                </Button>
                <Button size="sm" className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950">
                  Open Builder
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
