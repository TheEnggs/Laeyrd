import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import { Button } from "@webview/components/ui/button";
import { Badge } from "@webview/components/ui/badge";
import { Input } from "@webview/components/ui/input";
import {
  Tabs,
  TabsContent,
  AnimatedTabsTrigger,
  AnimatedTabsList,
} from "@webview/components/ui/tabs";
import {
  Palette,
  Code,
  Download,
  Star,
  Users,
  ChevronUp,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";

// Mock data for themes
const logoArr = ["🌙", "🌊", "⚡", "🐍", "🌐", "🌙", "🌊", "⚡", "🐍", "🌐"];
function generateMockThemes(length: number) {
  return Array.from({ length: length }, (_, index) => ({
    id: `theme-${index}`,
    name: `Theme ${index}`,
    publisher: `Publisher ${index}`,
    installs: Math.floor(Math.random() * 100000),
    rating: Math.random() * 5,
    logo: logoArr[index],
    description:
      "A professional dark theme with carefully crafted colors for optimal coding experience.",
    features: ["Dark mode optimized", "Syntax highlighting", "Custom icons"],
    instructions:
      "1. Click Install\n2. Restart VS Code\n3. Select theme from command palette",
    importantNotes:
      "This theme works best with the Material Icon Theme extension.",
  }));
}
function generateMockDevSetups(length: number) {
  return Array.from({ length: length }, (_, index) => ({
    id: `dev-setup-${index}`,
    name: `Dev Setup ${index}`,
    publisher: `Publisher ${index}`,
    installs: Math.floor(Math.random() * 100000),
    rating: Math.random() * 5,
    logo: logoArr[index],
    description:
      "Complete development environment setup for modern JavaScript development.",
    features: ["Node.js", "React", "Express", "MongoDB", "ESLint", "Prettier"],
    instructions:
      "1. Run the setup script\n2. Install dependencies\n3. Configure your environment\n4. Start coding!",
    importantNotes:
      "This setup requires Node.js 16+ and npm 8+. Make sure to update your system first.",
  }));
}
const mockThemes = generateMockThemes(50);
const mockDevSetups = generateMockDevSetups(50);

interface MarketplaceItemProps {
  item: (typeof mockThemes)[0];
  onInstall: (id: string) => void;
  onExpand: (id: string | null) => void;
  isExpanded: boolean;
}

function MarketplaceItem({
  item,
  onInstall,
  onExpand,
  isExpanded,
}: MarketplaceItemProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    onExpand(item.id);
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg",
        isExpanded ? "col-span-2 row-span-2" : "col-span-1"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {!isExpanded ? (
          // Compact view - Logo on left, info on right
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                  {item.logo}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                    <Star className="h-3 w-3 fill-current" />
                    {item.rating.toFixed(1)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {item.publisher}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Users className="h-3 w-3" />
                  {item.installs.toLocaleString()} installs
                </div>
                <p className="text-xs line-clamp-2 mb-3">{item.description}</p>
                <Button
                  size="sm"
                  className="max-w-max rounded-full self-end"
                  data-install-button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInstall(item.id);
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Expanded view - Full width, 2 rows
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-3xl">
                  {item.logo}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.publisher}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current" />
                      {item.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {item.installs.toLocaleString()} installs
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(null);
                }}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left side - Description and features */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm">{item.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="space-y-1">
                    {item.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right side - Instructions and install */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    Installation Instructions
                  </h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap">
                      {item.instructions}
                    </pre>
                  </div>
                </div>
                <Button
                  className="rounded-full"
                  data-install-button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInstall(item.id);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Now
                </Button>
              </div>
            </div>

            {/* Important notes section */}
            <div className="border-t pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    Important Notes
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.importantNotes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MarketplaceContent() {
  const [activeTab, setActiveTab] = useState("themes");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const PAGE_SIZE = 20;

  const handleInstall = (id: string) => {
    console.log(`Installing ${id}`);
    // TODO: Implement actual installation logic
  };

  const handleExpandItem = (id: string | null) => {
    if (id === expandedItem) {
      setExpandedItem(null);
    } else {
      setExpandedItem(id);
    }
  };

  // Filter and paginate data based on search query and current page
  const filteredAndPaginatedData = useMemo(() => {
    const data = activeTab === "themes" ? mockThemes : mockDevSetups;

    // Filter based on search query
    const filtered = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginated = filtered.slice(0, endIndex);

    return {
      items: paginated,
      hasMore: endIndex < filtered.length,
      total: filtered.length,
    };
  }, [activeTab, searchQuery, currentPage]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
    setExpandedItem(null);
  }, [searchQuery, activeTab]);

  // Load more function for infinite scroll
  const loadMore = () => {
    if (!isLoading && filteredAndPaginatedData.hasMore) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsLoading(false);
      }, 500);
    }
  };

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, filteredAndPaginatedData.hasMore]);

  return (
    <div className="w-full">
      <Badge>Coming Soon</Badge>
      {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <AnimatedTabsList
          activeTab={activeTab}
          tabValues={["themes", "dev-setup"]}
          className="max-w-lg mx-auto w-full h-full grid grid-cols-2 [mask-image:none] mb-8"
        >
          <AnimatedTabsTrigger
            value="themes"
            className="flex items-center gap-2 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-sm font-medium rounded-xl px-3 relative"
          >
            <Palette className="h-4 w-4" />
            Themes
          </AnimatedTabsTrigger>
          <AnimatedTabsTrigger
            value="dev-setup"
            className="flex items-center gap-2 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-sm font-medium rounded-xl px-3 relative"
          >
            <Code className="h-4 w-4" />
            Dev Setup
          </AnimatedTabsTrigger>
        </AnimatedTabsList>

        <TabsContent value="themes" className="space-y-4">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardDescription className="text-secondary-foreground/80 text-sm leading-relaxed">
                  Discover and install beautiful themes for VS Code
                </CardDescription>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search themes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-72 rounded-full"
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filteredAndPaginatedData.total} results
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min grid-flow-row-dense">
                {filteredAndPaginatedData.items.map((theme) => (
                  <MarketplaceItem
                    key={theme.id}
                    item={theme}
                    onInstall={handleInstall}
                    onExpand={handleExpandItem}
                    isExpanded={expandedItem === theme.id}
                  />
                ))}
              </div>
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              {!filteredAndPaginatedData.hasMore &&
                filteredAndPaginatedData.items.length > 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No more items to load
                  </div>
                )}
              {filteredAndPaginatedData.items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No themes found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dev-setup" className="space-y-4">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-secondary-foreground/80 text-sm leading-relaxed">
                    Pre-configured development environments and tool collections
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search dev setups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-72 rounded-full"
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filteredAndPaginatedData.total} results
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min grid-flow-row-dense">
                {filteredAndPaginatedData.items.map((setup) => (
                  <MarketplaceItem
                    key={setup.id}
                    item={setup}
                    onInstall={handleInstall}
                    onExpand={handleExpandItem}
                    isExpanded={expandedItem === setup.id}
                  />
                ))}
              </div>
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              {!filteredAndPaginatedData.hasMore &&
                filteredAndPaginatedData.items.length > 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No more items to load
                  </div>
                )}
              {filteredAndPaginatedData.items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No dev setups found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
