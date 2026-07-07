"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  label: string;
  value: string;
  helper?: string;
};

export type SelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  /** When false, do not render a separate empty placeholder option (options already include one). */
  usePlaceholderOption?: boolean;
};

const MENU_GAP_PX = 6;
const MENU_MAX_HEIGHT_PX = 280;

function slugifyLabel(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function getSelectedLabel(
  value: string,
  options: SelectOption[],
  placeholder: string,
) {
  if (!value) return placeholder;
  return options.find((option) => option.value === value)?.label ?? placeholder;
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  error,
  hint,
  disabled = false,
  required = false,
  id,
  className = "",
  usePlaceholderOption = true,
}: SelectProps) {
  const selectId = id ?? `select-${slugifyLabel(label)}`;
  const listboxId = `${selectId}-listbox`;
  const errorId = error ? `${selectId}-error` : undefined;
  const hintId = hint && !error ? `${selectId}-hint` : undefined;

  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [menuPlacement, setMenuPlacement] = useState<"bottom" | "top">("bottom");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selectedLabel = getSelectedLabel(value, options, placeholder);
  const hasValue = Boolean(value);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, []);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const maxHeight = Math.min(
      MENU_MAX_HEIGHT_PX,
      Math.floor(window.innerHeight * 0.45),
    );
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP_PX;
    const spaceAbove = rect.top - MENU_GAP_PX;
    const openAbove = spaceBelow < maxHeight && spaceAbove > spaceBelow;

    setMenuPlacement(openAbove ? "top" : "bottom");
    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      maxHeight,
      zIndex: 9999,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + MENU_GAP_PX }
        : { top: rect.bottom + MENU_GAP_PX }),
    });
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [disabled, options, value]);

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      closeMenu();
      triggerRef.current?.focus();
    },
    [closeMenu, onChange],
  );

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleReposition = () => updateMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeMenu, open]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        if (highlightIndex >= 0 && options[highlightIndex]) {
          selectOption(options[highlightIndex].value);
        }
      } else {
        openMenu();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setHighlightIndex((current) =>
        current < options.length - 1 ? current + 1 : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setHighlightIndex((current) =>
        current > 0 ? current - 1 : options.length - 1,
      );
      return;
    }

    if (event.key === "Escape") {
      closeMenu();
    }
  }

  const hasEmptyOptionInList = options.some((option) => option.value === "");
  const showPlaceholderOption = usePlaceholderOption && !hasEmptyOptionInList;

  const fieldClassName = [
    "afc-select-field",
    error ? "afc-select-field--error" : "",
    disabled ? "afc-select-field--disabled" : "",
    open ? "afc-select-field--open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const menu =
    open ? (
      <ul
        ref={menuRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={`${selectId}-trigger`}
        className={[
          "afc-select-menu",
          "afc-select-menu--portal",
          menuPlacement === "top" ? "afc-select-menu--above" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={menuStyle}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isHighlighted = index === highlightIndex;

          return (
            <li
              key={option.value || option.label}
              role="option"
              aria-selected={isSelected}
              className={[
                "afc-select-option",
                isSelected ? "afc-select-option--selected" : "",
                isHighlighted ? "afc-select-option--highlighted" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => setHighlightIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option.value)}
            >
              <span className="afc-select-option__label">{option.label}</span>
              {option.helper ? (
                <span className="afc-select-option__helper">{option.helper}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div className={fieldClassName} ref={rootRef}>
      <label htmlFor={selectId} className="afc-select-field__label">
        {label}
        {required ? <span className="afc-select-field__required">*</span> : null}
      </label>

      <div className="afc-select-field__control afc-select-field__control--native">
        <div className="afc-select-native-wrap">
          <select
            id={selectId}
            value={value}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            className="afc-select-native"
          >
            {showPlaceholderOption ? (
              <option value="" disabled={required} hidden={required}>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value || option.label} value={option.value}>
                {option.helper
                  ? `${option.label} — ${option.helper}`
                  : option.label}
              </option>
            ))}
          </select>
          <span className="afc-select-native__arrow" aria-hidden />
        </div>
      </div>

      <div className="afc-select-field__control afc-select-field__control--custom">
        <button
          ref={triggerRef}
          type="button"
          id={`${selectId}-trigger`}
          role="combobox"
          className={`afc-select-trigger ${open ? "afc-select-trigger--open" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            className={`afc-select-trigger__value ${hasValue ? "" : "afc-select-trigger__value--placeholder"}`}
          >
            {selectedLabel}
          </span>
          <span className="afc-select-trigger__arrow" aria-hidden />
        </button>
      </div>

      {menu && typeof document !== "undefined"
        ? createPortal(menu, document.body)
        : null}

      {hint && !error ? (
        <p id={hintId} className="afc-select-field__hint">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="afc-select-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
