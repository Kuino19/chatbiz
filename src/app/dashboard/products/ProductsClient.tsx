"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Pencil, X, Check, Package, AlertCircle, CheckCircle2, RefreshCw, UploadCloud, FileSpreadsheet } from "lucide-react";
import styles from "./page.module.css";
import { addProduct, deleteProduct, updateProduct, syncWhatsAppCatalog, importProductsCsv, importFromCatalogLink } from "./actions";
import { Link2, Sparkles } from "lucide-react";

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
  const [syncPending, setSyncPending] = useState(false);
  const [csvPending, setCsvPending] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPending, setLinkPending] = useState(false);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
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

  // ── SYNC FROM WHATSAPP CATALOG ──
  async function handleSyncWhatsApp() {
    setSyncPending(true);
    try {
      const res = await syncWhatsAppCatalog(businessId);
      if (res.success) {
        showToast("success", res.message || `Successfully synced catalog from WhatsApp!`);
        window.location.reload();
      } else {
        showToast("error", res.error || "Could not sync WhatsApp catalog");
      }
    } catch (err: any) {
      showToast("error", err.message || "WhatsApp sync failed");
    } finally {
      setSyncPending(false);
    }
  }

  // ── AI STORE LINK IMPORT ──
  async function handleLinkImport(e: React.FormEvent) {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    setLinkPending(true);
    try {
      const res = await importFromCatalogLink(linkUrl, businessId);
      if (res.success) {
        showToast("success", res.message || `Extracted products from your link!`);
        setLinkModalOpen(false);
        setLinkUrl("");
        window.location.reload();
      } else {
        showToast("error", res.error || "Failed to extract products from link");
      }
    } catch (err: any) {
      showToast("error", err.message || "Link import failed");
    } finally {
      setLinkPending(false);
    }
  }

  // ── BULK CSV IMPORT ──
  async function handleCsvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csvFile", file);

    setCsvPending(true);
    try {
      const res = await importProductsCsv(formData, businessId);
      if (res.success) {
        showToast("success", res.message || `Imported ${res.count} products from CSV!`);
        window.location.reload();
      } else {
        showToast("error", res.error || "Failed to import CSV");
      }
    } catch (err: any) {
      showToast("error", err.message || "CSV import failed");
    } finally {
      setCsvPending(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
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

  // ── DOWNLOAD SAMPLE CSV ──
  function downloadSampleCsv() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Price,Stock,Description,Image_URL\n" +
      "Sneakers Pro,15000,50,High quality running shoes,https://images.unsplash.com/photo-1542291026-7eec264c27ff\n" +
      "Leather Handbag,25000,20,Classic brown handbag,https://images.unsplash.com/photo-1584917865442-de89df76afd3\n" +
      "Smart Watch,35000,15,Bluetooth health tracking watch,\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "chatbiz_products_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* ── IMPORT & QUICK ACTIONS TOOLBAR ── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setLinkModalOpen(true)}
          className="btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            color: "#ffffff",
            fontWeight: 600,
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(99, 102, 241, 0.25)"
          }}
        >
          <Sparkles size={16} />
          ✨ AI Import from Store Link
        </button>

        <input
          type="file"
          accept=".csv"
          ref={csvInputRef}
          style={{ display: "none" }}
          onChange={handleCsvFileChange}
        />

        <button
          type="button"
          onClick={() => csvInputRef.current?.click()}
          disabled={csvPending}
          className="btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#0f172a",
            color: "#ffffff",
            fontWeight: 600,
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            cursor: csvPending ? "not-allowed" : "pointer"
          }}
        >
          <FileSpreadsheet size={16} />
          {csvPending ? "Importing CSV..." : "Bulk CSV Import"}
        </button>

        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
          or{" "}
          <button
            type="button"
            onClick={downloadSampleCsv}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#4f46e5",
              textDecoration: "underline",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            download sample CSV template
          </button>
        </span>
      </div>

      {/* ── AI LINK IMPORT MODAL ── */}
      {linkModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>AI Store Link Importer</h3>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.5 }}>
              Paste your public WhatsApp catalog link (e.g. <code>wa.me/c/23480...</code>) or online store URL. Our AI will extract product photos, names, and prices into your review table.
            </p>

            <form onSubmit={handleLinkImport}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Catalog or Store URL
                </label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://wa.me/c/2348012345678 or https://mystore.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#475569",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkPending}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: linkPending ? "not-allowed" : "pointer"
                  }}
                >
                  {linkPending ? "AI is Extracting Products..." : "Extract Products"}
                </button>
              </div>
            </form>
          </div>
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
