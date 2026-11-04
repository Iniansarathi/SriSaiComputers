'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { Upload, X, Plus, Eye, Save, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ProductFormProps {
  initialData?: Partial<Product>;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Form Field States
  const [title, setTitle] = useState(initialData?.title || '');
  const [brand, setBrand] = useState(initialData?.brand || 'Lenovo');
  const [model, setModel] = useState(initialData?.model || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [condition, setCondition] = useState(initialData?.condition || 'Very Good');
  const [status, setStatus] = useState(initialData?.status || 'AVAILABLE');
  const [featured, setFeatured] = useState(initialData?.featured || false);

  const [processorBrand, setProcessorBrand] = useState(initialData?.processor_brand || 'Intel');
  const [processorModel, setProcessorModel] = useState(initialData?.processor_model || 'Core i5-8350U');
  const [processorGen, setProcessorGen] = useState(initialData?.processor_generation || '8th Gen');

  const [ram, setRam] = useState(initialData?.ram || '16 GB');
  const [ramType, setRamType] = useState(initialData?.ram_type || 'DDR4');
  const [storageCapacity, setStorageCapacity] = useState(initialData?.storage_capacity || '512 GB');
  const [storageType, setStorageType] = useState(initialData?.storage_type || 'NVMe SSD');

  const [screenSize, setScreenSize] = useState(initialData?.screen_size || '14"');
  const [resolution, setResolution] = useState(initialData?.resolution || '1920x1080 Full HD');
  const [gpu, setGpu] = useState(initialData?.gpu || 'Intel UHD Graphics');
  const [os, setOs] = useState(initialData?.operating_system || 'Windows 11 Pro');

  const [conditionNotes, setConditionNotes] = useState(initialData?.condition_notes || '');
  const [batteryCondition, setBatteryCondition] = useState(initialData?.battery_condition || '3+ Hours Tested Backup');
  const [keyboardLayout, setKeyboardLayout] = useState(initialData?.keyboard_layout || 'English US');
  const [ports, setPorts] = useState(initialData?.ports || 'USB 3.1, USB-C, HDMI, Audio Jack');
  const [connectivity, setConnectivity] = useState(initialData?.connectivity || 'Wi-Fi 5, Bluetooth 4.2');
  const [accessories, setAccessories] = useState(initialData?.accessories || 'Original Power Adapter included');
  const [description, setDescription] = useState(initialData?.description || '');

  // Image Upload State
  const initialImages = initialData?.images?.map(i => i.image_url) || (initialData?.primary_image ? [initialData.primary_image] : []);
  const [images, setImages] = useState<string[]>(initialImages);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auto-fill Title when Brand & Model change
  const handleAutoTitle = () => {
    if (brand && model && processorModel && ram && storageCapacity) {
      setTitle(`${brand} ${model} — ${processorBrand} ${processorModel} (${ram} / ${storageCapacity})`);
    }
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.url) {
        setImages(prev => [...prev, data.url]);
      } else {
        setError(data.error || 'Failed to upload photo');
      }
    } catch (err: any) {
      setError('Error uploading image file');
    } finally {
      setUploadingImage(false);
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    setImages(prev => {
      const chosen = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [chosen, ...rest];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !brand || !model || !price) {
      setError('Please fill out all required basic fields (Title, Brand, Model, Price).');
      setLoading(false);
      return;
    }

    const payload = {
      title,
      brand,
      model,
      sku,
      price: Number(price),
      condition,
      status,
      featured,
      processor_brand: processorBrand,
      processor_model: processorModel,
      processor_generation: processorGen,
      ram,
      ram_type: ramType,
      storage_capacity: storageCapacity,
      storage_type: storageType,
      screen_size: screenSize,
      resolution,
      gpu,
      operating_system: os,
      condition_notes: conditionNotes,
      battery_condition: batteryCondition,
      keyboard_layout: keyboardLayout,
      ports,
      connectivity,
      accessories,
      description,
      images
    };

    try {
      const url = isEdit ? `/api/products/${initialData?.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        router.push('/admin/inventory');
        router.refresh();
      } else {
        setError(data.error || 'Failed to save product');
      }
    } catch (err: any) {
      setError('Network error saving product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-extrabold text-white text-lg">
              {isEdit ? 'Edit Laptop Listing' : 'Add New Laptop Listing'}
            </h2>
            <p className="text-xs text-slate-400">Fill in technical specs and shop photos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors border border-slate-700"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Preview Listing</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Listing...' : (isEdit ? 'Update Laptop' : 'Publish Laptop')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Specs & Info (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Basic Laptop Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Basic Information</h3>
              <button
                type="button"
                onClick={handleAutoTitle}
                className="text-[11px] font-bold text-blue-400 hover:underline"
              >
                ⚡ Auto-generate Title
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase">Product Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lenovo ThinkPad T480 — Intel Core i5 8th Gen (16GB RAM / 512GB SSD)"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Brand *</label>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-medium"
                >
                  <option value="Dell">Dell</option>
                  <option value="HP">HP</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="Apple">Apple</option>
                  <option value="Acer">Acer</option>
                  <option value="Asus">Asus</option>
                  <option value="Other">Other Brand</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Model *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. ThinkPad T480"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Shop Listed Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 24500"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Internal SKU Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="e.g. SSC-LNV-T480"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Condition Grade</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-semibold"
                >
                  <option value="Excellent">Excellent (Pristine / Like New)</option>
                  <option value="Very Good">Very Good (Minor Cosmetic Marks)</option>
                  <option value="Good">Good (Visible Scratch / Normal Wear)</option>
                  <option value="Fair">Fair (Heavy Cosmetic Wear)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Stock Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-bold"
                >
                  <option value="AVAILABLE">AVAILABLE (Public Listing)</option>
                  <option value="RESERVED">RESERVED (Hold State)</option>
                  <option value="SOLD">SOLD (Out of Stock)</option>
                  <option value="HIDDEN">HIDDEN (Private)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Technical Specifications</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Processor Brand</label>
                <input
                  type="text"
                  value={processorBrand}
                  onChange={e => setProcessorBrand(e.target.value)}
                  placeholder="Intel / AMD / Apple"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Processor Model</label>
                <input
                  type="text"
                  value={processorModel}
                  onChange={e => setProcessorModel(e.target.value)}
                  placeholder="Core i5-8350U"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">CPU Generation</label>
                <input
                  type="text"
                  value={processorGen}
                  onChange={e => setProcessorGen(e.target.value)}
                  placeholder="8th Gen"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">RAM</label>
                <input
                  type="text"
                  value={ram}
                  onChange={e => setRam(e.target.value)}
                  placeholder="16 GB"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">RAM Type</label>
                <input
                  type="text"
                  value={ramType}
                  onChange={e => setRamType(e.target.value)}
                  placeholder="DDR4"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Storage Capacity</label>
                <input
                  type="text"
                  value={storageCapacity}
                  onChange={e => setStorageCapacity(e.target.value)}
                  placeholder="512 GB"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Storage Type</label>
                <input
                  type="text"
                  value={storageType}
                  onChange={e => setStorageType(e.target.value)}
                  placeholder="NVMe SSD"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Screen Size</label>
                <input
                  type="text"
                  value={screenSize}
                  onChange={e => setScreenSize(e.target.value)}
                  placeholder="14&quot;"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Resolution</label>
                <input
                  type="text"
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  placeholder="1920x1080 Full HD"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Condition & Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Condition & Overview</h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Shop Condition Notes</label>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={e => setConditionNotes(e.target.value)}
                  placeholder="e.g. Minor cosmetic marks on lid. Display and keyboard pristine. Fully tested."
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Battery Backup Condition</label>
                <input
                  type="text"
                  value={batteryCondition}
                  onChange={e => setBatteryCondition(e.target.value)}
                  placeholder="e.g. 3+ Hours Backup Tested"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Product Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter detailed description or store summary..."
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Photos & Media Manager (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Product Photos</span>
              </h3>
              <span className="text-[11px] text-slate-400">{images.length} Photos</span>
            </div>

            {/* Photo Uploader */}
            <div className="space-y-3">
              <label className="block p-4 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-center cursor-pointer transition-colors bg-slate-950">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-300 block">
                  {uploadingImage ? 'Uploading Image...' : 'Upload Real Photo File'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">JPEG, PNG, WEBP up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-800"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="bg-slate-800 hover:bg-slate-750 text-white px-3 py-2 rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Image List Preview & Selector */}
            {images.length > 0 ? (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Click image to set Primary</div>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-slate-950 group ${
                        idx === 0 ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          PRIMARY
                        </span>
                      )}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="bg-rose-600 text-white p-1 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs bg-slate-950 rounded-xl">
                No photos uploaded yet. Upload high quality photos of lid, screen, keyboard & ports.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="font-extrabold text-xs uppercase tracking-wider text-blue-600">
                Live Public Product Preview
              </span>
              <button onClick={() => setPreviewModalOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="aspect-16/9 bg-slate-100 rounded-xl overflow-hidden relative">
                <img
                  src={images[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-xl text-slate-900">{title || 'Product Title Preview'}</h3>
                <div className="text-2xl font-black text-slate-900">₹{Number(price || 0).toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-600">
                  {processorBrand} {processorModel} • {ram} RAM • {storageCapacity} {storageType} • {condition} Condition
                </div>
              </div>

              <div className="bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs text-center">
                💬 WhatsApp Enquiry Link (Auto Pre-filled with Specs)
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
