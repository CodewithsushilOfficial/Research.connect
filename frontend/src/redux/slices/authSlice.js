import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
let user = null;
let profile = null;
let publicationCount = 0;

try {
  const savedUser = localStorage.getItem('user');
  if (savedUser) user = JSON.parse(savedUser);
  const savedProfile = localStorage.getItem('profile');
  if (savedProfile) profile = JSON.parse(savedProfile);
  const savedPublicationCount = localStorage.getItem('publicationCount');
  publicationCount = savedPublicationCount ? parseInt(savedPublicationCount, 10) || 0 : 0;
} catch (e) {
  console.error('Error parsing stored auth data:', e);
}

const initialState = {
  user,
  profile,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
  otpEmail: localStorage.getItem('otpEmail') || null,
  otpPurpose: localStorage.getItem('otpPurpose') || null,
  publicationCount
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setCredentials(state, action) {
      const { user, profile, accessToken } = action.payload;
      state.user = user;
      state.profile = profile;
      state.token = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;
      state.otpEmail = null;
      state.otpPurpose = null;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('otpEmail');
      localStorage.removeItem('otpPurpose');
      if (profile) {
        localStorage.setItem('profile', JSON.stringify(profile));
      }
    },
    updateProfileState(state, action) {
      state.profile = action.payload;
      localStorage.setItem('profile', JSON.stringify(action.payload));
    },
    updateUserState(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setOtpEmail(state, action) {
      state.otpEmail = action.payload;
      if (action.payload) {
        localStorage.setItem('otpEmail', action.payload);
      } else {
        localStorage.removeItem('otpEmail');
      }
    },
    setOtpPurpose(state, action) {
      state.otpPurpose = action.payload;
      if (action.payload) {
        localStorage.setItem('otpPurpose', action.payload);
      } else {
        localStorage.removeItem('otpPurpose');
      }
    },
    setPublicationCount(state, action) {
      state.publicationCount = action.payload;
      localStorage.setItem('publicationCount', action.payload.toString());
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    logoutSuccess(state) {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpEmail = null;
      state.otpPurpose = null;
      state.publicationCount = 0;
      state.loading = false;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      localStorage.removeItem('otpEmail');
      localStorage.removeItem('otpPurpose');
      localStorage.removeItem('publicationCount');
    }
  }
});

export const {
  setLoading,
  setCredentials,
  updateProfileState,
  updateUserState,
  setOtpEmail,
  setOtpPurpose,
  setPublicationCount,
  setError,
  logoutSuccess
} = authSlice.actions;

export default authSlice.reducer;
