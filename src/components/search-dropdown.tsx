"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Drop } from "../db/schema";
import { Link } from "@/components/ui/link";
import { useParams, useRouter } from "next/navigation";
import { DropSearchResult } from "@/app/api/search/route";

type SearchResult = Drop & { href: string };

export function SearchDropdownComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // we don't need react query, we have react query at home
  // react query at home:
  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredItems([]);
    } else {
      setIsLoading(true);

      const searchedFor = searchTerm;
      fetch(`/api/search?q=${searchTerm}`).then(async (results) => {
        const currentSearchTerm = inputRef.current?.value;
        if (currentSearchTerm !== searchedFor) {
          return;
        }
        const json = await results.json();
        setIsLoading(false);
        setFilteredItems(json as DropSearchResult);
      });
    }
  }, [searchTerm, inputRef]);

  const params = useParams();
  useEffect(() => {
    if (!params.drop) {
      const river = params.river;
      setSearchTerm(
        typeof river === "string" ? river.replaceAll("-", " ") : "",
      );
    }
  }, [params]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        prevIndex < filteredItems.length - 1 ? prevIndex + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : filteredItems.length - 1,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      router.push(filteredItems[highlightedIndex].href);
      setSearchTerm(filteredItems[highlightedIndex].name);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // close dropdown when clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="font-sans" ref={dropdownRef}>
      <div className="relative flex-grow">
        <div className="relative">
          <Input
            ref={inputRef}
            autoCapitalize="off"
            autoCorrect="off"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(e.target.value.length > 0);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="pr-12 font-sans font-medium sm:w-[300px] md:w-[375px]"
          />
          <X
            className={cn(
              "absolute right-7 top-2 h-5 w-5 text-muted-foreground",
              {
                hidden: !isOpen,
              },
            )}
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
          />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full border border-gray-200 bg-white shadow-lg">
            <ScrollArea className="h-[300px]">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <Link href={item.href} key={item.slug} prefetch={true}>
                    <div
                      className={cn("flex cursor-pointer items-center p-2", {
                        "bg-gray-100": index === highlightedIndex,
                      })}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => {
                        setSearchTerm(item.name);
                        setIsOpen(false);
                        inputRef.current?.blur();
                      }}
                    >
                      <Image
                        loading="eager"
                        decoding="sync"
                        src={item.image_url ?? "/placeholder.svg"}
                        alt=""
                        className="h-10 w-10 pr-2"
                        height={40}
                        width={40}
                        quality={65}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  </Link>
                ))
              ) : isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500">No results found</p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
