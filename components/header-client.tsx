"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Settings, HelpCircle, DollarSign, Code, LogOut } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface HeaderClientProps {
  userId: string
}

export function HeaderClient({ userId }: HeaderClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="container flex h-14 items-center">
      <div className="flex items-center space-x-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-2 mt-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-white/10",
                  pathname === "/" && "bg-white/10"
                )}
              >
                <DollarSign className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-white/10",
                  pathname === "/settings" && "bg-white/10"
                )}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <Link
                href="/help"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-white/10",
                  pathname === "/help" && "bg-white/10"
                )}
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="hidden md:block">
          <h1 className="text-2xl font-bold tracking-tighter graffiti-font text-white">
            RETAIL ANALYTICS
          </h1>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <Link href="/" className="md:hidden">
          <h1 className="text-xl font-bold tracking-tighter graffiti-font text-white">
            RETAIL ANALYTICS
          </h1>
        </Link>
        <div className="flex items-center space-x-2">
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}