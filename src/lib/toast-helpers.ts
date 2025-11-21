import { toast } from '@/components/ui/use-toast';

/**
 * Utility functions for consistent toast notifications across the app
 */

export const showSuccessToast = (message: string, title = 'Success') => {
  toast({
    title,
    description: message,
    variant: 'default',
  });
};

export const showErrorToast = (message: string, title = 'Error') => {
  toast({
    title,
    description: message,
    variant: 'destructive',
  });
};

export const showInfoToast = (message: string, title?: string) => {
  toast({
    title,
    description: message,
  });
};

// Recipe-specific toasts
export const recipeToasts = {
  created: () => showSuccessToast('Recipe created successfully'),
  updated: () => showSuccessToast('Recipe updated successfully'),
  deleted: () => showSuccessToast('Recipe deleted successfully'),
  imported: () => showSuccessToast('Recipe imported successfully'),
  cooked: () => showSuccessToast('Recipe cooked! Pantry updated'),
  error: (action: string) => showErrorToast(`Failed to ${action} recipe. Please try again.`),
};

// Pantry-specific toasts
export const pantryToasts = {
  itemAdded: () => showSuccessToast('Item added to pantry'),
  itemUpdated: () => showSuccessToast('Pantry item updated'),
  itemDeleted: () => showSuccessToast('Item removed from pantry'),
  bulkUpdated: (count: number) => showSuccessToast(`${count} items updated successfully`),
  error: (action: string) => showErrorToast(`Failed to ${action} pantry item. Please try again.`),
};

// Grocery list-specific toasts
export const groceryListToasts = {
  created: () => showSuccessToast('Grocery list created successfully'),
  updated: () => showSuccessToast('Grocery list updated'),
  deleted: () => showSuccessToast('Grocery list deleted'),
  itemChecked: () => showSuccessToast('Item checked off'),
  itemAdded: () => showSuccessToast('Item added to list'),
  itemRemoved: () => showSuccessToast('Item removed from list'),
  shared: () => showSuccessToast('Grocery list shared successfully', 'Link copied!'),
  error: (action: string) => showErrorToast(`Failed to ${action} grocery list. Please try again.`),
};

// Household-specific toasts
export const householdToasts = {
  created: () => showSuccessToast('Household created successfully'),
  updated: () => showSuccessToast('Household settings updated'),
  memberInvited: () => showSuccessToast('Invitation sent successfully', 'Invite sent!'),
  memberJoined: (name: string) => showSuccessToast(`${name} joined your household`),
  memberRemoved: () => showSuccessToast('Member removed from household'),
  error: (action: string) => showErrorToast(`Failed to ${action}. Please try again.`),
};

// Authentication toasts
export const authToasts = {
  loginSuccess: () => showSuccessToast('Welcome back!', 'Logged in'),
  loginError: () => showErrorToast('Invalid email or password', 'Login failed'),
  registerSuccess: () => showSuccessToast('Account created successfully!', 'Welcome!'),
  registerError: () => showErrorToast('Failed to create account. Please try again.'),
  logoutSuccess: () => showInfoToast('You have been logged out', 'Goodbye!'),
};

// Generic network errors
export const networkToasts = {
  offline: () => showErrorToast('You appear to be offline. Please check your connection.', 'Network Error'),
  timeout: () => showErrorToast('Request timed out. Please try again.', 'Request Timeout'),
  serverError: () => showErrorToast('Server error. Please try again later.', 'Server Error'),
  notFound: (resource: string) => showErrorToast(`${resource} not found.`, 'Not Found'),
  unauthorized: () => showErrorToast('You are not authorized to perform this action.', 'Unauthorized'),
};
