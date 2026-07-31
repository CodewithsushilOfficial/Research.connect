import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Trash2 } from 'lucide-react';
import ConfirmationModal from '../../../components/common/modals/ConfirmationModal';
import profileService from '../../../services/profile.service';
import authService from '../../../services/auth.service';
import { useDispatch } from 'react-redux';
import { logoutSuccess } from '../../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const DangerZoneSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const performDeactivate = async () => {
    setIsDeactivating(true);
    try {
      const response = await authService.deactivateAccount();
      if (response && response.success) {
        toast.success('Your account has been deactivated successfully.');
        dispatch(logoutSuccess());
        navigate('/login');
      } else {
        throw new Error(response?.message || 'Deactivation failed.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || (typeof err === 'string' ? err : err.error || 'An error occurred.');
      toast.error(errMsg);
    } finally {
      setIsDeactivating(false);
      setIsDeactivateOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await profileService.deleteProfile();
      if (response && response.success) {
        toast.success('Your profile and account have been successfully deleted.');
        dispatch(logoutSuccess());
        setIsDeleteOpen(false);
        navigate('/login');
      } else {
        throw new Error(response?.message || 'Delete account failed.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || (typeof err === 'string' ? err : err.error || 'An error occurred.');
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2.5 md:space-y-4 text-left">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-red-100 text-accent-red text-[9px] md:text-[10px] font-black uppercase tracking-wider">
          <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3" />
          Irreversible Actions
        </span>
      </div>

      {/* Card 1 - Deactivate Account */}
      <div className="relative overflow-hidden bg-[#FFFBF0] border-2 border-dashed border-amber-300 rounded-2xl p-3 md:p-5 space-y-1.5 md:space-y-3">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
        <div className="flex items-center gap-2 md:gap-3 pb-1.5 md:pb-2 border-b border-amber-200/60 pl-1">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
          </div>
          <h3 className="text-[11px] md:text-xs font-black text-amber-800 uppercase tracking-tight">Deactivate Account</h3>
        </div>

        <p className="text-[10px] md:text-[11px] text-amber-900/80 font-semibold leading-snug md:leading-relaxed pl-1">
          Temporarily disable your profile, research feeds, and visibility search indexing. You can restore your full account history and reactivate at any time by logging back in.
        </p>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3 pt-0.5 md:pt-1 pl-1">
          <span className="text-[9px] md:text-[10px] text-amber-700/60 font-semibold leading-snug">
            <span className="font-extrabold text-amber-600 uppercase mr-1">Note:</span> Your uploads and search visibility status will remain hidden until you reactivate.
          </span>
          <button
            onClick={() => setIsDeactivateOpen(true)}
            disabled={isDeactivating}
            className="self-end md:self-auto w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] md:text-xs px-3.5 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isDeactivating ? 'Deactivating...' : 'Deactivate Account'}
          </button>
        </div>
      </div>

      {/* Card 2 - Delete Account */}
      <div className="relative overflow-hidden bg-[#FFF5F5] border-2 border-red-300 rounded-2xl p-3 md:p-5 space-y-1.5 md:space-y-3 shadow-[0_0_0_3px_rgba(239,68,68,0.06)]">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-red" />
        <div className="flex items-center gap-2 md:gap-3 pb-1.5 md:pb-2 border-b border-red-200/60 pl-1">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-red" />
          </div>
          <h3 className="text-[11px] md:text-xs font-black text-accent-red uppercase tracking-tight">Delete Account Permanently</h3>
        </div>

        <p className="text-[10px] md:text-[11px] text-red-900/80 font-semibold leading-snug md:leading-relaxed pl-1">
          Deleting your account is permanent. All your profile data, academic metrics, co-authors list, and stored publications will be permanently wiped from our databases. This action cannot be reversed.
        </p>

        <div className="flex items-center justify-end pt-0.5 md:pt-1 pl-1">
          <button
            onClick={() => {
              setIsDeleteOpen(true);
            }}
            disabled={isDeleting}
            className="w-auto font-bold text-[11px] md:text-xs px-3.5 md:px-5 py-1.5 md:py-2.5 bg-accent-red hover:bg-red-650 text-white rounded-lg md:rounded-xl shadow-sm transition-all active:scale-95"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Custom Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={performDeactivate}
        title="Deactivate Account"
        description="Your profile, publications, and research activity will be hidden until you log in again. You can reactivate your account at any time."
        confirmText="Deactivate Account"
        cancelText="Cancel"
        variant="warning"
        loading={isDeactivating}
        icon={<AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />}
      />

      {/* Custom Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account Permanently"
        description="This action permanently deletes your account and all associated data. This action cannot be undone."
        confirmText="Delete Permanently"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        requireTextInput="DELETE"
        icon={<AlertTriangle className="w-6 h-6 text-accent-red flex-shrink-0" />}
      />
    </div>
  );
};

export default DangerZoneSettings;