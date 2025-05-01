"use client"

import { useState, useEffect } from "react"
import { Save, Download, Trash2, Check, AlertCircle, Shield, Database, Palette } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { saveData, getSavedDataList, loadData, deleteData } from "@/app/actions"
import type { BusinessData, InventoryItem, Customer } from "@/lib/data"
import { HustleTip } from "@/components/hustle-tip"
import { useTheme } from "next-themes"

// Define accent color options
const accentColors = {
  gold: { accent: "43 77% 52%", foreground: "0 0% 0%" }, // Original Gold
  blood: { accent: "0 100% 27%", foreground: "0 0% 98%" }, // Blood Red
  steel: { accent: "220 13% 47%", foreground: "0 0% 98%" }, // Steel Blue
  money: { accent: "120 30% 56%", foreground: "0 0% 0%" }, // Money Green
}

type AccentColorName = keyof typeof accentColors

interface SettingsTabProps {
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  onDataLoaded: (businessData: BusinessData, inventory: InventoryItem[], customers: Customer[]) => void
}

interface SavedFile {
  id: string
  url: string
  pathname: string
  uploadedAt: string
}

export default function SettingsTab({ businessData, inventory, customers, onDataLoaded }: SettingsTabProps) {
  const [saveName, setSaveName] = useState("")
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  const [selectedAccent, setSelectedAccent] = useState<AccentColorName>("gold") // Default to gold

  // Load saved files list
  const loadSavedFiles = async () => {
    setIsLoading(true)
    const result = await getSavedDataList()
    setIsLoading(false)

    if (result.success) {
      setSavedFiles(result.files)
    }
  }

  useEffect(() => {
    loadSavedFiles()
  }, [])

  // Effect to apply the selected accent color
  useEffect(() => {
    const root = document.documentElement
    const color = accentColors[selectedAccent]

    // Core accent colors
    root.style.setProperty("--accent", color.accent)
    root.style.setProperty("--accent-foreground", color.foreground)

    // Apply accent to primary elements
    root.style.setProperty("--primary", color.accent)
    root.style.setProperty("--primary-foreground", color.foreground)

    // Apply accent to ring/focus elements
    root.style.setProperty("--ring", color.accent)

    // Apply accent to border elements
    root.style.setProperty("--border", color.accent)

    // Apply accent to sidebar elements
    root.style.setProperty("--sidebar-accent", color.accent)
    root.style.setProperty("--sidebar-accent-foreground", color.foreground)
    root.style.setProperty("--sidebar-primary", color.accent)
    root.style.setProperty("--sidebar-primary-foreground", color.foreground)
    root.style.setProperty("--sidebar-ring", color.accent)
    root.style.setProperty("--sidebar-border", color.accent)

    // Apply accent to chart colors (optional, can be customized further)
    root.style.setProperty("--chart-1", color.accent)
  }, [selectedAccent])

  // Handle save data
  const handleSaveData = async () => {
    if (!saveName.trim()) {
      setMessage({ type: "error", text: "Enter a name for your save" })
      return
    }

    setIsLoading(true)
    const result = await saveData(saveName, businessData, inventory, customers)
    setIsLoading(false)

    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setSaveName("")
      setIsSaveDialogOpen(false)
      loadSavedFiles()
    } else {
      setMessage({ type: "error", text: result.message })
    }
  }

  // Handle load data
  const handleLoadData = async (url: string) => {
    setIsLoading(true)
    const result = await loadData(url)
    setIsLoading(false)

    if (result.success && result.data) {
      onDataLoaded(result.data.businessData, result.data.inventory, result.data.customers)
      setMessage({ type: "success", text: result.message })
      setIsLoadDialogOpen(false)
    } else {
      setMessage({ type: "error", text: result.message })
    }
  }

  // Handle delete data
  const handleDeleteData = async (pathname: string) => {
    setIsLoading(true)
    const result = await deleteData(pathname)
    setIsLoading(false)

    if (result.success) {
      setMessage({ type: "success", text: result.message })
      loadSavedFiles()
    } else {
      setMessage({ type: "error", text: result.message })
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-accent border-2 text-center">
          <h1 className="text-4xl font-bold text-accent gangster-font text-shadow">SETTINGS</h1>
          <p className="text-white/80 mt-1">SECURE YOUR DATA. PROTECT YOUR EMPIRE.</p>
        </div>

        <div className="mt-6">
          <HustleTip title="DATA SECURITY">
            <p>Back up your business data regularly. Smart hustlers never lose track of their numbers.</p>
          </HustleTip>
        </div>
      </div>

      {message && (
        <Alert
          variant={message.type === "success" ? "default" : "destructive"}
          className={`mb-4 card-sharp ${
            message.type === "success" ? "bg-accent/10 text-accent border-accent/20" : "bg-blood/10 text-blood border-blood/20"
          }`}
        >
          {message.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle className="gangster-font">{message.type === "success" ? "SUCCESS" : "ERROR"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Accent Color Selection Card */}
      <Card className="card-hover card-sharp border-accent">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gangster-font text-accent">
              <Palette className="h-5 w-5 mr-2 text-accent" />
              ACCENT COLOR
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose an accent color to customize the look.
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(accentColors) as AccentColorName[]).map((colorName) => (
                <Button
                  key={colorName}
                  variant={selectedAccent === colorName ? "default" : "outline"}
                  onClick={() => setSelectedAccent(colorName)}
                  className={`button-sharp capitalize ${selectedAccent === colorName ? 'bg-accent text-accent-foreground' : 'border-accent text-accent'}`}
                >
                  {colorName}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover card-sharp border-accent">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gangster-font text-accent">
              <Database className="h-5 w-5 mr-2 text-accent" />
              DATA MANAGEMENT
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground button-sharp">
                    <Save className="mr-2 h-4 w-4" /> SAVE DATA
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-smoke border-accent card-sharp">
                  <DialogHeader>
                    <DialogTitle className="gangster-font text-accent">SAVE YOUR DATA</DialogTitle>
                    <DialogDescription>
                      Enter a name to identify this save. This will secure your current business data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="saveName" className="gangster-font">
                        SAVE NAME
                      </Label>
                      <Input
                        id="saveName"
                        placeholder="My Business Data"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        className="input-sharp"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSaveData}
                      disabled={isLoading}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground button-sharp"
                    >
                      {isLoading ? "SAVING..." : "SAVE DATA"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full button-sharp" variant="outline">
                    <Download className="mr-2 h-4 w-4" /> LOAD DATA
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-smoke border-accent card-sharp">
                  <DialogHeader>
                    <DialogTitle className="gangster-font text-accent">LOAD SAVED DATA</DialogTitle>
                    <DialogDescription>
                      Select a previously saved file to load. This will replace your current data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">LOADING DATA...</p>
                      </div>
                    ) : savedFiles.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">NO SAVED DATA FOUND</p>
                    ) : (
                      savedFiles.map((file) => (
                        <Card key={file.id} className="overflow-hidden card-hover card-sharp border-accent">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium gangster-font">SAVE #{file.id.substring(0, 8)}</h4>
                                <p className="text-sm text-muted-foreground">{file.uploadedAt}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleLoadData(file.url)}
                                  disabled={isLoading}
                                  className="bg-accent/20 text-accent hover:bg-accent/30 border-none button-sharp"
                                >
                                  LOAD
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteData(file.pathname)}
                                  disabled={isLoading}
                                  className="bg-blood/20 text-blood hover:bg-blood/30 border-none button-sharp"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover card-sharp border-accent">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gangster-font text-accent">
              <Shield className="h-5 w-5 mr-2 text-accent" />
              ABOUT
            </h3>
            <p className="text-sm text-muted-foreground">
              Hustle Calculator helps you maximize profits, track inventory, and collect debts. Stay on top of your
              business and keep your money right.
            </p>
            <div className="flex items-center justify-between bg-smoke p-3">
              <span className="text-sm gangster-font">VERSION</span>
              <span className="text-sm font-medium text-accent">2.0</span>
            </div>
            <div className="flex items-center justify-between bg-smoke p-3">
              <span className="text-sm gangster-font">DATA STORAGE</span>
              <span className="text-sm font-medium text-accent">VERCEL BLOB</span>
            </div>
            <div className="flex items-center justify-between bg-smoke p-3">
              <span className="text-sm gangster-font">THEME</span>
              <span className="text-sm font-medium text-accent">BOSS MODE</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
