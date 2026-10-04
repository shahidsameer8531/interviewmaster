"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { appNavigation } from "@/components/app/app-navigation";
import { useSearch } from "@/components/app/search-context";

/**
 * "Search or jump to". The dialog state and the ⌘K / Ctrl+K shortcut live in
 * the shell's SearchProvider so one dialog serves the whole screen.
 */
export const SearchCommand = () => {
  const router = useRouter();
  const { open, setOpen, shortcutLabel } = useSearch();
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <Search className="h-4 w-4" /> Search or jump to
        {shortcutLabel && (
          <kbd className="ml-1 rounded border border-app-line-strong px-1.5 py-0.5 font-mono text-[11px] font-normal text-app-ink-3" aria-label={`Shortcut ${shortcutLabel}`}>
            {shortcutLabel}
          </kbd>
        )}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a screen" />
        <CommandList>
          <CommandEmpty>No screen matches that.</CommandEmpty>
          {appNavigation.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem key={item.href} value={`${group.label} ${item.label}`} onSelect={() => go(item.href)}>
                  <item.icon className="mr-2 h-4 w-4" aria-hidden />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="Actions">
            <CommandItem value="new mock interview session" onSelect={() => go("/dashboard/interview/new")}>
              Start a new mock interview
            </CommandItem>
            <CommandItem value="change target role company loop date" onSelect={() => go("/settings")}>
              Change your target
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
