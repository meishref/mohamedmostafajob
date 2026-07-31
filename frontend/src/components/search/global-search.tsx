"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/hooks/use-search";
import type { SearchResult } from "@/types/search";
import {
  ClipboardList,
  CreditCard,
  Receipt,
  Search,
  UserCircle,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const typeIcons = {
  employee: UserCircle,
  task: ClipboardList,
  payment: CreditCard,
  expense: Receipt,
};

function SearchResults({
  query,
  onSelect,
}: {
  query: string;
  onSelect: () => void;
}) {
  const t = useTranslations("search");
  const { data, isLoading, isFetching } = useGlobalSearch(query, query.trim().length >= 2);
  const results = data?.results ?? [];

  if (query.trim().length < 2) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        {t("minChars")}
      </p>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        {t("noResults", { query })}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {results.map((item: SearchResult) => {
        const Icon = typeIcons[item.type];
        return (
          <li key={`${item.type}-${item.id}`}>
            <Link
              href={item.url}
              onClick={onSelect}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {t(`types.${item.type}`)}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              {item.status && (
                <Badge
                  variant="secondary"
                  style={
                    item.status_color
                      ? { backgroundColor: `${item.status_color}20`, color: item.status_color }
                      : undefined
                  }
                  className="shrink-0 text-[10px]"
                >
                  {item.status}
                </Badge>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function GlobalSearch() {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    setQuery("");
    setDebounced("");
  };

  return (
    <>
      <div ref={containerRef} className="relative hidden flex-1 md:block md:max-w-md md:px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("placeholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="pl-9"
          />
        </div>

        {open && debounced.trim().length >= 1 && (
          <div className="absolute left-4 right-4 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border bg-background shadow-lg">
            <SearchResults query={debounced} onSelect={() => { setOpen(false); setQuery(""); }} />
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        aria-label={t("openSearch")}
        onClick={() => setMobileOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex items-center gap-2 border-b p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder={t("mobilePlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={closeMobile} aria-label={t("closeSearch")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
            <SearchResults query={debounced} onSelect={closeMobile} />
          </div>
        </div>
      )}
    </>
  );
}
