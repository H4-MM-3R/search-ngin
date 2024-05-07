"use client";

import { useRef, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const SearchBar = () => {
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get("query") || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearching, startTransition] = useTransition();
  const router = useRouter();
  const [query, setquery] = useState<string>(defaultQuery);

  const search = () => {
    startTransition(() => {
      router.push(`/search?query=${query}`);
    });
  };

  return (
    <div className="relative w-full h-14 flex flex-col bg-white">
      <div className="relative h-14 z-10 rounded-md">
        <Input
          disabled={isSearching}
          value={query}
          onChange={(e) => {
            setquery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search();
            }
            if (e.key === "Escape") {
              inputRef?.current?.blur();
            }
          }}
          ref={inputRef}
          className="absolute inset-0 h-full"
          placeholder="Search"
        />
        <Button
          disabled={isSearching}
          size="sm"
          onClick={search}
          className="absolute inset-y-0 h-full right-0 rounded-l-none"
        >
          {isSearching ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
