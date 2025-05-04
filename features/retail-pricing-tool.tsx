"use client"

import { useState, useMemo } from "react"
import { v4 as uuidv4 } from "uuid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {PriceGenerator} from "@/features/price-generator"
import PriceTable from "@/features/price-table"
import PriceCharts from "@/features/price-charts"
import { HustleTip } from "@/components/hustle-tip"
import { Button } from "@/components/ui/button"
import { Download, Save, RefreshCw } from "lucide-react"
import type { ScenarioData, PricePoint } from "@/types"
import { formatCurrency, formatGrams } from "@/lib/utils"

export default function RetailPricingTool() {
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([])
  const [selectedPricePointId, setSelectedPricePointId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("generate")
  
  // Process generated scenarios into price points
  const handleGenerateScenarios = (scenarios: ScenarioData[]) => {
    const newPricePoints: PricePoint[] = scenarios.map((scenario) => {
      // Calculate wholesale price based on retail price and margin
      const retailPricePerGram = scenario.retailPriceG
      const grossMargin = scenario.grossMarginG
      
      const wholesale = scenario.wholesalePricePerGram;
      const retail = scenario.retailPricePerGram;
      
      // Using GAAP principles:
      // Wholesale price = Retail price - Gross margin
      const wholesalePricePerGram = retailPricePerGram - grossMargin
      
      // Profit per gram is the same as gross margin
      const profitPerGram = grossMargin
      
      // Calculate markup percentage: (Retail - Wholesale)/Wholesale * 100
      const markupPercentage = Math.round((profitPerGram / wholesalePricePerGram) * 100)
      
      // Break-even calculation - how much product needed to sell to meet target profit
      const breakEvenGramsPerMonth = scenario.netProfit / profitPerGram
      const breakEvenOuncesPerMonth = breakEvenGramsPerMonth / 28.35
      
      // Revenue and cost calculations
      const monthlyRevenue = retailPricePerGram * breakEvenGramsPerMonth
      const monthlyCost = wholesalePricePerGram * breakEvenGramsPerMonth
      const monthlyProfit = monthlyRevenue - monthlyCost
      
      // ROI calculation: Profit / Cost * 100
      const roi = (monthlyProfit / monthlyCost) * 100
      
      return {
        value: retailPricePerGram,
        id: uuidv4(),
        markupPercentage,
        wholesalePricePerGram,
        retailPricePerGram,
        profitPerGram,
        breakEvenGramsPerMonth,
        breakEvenOuncesPerMonth,
        monthlyRevenue,
        monthlyCost,
        monthlyProfit,
        roi,
        updatedAt: new Date().toISOString(),
        wholesale: wholesale,
        retail: retail
      }
    })
    
    setPricePoints(newPricePoints)
    if (newPricePoints.length > 0) {
      // Select the middle price point by default (the base price)
      setSelectedPricePointId(newPricePoints[Math.floor(newPricePoints.length / 2)].id)
      setActiveTab("view")
    }
  }
  
  const selectedPricePoint = useMemo(() => {
    return pricePoints.find(point => point.id === selectedPricePointId)
  }, [pricePoints, selectedPricePointId])
  
  const handleClearData = () => {
    setPricePoints([])
    setSelectedPricePointId("")
    setActiveTab("generate")
  }
  
  const handleSavePricePoint = () => {
    // In a real app, this would save to a database
    alert("Price point saved! (Demo functionality)")
  }
  
  const handleExportData = () => {
    // Create a CSV or JSON export
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pricePoints, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "price-points.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border rounded-md border-white bg-black p-0 mb-4 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 gap-0 bg-transparent p-0 overflow-hidden">
            <TabsTrigger
              value="generate"
              className="gangster-font text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-3 font-bold transition-colors data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:focus-visible:outline-none"
              style={{ borderBottom: '2px solid transparent' }}
            >
              GENERATE PRICING
            </TabsTrigger>
            <TabsTrigger
              value="view"
              className="gangster-font text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-3 font-bold transition-colors data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:focus-visible:outline-none"
              style={{ borderBottom: '2px solid transparent' }}
              disabled={pricePoints.length === 0}
            >
              VIEW RESULTS
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="generate" className="space-y-4 mt-4 px-1 sm:px-0">
          <Card className="card-sharp border-white">
            <CardContent className="pt-6">
              <PriceGenerator />
            </CardContent>
          </Card>
          
          {pricePoints.length > 0 && (
            <HustleTip title="PRICING GENERATED">
              <p>
                Your pricing scenarios have been generated! Click the "VIEW RESULTS" tab to see detailed analysis and charts.
              </p>
            </HustleTip>
          )}
        </TabsContent>
        
        <TabsContent value="view" className="space-y-6 mt-4 px-1 sm:px-0">
          {pricePoints.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold gangster-font">PRICING ANALYSIS</h2>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white text-white hover:bg-white/10 button-sharp"
                    onClick={handleClearData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white text-white hover:bg-white/10 button-sharp"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  {selectedPricePoint && (
                    <Button 
                      size="sm"
                      className="bg-white hover:bg-white/90 text-black button-sharp border-white"
                      onClick={handleSavePricePoint}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Selected
                    </Button>
                  )}
                </div>
              </div>
              
              <Card className="card-sharp border-white">
                <CardContent className="pt-6 overflow-x-auto">
                  <PriceTable prices={ [] } onEdit={ function ( price: PricePoint ): void
                  {
                    throw new Error( "Function not implemented." )
                  } } onDelete={ function ( price: PricePoint ): void
                  {
                    throw new Error( "Function not implemented." )
                  } }                  />
                </CardContent>
              </Card>
              
              {selectedPricePoint && (
                <HustleTip title="SELECTED PRICE POINT">
                  <p>
                    You've selected a markup of <strong>{selectedPricePoint.markupPercentage}%</strong> with a retail price of <strong>{formatCurrency(selectedPricePoint.retailPricePerGram)}/g</strong>.
                    This would require selling <strong>{formatGrams(selectedPricePoint.breakEvenGramsPerMonth)} grams</strong> per month to reach your profit target.
                  </p>
                </HustleTip>
              )}
              
              <Card className="card-sharp border-white">
                <CardContent className="pt-6">
                  <PriceCharts pricePoints={pricePoints} />
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12 bg-smoke card-sharp">
              <p className="gangster-font text-white mb-4">NO PRICING DATA YET</p>
              <p className="text-muted-foreground">Generate pricing scenarios first</p>
              <Button 
                onClick={() => setActiveTab("generate")} 
                className="mt-4 bg-white hover:bg-white/90 text-black button-sharp border-white"
              >
                Generate Pricing
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
