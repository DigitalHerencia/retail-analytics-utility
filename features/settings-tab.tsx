"use client"

import { useState } from "react"
import { Database, Trash2, Check, AlertCircle, Boxes, Scale, Weight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useClerk } from "@clerk/nextjs"
import { HustleStat } from "@/components/hustle-stat"
import { HustleTip } from "@/components/hustle-tip"
import SetupTab, { RISK_MODE_DEFAULTS } from "./setup-tab"
import type { BusinessData } from "@/types"

interface SettingsTabProps {
  dbConnected: boolean
  totalTransactions: number
  lifetimeProfit: number
  totalGramsAdded: number
  businessData: BusinessData
  mode: keyof typeof RISK_MODE_DEFAULTS
  onUpdateBusinessData: (data: BusinessData, mode: keyof typeof RISK_MODE_DEFAULTS) => Promise<void>
  onAccountDeleted?: () => void
  message?: { type: "success" | "error"; text: string } | null
}

export default function SettingsTab({
  dbConnected,
  totalTransactions,
  lifetimeProfit,
  totalGramsAdded,
  businessData: initialBusinessData,
  mode: initialMode,
  onUpdateBusinessData,
  onAccountDeleted,
  message,
}: SettingsTabProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [localMessage, setLocalMessage] = useState<{ type: "success" | "error"; text: string } | null>(message || null)
  const { user } = useClerk()
  const [businessData, setBusinessData] = useState<BusinessData>(initialBusinessData)
  const [mode, setMode] = useState<keyof typeof RISK_MODE_DEFAULTS>(initialMode)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // Handler for deleting the account
  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setLocalMessage(null)
    try {
      await user?.delete()
      setLocalMessage({ type: "success", text: "Your account has been deleted." })
      if (onAccountDeleted) onAccountDeleted()
    } catch (error) {
      setLocalMessage({ type: "error", text: "Failed to delete account. Please try again." })
    }
    setIsDeleting(false)
  }

  const handleUpdateBusinessData = async (data: BusinessData) => {
    setSaving(true)
    setSaveMsg(null)
    try {
      await onUpdateBusinessData(data, mode)
      setSaveMsg("Settings saved.")
    } catch (e) {
      setSaveMsg("Failed to save settings.")
    }
    setSaving(false)
  }

  const handleSelectRisk = (newMode: keyof typeof RISK_MODE_DEFAULTS) => {
    setMode(newMode)
    // Reset business params to mode defaults, but keep editable
    setBusinessData({
      ...businessData,
      ...RISK_MODE_DEFAULTS[newMode],
    })
  }

  return (
    <div className="container space-y-6 p-4">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2 card-sharp fade-in">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">SETTINGS</h1>
          <p className="text-white/80 mt-1">Manage your account and connection status.</p>
        </div>
        <HustleTip title="RETAIL ANALYTICS">
          <p>
            Explore key metrics to optimize your retail performance. Track transactions, measure profit, and monitor total
            grams added to gain insights into your business.
          </p>
        </HustleTip>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <HustleStat title="Total Transactions" value={totalTransactions.toLocaleString()} icon={<Boxes />} trend={undefined} trendValue={undefined} />
          <HustleStat title="Lifetime Profit" value={`$${lifetimeProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={<Scale />} trend={undefined} trendValue={undefined} />
          <HustleStat title="Total Grams Added" value={totalGramsAdded.toLocaleString()} icon={<Weight />} trend={undefined} trendValue={undefined} />
        </div>
      </div>

      {localMessage && (
        <Alert
          variant={localMessage.type === "success" ? "default" : "destructive"}
          className={`mb-6 card-sharp ${
            localMessage.type === "success" ? "bg-white/10 text-white border-white/20" : "bg-blood/10 text-blood border-blood/20"
          }`}
        >
          {localMessage.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle className="gangster-font">{localMessage.type === "success" ? "SUCCESS" : "ERROR"}</AlertTitle>
          <AlertDescription>{localMessage.text}</AlertDescription>
        </Alert>
      )}

      <SetupTab
        businessData={businessData}
        onUpdateBusinessData={setBusinessData}
        retailPricePerGram={businessData.wholesalePricePerOz / 28.35}
        onUpdateRetailPrice={(retail) => setBusinessData({ ...businessData, retailPricePerGram: retail })}
        showModeSelection={true}
        mode={mode}
        onSelectRisk={handleSelectRisk}
      />
      <div className="flex justify-end mt-4">
        <Button onClick={() => handleUpdateBusinessData(businessData)} disabled={saving} className="button-sharp bg-white text-black">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        {saveMsg && <span className="ml-4 text-sm text-white">{saveMsg}</span>}
      </div>

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

