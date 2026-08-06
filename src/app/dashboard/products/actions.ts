"use server";

import { db } from "@/lib/db";

export async function addProduct(formData: FormData, businessId: string) {
  try {
    const product = await db.product.create({
      data: {
        businessId,
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string, 10),
        lowStockThreshold: parseInt(formData.get("threshold") as string, 10),
        description: (formData.get("description") as string) || null,
      },
    });
    return { success: true, product };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({ where: { id } });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateProduct(formData: FormData, id: string) {
  try {
    const product = await db.product.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string, 10),
        lowStockThreshold: parseInt(formData.get("threshold") as string, 10),
        description: (formData.get("description") as string) || null,
      },
    });
    return { success: true, product };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
