"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  saveBusinessData, 
  saveInventory, 
  saveCustomers, 
  saveTransactions, 
  saveScenarios,
  loadAllData,
  saveAllData
} from "@/app/(root)/actions";
import { BusinessData, InventoryItem, Customer, Transaction, ScenarioData, defaultBusinessData } from "@/lib/data";
import { useToast } from "./use-toast";

export interface UsePersistentStateOptions {
  autoSave?: boolean;
  autoSaveDelay?: number; // in milliseconds
  showToasts?: boolean;
}

// Default options
const DEFAULT_OPTIONS: UsePersistentStateOptions = {
  autoSave: true,
  autoSaveDelay: 2000, // 2 seconds
  showToasts: true
};

export function usePersistentState(options: UsePersistentStateOptions = DEFAULT_OPTIONS) {
  // Toast notifications
  const { toast } = useToast();
  
  // State management for all data types
  const [businessData, setBusinessDataInternal] = useState<BusinessData>(defaultBusinessData);
  const [inventory, setInventoryInternal] = useState<InventoryItem[]>([]);
  const [customers, setCustomersInternal] = useState<Customer[]>([]);
  const [transactions, setTransactionsInternal] = useState<Transaction[]>([]);
  const [scenarios, setScenariosInternal] = useState<ScenarioData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-save management
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaves = useRef<{
    businessData?: boolean;
    inventory?: boolean;
    customers?: boolean;
    transactions?: boolean;
    scenarios?: boolean;
  }>({});

  // Merged options
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Load data on initial render
  useEffect(() => {
    async function fetchAllData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await loadAllData();
        
        if (result.success) {
          if (result.businessData) setBusinessDataInternal(result.businessData);
          if (result.inventory) setInventoryInternal(result.inventory);
          if (result.customers) setCustomersInternal(result.customers);
          if (result.transactions) setTransactionsInternal(result.transactions);
          if (result.scenarios) setScenariosInternal(result.scenarios);
        } else {
          setError(result.error || "Failed to load data");
          if (mergedOptions.showToasts) {
            toast({
              title: "Error loading data",
              description: result.error || "Failed to load data",
              variant: "destructive"
            });
          }
        }
      } catch (err) {
        console.error("Error in fetchAllData:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAllData();
  }, [mergedOptions.showToasts, toast]);

  // Schedule an auto-save with throttling
  const scheduleSave = useCallback(() => {
    if (!mergedOptions.autoSave) return;
    
    // Clear existing timeout if there is one
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const savePayload = {
          businessData: pendingSaves.current.businessData ? businessData : undefined,
          inventory: pendingSaves.current.inventory ? inventory : undefined,
          customers: pendingSaves.current.customers ? customers : undefined,
          transactions: pendingSaves.current.transactions ? transactions : undefined,
          scenarios: pendingSaves.current.scenarios ? scenarios : undefined
        };
        
        const result = await saveAllData(savePayload);
        
        if (!result.success && mergedOptions.showToasts) {
          toast({
            title: "Error saving changes",
            description: result.error || "Your changes couldn't be saved",
            variant: "destructive"
          });
        }
        
        // Reset pending saves
        pendingSaves.current = {};
      } catch (err) {
        console.error("Error auto-saving data:", err);
        if (mergedOptions.showToasts) {
          toast({
            title: "Error saving changes",
            description: err instanceof Error ? err.message : "Unknown error",
            variant: "destructive"
          });
        }
      }
    }, mergedOptions.autoSaveDelay);
  }, [businessData, inventory, customers, transactions, scenarios, mergedOptions, toast]);

  // Wrapped state setters that trigger auto-save
  const setBusinessData = useCallback((newData: BusinessData | ((prev: BusinessData) => BusinessData)) => {
    setBusinessDataInternal(newData);
    pendingSaves.current.businessData = true;
    scheduleSave();
  }, [scheduleSave]);

  const setInventory = useCallback((newInventory: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => {
    setInventoryInternal(newInventory);
    pendingSaves.current.inventory = true;
    scheduleSave();
  }, [scheduleSave]);

  const setCustomers = useCallback((newCustomers: Customer[] | ((prev: Customer[]) => Customer[])) => {
    setCustomersInternal(newCustomers);
    pendingSaves.current.customers = true;
    scheduleSave();
  }, [scheduleSave]);

  const setTransactions = useCallback((newTransactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    setTransactionsInternal(newTransactions);
    pendingSaves.current.transactions = true;
    scheduleSave();
  }, [scheduleSave]);

  const setScenarios = useCallback((newScenarios: ScenarioData[] | ((prev: ScenarioData[]) => ScenarioData[])) => {
    setScenariosInternal(newScenarios);
    pendingSaves.current.scenarios = true;
    scheduleSave();
  }, [scheduleSave]);

  // Manual save function for immediate saving
  const saveAllChanges = useCallback(async () => {
    try {
      setError(null);
      
      const result = await saveAllData( {
          businessData,
          inventory,
          customers,
          transactions,
          scenarios
      } );
      
      if (result.success) {
        if (mergedOptions.showToasts) {
          toast({
            title: "Changes saved",
            description: "All your data has been saved successfully"
          });
        }
        return true;
      } else {
        setError(result.error || "Failed to save data");
        if (mergedOptions.showToasts) {
          toast({
            title: "Error saving changes",
            description: result.error || "Your changes couldn't be saved",
            variant: "destructive"
          });
        }
        return false;
      }
    } catch (err) {
      console.error("Error in saveAllChanges:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      if (mergedOptions.showToasts) {
        toast({
          title: "Error saving changes",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive"
        });
      }
      return false;
    }
  }, [businessData, inventory, customers, transactions, scenarios, mergedOptions.showToasts, toast]);

  // Add a transaction and update inventory automatically
  const addTransaction = useCallback((transaction: Transaction) => {
    // Add to transactions state
    setTransactions(prev => [...prev, transaction]);
    
    // If it's a sale or purchase, update inventory accordingly
    if (transaction.type === "sale" || transaction.type === "purchase") {
      if (transaction.inventoryId) {
        setInventory(prev => {
          return prev.map(item => {
            if (item.id === transaction.inventoryId) {
              // For sales, decrease quantity; for purchases, increase
              const quantityChange = transaction.type === "sale" 
                ? -transaction.quantityGrams 
                : transaction.quantityGrams;
                
              const newQuantityG = item.quantityG + quantityChange;
              const newQuantityOz = newQuantityG / 28.3495;
              const newQuantityKg = newQuantityG / 1000;
              
              return {
                ...item,
                quantityG: newQuantityG,
                quantityOz: newQuantityOz,
                quantityKg: newQuantityKg
              };
            }
            return item;
          });
        });
      }
    }
    
    // If the transaction is linked to a customer, update their record
    if (transaction.customerId) {
      setCustomers(prev => {
        return prev.map(customer => {
          if (customer.id === transaction.customerId) {
            // For sales, increase amount owed; for payments, decrease
            let amountChange = 0;
            
            if (transaction.type === "sale") {
              amountChange = transaction.totalPrice;
            } else if (transaction.type === "payment") {
              amountChange = -transaction.totalPrice;
              
              // Also add to payment history
              const payment = {
                id: transaction.id,
                amount: transaction.totalPrice,
                date: transaction.date,
                method: transaction.paymentMethod,
                notes: transaction.notes,
                createdAt: transaction.createdAt
              };
              
              return {
                ...customer,
                amountOwed: Math.max(0, customer.amountOwed - transaction.totalPrice),
                status: customer.amountOwed - transaction.totalPrice <= 0 ? "paid" : "partial",
                paymentHistory: [...customer.paymentHistory, payment]
              };
            }
            
            const newAmountOwed = Math.max(0, customer.amountOwed + amountChange);
            
            return {
              ...customer,
              amountOwed: newAmountOwed,
              status: newAmountOwed > 0 ? "unpaid" : "paid",
            };
          }
          return customer;
        });
      });
    }
  }, [setTransactions, setInventory, setCustomers]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    businessData,
    setBusinessData,
    inventory,
    setInventory,
    customers,
    setCustomers,
    transactions,
    setTransactions,
    scenarios,
    setScenarios,
    isLoading,
    error,
    saveAllChanges,
    addTransaction
  };
}
