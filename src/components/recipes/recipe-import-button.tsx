'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { RecipeImportModal } from './recipe-import-modal';

export function RecipeImportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Download className="mr-2 h-4 w-4" />
        Import from URL
      </Button>
      <RecipeImportModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
