'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Trash2, Edit2, Save, X, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

export interface RecipeNote {
  id: string;
  userId: string;
  recipeId: string;
  noteText: string;
  stepNumber: number | null;
  createdAt: string;
  updatedAt: string;
  sessionId: string | null;
}

interface RecipeNoteProps {
  recipeId: string;
  stepNumber?: number;
  existingNotes?: RecipeNote[];
  sessionId?: string | null;
  onNoteAdded?: () => void;
  onNoteUpdated?: () => void;
  onNoteDeleted?: () => void;
}

export function RecipeNoteInput({
  recipeId,
  stepNumber,
  existingNotes = [],
  sessionId,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted,
}: RecipeNoteProps) {
  const [noteText, setNoteText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { toast } = useToast();

  // Quick note templates
  const templates = [
    'Needs more time',
    'Reduce heat',
    'Increase seasoning',
    'Great as written',
    'Made substitution',
  ];

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      toast({
        title: 'Error',
        description: 'Note text cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`/api/recipes/${recipeId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteText: noteText.trim(),
          stepNumber: stepNumber ?? null,
          sessionId: sessionId ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      toast({
        title: 'Note saved',
        description: 'Your note has been saved successfully',
      });

      setNoteText('');
      setIsAdding(false);

      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editText.trim()) {
      toast({
        title: 'Error',
        description: 'Note text cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteText: editText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      toast({
        title: 'Note updated',
        description: 'Your note has been updated successfully',
      });

      setEditingNoteId(null);
      setEditText('');

      if (onNoteUpdated) {
        onNoteUpdated();
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      toast({
        title: 'Note deleted',
        description: 'Your note has been deleted successfully',
      });

      if (onNoteDeleted) {
        onNoteDeleted();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTemplateClick = (template: string) => {
    setNoteText(template);
    setIsAdding(true);
  };

  const filteredNotes = existingNotes.filter(
    (note) =>
      stepNumber === undefined ||
      note.stepNumber === null ||
      note.stepNumber === stepNumber
  );

  return (
    <div className="space-y-3">
      {/* Add note button/form */}
      {!isAdding ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Note
          {stepNumber !== undefined && ` for Step ${stepNumber + 1}`}
        </Button>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              <StickyNote className="mr-2 inline h-4 w-4" />
              {stepNumber !== undefined
                ? `Note for Step ${stepNumber + 1}`
                : 'General Note'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Quick templates */}
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <Badge
                  key={template}
                  variant="outline"
                  className="cursor-pointer hover:bg-[#d4a574] hover:text-white"
                  onClick={() => handleTemplateClick(template)}
                >
                  {template}
                </Badge>
              ))}
            </div>

            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your note here..."
              rows={3}
              className="resize-none"
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveNote}
                disabled={isSaving || !noteText.trim()}
                className="flex-1 bg-[#2d5016] hover:bg-[#3d6b1f]"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Note'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNoteText('');
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing notes */}
      {filteredNotes.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Previous Notes ({filteredNotes.length})
          </div>
          {filteredNotes.map((note) => (
            <Card key={note.id} className="bg-amber-50 dark:bg-amber-950/10">
              <CardContent className="p-3">
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                        {note.noteText}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditText(note.noteText);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>
                        {formatDistanceToNow(new Date(note.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {note.stepNumber !== null && (
                        <Badge variant="secondary" className="text-xs">
                          Step {note.stepNumber + 1}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
