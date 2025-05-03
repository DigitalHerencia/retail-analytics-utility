"use client"

import { useState } from "react"
import { Database, Trash2, Check, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useClerk } from "@clerk/nextjs"

interface SettingsTabProps {
  dbConnected: boolean
  onAccountDeleted?: () => void
}

export default function SettingsTab({ dbConnected, onAccountDeleted }: SettingsTabProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const { user } = useClerk()

  // Handler for deleting the account
  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setMessage(null)
    try {
      await user?.delete()
      setMessage({ type: "success", text: "Your account has been deleted." })
      if (onAccountDeleted) onAccountDeleted()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete account. Please try again." })
    }
    setIsDeleting(false)
  }

  return (
    <div className="space-y-6 p-4">
      <div className="mb-6">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2 text-center">
          <h1 className="text-4xl font-bold text-white gangster-font text-shadow">SETTINGS</h1>
          <p className="text-white/80 mt-1">Manage your account and connection status.</p>
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
            <Database className="h-5 w-5 mr-2" /> DB CONNECTION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span>Status:</span>
            <span className={`font-semibold ${dbConnected ? "text-green-400" : "text-red-400"}`}>
              {dbConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-sharp border-white">
        <CardHeader>
          <CardTitle className="gangster-font text-white flex items-center">
            <Trash2 className="h-5 w-5 mr-2" /> DELETE ACCOUNT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-center text-red-300">
            Warning: This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="bg-white text-black button-sharp mt-4 w-full sm:w-auto"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
