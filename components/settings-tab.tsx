"use client"

import { useState, useEffect } from "react"
import { Save, Download, Trash2, Check, AlertCircle, Shield, Database, RotateCcw } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { saveData, getSavedDataList, loadData, deleteData } from "@/app/(root)/actions"
import type { BusinessData, InventoryItem, Customer } from "@/lib/data"
import { HustleTip } from "@/components/hustle-tip"
import { useTheme } from "next-themes"

interface SettingsTabProps {
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  onDataLoaded: (businessData: BusinessData, inventory: InventoryItem[], customers: Customer[]) => void
  isNewAccount?: boolean
}

interface SavedFile {
  id: string
  url: string
  pathname: string
  uploadedAt: string
}

export default function SettingsTab({ businessData, inventory, customers, onDataLoaded, isNewAccount = false }: SettingsTabProps) {
  const [saveName, setSaveName] = useState("")
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)

  // Load saved files list
  const loadSavedFiles = async () => {
    setIsLoading(true)
    const result = await getSavedDataList()
    setIsLoading(false)

    if (result.success && result.list) {
      // Map the result.list (array of names) to SavedFile objects
      setSavedFiles(result.list.map((name: string) => ({
        id: name,
        url: name,
        pathname: name,
        uploadedAt: new Date().toLocaleString(), // Placeholder, update if you have a real timestamp
      })))
    } else {
      setSavedFiles([])
    }
  }

  useEffect(() => {
    loadSavedFiles()
  }, [])

  // Handle save data
  const handleSaveData = async () => {
    if (!saveName.trim()) {
      setMessage({ type: "error", text: "Enter a name for your save" })
      return
    }

    setIsLoading(true)
    const result = await saveData(saveName, { businessData, inventory, customers })
    setIsLoading(false)

    if (result.success) {
      setMessage({ type: "success", text: "Data saved successfully." })
      setSaveName("")
      setIsSaveDialogOpen(false)
      loadSavedFiles()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save data." })
    }
  }

  // Handle load data
  const handleLoadData = async (name: string) => {
    setIsLoading(true)
    const result = await loadData(name)
    setIsLoading(false)

    if (result.success && result.data) {
      const { businessData, inventory, customers } = result.data
      onDataLoaded(businessData, inventory, customers)
      setMessage({ type: "success", text: "Data loaded successfully." })
      setIsLoadDialogOpen(false)
    } else {
      setMessage({ type: "error", text: result.error || "Failed to load data." })
    }
  }

  // Handle delete data
  const handleDeleteData = async (name: string) => {
    setIsLoading(true)
    const result = await deleteData(name)
    setIsLoading(false)

    if (result.success) {
      setMessage({ type: "success", text: "Data deleted successfully." })
      loadSavedFiles()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to delete data." })
    }
  }

  // Placeholder for handleResetData
  const handleResetData = async () => {
    console.log("Resetting user data...") // Replace with actual API call
    setMessage({ type: "success", text: "Demo data reset successfully (placeholder)." })
  }

  return (
    <div className="space-y-4 p-4">
      {isNewAccount && (
        <HustleTip title="Clear Demo Data">
          Welcome! Your account includes demo data to help you get started. You can clear this demo data in the 'Database Management' section below.
        </HustleTip>
      )}

      <div className="mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2 text-center">
          <h1 className="text-4xl font-bold text-white gangster-font text-shadow">SETTINGS</h1>
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
            message.type === "success" ? "bg-white/10 text-white border-white/20" : "bg-blood/10 text-blood border-blood/20"
          }`}
        >
          {message.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle className="gangster-font">{message.type === "success" ? "SUCCESS" : "ERROR"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="card-hover card-sharp border-white">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gangster-font text-white">
              <Database className="h-5 w-5 mr-2 text-white" />
              DATA MANAGEMENT
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-white hover:bg-white/90 text-black button-sharp">
                    <Save className="mr-2 h-4 w-4" /> SAVE DATA
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-smoke border-white card-sharp">
                  <DialogHeader>
                    <DialogTitle className="gangster-font text-white">SAVE YOUR DATA</DialogTitle>
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
                      className="bg-white hover:bg-white/90 text-black button-sharp"
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
                <DialogContent className="bg-smoke border-white card-sharp">
                  <DialogHeader>
                    <DialogTitle className="gangster-font text-white">LOAD SAVED DATA</DialogTitle>
                    <DialogDescription>
                      Select a previously saved file to load. This will replace your current data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">LOADING DATA...</p>
                      </div>
                    ) : savedFiles.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">NO SAVED DATA FOUND</p>
                    ) : (
                      savedFiles.map((file) => (
                        <Card key={file.id} className="overflow-hidden card-hover card-sharp border-white">
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
                                  className="bg-white/20 text-white hover:bg-white/30 border-none button-sharp"
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

            <div className="pt-4 border-t border-[hsl(var(--border))]">
              <h4 className="text-md font-medium mb-2 gangster-font text-white">Reset Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Reset all your stored data to the initial demo state. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="button-sharp border-2 border-white">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all your current business data, inventory, and customer records, replacing it with the default demo data. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Reset Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover card-sharp border-white">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gangster-font text-white">
              <Shield className="h-5 w-5 mr-2 text-white" />
              ACCOUNT SECURITY
            </h3>
            <p className="text-sm text-muted-foreground">
              Password reset and account management options will appear here once authentication is fully implemented.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover card-sharp border-white">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gangster-font text-white">
              <Shield className="h-5 w-5 mr-2 text-white" />
              ABOUT
            </h3>
            <p className="text-sm text-muted-foreground">
              Hustle Calculator helps you maximize profits, track inventory, and collect debts. Stay on top of your
              business and keep your money right.
            </p>
            <div className="flex items-center justify-between bg-smoke p-3">
              <span className="text-sm gangster-font">VERSION</span>
              <span className="text-sm font-medium text-white">1.0</span>
            </div>
            <div className="flex items-center justify-between bg-smoke p-3">
              <span className="text-sm gangster-font">DATA STORAGE</span>
              <span className="text-sm font-medium text-white">VERCEL BLOB</span>
            </div>
            <div className="flex items-center justify-between bg-smoke p-3">
              <span className="text-sm gangster-font">THEME</span>
              <span className="text-sm font-medium text-white">BOSS MODE</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
