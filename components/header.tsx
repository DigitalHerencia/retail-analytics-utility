"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Settings, HelpCircle, DollarSign, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { id: "pricing", href: "/pricing", label: "PRICING", icon: <DollarSign className="h-5 w-5" /> },
    { id: "settings", href: "/settings", label: "SETTINGS", icon: <Settings className="h-5 w-5" /> },
    { id: "help", href: "/help", label: "HELP", icon: <HelpCircle className="h-5 w-5" /> },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent bg-black">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-accent">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-black border-accent p-0 w-[300px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-accent font-graffiti">Hustlers Code</h2>
                  <p className="text-sm text-accent/70">STACK PAPER. STAY SMART.</p>
                </div>

                <nav className="flex-1 overflow-auto">
                  <ul className="px-2 py-4 space-y-1">
                    {menuItems.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium gangster-font",
                            pathname === item.href
                              ? "bg-accent text-accent-foreground"
                              : "text-accent/70 hover:text-accent hover:bg-accent/10",
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.icon}
                          <span className="ml-3">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="p-6 border-t border-accent">
                  <div className="text-xs text-accent/50 pt-2">
                    <p>Hustlers Code v1.0</p>
                    <p>© 2025 Hustlers Code</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-accent font-graffiti">
            <Code className="h-6 w-6 text-accent" />
            Hustlers Code
          </Link>
        </div>
      </div>
    </header>
  )
}
