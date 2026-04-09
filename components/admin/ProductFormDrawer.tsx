'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';

const itemSchema = z.object({
    item_name: z.string().min(1, 'Name is required'),
    item_price: z.number().min(0, 'Price must be positive'),
    item_discount: z.number().min(0).nullable(),
    item_code: z.string().optional(),
    item_description: z.string().optional(),
    category_id: z.number().nullable(),
    brand_id: z.number().nullable(),
    material_id: z.number().nullable(),
    item_image: z.string().optional(),
});

const variantSchema = z.object({
    color_id: z.number().min(1, 'Color is required'),
    size_id: z.number().min(1, 'Size is required'),
    product_quantity: z.number().min(0, 'Quantity must be >= 0'),
});

interface Variant {
    color_id: number;
    size_id: number;
    product_quantity: number;
}

interface LookupData {
    categories: { category_id: number; category_name: string }[];
    brands: { brand_id: number; brand_name: string }[];
    materials: { material_id: number; material_name: string }[];
    colors: { color_id: number; color_name: string }[];
    sizes: { size_id: number; size_name: string }[];
}

interface ProductFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    lookups: LookupData;
    editData?: any;
}

export default function ProductFormDrawer({
    isOpen,
    onClose,
    onSubmit,
    lookups,
    editData,
}: ProductFormDrawerProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Step 1: Item data
    const [itemName, setItemName] = useState(editData?.item_name || '');
    const [itemPrice, setItemPrice] = useState(editData?.item_price?.toString() || '');
    const [itemDiscount, setItemDiscount] = useState(editData?.item_discount?.toString() || '');
    const [itemCode, setItemCode] = useState(editData?.item_code || '');
    const [itemDescription, setItemDescription] = useState(editData?.item_description || '');
    const [categoryId, setCategoryId] = useState(editData?.category_id?.toString() || '');
    const [brandId, setBrandId] = useState(editData?.brand_id?.toString() || '');
    const [materialId, setMaterialId] = useState(editData?.material_id?.toString() || '');
    const [itemImage, setItemImage] = useState(editData?.item_image || '');

    // Step 2: Variants
    const [variants, setVariants] = useState<Variant[]>(
        editData?.products?.map((p: any) => ({
            color_id: p.color_id,
            size_id: p.size_id,
            product_quantity: p.product_quantity,
        })) || [{ color_id: 0, size_id: 0, product_quantity: 0 }]
    );

    const addVariant = () => {
        setVariants([...variants, { color_id: 0, size_id: 0, product_quantity: 0 }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: number) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const validateStep1 = () => {
        const result = itemSchema.safeParse({
            item_name: itemName,
            item_price: parseFloat(itemPrice) || 0,
            item_discount: itemDiscount ? parseFloat(itemDiscount) : null,
            item_code: itemCode || undefined,
            item_description: itemDescription || undefined,
            category_id: categoryId ? parseInt(categoryId) : null,
            brand_id: brandId ? parseInt(brandId) : null,
            material_id: materialId ? parseInt(materialId) : null,
            item_image: itemImage || undefined,
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0] as string] = issue.message;
            });
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        // Validate variants
        const validVariants = variants.filter((v) => v.color_id > 0 && v.size_id > 0);
        if (validVariants.length === 0) {
            setErrors({ variants: 'At least one valid variant is required' });
            return;
        }

        for (const v of validVariants) {
            const result = variantSchema.safeParse(v);
            if (!result.success) {
                setErrors({ variants: result.error.issues[0].message });
                return;
            }
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            await onSubmit({
                item_name: itemName,
                item_price: parseFloat(itemPrice) || 0,
                item_discount: itemDiscount ? parseFloat(itemDiscount) : null,
                item_code: itemCode || null,
                item_description: itemDescription || null,
                category_id: categoryId ? parseInt(categoryId) : null,
                brand_id: brandId ? parseInt(brandId) : null,
                material_id: materialId ? parseInt(materialId) : null,
                item_image: itemImage || null,
                variants: validVariants,
            });
            onClose();
        } catch (err: any) {
            setErrors({ submit: err.message || 'Submission failed' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="admin-drawer-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="admin-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div className="admin-drawer-title">
                                {editData ? 'Edit Product' : 'Create Product'}
                            </div>
                            <button className="admin-btn admin-btn-sm" onClick={onClose}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Step Indicator */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                            <div
                                style={{
                                    flex: 1,
                                    height: '2px',
                                    background: step >= 1 ? '#ffffff' : '#27272a',
                                    borderRadius: '1px',
                                    transition: 'background 0.3s',
                                }}
                            />
                            <div
                                style={{
                                    flex: 1,
                                    height: '2px',
                                    background: step >= 2 ? '#ffffff' : '#27272a',
                                    borderRadius: '1px',
                                    transition: 'background 0.3s',
                                }}
                            />
                        </div>

                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label className="admin-label">Product Name *</label>
                                        <input
                                            className="admin-input"
                                            value={itemName}
                                            onChange={(e) => setItemName(e.target.value)}
                                            placeholder="e.g. Classic T-Shirt"
                                        />
                                        {errors.item_name && (
                                            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.item_name}</span>
                                        )}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label className="admin-label">Price *</label>
                                            <input
                                                className="admin-input"
                                                type="number"
                                                step="0.01"
                                                value={itemPrice}
                                                onChange={(e) => setItemPrice(e.target.value)}
                                                placeholder="0.00"
                                            />
                                            {errors.item_price && (
                                                <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.item_price}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label className="admin-label">Discount</label>
                                            <input
                                                className="admin-input"
                                                type="number"
                                                step="0.01"
                                                value={itemDiscount}
                                                onChange={(e) => setItemDiscount(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="admin-label">Item Code</label>
                                        <input
                                            className="admin-input"
                                            value={itemCode}
                                            onChange={(e) => setItemCode(e.target.value)}
                                            placeholder="SKU-001"
                                        />
                                    </div>

                                    <div>
                                        <label className="admin-label">Description</label>
                                        <textarea
                                            className="admin-input"
                                            rows={3}
                                            value={itemDescription}
                                            onChange={(e) => setItemDescription(e.target.value)}
                                            placeholder="Product description..."
                                            style={{ resize: 'vertical' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label className="admin-label">Category</label>
                                            <select className="admin-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                                <option value="">None</option>
                                                {lookups.categories.map((c) => (
                                                    <option key={c.category_id} value={c.category_id}>
                                                        {c.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="admin-label">Brand</label>
                                            <select className="admin-select" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                                                <option value="">None</option>
                                                {lookups.brands.map((b) => (
                                                    <option key={b.brand_id} value={b.brand_id}>
                                                        {b.brand_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="admin-label">Material</label>
                                            <select className="admin-select" value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
                                                <option value="">None</option>
                                                {lookups.materials.map((m) => (
                                                    <option key={m.material_id} value={m.material_id}>
                                                        {m.material_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="admin-label">Image Path</label>
                                        <input
                                            className="admin-input"
                                            value={itemImage}
                                            onChange={(e) => setItemImage(e.target.value)}
                                            placeholder="image_filename.jpg"
                                        />
                                    </div>

                                    <button className="admin-btn admin-btn-primary" onClick={handleNext} style={{ marginTop: '0.5rem' }}>
                                        Next — Add Variants →
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>
                                            Variants ({variants.length})
                                        </span>
                                        <button className="admin-btn admin-btn-sm" onClick={addVariant}>
                                            <Plus size={14} /> Add Variant
                                        </button>
                                    </div>

                                    {variants.map((variant, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '1rem',
                                                border: '1px solid #27272a',
                                                borderRadius: '0.5rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Variant #{i + 1}</span>
                                                {variants.length > 1 && (
                                                    <button
                                                        className="admin-btn admin-btn-sm admin-btn-danger"
                                                        onClick={() => removeVariant(i)}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                                <div>
                                                    <label className="admin-label">Color</label>
                                                    <select
                                                        className="admin-select"
                                                        value={variant.color_id}
                                                        onChange={(e) => updateVariant(i, 'color_id', parseInt(e.target.value))}
                                                    >
                                                        <option value="0">Select</option>
                                                        {lookups.colors.map((c) => (
                                                            <option key={c.color_id} value={c.color_id}>
                                                                {c.color_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="admin-label">Size</label>
                                                    <select
                                                        className="admin-select"
                                                        value={variant.size_id}
                                                        onChange={(e) => updateVariant(i, 'size_id', parseInt(e.target.value))}
                                                    >
                                                        <option value="0">Select</option>
                                                        {lookups.sizes.map((s) => (
                                                            <option key={s.size_id} value={s.size_id}>
                                                                {s.size_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="admin-label">Quantity</label>
                                                    <input
                                                        className="admin-input"
                                                        type="number"
                                                        value={variant.product_quantity}
                                                        onChange={(e) => updateVariant(i, 'product_quantity', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {errors.variants && (
                                        <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.variants}</span>
                                    )}
                                    {errors.submit && (
                                        <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.submit}</span>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                        <button className="admin-btn" onClick={() => setStep(1)}>
                                            ← Back
                                        </button>
                                        <button
                                            className="admin-btn admin-btn-primary"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            style={{ flex: 1, opacity: isSubmitting ? 0.6 : 1 }}
                                        >
                                            {isSubmitting ? 'Saving...' : editData ? 'Update Product' : 'Create Product'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
