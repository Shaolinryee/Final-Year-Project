/**
 * TaskFormModal Component
 * For creating and editing tasks
 */

import { useState, useEffect, useRef } from "react";
import { Upload, X, Image as ImageIcon, Video, FileText, Paperclip } from "lucide-react";
import { Modal, Input, Textarea, Select, Button } from "../ui";

const TaskFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  task = null, // null for create, object for edit
  loading = false,
  errorMessage = "",
}) => {
  const normalizeStatus = (status) => {
    const normalized = (status || "todo").toLowerCase().replace("_", "-");
    if (normalized === "completed") return "done";
    if (normalized === "in_progress") return "in-progress";
    if (normalized === "in_review") return "in-review";
    if (normalized === "rejected") return "rejected";
    if (normalized === "support") return "support";
    return normalized;
  };

  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });
  const [errors, setErrors] = useState({});
  const [filesToUpload, setFilesToUpload] = useState([]);
  const fileInputRef = useRef(null);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || "",
          description: task.description || "",
          status: normalizeStatus(task.status),
          priority: task.priority?.toLowerCase() || "medium",
          dueDate: task.dueDate || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          dueDate: "",
        });
      }
      setErrors({});
      setFilesToUpload([]);
    }
  }, [isOpen, task]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const submitData = {
      ...formData,
      status: normalizeStatus(formData.status),
      priority: formData.priority.toLowerCase(),
    };
    onSubmit(submitData, filesToUpload);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Add preview URLs for images
    const filesWithPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        file.previewUrl = URL.createObjectURL(file);
      }
      return file;
    });

    setFilesToUpload((prev) => [...prev, ...filesWithPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      filesToUpload.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [filesToUpload]);

  const removeFile = (idx) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== idx));
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) return ImageIcon;
    if (fileType?.startsWith("video/")) return Video;
    return FileText;
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    });
    setErrors({});
    setFilesToUpload([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Task" : "Create Task"}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEditing ? "Save Changes" : "Create Task"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={errors.title}
          required
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Add more details..."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={[
              { value: "todo", label: "To Do" },
              { value: "in-progress", label: "In Progress" },
              // { value: "in-review", label: "In Review" },
              { value: "done", label: "Done" },
              { value: "rejected", label: "Rejected" },
              { value: "support", label: "Support" },
            ]}
          />

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange("dueDate", e.target.value)}
        />

        {/* Attachments Upload Section */}
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5" /> Attachments
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-brand-border rounded-lg p-4 text-center cursor-pointer hover:border-brand/50 hover:bg-brand-dark/30 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-text-secondary group-hover:text-brand mx-auto mb-1 transition-colors" />
            <p className="text-text-secondary text-sm">Click to add files</p>
          </div>

          {filesToUpload.length > 0 && (
            <div className="mt-3 space-y-2">
              {filesToUpload.map((file, idx) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 bg-brand-dark/30 rounded-lg group"
                  >
                    <div className="w-10 h-10 rounded bg-brand-dark/50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-brand-border/30">
                      {file.type.startsWith('image/') && file.previewUrl ? (
                        <img src={file.previewUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className="w-5 h-5 text-text-secondary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="p-1 rounded text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
