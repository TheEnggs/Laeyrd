"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@webview/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import { Label } from "@webview/components/ui/label";
import { Slider } from "@webview/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@webview/components/ui/select";
import { Switch } from "@webview/components/ui/switch";
import { useSettings } from "../contexts/settings-context";
import {
  Monitor,
  FileText,
  FolderOpen,
  Search,
  Maximize2,
  Eye,
  EyeOff,
  Layout,
  Settings,
} from "lucide-react";

export default function LayoutSettings() {
  const { state, updateSetting } = useSettings();
  const { layout, workbench } = state.settings;

  return (
    <div className="w-full">
      <Tabs defaultValue="window" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 border border-border/40 p-1 rounded-xl">
          <TabsTrigger
            value="window"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg px-3 py-2"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Window</span>
          </TabsTrigger>
          <TabsTrigger
            value="editor"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg px-3 py-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger
            value="explorer"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg px-3 py-2"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Explorer</span>
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg px-3 py-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </TabsTrigger>
        </TabsList>

        {/* Window Layout Settings */}
        <TabsContent value="window" className="space-y-6">
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                Window & Panel Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-location">Sidebar Location</Label>
                    <Select
                      value={workbench.sideBarLocation}
                      onValueChange={(value) =>
                        updateSetting("workbench", "sideBarLocation", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panel-location">Panel Location</Label>
                    <Select
                      value={workbench.panelLocation}
                      onValueChange={(value) =>
                        updateSetting("workbench", "panelLocation", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-bar-location">
                      Activity Bar Location
                    </Label>
                    <Select
                      value={workbench.activityBarLocation}
                      onValueChange={(value) =>
                        updateSetting("workbench", "activityBarLocation", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title-bar-style">Title Bar Style</Label>
                    <Select
                      value={layout.window.titleBarStyle}
                      onValueChange={(value) =>
                        updateSetting("layout", "window", {
                          ...layout.window,
                          titleBarStyle: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="native">Native</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="menu-bar-visibility">
                      Menu Bar Visibility
                    </Label>
                    <Select
                      value={layout.window.menuBarVisibility}
                      onValueChange={(value) =>
                        updateSetting("layout", "window", {
                          ...layout.window,
                          menuBarVisibility: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visible">Visible</SelectItem>
                        <SelectItem value="toggle">Toggle</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="window-zoom-level">
                      Window Zoom Level: {layout.window.zoomLevel}%
                    </Label>
                    <Slider
                      value={[layout.window.zoomLevel]}
                      onValueChange={([value]) =>
                        updateSetting("layout", "window", {
                          ...layout.window,
                          zoomLevel: value,
                        })
                      }
                      min={-8}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="native-fullscreen"
                      checked={layout.window.nativeFullScreen}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "window", {
                          ...layout.window,
                          nativeFullScreen: checked,
                        })
                      }
                    />
                    <Label htmlFor="native-fullscreen">
                      Native Full Screen
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="native-tabs"
                      checked={layout.window.nativeTabs}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "window", {
                          ...layout.window,
                          nativeTabs: checked,
                        })
                      }
                    />
                    <Label htmlFor="native-tabs">Native Tabs</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zen Mode Settings */}
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                Zen Mode Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="zen-fullscreen"
                      checked={layout.zenMode.fullScreen}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "zenMode", {
                          ...layout.zenMode,
                          fullScreen: checked,
                        })
                      }
                    />
                    <Label htmlFor="zen-fullscreen">Full Screen</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="zen-center-layout"
                      checked={layout.zenMode.centerLayout}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "zenMode", {
                          ...layout.zenMode,
                          centerLayout: checked,
                        })
                      }
                    />
                    <Label htmlFor="zen-center-layout">Center Layout</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="zen-hide-line-numbers"
                      checked={layout.zenMode.hideLineNumbers}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "zenMode", {
                          ...layout.zenMode,
                          hideLineNumbers: checked,
                        })
                      }
                    />
                    <Label htmlFor="zen-hide-line-numbers">
                      Hide Line Numbers
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="zen-hide-tabs"
                      checked={layout.zenMode.hideTabs}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "zenMode", {
                          ...layout.zenMode,
                          hideTabs: checked,
                        })
                      }
                    />
                    <Label htmlFor="zen-hide-tabs">Hide Tabs</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="zen-hide-status-bar"
                      checked={layout.zenMode.hideStatusBar}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "zenMode", {
                          ...layout.zenMode,
                          hideStatusBar: checked,
                        })
                      }
                    />
                    <Label htmlFor="zen-hide-status-bar">Hide Status Bar</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="zen-hide-activity-bar"
                      checked={layout.zenMode.hideActivityBar}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "zenMode", {
                          ...layout.zenMode,
                          hideActivityBar: checked,
                        })
                      }
                    />
                    <Label htmlFor="zen-hide-activity-bar">
                      Hide Activity Bar
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="zen-hide-sidebar"
                      checked={layout.zenMode.hideSideBar}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "zenMode", {
                          ...layout.zenMode,
                          hideSideBar: checked,
                        })
                      }
                    />
                    <Label htmlFor="zen-hide-sidebar">Hide Sidebar</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="zen-hide-menu-bar"
                      checked={layout.zenMode.hideMenuBar}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "zenMode", {
                          ...layout.zenMode,
                          hideMenuBar: checked,
                        })
                      }
                    />
                    <Label htmlFor="zen-hide-menu-bar">Hide Menu Bar</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Editor Layout Settings */}
        <TabsContent value="editor" className="space-y-6">
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                Editor Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="show-line-numbers">Show Line Numbers</Label>
                    <Select
                      value={layout.editor.showLineNumbers}
                      onValueChange={(value) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          showLineNumbers: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on">On</SelectItem>
                        <SelectItem value="off">Off</SelectItem>
                        <SelectItem value="relative">Relative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="render-line-highlight">
                      Line Highlight
                    </Label>
                    <Select
                      value={layout.editor.renderLineHighlight}
                      onValueChange={(value) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          renderLineHighlight: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="gutter">Gutter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="render-whitespace">Render Whitespace</Label>
                    <Select
                      value={layout.editor.renderWhitespace}
                      onValueChange={(value) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          renderWhitespace: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="boundary">Boundary</SelectItem>
                        <SelectItem value="mark">Mark</SelectItem>
                        <SelectItem value="selection">Selection</SelectItem>
                        <SelectItem value="trailing">Trailing</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="show-folding-controls">
                      Show Folding Controls
                    </Label>
                    <Select
                      value={layout.editor.showFoldingControls}
                      onValueChange={(value) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          showFoldingControls: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always</SelectItem>
                        <SelectItem value="mouseover">Mouse Over</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="folding-strategy">Folding Strategy</Label>
                    <Select
                      value={layout.editor.foldingStrategy}
                      onValueChange={(value) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          foldingStrategy: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="indentation">Indentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="render-control-characters"
                      checked={layout.editor.renderControlCharacters}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          renderControlCharacters: checked,
                        })
                      }
                    />
                    <Label htmlFor="render-control-characters">
                      Render Control Characters
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="render-indent-guides"
                      checked={layout.editor.renderIndentGuides}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          renderIndentGuides: checked,
                        })
                      }
                    />
                    <Label htmlFor="render-indent-guides">
                      Render Indent Guides
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="render-validation-decorations">
                      Validation Decorations
                    </Label>
                    <Select
                      value={layout.editor.renderValidationDecorations}
                      onValueChange={(value) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          renderValidationDecorations: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on">On</SelectItem>
                        <SelectItem value="off">Off</SelectItem>
                        <SelectItem value="editable">Editable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editor Guides Settings */}
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                Editor Guides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="indentation-guides"
                      checked={layout.editor.guides.indentation}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          guides: {
                            ...layout.editor.guides,
                            indentation: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="indentation-guides">
                      Indentation Guides
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bracket-pairs"
                      checked={layout.editor.guides.bracketPairs}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          guides: {
                            ...layout.editor.guides,
                            bracketPairs: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="bracket-pairs">Bracket Pairs</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bracket-pairs-horizontal"
                      checked={layout.editor.guides.bracketPairsHorizontal}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          guides: {
                            ...layout.editor.guides,
                            bracketPairsHorizontal: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="bracket-pairs-horizontal">
                      Horizontal Bracket Pairs
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="highlight-active-indentation"
                      checked={layout.editor.guides.highlightActiveIndentation}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          guides: {
                            ...layout.editor.guides,
                            highlightActiveIndentation: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="highlight-active-indentation">
                      Highlight Active Indentation
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="highlight-active-bracket-pair"
                      checked={layout.editor.guides.highlightActiveBracketPair}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "editor", {
                          ...layout.editor,
                          guides: {
                            ...layout.editor.guides,
                            highlightActiveBracketPair: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="highlight-active-bracket-pair">
                      Highlight Active Bracket Pair
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explorer Settings */}
        <TabsContent value="explorer" className="space-y-6">
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                File Explorer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compact-folders"
                      checked={layout.explorer.compactFolders}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "explorer", {
                          ...layout.explorer,
                          compactFolders: checked,
                        })
                      }
                    />
                    <Label htmlFor="compact-folders">Compact Folders</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-reveal"
                      checked={layout.explorer.autoReveal}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "explorer", {
                          ...layout.explorer,
                          autoReveal: checked,
                        })
                      }
                    />
                    <Label htmlFor="auto-reveal">Auto Reveal</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sort-order">Sort Order</Label>
                    <Select
                      value={layout.explorer.sortOrder}
                      onValueChange={(value) =>
                        updateSetting("layout", "explorer", {
                          ...layout.explorer,
                          sortOrder: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="filesFirst">Files First</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="modified">Modified</SelectItem>
                        <SelectItem value="foldersNestsFiles">
                          Folders Nests Files
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="open-editors-visible">
                      Open Editors Visible: {layout.explorer.openEditorsVisible}
                    </Label>
                    <Slider
                      value={[layout.explorer.openEditorsVisible]}
                      onValueChange={([value]) =>
                        updateSetting("layout", "explorer", {
                          ...layout.explorer,
                          openEditorsVisible: value,
                        })
                      }
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Settings */}
        <TabsContent value="search" className="space-y-6">
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                Search Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-line-numbers"
                      checked={layout.search.showLineNumbers}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "search", {
                          ...layout.search,
                          showLineNumbers: checked,
                        })
                      }
                    />
                    <Label htmlFor="show-line-numbers">Show Line Numbers</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-global-ignore-files"
                      checked={layout.search.useGlobalIgnoreFiles}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "search", {
                          ...layout.search,
                          useGlobalIgnoreFiles: checked,
                        })
                      }
                    />
                    <Label htmlFor="use-global-ignore-files">
                      Use Global Ignore Files
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-parent-ignore-files"
                      checked={layout.search.useParentIgnoreFiles}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "search", {
                          ...layout.search,
                          useParentIgnoreFiles: checked,
                        })
                      }
                    />
                    <Label htmlFor="use-parent-ignore-files">
                      Use Parent Ignore Files
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-ignore-files"
                      checked={layout.search.useIgnoreFiles}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "search", {
                          ...layout.search,
                          useIgnoreFiles: checked,
                        })
                      }
                    />
                    <Label htmlFor="use-ignore-files">Use Ignore Files</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-exclude-settings"
                      checked={layout.search.useExcludeSettingsAndIgnoreFiles}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "search", {
                          ...layout.search,
                          useExcludeSettingsAndIgnoreFiles: checked,
                        })
                      }
                    />
                    <Label htmlFor="use-exclude-settings">
                      Use Exclude Settings
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="follow-symlinks"
                      checked={layout.search.followSymlinks}
                      onCheckedChange={(checked) =>
                        updateSetting("layout", "search", {
                          ...layout.search,
                          followSymlinks: checked,
                        })
                      }
                    />
                    <Label htmlFor="follow-symlinks">Follow Symlinks</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
