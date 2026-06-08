import { create } from 'zustand';

interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  isLoading: boolean;
  loadingMessage: string;
  theme: 'light' | 'dark';
  toast: ToastMessage | null;
}

interface UiActions {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showToast: (text: string, type?: ToastMessage['type']) => void;
  clearToast: () => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  isLoading: false,
  loadingMessage: '',
  theme: 'light',
  toast: null,

  showLoading: (message = '加载中...') => set({ isLoading: true, loadingMessage: message }),
  hideLoading: () => set({ isLoading: false, loadingMessage: '' }),

  showToast: (text, type = 'info') => {
    set({ toast: { text, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  clearToast: () => set({ toast: null }),

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
