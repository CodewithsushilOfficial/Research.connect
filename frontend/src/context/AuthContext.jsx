import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hydrateSession } from '../redux/slices/authSlice';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const hasFetched = useRef(false);

  // On app load (any browser/tab), pull the latest name/profile from the
  // server instead of trusting whatever is cached in localStorage. Fixes
  // navbar/home feed showing stale or default name+position after a
  // profile edit on a different session.
  useEffect(() => {
    if (hasFetched.current || !authState.token) return;
    hasFetched.current = true;

    authService.getMe()
      .then((res) => {
        if (res.success && res.data?.user) {
          dispatch(hydrateSession({ user: res.data.user, profile: res.data.profile }));
        }
      })
      .catch(() => {
        // Silent fail: keep whatever was already in localStorage/Redux
      });
  }, [authState.token, dispatch]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // If not wrapped in AuthProvider, fallback to direct Redux hook
    const authState = useSelector((state) => state.auth);
    return authState;
  }
  return context;
};
