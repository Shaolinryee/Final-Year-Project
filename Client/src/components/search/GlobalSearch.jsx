import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, ListTodo, Folder, Calendar, User, ArrowRight } from "lucide-react";
import { tasksApi } from "../../services/api";
import { StatusPill } from "../ui";

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Handle focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await tasksApi.search({ q: query });
      if (data) {
        setResults(data.slice(0, 8)); // Limit to 8 results
      }
      setLoading(false);
      setSelectedIndex(0);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1));
    } else if (e.key === "Enter") {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelect = (task) => {
    navigate(`/projects/${task.projectId}/tasks/${task.id}`);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-brand-light border border-brand-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Input Area */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-border bg-brand-dark/20">
          <Search className="w-5 h-5 text-brand" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks by title, description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-text-primary text-lg placeholder:text-text-secondary/50"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          ) : query ? (
            <button onClick={() => setQuery("")} className="p-1 hover:bg-brand-dark/50 rounded-lg text-text-secondary transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="px-1.5 py-0.5 rounded border border-brand-border text-[10px] text-text-secondary font-medium bg-brand-dark/30">
              ESC
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query ? (
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-brand" />
              </div>
              <p className="text-text-primary font-medium">Global Search</p>
              <p className="text-sm text-text-secondary mt-1">Search for tasks across all your projects</p>
              <div className="mt-6 grid grid-cols-2 gap-2 text-left">
                <div className="p-3 bg-brand-dark/30 rounded-xl border border-brand-border/50">
                  <p className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Quick Filters</p>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    <li className="flex items-center gap-2 italic uppercase opacity-70">Type to start searching...</li>
                  </ul>
                </div>
                <div className="p-3 bg-brand-dark/30 rounded-xl border border-brand-border/50">
                  <p className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Shortcuts</p>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    <li className="flex justify-between"><span>Navigate</span> <span className="font-mono text-[10px]">↑↓</span></li>
                    <li className="flex justify-between"><span>Open</span> <span className="font-mono text-[10px]">↵</span></li>
                  </ul>
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 py-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                Task Results ({results.length})
              </p>
              {results.map((task, index) => (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    selectedIndex === index 
                      ? "bg-brand/10 border border-brand/20 translate-x-1" 
                      : "hover:bg-brand-dark/40 border border-transparent"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand/10 text-brand'
                  }`}>
                    <ListTodo className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-text-primary truncate">{task.title}</h4>
                      <StatusPill status={task.status} size="xs" />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Folder className="w-3 h-3 text-brand" />
                        {task.project?.name}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignee.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedIndex === index && (
                    <ArrowRight className="w-4 h-4 text-brand animate-in slide-in-from-left-2" />
                  )}
                </button>
              ))}
            </div>
          ) : !loading && (
            <div className="p-12 text-center text-text-secondary">
              <p>No tasks found for "{query}"</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-brand-border bg-brand-dark/30 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] text-text-secondary">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-brand-dark/50 border border-brand-border font-mono">↵</span>
              to select
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-brand-dark/50 border border-brand-border font-mono">↑↓</span>
              to navigate
            </span>
          </div>
          <div className="text-[10px] text-brand/70 font-medium italic">
            Search Pro
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
