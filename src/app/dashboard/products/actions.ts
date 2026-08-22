"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

function initCloudinary() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) return;

  try {
    const parsed = new URL(url);
    const cloud_name = parsed.hostname;
    const api_key = parsed.username;
    const api_secret = parsed.password;

    if (cloud_name && api_key && api_secret) {
      cloudinary.config({
        cloud_name,
        api_key,
        api_secret,
        secure: true,
      });
    }
  } catch (e) {
    console.error("Failed to parse CLOUDINARY_URL:", e);
  }
}

async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  initCloudinary();

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
          console.log("[Cloudinary Upload Success]", result?.secure_url);
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

import { decryptToken } from "@/lib/crypto";

export async function syncWhatsAppCatalog(businessId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business || business.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const token = decryptToken(business.metaAccessToken);
  if (!token) {
    return { success: false, error: "WhatsApp is not connected. Please connect WhatsApp in Settings first." };
  }

  try {
    let catalogId: string | null = null;

    // 1. Check if catalog is directly assigned to WABA
    if (business.wabaId) {
      const catRes = await fetch(
        `https://graph.facebook.com/v21.0/${business.wabaId}/assigned_product_catalogs?access_token=${token}`
      );
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.data && catData.data.length > 0) {
          catalogId = catData.data[0].id;
        }
      }
    }

    // 2. Check commerce settings on phone number
    if (!catalogId && business.metaPhoneNumberId) {
      const commRes = await fetch(
        `https://graph.facebook.com/v21.0/${business.metaPhoneNumberId}/whatsapp_commerce_settings?access_token=${token}`
      );
      if (commRes.ok) {
        const commData = await commRes.json();
        if (commData.data?.[0]?.catalog_id) {
          catalogId = commData.data[0].catalog_id;
        }
      }
    }

    if (!catalogId) {
      return {
        success: false,
        error: "No Meta Commerce Catalog found linked to your WhatsApp account. You can create or link one in Meta Commerce Manager, or use Bulk CSV Import to upload products in seconds.",
      };
    }

    // 3. Fetch products from Meta Catalog
    const prodRes = await fetch(
      `https://graph.facebook.com/v21.0/${catalogId}/products?fields=id,name,description,price,currency,image_url,availability&limit=150&access_token=${token}`
    );

    if (!prodRes.ok) {
      const errText = await prodRes.text();
      console.error("Meta Catalog Fetch Error:", errText);
      return { success: false, error: "Failed to fetch products from your Meta Catalog." };
    }

    const prodData = await prodRes.json();
    const metaProducts = prodData.data || [];

    if (metaProducts.length === 0) {
      return { success: false, error: "Catalog found, but it currently has 0 products." };
    }

    let importedCount = 0;
    for (const item of metaProducts) {
      if (!item.name) continue;

      let price = 0;
      if (typeof item.price === "number") {
        price = item.price;
      } else if (typeof item.price === "string") {
        const cleaned = item.price.replace(/[^0-9.]/g, "");
        price = parseFloat(cleaned) || 0;
      }

      // Re-upload ephemeral Meta CDN image to permanent Cloudinary storage
      let permanentImageUrl: string | null = null;
      if (item.image_url && item.image_url.startsWith("http")) {
        initCloudinary();
        try {
          const uploadRes = await cloudinary.uploader.upload(item.image_url, {
            folder: "chatbiz_products",
            fetch_format: "auto",
            quality: "auto",
          });
          permanentImageUrl = uploadRes?.secure_url || null;
        } catch (imgErr) {
          console.warn("Could not re-upload Meta CDN image to Cloudinary, fallback to source URL:", imgErr);
          permanentImageUrl = item.image_url;
        }
      }

      // Meta catalog provides boolean status (in stock / out of stock), not numeric stock counts.
      // Default to 10 for in-stock items with a reminder for the vendor to verify quantities.
      const initialStock = item.availability === "in stock" ? 10 : 0;

      await db.product.create({
        data: {
          businessId,
          name: item.name,
          description: item.description || null,
          price,
          stock: initialStock,
          lowStockThreshold: 5,
          imageUrl: permanentImageUrl,
        },
      });
      importedCount++;
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");

    return {
      success: true,
      count: importedCount,
      message: `Imported ${importedCount} product(s) from Meta Catalog! Please review prices and update your stock counts.`,
    };
  } catch (err: any) {
    console.error("Sync WhatsApp Catalog Exception:", err);
    return { success: false, error: err.message || "Failed to import catalog from WhatsApp" };
  }
}

export async function importProductsCsv(formData: FormData, businessId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business || business.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("csvFile") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Please select a valid CSV file to upload." };
  }

  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return { success: false, error: "CSV file is empty or has no data rows." };
    }

    const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const nameIdx = header.findIndex((h) => h.includes("name") || h.includes("title"));
    const priceIdx = header.findIndex((h) => h.includes("price") || h.includes("amount") || h.includes("cost"));
    const stockIdx = header.findIndex((h) => h.includes("stock") || h.includes("qty") || h.includes("quantity"));
    const descIdx = header.findIndex((h) => h.includes("desc") || h.includes("detail"));
    const imgIdx = header.findIndex((h) => h.includes("image") || h.includes("photo") || h.includes("url") || h.includes("pic"));

    if (nameIdx === -1) {
      return { success: false, error: "Could not find a 'Name' or 'Title' column in your CSV header." };
    }

    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvRow(lines[i]);
      if (!row || row.length === 0) continue;

      const name = (row[nameIdx] || "").trim();
      if (!name) continue;

      const priceRaw = priceIdx !== -1 && row[priceIdx] ? row[priceIdx] : "0";
      const price = parseFloat(priceRaw.replace(/[^0-9.]/g, "")) || 0;

      const stockRaw = stockIdx !== -1 && row[stockIdx] ? row[stockIdx] : "20";
      const stock = parseInt(stockRaw.replace(/[^0-9]/g, ""), 10) || 20;

      const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : null;
      const imageUrl = imgIdx !== -1 && row[imgIdx] ? row[imgIdx].trim() : null;

      await db.product.create({
        data: {
          businessId,
          name,
          price,
          stock,
          lowStockThreshold: 5,
          description,
          imageUrl: imageUrl && imageUrl.startsWith("http") ? imageUrl : null,
        },
      });
      count++;
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");

    return {
      success: true,
      count,
      message: `Successfully imported ${count} product(s) from your CSV file!`,
    };
  } catch (err: any) {
    console.error("Import CSV Exception:", err);
    return { success: false, error: err.message || "Failed to process CSV file." };
  }
}

function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"' || char === "'") {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ""));
  return result;
}

