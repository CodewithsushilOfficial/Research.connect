import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Send } from 'lucide-react';
import Input from '../common/inputs/Input';
import Select from '../common/inputs/Select';
import Button from '../common/buttons/Button';
import Card from '../common/cards/Card';
import helpService from '../../services/help.service';

const GrievanceForm = ({ defaultUser }) => {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: defaultUser ? `${defaultUser.firstName} ${defaultUser.lastName}` : '',
      email: defaultUser ? defaultUser.email : '',
      category: '',
      paperUrl: '',
      description: '',
      attachment: ''
    }
  });

  const categories = [
    { value: 'Broken Download', label: 'Broken Download' },
    { value: 'Upload Failed', label: 'Upload Failed' },
    { value: 'Duplicate Paper', label: 'Duplicate Paper' },
    { value: 'Incorrect Metadata', label: 'Incorrect Metadata' },
    { value: 'Plagiarism', label: 'Plagiarism / Intellectual Property Theft' },
    { value: 'Copyright / DMCA', label: 'Copyright / DMCA Violation' },
    { value: 'Technical Bug', label: 'Technical Bug' },
    { value: 'Spam Content', label: 'Spam / Offensive Content' },
    { value: 'Other', label: 'Other' }
  ];

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await helpService.submitGrievanceReport(data);
      if (response.success) {
        toast.success(response.message || 'Grievance submitted successfully!');
        reset({
          name: defaultUser ? `${defaultUser.firstName} ${defaultUser.lastName}` : '',
          email: defaultUser ? defaultUser.email : '',
          category: '',
          paperUrl: '',
          description: '',
          attachment: ''
        });
      }
    } catch (error) {
      const errMsg = error.message || 'Failed to submit grievance. Please try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border-border/80">
      <h3 className="text-lg font-bold text-text-primary tracking-tight mb-2 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-accent-red" />
        Report a Problem / Grievance
      </h3>
      <p className="text-sm text-text-secondary mb-6">
        Submit plagiarism reports, DMCA copyright notices, incorrect metadata feedback, or general compliance issues.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            required
            error={errors.name?.message}
            className="focus:ring-primary/20 focus:border-primary transition-all duration-200"
            {...register('name', { required: 'Name is required' })}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john.doe@institution.edu"
            required
            error={errors.email?.message}
            className="focus:ring-primary/20 focus:border-primary transition-all duration-200"
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
          label="Grievance Category"
          name="category"
          placeholder="Select grievance category"
          required
          options={categories}
          error={errors.category?.message}
          className="focus:ring-primary/20 focus:border-primary transition-all duration-200"
          {...register('category', { required: 'Please select a category' })}
        />

        <Input
          label="Research Paper URL (Optional)"
          name="paperUrl"
          placeholder="https://researchconnect.org/publications/some-paper"
          error={errors.paperUrl?.message}
          className="focus:ring-primary/20 focus:border-primary transition-all duration-200"
          {...register('paperUrl', {
            pattern: {
              value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
              message: 'Please enter a valid URL'
            }
          })}
        />

        <div className="flex flex-col w-full space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary tracking-wide flex items-center gap-1">
            Description
            <span className="text-accent-red font-bold">*</span>
          </label>
          <textarea
            name="description"
            rows="6"
            placeholder="Provide a detailed description of the grievance..."
            className={`w-full px-4 py-2.5 text-sm bg-bg-card border ${
              errors.description ? 'border-accent-red focus:ring-accent-red/20 focus:border-accent-red' : 'border-border focus:ring-primary/20 focus:border-primary'
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-40 transition-all duration-200`}
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
              maxLength: { value: 5000, message: 'Description cannot exceed 5000 characters' }
            })}
          />
          {errors.description && (
            <span className="text-xs font-medium text-accent-red">
              {errors.description.message}
            </span>
          )}
        </div>

        <Input
          label="Attachment URL (Optional)"
          name="attachment"
          placeholder="https://example.com/dmca_document.pdf"
          error={errors.attachment?.message}
          className="focus:ring-primary/20 focus:border-primary transition-all duration-200"
          {...register('attachment')}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="danger"
            loading={submitting}
            icon={<Send className="w-4 h-4" />}
            className="w-full md:w-auto hover:shadow-md transition-shadow duration-200"
          >
            Submit Grievance
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GrievanceForm;
