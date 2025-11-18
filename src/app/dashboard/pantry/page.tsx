'use client';

import { useEffect, useState } from 'react';
import { AddPantryItemForm } from '@/components/pantry/add-pantry-item-form';
import { PantryList } from '@/components/pantry/pantry-list';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, PackageOpen } from 'lucide-react';

interface PantryItem {
  id: string;
  quantity?: string | null;
  unit?: string | null;
  updatedAt: string;
  ingredient: {
    id: string;
    name: string;
    category: string;
    commonUnits: string[] | null;
  };
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'produce', label: 'Produce' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'pantry', label: 'Pantry' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'other', label: 'Other' },
];

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchPantryItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pantry');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      }
    } catch (error) {
      console.error('Error fetching pantry items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPantryItems();
  }, []);

  // Filter items based on search and category
  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (search) {
      filtered = filtered.filter((item) =>
        item.ingredient.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.ingredient.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [search, selectedCategory, items]);

  // Get category stats
  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    items.forEach((item) => {
      stats[item.ingredient.category] = (stats[item.ingredient.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pantry Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your household ingredient inventory
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categoryStats).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">With Quantities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {items.filter((item) => item.quantity).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {items.filter((item) => !item.quantity).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Item Form */}
        <div className="lg:col-span-1">
          <AddPantryItemForm onItemAdded={fetchPantryItems} />
        </div>

        {/* Pantry List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Pantry</CardTitle>
              <CardDescription>
                Search and filter your pantry items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Label htmlFor="search" className="sr-only">
                    Search
                  </Label>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search pantry items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={selectedCategory === cat.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      {cat.label}
                      {cat.value && categoryStats[cat.value] && (
                        <span className="ml-1">({categoryStats[cat.value]})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredItems.length === 0 && search && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PackageOpen className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No items found matching "{search}"
                  </p>
                </div>
              )}

              {/* Pantry List */}
              {!isLoading && <PantryList items={filteredItems} onUpdate={fetchPantryItems} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
