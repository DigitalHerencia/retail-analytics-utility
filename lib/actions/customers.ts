"use server"

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCustomer, updateCustomer } from "../fetchers/customers";
import { Customer } from "@/types";

export async function saveCustomer(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string) || "Anonymous Client";
  const phone = (formData.get("phone") as string) || "";
  const amountOwed = parseFloat((formData.get("amountOwed") as string) || "0");
  const dueDate = (formData.get("dueDate") as string) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const notes = (formData.get("notes") as string) || "";
  const paymentHistory = formData.get("paymentHistory") ? JSON.parse(formData.get("paymentHistory") as string) : [];
  const status = amountOwed === 0 ? "paid" : "unpaid" as const;

  if (id) {
    // Update existing customer
    const customer: Customer = {
      id,
      name,
      phone,
      email: "",
      address: "",
      amountOwed,
      dueDate,
      status,
      paymentHistory,
      notes,
      createdAt: formData.get("createdAt") as string || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await updateCustomer(userId, customer);
  } else {
    // Create new customer
    const customer: Omit<Customer, "id" | "createdAt" | "updatedAt"> = {
      name,
      phone,
      email: "",
      address: "",
      amountOwed,
      dueDate,
      status,
      paymentHistory,
      notes,
    };
    await createCustomer(userId, customer);
  }

  revalidatePath("/customers");
  revalidatePath("/");
  return { success: true };
}
