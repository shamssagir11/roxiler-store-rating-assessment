import React, { useState } from 'react';
import { Star, Search, ArrowUpDown, ArrowUp, ArrowDown, X, AlertCircle } from 'lucide-react';

/**
 * Reusable Button Component
 */
export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  type = 'button',
  loading = false,
  disabled = false,
  icon = null,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

/**
 * Reusable Input Component with Label, Error, Hint & Password toggle
 */
export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  maxLength,
  showPasswordToggle = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const effectiveType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" htmlFor={name}>
          <span>
            {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </span>
          {maxLength && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', fontWeight: 400 }}>
              {value ? value.length : 0}/{maxLength}
            </span>
          )}
        </label>
      )}

      <div className="input-password-wrapper">
        <input
          id={name}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`form-input ${error ? 'has-error' : ''}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}
      {!error && hint && <div className="form-hint">{hint}</div>}
    </div>
  );
};

/**
 * Reusable Select Dropdown Component
 */
export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  hint,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" htmlFor={name}>
          <span>
            {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </span>
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`form-select ${error ? 'has-error' : ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <div className="form-error">{error}</div>}
      {!error && hint && <div className="form-hint">{hint}</div>}
    </div>
  );
};

/**
 * Reusable Star Rating Component (Interactive or Read-Only)
 */
export const RatingStars = ({
  rating = 0,
  max = 5,
  onChange = null,
  interactive = false,
  size = 18,
  showValue = true,
  count = null,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="star-display">
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(displayRating);

          if (interactive && onChange) {
            return (
              <button
                key={star}
                type="button"
                className={`star-btn ${isFilled ? 'active' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => onChange(star)}
                title={`Rate ${star} out of 5`}
              >
                <Star size={size} fill={isFilled ? 'currentColor' : 'none'} />
              </button>
            );
          }

          return (
            <span
              key={star}
              style={{
                color: isFilled ? 'var(--color-star-active)' : 'var(--color-star-empty)',
                display: 'inline-flex',
              }}
            >
              <Star size={size} fill={isFilled ? 'currentColor' : 'none'} />
            </span>
          );
        })}
      </div>

      {showValue && (
        <span className="star-score-text">
          {rating > 0 ? Number(rating).toFixed(1) : 'No ratings'}
        </span>
      )}

      {count !== null && (
        <span className="star-count-text">
          ({count} {count === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
};

/**
 * Reusable Stat Card Component
 */
export const StatCard = ({ label, value, subtext, icon: Icon, color = 'primary' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div className="stat-icon-wrapper">
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

/**
 * Reusable Search Bar Component
 */
export const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`search-input-wrapper ${className}`}>
      <Search size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-slate-400)',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

/**
 * Reusable Sort Column Header
 */
export const SortableColumn = ({ label, field, currentSortBy, currentSortOrder, onSort }) => {
  const isActive = currentSortBy === field;
  return (
    <th className="sortable-th" onClick={() => onSort(field)}>
      <span className="th-content">
        {label}
        {isActive ? (
          currentSortOrder === 'asc' ? (
            <ArrowUp size={14} color="var(--color-primary)" />
          ) : (
            <ArrowDown size={14} color="var(--color-primary)" />
          )
        ) : (
          <ArrowUpDown size={14} style={{ opacity: 0.3 }} />
        )}
      </span>
    </th>
  );
};

/**
 * Reusable Modal Component
 */
export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = '540px' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

/**
 * Reusable Empty State Component
 */
export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'No records found',
  description = 'Try adjusting your filters or search keywords.',
  action = null,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon-circle">
        <Icon size={32} />
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-description">{description}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
};

/**
 * Loading Spinner / Skeleton
 */
export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 14 }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)', fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} style={{ display: 'flex', gap: 16 }}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="skeleton"
              style={{
                height: 28,
                flex: cIdx === 0 ? 2 : 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
