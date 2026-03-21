/**
 * TaskFormModal Component
 * For creating and editing tasks
 */

import { useState, useEffect } from "react";
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
    onSubmit(submitData);
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
      </form>
    </Modal>
  );
};

export default TaskFormModal;
