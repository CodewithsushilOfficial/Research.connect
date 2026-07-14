import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Send, Upload, X, Paperclip } from 'lucide-react';
import Input from '../common/inputs/Input';
import Select from '../common/inputs/Select';
import Button from '../common/buttons/Button';
import Card from '../common/cards/Card';
import helpService from '../../services/help.service';

const ContactSupportForm = ({ defaultUser }) => {
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Helper to generate default form state values
  const getInitialValues = (user) => ({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user ? user.email : '',
    category: '',
    subject: '',
    message: ''
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: getInitialValues(defaultUser)
  });

  // Feature 1: Keep form in sync if defaultUser loads asynchronously
  useEffect(() => {
    if (defaultUser) {
      reset(getInitialValues(defaultUser));
    }
  }, [defaultUser, reset]);

  // Feature 2: Watch message length for the character counter
  const messageValue = watch('message', '');

  const categories = [
    { value: 'General Inquiry', label: 'General Inquiry' },
    { value: 'Technical Support', label: 'Technical Support' },
    { value: 'Account Issue', label: 'Account Issue' },
    { value: 'Upload Issue', label: 'Upload Issue' },
    { value: 'Download Issue', label: 'Download Issue' },
    { value: 'Other', label: 'Other' }
  ];

  // Feature 3: File Input Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional validation: 5MB size limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    
    // Construct FormData to cleanly handle text fields and binary file uploads
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('category', data.category);
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    try {
      const response = await helpService.submitContactRequest(formData);
      if (response.success) {
        toast.success(response.message || 'Support ticket submitted successfully!');
        reset(getInitialValues(defaultUser));
        setSelectedFile(null);
      }
    } catch (error) {
      const errMsg = error.message || 'Failed to submit support ticket. Please try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <h3 className="text-lg font-bold text-text-primary tracking-tight mb-2">Contact Support</h3>
      <p className="text-sm text-text-secondary mb-6">
        Fill out the form below and our support team will get back to you shortly.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john.doe@institution.edu"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Please enter a valid email address'
              }
            })}
          />
        </div>

        <Select
          label="Category"
          name="category"
          placeholder="Select support category"
          required
          options={categories}
          error={errors.category?.message}
          {...register('category', { required: 'Please select a category' })}
        />

        <Input
          label="Subject"
          name="subject"
          placeholder="Brief summary of the issue"
          required
          error={errors.subject?.message}
          {...register('subject', {
            required: 'Subject is required',
            minLength: { value: 3, message: 'Subject must be at least 3 characters' },
            maxLength: { value: 200, message: 'Subject cannot exceed 200 characters' }
          })}
        />

        <div className="flex flex-col w-full space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-text-secondary tracking-wide flex items-center gap-1">
              Message
              <span className="text-accent-red font-bold">*</span>
            </label>
            {/* Dynamic Character Counter */}
            <span className={`text-[11px] ${messageValue.length > 4900 ? 'text-accent-red font-semibold' : 'text-text-secondary'}`}>
              {messageValue.length} / 5000
            </span>
          </div>
          <textarea
            name="message"
            rows="6"
            placeholder="Describe your issue in detail..."
            className={`w-full px-4 py-2 text-sm bg-bg-card border ${
              errors.message ? 'border-accent-red focus:ring-accent-red' : 'border-border focus:ring-primary'
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-40 transition-colors`}
            {...register('message', {
              required: 'Message is required',
              minLength: { value: 10, message: 'Message must be at least 10 characters' },
              maxLength: { value: 5000, message: 'Message cannot exceed 5000 characters' }
            })}
          />
          {errors.message && (
            <span className="text-xs font-medium text-accent-red">
              {errors.message.message}
            </span>
          )}
        </div>

        {/* Real File Upload UX Dropzone Alternative */}
        <div className="flex flex-col w-full space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary tracking-wide">
            Attachment (Optional)
          </label>
          
          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-bg-card hover:bg-bg-hover transition-colors">
              <div className="flex flex-col items-center justify-center pt-4 pb-4 text-center px-4">
                <Upload className="w-5 h-5 text-text-secondary mb-1" />
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-text-secondary mt-0.5">PNG, JPG, or PDF (Max 5MB)</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,.pdf" 
                onChange={handleFileChange} 
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 bg-bg-card border border-border rounded-lg text-sm">
              <div className="flex items-center space-x-2 truncate">
                <Paperclip className="w-4 h-4 text-primary shrink-0" />
                <span className="text-text-primary truncate font-medium">{selectedFile.name}</span>
                <span className="text-xs text-text-secondary shrink-0">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button 
                type="button" 
                onClick={removeFile}
                className="p-1 hover:bg-bg-hover rounded-full text-text-secondary hover:text-accent-red transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            icon={<Send className="w-4 h-4" />}
            className="w-full md:w-auto"
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ContactSupportForm;
