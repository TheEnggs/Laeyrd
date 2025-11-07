"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Base styles
      "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
      // Mobile: horizontal scrollable row
      "w-full tabs-scroll scrollbar-none gap-1 relative",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground relative z-10",
      // Prevent shrinking, enable snapping, give comfortable target on mobile
      "shrink-0",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// Animated TabsTrigger with background indicator
const AnimatedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative z-10",
        "shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
});
AnimatedTabsTrigger.displayName = "AnimatedTabsTrigger";

// Animated TabsList with background indicator
const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    activeTab?: string;
    tabValues?: string[];
  }
>(({ className, activeTab, tabValues = [], children, ...props }, ref) => {
  // Calculate the position of the active tab
  const getActiveTabPosition = () => {
    if (!activeTab || !tabValues.length) return 0;
    const activeIndex = tabValues.indexOf(activeTab);
    if (activeIndex === -1) return 0;
    return (activeIndex / tabValues.length) * 100 + 0.2;
  };

  const tabWidth = tabValues.length > 0 ? 100 / tabValues.length - 0.4 : 100;

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-full items-center justify-start rounded-full shadow-md border border-border/40 bg-card/50 p-1 text-muted-foreground",
        "w-full tabs-scroll scrollbar-none gap-1 relative",
        className
      )}
      {...props}
    >
      {children}
      {/* Animated background indicator */}
      {activeTab && tabValues.length > 0 && (
        <motion.div
          layoutId={"activeTabBackground" + activeTab}
          className="absolute top-1/2 -translate-y-1/2 inset-0 h-[calc(100%-2px)] bg-gradient-to-r from-primary/90 to-primary/80 rounded-full shadow-sm"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: `${tabWidth}%`,
            left: `${getActiveTabPosition()}%`,
          }}
        />
      )}
    </TabsPrimitive.List>
  );
});
AnimatedTabsList.displayName = "AnimatedTabsList";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="w-full space-y-4"
      >
        {props.children}
      </motion.div>
    </AnimatePresence>
  </TabsPrimitive.Content>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AnimatedTabsTrigger,
  AnimatedTabsList,
};
