'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { showToast } from '@/features/ui/uiSlice';
import { Package, Plus, Minus, Search, ShoppingCart, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'Supplements' | 'Apparel' | 'Hydration' | 'Gear';
  price: number;
  stock: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Whey Isolate Protein (Chocolate 2lb)',
    category: 'Supplements',
    price: 49.99,
    stock: 24,
    unit: 'tubs',
    status: 'In Stock',
  },
  {
    id: '2',
    name: 'Nitric Explosion Pre-Workout (Blue Razz)',
    category: 'Supplements',
    price: 38.5,
    stock: 14,
    unit: 'tubs',
    status: 'In Stock',
  },
  {
    id: '3',
    name: 'Arche Elite Gym Towel (Microfiber)',
    category: 'Gear',
    price: 15.0,
    stock: 35,
    unit: 'units',
    status: 'In Stock',
  },
  {
    id: '4',
    name: 'Electrolyte Mineral Hydration (500ml)',
    category: 'Hydration',
    price: 3.5,
    stock: 4,
    unit: 'bottles',
    status: 'Low Stock',
  },
  {
    id: '5',
    name: 'Ironpulse Heavyweight Lifting Straps',
    category: 'Gear',
    price: 22.0,
    stock: 0,
    unit: 'pairs',
    status: 'Out of Stock',
  },
  {
    id: '6',
    name: 'Arche Athletic Performance T-Shirt (L)',
    category: 'Apparel',
    price: 28.0,
    stock: 18,
    unit: 'shirts',
    status: 'In Stock',
  },
];

export default function InventoryView() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStockChange = (id: string, delta: number, name: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta);
          let newStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (newStock === 0) newStatus = 'Out of Stock';
          else if (newStock <= 5) newStatus = 'Low Stock';

          return { ...item, stock: newStock, status: newStatus };
        }
        return item;
      })
    );

    dispatch(
      showToast({
        message: `Updated stock for ${name} (${delta > 0 ? '+1' : '-1'})`,
        type: 'info',
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Pro Shop &amp; Gym Supplies Inventory
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage supplements, apparel, hydration beverages and locker supplies
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory items..."
            className="w-full pl-9 pr-4 py-2 bg-[#070E1C] border border-[#142644] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['All', 'Supplements', 'Apparel', 'Hydration', 'Gear'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-lime-400 text-black'
                  : 'bg-[#0E1E38] text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-[#1E3A66] transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#0E1E38] text-slate-400 border border-[#18315B] uppercase font-mono">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'In Stock'
                      ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                      : item.status === 'Low Stock'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-white mt-3 leading-snug">{item.name}</h3>
              <p className="text-lg font-extrabold text-lime-400 font-mono mt-1">
                ${item.price.toFixed(2)} USD
              </p>
            </div>

            <div className="pt-3 border-t border-[#12223c] flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Current Stock:{' '}
                <span className="font-extrabold text-white font-mono text-sm">
                  {item.stock}
                </span>{' '}
                {item.unit}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStockChange(item.id, -1, item.name)}
                  disabled={item.stock <= 0}
                  className="w-7 h-7 rounded-lg bg-[#0E1E38] hover:bg-[#14294C] disabled:opacity-30 border border-[#18315B] text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStockChange(item.id, 1, item.name)}
                  className="w-7 h-7 rounded-lg bg-lime-400 hover:bg-lime-300 text-black flex items-center justify-center cursor-pointer shadow-[0_0_8px_rgba(163,230,53,0.2)] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
