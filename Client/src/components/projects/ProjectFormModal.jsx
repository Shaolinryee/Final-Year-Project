/**
 * ProjectFormModal Component
 * For creating and editing projects
 */

import { useState, useEffect } from "react";
import { Modal, Input, Textarea, Select, Button } from "../ui";
import { generateProjectKey } from "../../services/api";

const ProjectFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  project = null, // null for create, object for edit
  loading = false,
}) => {
  const isEditing = !!project;
  
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    status: "active",
  });
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          name: project.name || "",
          key: project.key || "",
          description: project.description || "",
          status: project.status || "active",
        });
        setKeyManuallyEdited(true);
      } else {
        setFormData({
          name: "",
          key: "",
          description: "",
          status: "active",
        });
        setKeyManuallyEdited(false);
      }
      setErrors({});
    }
  }, [isOpen, project]);

  // Auto-generate key from name (only for new projects)
  useEffect(() => {
    if (!isEditing && !keyManuallyEdited && formData.name) {
      setFormData((prev) => ({
        ...prev,
        key: generateProjectKey(formData.name),
      }));
    }
  }, [formData.name, isEditing, keyManuallyEdited]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleKeyChange = (value) => {
    setKeyManuallyEdited(true);
    handleChange("key", value.toUpperCase().slice(0, 4));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    if (!formData.key.trim()) {
      newErrors.key = "Project key is required";
    } else if (formData.key.length < 2) {
      newErrors.key = "Key must be at least 2 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ name: "", key: "", description: "", status: "active" });
    setErrors({});
    setKeyManuallyEdited(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Project" : "Create Project"}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="Enter project name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          required
          autoFocus
        />

        <Input
          label="Project Key"
          placeholder="e.g., PRJ"
          value={formData.key}
          onChange={(e) => handleKeyChange(e.target.value)}
          error={errors.key}
          helperText="Short identifier (2-4 characters)"
        />

        <Textarea
          label="Description"
          placeholder="Describe your project..."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </form>
    </Modal>
  );
};

export default ProjectFormModal;
