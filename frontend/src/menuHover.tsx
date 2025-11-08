import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HoverDropdownProps {
  label: string;
  items: { label: string; to: string }[];
}
export function HoverDropdown({ label, items }: HoverDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {label}
          {open ? (
            <ChevronUp size={16} className="opacity-70 transition-transform duration-200" />
          ) : (
            <ChevronDown size={16} className="opacity-70 transition-transform duration-200" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="min-w-[180px]"
      >
        {items.map((item) => (
          <DropdownMenuItem
            asChild
            key={item.to}
            className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
          >
            <Link to={item.to}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}