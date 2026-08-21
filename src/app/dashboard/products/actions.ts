"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("Cloudinary not configured, skipping image upload.");
    return null;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await new Promise((resolve) => {
      cloudinary.uploader.upload_stream(
        { folder: "chatbiz_products", fetch_format: "auto", quality: "auto" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return resolve(null);
          }
          resolve(result?.secure_url || null);
        }
      ).end(buffer);
    });
  } catch (err) {
    console.error("Image upload exception:", err);
    return null;
  }
}

export async function addProduct(formData: FormData, businessId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business || business.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const name = ((formData.get("name") as string) || "").trim();
    if (!name) return { success: false, error: "Product name is required." };

    const rawPrice = formData.get("price") as string;
    const price = parseFloat(rawPrice);
    if (isNaN(price) || price < 0) {
      return { success: false, error: "Please enter a valid price in Naira." };
    }

    const rawStock = formData.get("stock") as string;
    const stock = parseInt(rawStock, 10);
    const validStock = isNaN(stock) || stock < 0 ? 0 : stock;

    const rawThreshold = formData.get("threshold") as string;
    const threshold = parseInt(rawThreshold, 10);
    const validThreshold = isNaN(threshold) || threshold < 0 ? 5 : threshold;

    const description = ((formData.get("description") as string) || "").trim() || null;
    const imageFile = formData.get("image") as File | null;
    const imageUrl = imageFile && imageFile.size > 0 ? await uploadImage(imageFile) : null;

    const product = await db.product.create({
      data: {
        businessId,
        name,
        price,
        stock: validStock,
        lowStockThreshold: validThreshold,
        description,
        imageUrl,
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        imageUrl: product.imageUrl,
      },
    };
  } catch (e: any) {
    console.error("Add Product Error:", e);
    return { success: false, error: e.message || "Failed to add product" };
  }
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const product = await db.product.findUnique({ where: { id }, include: { business: true } });
  if (!product || product.business.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    console.error("Delete Product Error:", e);
    return { success: false, error: e.message || "Failed to delete product" };
  }
}

export async function updateProduct(formData: FormData, id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const product = await db.product.findUnique({ where: { id }, include: { business: true } });
  if (!product || product.business.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const name = ((formData.get("name") as string) || "").trim();
    if (!name) return { success: false, error: "Product name is required." };

    const rawPrice = formData.get("price") as string;
    const price = parseFloat(rawPrice);
    if (isNaN(price) || price < 0) {
      return { success: false, error: "Please enter a valid price." };
    }

    const rawStock = formData.get("stock") as string;
    const stock = parseInt(rawStock, 10);
    const validStock = isNaN(stock) || stock < 0 ? 0 : stock;

    const rawThreshold = formData.get("threshold") as string;
    const threshold = parseInt(rawThreshold, 10);
    const validThreshold = isNaN(threshold) || threshold < 0 ? 5 : threshold;

    const description = ((formData.get("description") as string) || "").trim() || null;
    const imageFile = formData.get("image") as File | null;
    
    let newImageUrl = undefined;
    if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) newImageUrl = uploadedUrl;
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        name,
        price,
        stock: validStock,
        lowStockThreshold: validThreshold,
        description,
        ...(newImageUrl && { imageUrl: newImageUrl }),
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");

    return {
      success: true,
      product: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        price: updated.price,
        stock: updated.stock,
        lowStockThreshold: updated.lowStockThreshold,
        imageUrl: updated.imageUrl,
      },
    };
  } catch (e: any) {
    console.error("Update Product Error:", e);
    return { success: false, error: e.message || "Failed to update product" };
  }
}

