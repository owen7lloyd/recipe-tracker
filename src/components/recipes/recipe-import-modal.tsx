'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { RecipeForm } from './recipe-form';

interface RecipeImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeImportModal({
  open,
  onOpenChange,
}: RecipeImportModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedRecipe, setImportedRecipe] = useState<any>(null);
  const [source, setSource] = useState<string>('');

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      setIsImporting(true);
      setError(null);

      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import recipe');
      }

      const data = await response.json();
      setImportedRecipe(data.recipe);
      setSource(data.source);

      toast({
        title: 'Recipe imported successfully',
        description: `Recipe data has been loaded from ${data.source === 'schema' ? 'structured data' : 'HTML parsing'}. You can review and edit before saving.`,
      });
    } catch (err) {
      console.error('Error importing recipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setImportedRecipe(null);
    setSource('');
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        {!importedRecipe ? (
          <>
            <DialogHeader>
              <DialogTitle>Import Recipe from URL</DialogTitle>
              <DialogDescription>
                Enter a recipe URL to automatically import the recipe details.
                Supports most popular recipe websites.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="recipe-url">Recipe URL</Label>
                <Input
                  id="recipe-url"
                  type="url"
                  placeholder="https://example.com/recipe"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isImporting) {
                      handleImport();
                    }
                  }}
                  disabled={isImporting}
                />
                <p className="text-xs text-slate-500">
                  Paste a link to any recipe from a supported website
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={isImporting || !url.trim()}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Import Recipe
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <h4 className="mb-2 text-sm font-semibold">Supported Sites</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Most recipe websites with structured data (schema.org) are
                  supported, including: AllRecipes, Food Network, Serious Eats,
                  BBC Good Food, Bon Appétit, and many more.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Review Imported Recipe</DialogTitle>
              <DialogDescription>
                Review and edit the imported recipe before saving. Source:{' '}
                {source === 'schema' ? 'Structured Data' : 'HTML Parsing'}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <RecipeForm
                initialData={importedRecipe}
                onSuccess={() => {
                  handleClose();
                  router.refresh();
                }}
              />
            </div>

            <div className="mt-4 flex justify-start">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                size="sm"
              >
                ← Import a different recipe
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
