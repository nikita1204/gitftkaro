import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobileMenuOpen: false,
  activeModal: null, // e.g. 'quoteModal', 'infoModal'
  modalData: null,
  isAnnouncementDismissed: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openMobileMenu: (state) => {
      state.isMobileMenuOpen = true;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload?.modalName || action.payload;
      state.modalData = action.payload?.modalData || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    dismissAnnouncement: (state) => {
      state.isAnnouncementDismissed = true;
    },
  },
});

export const {
  openMobileMenu,
  closeMobileMenu,
  toggleMobileMenu,
  openModal,
  closeModal,
  dismissAnnouncement,
} = uiSlice.actions;

export default uiSlice.reducer;
