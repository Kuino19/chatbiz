"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary auto-configures if CLOUDINARY_URL is in environment variables.

async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "chatbiz_products", fetch_format: "auto", quality: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return reject(error);
        }
        resolve(result?.secure_url || null);
      }
    ).end(buffer);
  });
}

export async function addProduct(formData: FormData, businessId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business || business.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const imageFile = formData.get("image") as File | null;
    const imageUrl = imageFile && imageFile.size > 0 ? await uploadImage(imageFile) : null;

    const product = await db.product.create({
      data: {
        businessId,
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string, 10),
        lowStockThreshold: parseInt(formData.get("threshold") as string, 10),
        description: (formData.get("description") as string) || null,
        imageUrl,
      },
    });
    return { success: true, product };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const product = await db.product.findUnique({ where: { id }, include: { business: true } });
  if (!product || product.business.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.product.delete({ where: { id } });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateProduct(formData: FormData, id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const product = await db.product.findUnique({ where: { id }, include: { business: true } });
  if (!product || product.business.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const imageFile = formData.get("image") as File | null;
    let newImageUrl = undefined; // Undefined means don't update this field if no new file
    
    if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) newImageUrl = uploadedUrl;
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string, 10),
        lowStockThreshold: parseInt(formData.get("threshold") as string, 10),
        description: (formData.get("description") as string) || null,
        ...(newImageUrl && { imageUrl: newImageUrl }),
      },
    });
    return { success: true, product: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

