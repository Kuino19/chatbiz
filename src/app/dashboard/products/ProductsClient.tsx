"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, X, Check, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import styles from "./page.module.css";
import { addProduct, deleteProduct, updateProduct } from "./actions";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  lowStockThreshold: number;
  imageUrl?: string | null;
}

interface ProductsClientProps {
  initialProducts: Product[];
  businessId: string;
}

export default function ProductsClient({ initialProducts, businessId }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [addPending, setAddPending] = useState(false);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  // ── ADD PRODUCT ──
  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    setAddPending(true);
    try {
      const result = await addProduct(formData, businessId);
      if (result.success && result.product) {
        setProducts(prev => [result.product!, ...prev.filter(p => p.id !== result.product!.id)]);
        showToast("success", `"${result.product!.name}" added to your catalog ✓`);
        form.reset();
      } else {
        showToast("error", result.error || "Failed to add product");
      }
    } catch (err: any) {
      console.error("Add product client error:", err);
      showToast("error", err.message || "Failed to add product");
    } finally {
      setAddPending(false);
    }
  }

  // ── DELETE PRODUCT ──
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setIsPending(true);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast("success", `"${name}" removed from catalog`);
      } else {
        showToast("error", result.error || "Failed to delete product");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete product");
    } finally {
      setIsPending(false);
    }
  }

  // ── EDIT PRODUCT ──
  async function handleUpdate(e: React.FormEvent<HTMLFormElement>, product: Product) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsPending(true);
    try {
      const result = await updateProduct(formData, product.id);
      if (result.success && result.product) {
        setProducts(prev => prev.map(p => p.id === product.id ? result.product! : p));
        setEditingId(null);
        showToast("success", `"${result.product!.name}" updated ✓`);
      } else {
        showToast("error", result.error || "Failed to update product");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to update product");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      {/* ── TOAST ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── ADD PRODUCT FORM ── */}
      <div className={`card ${styles.addProductCard}`}>
        <h3>Add New Product</h3>
        <form id="addProductForm" onSubmit={handleAdd} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Product Name</label>
            <input id="name" name="name" type="text" required placeholder="e.g. Smart Watch Pro" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price">Price (₦)</label>
              <input id="price" name="price" type="number" step="0.01" min="0" required placeholder="0.00" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="stock">Stock Qty</label>
              <input id="stock" name="stock" type="number" min="0" required placeholder="0" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="threshold">Low Stock Alert</label>
              <input id="threshold" name="threshold" type="number" min="0" defaultValue="5" required />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description (Optional)</label>
            <textarea id="description" name="description" rows={2} placeholder="Short description shown in WhatsApp catalog" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="image">Product Image (Optional)</label>
            <input id="image" name="image" type="file" accept="image/*" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={addPending}>
            <Plus size={16} />
            {addPending ? "Adding…" : "Add Product"}
          </button>
        </form>
      </div>

      {/* ── PRODUCTS TABLE ── */}
      <div className={styles.productsList}>
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} className={styles.emptyIcon} />
            <p>No products yet. Add your first product above.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  {editingId === product.id ? (
                    /* ── INLINE EDIT ROW ── */
                    <td colSpan={5} className={styles.editRow}>
                      <form
                        onSubmit={(e) => handleUpdate(e, product)}
                        className={styles.editForm}
                      >
                        <div className={styles.editGrid}>
                          <div className={styles.formGroup}>
                            <label>Name</label>
                            <input name="name" defaultValue={product.name} required />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Price (₦)</label>
                            <input name="price" type="number" step="0.01" defaultValue={product.price} required />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Stock</label>
                            <input name="stock" type="number" defaultValue={product.stock} required />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Low Stock Alert</label>
                            <input name="threshold" type="number" defaultValue={product.lowStockThreshold} required />
                          </div>
                          <div className={`${styles.formGroup} ${styles.editDescField}`}>
                            <label>Description</label>
                            <input name="description" defaultValue={product.description || ""} />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Update Image</label>
                            <input name="image" type="file" accept="image/*" />
                          </div>
                        </div>
                        <div className={styles.editActions}>
                          <button type="submit" className={styles.btnSave} disabled={isPending}>
                            <Check size={15} /> {isPending ? "Saving…" : "Save"}
                          </button>
                          <button type="button" className={styles.btnCancelEdit} onClick={() => setEditingId(null)}>
                            <X size={15} /> Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    /* ── NORMAL ROW ── */
                    <>
                      <td>
                        <div className={styles.productInfo}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, marginRight: 12 }} />
                          ) : (
                            <div style={{ width: 40, height: 40, backgroundColor: "#f1f5f9", borderRadius: 4, marginRight: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Package size={20} color="#94a3b8" />
                            </div>
                          )}
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span className={styles.productName}>{product.name}</span>
                            {product.description && (
                              <span className={styles.productDesc}>{product.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={styles.priceCell}>₦{product.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span className={styles.stockCount}>{product.stock}</span>
                        {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                          <span className={styles.badgeWarning}>Low</span>
                        )}
                        {product.stock === 0 && (
                          <span className={styles.badgeDanger}>0</span>
                        )}
                      </td>
                      <td>
                        {product.stock > 0 ? (
                          <span className={styles.badgeSuccess}>In Stock</span>
                        ) : (
                          <span className={styles.badgeDanger}>Out of Stock</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            onClick={() => setEditingId(product.id)}
                            className={styles.btnEdit}
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className={styles.iconBtn}
                            title="Delete"
                            disabled={isPending}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
