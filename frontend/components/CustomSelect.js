"use client";

import {
  Check,
  ChevronDown,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Pilih data",
  searchable = false,
  searchPlaceholder = "Cari data...",
  emptyMessage = "Data tidak ditemukan",
  className = "",
  triggerClassName = "",
  dropdownClassName = "",
  optionClassName = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const containerReference =
    useRef(null);

  const searchInputReference =
    useRef(null);

  const selectedOption = options.find(
    (option) =>
      option.value === value
  );

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        containerReference.current &&
        !containerReference.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    if (
      isOpen &&
      searchable &&
      searchInputReference.current
    ) {
      searchInputReference.current.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) {
      setSearchKeyword("");
    }
  }, [isOpen]);

  const filteredOptions =
    useMemo(() => {
      if (!searchable) {
        return options;
      }

      return options.filter(
        (option) =>
          option.label
            ?.toLowerCase()
            .includes(
              searchKeyword.toLowerCase()
            )
      );
    }, [
      options,
      searchKeyword,
      searchable,
    ]);

  return (
    <div
      ref={containerReference}
      className={`relative w-full ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setIsOpen(
            (previousState) =>
              !previousState
          )
        }
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center justify-between hover:border-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${triggerClassName}`}
      >
        <span
          className={`text-sm font-bold truncate ${selectedOption
            ? "text-slate-600"
            : "text-slate-400"
            }`}
        >
          {selectedOption?.label ||
            placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen
            ? "rotate-180"
            : ""
            }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}
        >
          {searchable && (
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                <Search
                  size={16}
                  className="text-slate-400 mr-2"
                />

                <input
                  ref={
                    searchInputReference
                  }
                  type="text"
                  value={searchKeyword}
                  onChange={(
                    event
                  ) =>
                    setSearchKeyword(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    searchPlaceholder
                  }
                  className="bg-transparent outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length >
              0 ? (
              filteredOptions.map(
                (option) => {
                  const isSelected =
                    option.value ===
                    value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() => {
                        onChange(
                          option.value,
                          option
                        );

                        setIsOpen(
                          false
                        );
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left transition-all ${isSelected
                        ? "bg-primary/5 text-primary"
                        : "hover:bg-slate-50 text-slate-600"
                        } ${optionClassName}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">
                          {
                            option.label
                          }
                        </span>

                        {option.description && (
                          <span className="text-[11px] text-slate-400 font-medium mt-1">
                            {
                              option.description
                            }
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <Check
                          size={16}
                        />
                      )}
                    </button>
                  );
                }
              )
            ) : (
              <div className="px-4 py-6 text-center text-sm font-semibold text-slate-400">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
