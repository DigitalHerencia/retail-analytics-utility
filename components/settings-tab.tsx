"use client"

import { useState, useEffect } from "react"
import { Save, Download, Trash2, Check, AlertCircle, Shield, Database, RotateCcw, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { saveData, getSavedDataList, loadData, deleteData } from "@/app/(root)/actions"
import type { BusinessData, InventoryItem, Customer } from "@/lib/data"

interface SettingsTabProps {
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  onDataLoaded: (businessData: BusinessData, inventory: InventoryItem[], customers: Customer[]) => void
  isNewAccount?: boolean
  isLoading?: boolean
  saveAllChanges?: () => Promise<boolean> // Add the new prop
}

interface SavedFile {
  id: string
  url: string
  pathname: string
  uploadedAt: string
}

export default function SettingsTab({ 
  businessData, 
  inventory, 
  customers, 
  onDataLoaded, 
  isNewAccount = false, 
  isLoading: pageIsLoading = false,
  saveAllChanges // Receive the saveAllChanges prop
}: SettingsTabProps) {
  const [saveName, setSaveName] = useState("")
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleDataExport = async () => {
    try {
      // If saveAllChanges is provided, save everything first to ensure latest data
      if (saveAllChanges) {
        await saveAllChanges();
      }
      
      // Create a JSON Blob of all data
      const allData = {
        businessData,
        inventory,
        customers,
        exportDate: new Date().toISOString(),
      }

      const jsonString = JSON.stringify(allData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      
      // Create a download link and trigger it
      const a = document.createElement("a")
      a.href = url
      a.download = `retail-analytics-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      setMessage({
        type: "success",
        text: "Data exported successfully. The file has been downloaded.",
      })
    } catch (error) {
      console.error("Export error:", error)
      setMessage({
        type: "error",
        text: "Failed to export data. Please try again.",
      })
    }
  }

  const handleClearData = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmClearData = async () => {
    setIsLoading(true)
    setShowDeleteConfirm(false)
    let allDeleted = true
    let errorMessages: string[] = []

    try {
      // Fetch the list of saved files first
      const listResult = await getSavedDataList()

      if (listResult.success && listResult.list && listResult.list.length > 0) {
        // Iterate and delete each file
        for (const fileName of listResult.list) {
          const deleteResult = await deleteData(fileName)
          if (!deleteResult.success) {
            allDeleted = false
            errorMessages.push(deleteResult.error || `Failed to delete ${fileName}`)
          }
        }
      } else if (!listResult.success) {
        // Handle error fetching the list
        allDeleted = false
        errorMessages.push(listResult.error || "Failed to retrieve list of saved data.")
      }
      // If listResult.list is empty, we consider it a success (nothing to delete)

      setIsLoading(false)

      if (allDeleted) {
        setMessage({ type: "success", text: "All saved data has been cleared successfully." })
        // Reset local state with default empty BusinessData structure
        onDataLoaded(
          { 
            wholesalePricePerOz: 0, 
            targetProfitPerMonth: 0, 
            operatingExpenses: 0,
            targetProfit: undefined 
          }, // businessData 
          [], // inventory
          []  // customers
        )
        loadSavedFiles() // Refresh the list of saved files
      } else {
        setMessage({ type: "error", text: `Failed to delete some data: ${errorMessages.join(", ")}` })
      }
    } catch (error) {
      console.error("Error clearing data:", error)
      setIsLoading(false)
      setMessage({ type: "error", text: "An unexpected error occurred while clearing data." })
    }
  }

  return (
    <div className="space-y-6 p-4">
      {pageIsLoading ? (
        <Card className="card-sharp border-white">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
              <p className="text-white">Loading your data...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2 text-center">
              <h1 className="text-4xl font-bold text-white gangster-font text-shadow">SETTINGS</h1>
              <p className="text-white/80 mt-1">SECURE YOUR DATA. PROTECT YOUR EMPIRE.</p>
            </div>
          </div>

          {message && (
            <Alert
              variant={message.type === "success" ? "default" : "destructive"}
              className={`mb-6 card-sharp ${
                message.type === "success" ? "bg-white/10 text-white border-white/20" : "bg-blood/10 text-blood border-blood/20"
              }`}
            >
              {message.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle className="gangster-font">{message.type === "success" ? "SUCCESS" : "ERROR"}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white flex items-center">
                <Database className="h-5 w-5 mr-2" /> DATA MANAGEMENT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-white hover:bg-white/90 text-black button-sharp">
                      <Save className="h-4 w-4 mr-2" /> SAVE DATA
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-smoke border-white card-sharp">
                    <DialogHeader>
                      <DialogTitle className="gangster-font text-white">SAVE YOUR DATA</DialogTitle>
                      <DialogDescription className="text-white/80">
                        Enter a name to identify this save. This will secure your current business data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="saveName" className="gangster-font text-white">
                          SAVE NAME
                        </Label>
                        <Input
                          id="saveName"
                          placeholder="My Business Data"
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          className="input-sharp bg-black/50 text-white border-white/50 focus:border-white"
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
                    <Button className="w-full button-sharp border-white text-white hover:bg-white/10" variant="outline">
                      <Download className="h-4 w-4 mr-2" /> LOAD DATA
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-smoke border-white card-sharp">
                    <DialogHeader>
                      <DialogTitle className="gangster-font text-white">LOAD SAVED DATA</DialogTitle>
                      <DialogDescription className="text-white/80">
                        Select a previously saved file to load. This will replace your current data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto">
                      {isLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                          <p className="mt-2 text-white/70">LOADING DATA...</p>
                        </div>
                      ) : savedFiles.length === 0 ? (
                        <p className="text-center text-white/70 py-4">NO SAVED DATA FOUND</p>
                      ) : (
                        savedFiles.map((file) => (
                          <Card key={file.id} className="overflow-hidden card-sharp border-white/20 bg-black/20">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium gangster-font text-white">SAVE #{file.id.substring(0, 8)}</h4>
                                  <p className="text-sm text-white/60">{file.uploadedAt}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleLoadData(file.url)}
                                    disabled={isLoading}
                                    className="bg-white hover:bg-white/90 text-black button-sharp"
                                  >
                                    LOAD
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteData(file.pathname)}
                                    disabled={isLoading}
                                    className="border-blood text-blood hover:bg-blood/10 button-sharp"
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

              <div className="bg-smoke p-4 rounded-md mb-4">
                <h3 className="text-lg font-semibold mb-3">Export Data</h3>
                <p className="mb-3 text-sm">
                  Export all your business data in JSON format as a backup or for external analysis.
                </p>
                <Button
                  variant="outline"
                  className="button-sharp w-full sm:w-auto"
                  onClick={handleDataExport}
                  disabled={isLoading}
                >
                  {isLoading ? "Exporting..." : "Export All Data"}
                </Button>
              </div>

              <div className="bg-red-900/30 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-3 text-red-400">Reset All Data</h3>
                <p className="mb-3 text-sm text-red-300">
                  Warning: This will permanently delete all your data including inventory, customers, and transactions. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  className="button-sharp w-full sm:w-auto"
                  onClick={handleClearData}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Clear All Data"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent className="bg-smoke border-white card-sharp">
              <AlertDialogHeader>
                <AlertDialogTitle className="gangster-font text-white">CONFIRM DATA DELETION</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete all your data? This action cannot be undone and will permanently erase all your inventory items, customers, and transactions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="button-sharp" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white button-sharp"
                  onClick={confirmClearData}
                >
                  Delete All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}
