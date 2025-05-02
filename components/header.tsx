"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Settings, HelpCircle, DollarSign, Code, LogOut } from "lucide-react"
import { UserButton, useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const menuItems = [
    { id: "pricing", href: "/pricing", label: "PRICING", icon: <DollarSign className="h-5 w-5" /> },
    { id: "settings", href: "/settings", label: "SETTINGS", icon: <Settings className="h-5 w-5" /> },
    { id: "help", href: "/help", label: "HELP", icon: <HelpCircle className="h-5 w-5" /> },
  ]

  const handleLogout = () => {
    // Use the dedicated sign-out page instead of direct signOut
    router.push('/sign-out');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white bg-black">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white font-graffiti">
          <Code className="h-6 w-6 text-white" />
          Hustlers Code
        </Link>
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6 text-white" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black border-white p-0 w-[300px] text-white">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white font-graffiti">Hustlers Code</h2>
                  <p className="text-sm text-white/70">STACK PAPER. STAY SMART.</p>
                </div>

                <nav className="flex-1 overflow-auto">
                  <ul className="px-2 py-4 space-y-1">
                    {menuItems.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium gangster-font text-white",
                            pathname === item.href
                              ? "bg-white text-black"
                              : "text-white/70 hover:text-white hover:bg-white/10"
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

                <div className="p-6 border-t border-white">
                  {isLoaded && user ? (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={handleLogout}
                        className="w-full bg-white text-black hover:bg-white/80 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        SIGN OUT
                      </button>
                    </div>
                  ) : (
                    <Link href="/sign-in">
                      <Button className="w-full bg-white text-black hover:bg-white/80">SIGN IN</Button>
                    </Link>
                  )}
                  <div className="text-xs text-white/50 pt-2">
                    <p>Hustlers Code v1.0</p>
                    <p>© 2025 Hustlers Code</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
