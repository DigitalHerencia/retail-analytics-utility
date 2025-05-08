"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RetailAnalyticsTable from "@/components/retail-analytics-table"
import RetailAnalyticsForm from "@/components/retail-analytics-form"
import RetailAnalyticsCharts from "@/components/retail-analytics-charts"
import SalespeopleTable from "@/components/salespeople-table"
import SalespeopleCharts from "@/components/salespeople-charts"
import PriceGenerator from "@/components/price-generator"
import { getScenarios, createScenario, updateScenario, deleteScenario } from "@/app/actions"
import type { ScenarioData } from "@/lib/types"

export default function RetailAnalyticsDashboard() {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([])
  const [editingScenario, setEditingScenario] = useState<ScenarioData | null>(null)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Load scenarios from database
  useEffect(() => {
    const loadScenarios = async () => {
      setIsLoading(true)
      const data = await getScenarios()
      setScenarios(data)
      if (data.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(data[0].id)
      }
      setIsLoading(false)
    }

    loadScenarios()
  }, [])

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0]

  const handleAddScenario = async (newScenario: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">) => {
    const created = await createScenario(newScenario)
    if (created) {
      setScenarios([...scenarios, created])
      setSelectedScenarioId(created.id)
    }
  }

  const handleUpdateScenario = async (updatedScenario: ScenarioData) => {
    const updated = await updateScenario(updatedScenario.id, updatedScenario)
    if (updated) {
      setScenarios(scenarios.map((scenario) => (scenario.id === updated.id ? updated : scenario)))
      setEditingScenario(null)
    }
  }

  const handleDeleteScenario = async (id: string) => {
    const success = await deleteScenario(id)
    if (success) {
      setScenarios(scenarios.filter((scenario) => scenario.id !== id))
      if (selectedScenarioId === id && scenarios.length > 1) {
        setSelectedScenarioId(scenarios[0].id === id ? scenarios[1].id : scenarios[0].id)
      }
    }
  }

  const handleEditScenario = (scenario: ScenarioData) => {
    setEditingScenario(scenario)
  }

  const handleUpdateSalespeople = async (scenarioId: string, updatedSalespeople: any) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (!scenario) return

    // Calculate total commission
    const totalCommission = updatedSalespeople.reduce((total: number, person: any) => total + person.earnings, 0)

    // Update net profit after commission
    const netProfitAfterCommission = scenario.netProfit - totalCommission

    const updated = await updateScenario(scenarioId, {
      salespeople: updatedSalespeople,
      totalCommission,
      netProfitAfterCommission,
    })

    if (updated) {
      setScenarios(scenarios.map((s) => (s.id === updated.id ? updated : s)))
    }
  }

  const handleGenerateScenarios = async (newScenarios: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">[]) => {
    // Create all scenarios in the database
    const createdScenarios = await Promise.all(newScenarios.map((scenario) => createScenario(scenario)))

    // Filter out any null values (failed creations)
    const validScenarios = createdScenarios.filter(Boolean) as ScenarioData[]

    if (validScenarios.length > 0) {
      setScenarios(validScenarios)
      // Select the middle scenario (base price)
      const middleIndex = Math.floor(validScenarios.length / 2)
      setSelectedScenarioId(validScenarios[middleIndex].id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Retail Analytics Tool</CardTitle>
          <CardDescription>
            Compare different pricing scenarios and analyze their impact on revenue, profit, and sales team performance
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="table">Data Table</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="salespeople">Salespeople</TabsTrigger>
          <TabsTrigger value="salesCharts">Sales Charts</TabsTrigger>
          <TabsTrigger value="add">Add/Edit</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardContent className="pt-6">
              <RetailAnalyticsTable
                scenarios={scenarios}
                onEdit={handleEditScenario}
                onDelete={handleDeleteScenario}
                onSelectScenario={setSelectedScenarioId}
                selectedScenarioId={selectedScenarioId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardContent className="pt-6">
              <RetailAnalyticsCharts scenarios={scenarios} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salespeople">
          <Card>
            <CardContent className="pt-6">
              {selectedScenario ? (
                <SalespeopleTable
                  scenario={selectedScenario}
                  onUpdateSalespeople={(updatedSalespeople) =>
                    handleUpdateSalespeople(selectedScenario.id, updatedSalespeople)
                  }
                />
              ) : (
                <p>No scenario selected. Please select a scenario from the Data Table tab.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salesCharts">
          <Card>
            <CardContent className="pt-6">
              {selectedScenario ? (
                <SalespeopleCharts scenario={selectedScenario} />
              ) : (
                <p>No scenario selected. Please select a scenario from the Data Table tab.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardContent className="pt-6">
              <RetailAnalyticsForm
                onSubmit={editingScenario ? handleUpdateScenario : handleAddScenario}
                initialData={editingScenario}
                isEditing={!!editingScenario}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate">
          <PriceGenerator onGenerate={handleGenerateScenarios} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
