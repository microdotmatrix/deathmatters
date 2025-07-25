"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

export function AnimatedDatePicker({
  date,
  setDate,
  width = "w-full",
  label,
  layout = "dropdown",
}: {
  date?: Date;
  setDate: (date: Date) => void;
  width?: string;
  label?: string;
  layout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const isActive = isFocused || date !== undefined;

  const labelVariants = {
    default: {
      y: 0,
      x: 25,
      scale: 1,
      color: "var(--color-muted-foreground)",
      originX: 0,
    },
    focused: {
      y: -25,
      x: 0,
      scale: 0.85,
      color: "var(--color-foreground)",
      originX: 0,
    },
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            width
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date && format(date, "PPP")}
          <motion.label
            htmlFor={label}
            className="absolute left-3 top-2.5 pointer-events-none text-sm"
            initial="default"
            animate={isActive ? "focused" : "default"}
            variants={labelVariants}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <Calendar
          mode="single"
          captionLayout={layout}
          selected={date}
          onSelect={setDate}
          autoFocus
          required
        />
      </PopoverContent>
    </Popover>
  );
}
