"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Users, Package, BarChart3, ShoppingCart, Calendar } from "lucide-react"
import { HustleTip } from "@/components/hustle-tip"

export default function HelpTab() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">HELP & GUIDE</h1>
          <p className="text-white/80 mt-1">LEARN THE GAME. MASTER THE HUSTLE.</p>
        </div>

        <HustleTip title="KNOWLEDGE IS POWER">
          <p>
            This guide will help you get the most out of your Hustle Calculator. Learn all the features to maximize
            your profits and run your business like a boss.
          </p>
        </HustleTip>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border rounded-md border-white bg-black p-0 mb-4 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 gap-0 bg-transparent p-0 overflow-hidden border border-white rounded h-12">
            {["overview", "calculator", "inventory", "customers", "register", "forecast", "crash-course"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="gangster-font text-xs sm:text-sm flex items-center justify-center h-12 w-full font-bold uppercase transition-colors rounded-none border-0 bg-transparent text-white data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-black focus-visible:outline-none"
              >
                {tab.replace(/-/g, ' ').toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">WELCOME TO HUSTLE CALCULATOR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Hustle Calculator is your all-in-one business management tool designed specifically for street
                entrepreneurs. Track your inventory, manage clients, record sales, and forecast profits - all with an
                interface that keeps your data private and your business running smooth.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-smoke p-4 flex flex-col items-center text-center">
                  <Calculator className="h-10 w-10 text-white mb-2" />
                  <h3 className="gangster-font text-white">PRICE CALCULATOR</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Find your optimal price points to maximize profits
                  </p>
                </div>

                <div className="bg-smoke p-4 flex flex-col items-center text-center">
                  <Package className="h-10 w-10 text-white mb-2" />
                  <h3 className="gangster-font text-white">INVENTORY TRACKER</h3>
                  <p className="text-sm text-muted-foreground mt-1">Keep track of your product and never run dry</p>
                </div>

                <div className="bg-smoke p-4 flex flex-col items-center text-center">
                  <Users className="h-10 w-10 text-white mb-2" />
                  <h3 className="gangster-font text-white">CLIENT MANAGEMENT</h3>
                  <p className="text-sm text-muted-foreground mt-1">Manage your clients and collect what's owed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">GETTING STARTED</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong className="text-white">Set up your business</strong> - Go to the Setup tab and enter your
                  wholesale costs and target profit
                </li>
                <li>
                  <strong className="text-white">Add your inventory</strong> - Track what you have on hand in the
                  Inventory tab
                </li>
                <li>
                  <strong className="text-white">Add your clients</strong> - Keep track of who owes you money in the
                  Clients tab
                </li>
                <li>
                  <strong className="text-white">Record transactions</strong> - Use the Register to record sales and
                  payments
                </li>
                <li>
                  <strong className="text-white">Check your forecast</strong> - See how your business is performing in
                  the Forecast tab
                </li>
              </ol>

              <div className="bg-smoke p-4 mt-4">
                <h3 className="gangster-font text-white mb-2">PRO TIP</h3>
                <p className="text-sm">
                  Use the hamburger menu in the top left to quickly navigate between sections. You can also change the
                  theme and accent color in settings to match your style.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6 mt-6">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">PRICE CALCULATOR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Price Calculator helps you find the optimal price points for your product. It shows you different
                markup percentages and how they affect your profit, break-even point, and ROI.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-white">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Enter your wholesale cost per ounce in the setup tab</li>
                  <li>Adjust the markup percentage slider to see how different price points affect your profits</li>
                  <li>The calculator will automatically show you different markup options from 50% to 200%</li>
                  <li>See how each price point affects your profit margin and break-even quantity</li>
                  <li>Click "SAVE PRICING SETTINGS" to apply the selected markup to all calculations</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-white mb-2">KEY TERMS</h3>

                  <div className="space-y-2">
                    <div>
                      <strong className="text-white">Markup</strong>: The percentage added to your cost to set your price
                    </div>
                    <div>
                      <strong className="text-white">Break-even</strong>: How much product you need to move to cover
                      costs
                    </div>
                    <div>
                      <strong className="text-white">ROI</strong>: Return on Investment - how hard your money is working
                      for you
                    </div>
                    <div>
                      <strong className="text-white">Profit Margin</strong>: The percentage of your retail price that is profit
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">INVENTORY MANAGEMENT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Inventory tab helps you keep track of your product. You can add new inventory, update quantities,
                and see what's running low to avoid stockouts.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-white">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click "Add Product" to add new inventory items</li>
                  <li>Enter the product name, quantity (in grams or ounces), purchase date, and cost</li>
                  <li>Set reorder thresholds to get alerts when inventory is running low</li>
                  <li>Your inventory will automatically update when you make sales through the Register</li>
                  <li>View total inventory value and quantity at the top of the page</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-white mb-2">PRO TIP</h3>
                  <p className="text-sm">
                    Keep your inventory updated in real-time. Track both grams and ounces for precision. The system will 
                    automatically highlight items that are running low with a "Low Stock" badge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 mt-6">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">CLIENT MANAGEMENT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Clients tab helps you manage your customer relationships. Keep track of who owes you money, when
                payments are due, and view payment history to maintain strong business relationships.
              </p>
              
              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-white">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click "Add Client" to create a new customer profile</li>
                  <li>Enter their contact information, payment terms, and any notes</li>
                  <li>When a client buys on credit, their balance will update automatically</li>
                  <li>Use the Register tab to record payments from clients</li>
                  <li>View payment history and current balance for each client</li>
                  <li>Use the Analytics view to see overall client metrics like collection rate and overdue amounts</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-white mb-2">PRO TIP</h3>
                  <p className="text-sm">
                    Always set clear due dates for payments and follow up consistently. The client analytics page shows your
                    collection rate and average days to payment to help you monitor your cash flow.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-6 mt-6">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">CASH REGISTER</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Cash Register tab is where you record your daily sales and collect payments from clients. It
                automatically updates your inventory and client balances to keep everything in sync.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-white">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Use the "QUICK SALE" tab to record product sales</li>
                  <li>Select the product, quantity, and payment method (cash or credit)</li>
                  <li>If selling to a specific customer, select them from the dropdown</li>
                  <li>Switch to "COLLECT PAYMENT" tab to record payments from clients with outstanding balances</li>
                  <li>Select the client, enter the payment amount, and choose the payment method</li>
                  <li>All transactions are tracked automatically for your financial reports</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-white mb-2">PRO TIP</h3>
                  <p className="text-sm">
                    Record every transaction immediately. The register shows your daily revenue, profit, and number of
                    transactions at the top of the page to give you a quick overview of your day's business.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6 mt-6">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">MONTHLY FORECAST</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Forecast tab gives you a comprehensive view of your business performance. Track your progress toward monthly goals,
                analyze sales trends, and make data-driven decisions to grow your profits.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-white">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>View your monthly revenue, profit, and projected profit at the top of the page</li>
                  <li>Use the "OVERVIEW" tab to see your profit target progress and monthly financial summary</li>
                  <li>The "SALES" tab shows your sales by product and daily revenue/profit chart</li>
                  <li>Check "INVENTORY" to monitor your inventory levels and get low stock alerts</li>
                  <li>The "ACCOUNTS" tab displays outstanding balances and overdue payments</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-white mb-2">PRO TIP</h3>
                  <p className="text-sm">
                    Pay close attention to your top-selling products in the sales breakdown chart. This data helps you
                    make smarter inventory purchases and pricing decisions to maximize your profits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crash-course" className="space-y-6 mt-6">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">RETAIL ANALYTICS CRASH COURSE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Retail analytics</strong> is the practice of using data to make smarter business decisions in retail. It helps you understand your sales, customers, inventory, and profits so you can grow your business and stay ahead of the competition.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Why it matters:</strong> Analytics turns raw numbers into insights. It shows you what’s selling, who’s buying, and where you’re making (or losing) money. With analytics, you can:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Set the right prices for maximum profit</li>
                    <li>Keep your best products in stock</li>
                    <li>Spot trends and seasonality</li>
                    <li>Reduce losses from unsold inventory</li>
                    <li>Collect what you’re owed, faster</li>
                  </ul>
                </li>
              </ul>
              <div className="bg-smoke p-4 mt-4 rounded">
                <h3 className="gangster-font text-white mb-2">GLOSSARY</h3>
                <div className="space-y-2 text-sm">
                  <div><strong className="text-white">Markup</strong>: The percentage you add to your cost to set your price. Higher markup means more profit per sale, but may slow down sales volume.</div>
                  <div><strong className="text-white">Break-even</strong>: The amount you need to sell to cover your costs. After this, you start making profit.</div>
                  <div><strong className="text-white">ROI</strong>: Return on Investment. Shows how much profit you make compared to what you spend.</div>
                  <div><strong className="text-white">Profit Margin</strong>: The percentage of your selling price that is profit.</div>
                  <div><strong className="text-white">Inventory Turnover</strong>: How quickly you sell through your stock. High turnover means you’re selling fast.</div>
                  <div><strong className="text-white">Accounts Receivable</strong>: Money owed to you by customers who bought on credit.</div>
                  <div><strong className="text-white">Revenue</strong>: Total money from sales before costs are subtracted.</div>
                  <div><strong className="text-white">Operating Expenses</strong>: The costs of running your business (rent, supplies, etc.).</div>
                </div>
              </div>
              <div className="bg-smoke p-4 mt-4 rounded">
                <h3 className="gangster-font text-white mb-2">EXAMPLES</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Example 1:</strong> If you buy a product for $10 and sell it for $20, your markup is 100%. If you sell 50 units, your revenue is $1,000 and your profit (before expenses) is $500.</li>
                  <li><strong>Example 2:</strong> If you notice your best-selling product is always out of stock, analytics tells you to order more next time to avoid missed sales.</li>
                  <li><strong>Example 3:</strong> If your accounts receivable is growing, it means customers aren’t paying on time. Use the analytics to follow up and improve your cash flow.</li>
                </ul>
              </div>
              <div className="bg-smoke p-4 mt-4 rounded">
                <h3 className="gangster-font text-white mb-2">PRO TIP</h3>
                <p className="text-sm">
                  Review your analytics weekly. Small changes—like raising prices on bestsellers or cutting slow-moving stock—can make a big difference in your bottom line.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
