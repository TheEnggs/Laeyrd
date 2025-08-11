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
import { Input } from "@webview/components/ui/input";
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
import { FileText, Terminal, Monitor } from "lucide-react";

const fontWeights = [
  { value: "normal", label: "Normal" },
  { value: "bold", label: "Bold" },
  { value: "100", label: "Thin (100)" },
  { value: "200", label: "Extra Light (200)" },
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi Bold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra Bold (800)" },
  { value: "900", label: "Black (900)" },
];

const commonFonts = [
  "Consolas, Monaco, monospace",
  "Fira Code, Consolas, monospace",
  "JetBrains Mono, Consolas, monospace",
  "Source Code Pro, Consolas, monospace",
  "Cascadia Code, Consolas, monospace",
  "Menlo, Monaco, monospace",
  "Ubuntu Mono, Consolas, monospace",
  "DejaVu Sans Mono, Consolas, monospace",
  "Liberation Mono, Consolas, monospace",
  "Courier New, Courier, monospace",
];

const uiFonts = [
  "Segoe UI, Tahoma, sans-serif",
  "Inter, Segoe UI, sans-serif",
  "Roboto, Segoe UI, sans-serif",
  "Open Sans, Segoe UI, sans-serif",
  "Lato, Segoe UI, sans-serif",
  "Poppins, Segoe UI, sans-serif",
  "Montserrat, Segoe UI, sans-serif",
  "Ubuntu, Segoe UI, sans-serif",
  "Noto Sans, Segoe UI, sans-serif",
  "Arial, sans-serif",
];

export default function FontSettings() {
  const { state, updateSetting } = useSettings() as any;
  const { editor, terminal, ui } = state.settings;

  return (
    <div className="w-full">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 border border-border/40 p-1 rounded-xl">
          <TabsTrigger
            value="editor"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg px-3 py-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger
            value="terminal"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg px-3 py-2"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </TabsTrigger>
          <TabsTrigger
            value="ui"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg px-3 py-2"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>UI Elements</span>
          </TabsTrigger>
        </TabsList>

        {/* Editor Font Settings */}
        <TabsContent value="editor" className="space-y-6">
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                Editor Font Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editor-font-family">Font Family</Label>
                    <Select
                      value={editor.fontFamily}
                      onValueChange={(value) =>
                        updateSetting("editor", "fontFamily", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commonFonts.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font.split(",")[0]}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    {editor.fontFamily === "custom" && (
                      <Input
                        placeholder="Enter custom font family"
                        className="mt-2"
                        onChange={(e) =>
                          updateSetting("editor", "fontFamily", e.target.value)
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editor-font-size">
                      Font Size: {editor.fontSize}px
                    </Label>
                    <Slider
                      value={[editor.fontSize]}
                      onValueChange={([value]) =>
                        updateSetting("editor", "fontSize", value)
                      }
                      min={8}
                      max={32}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editor-font-weight">Font Weight</Label>
                    <Select
                      value={editor.fontWeight}
                      onValueChange={(value) =>
                        updateSetting("editor", "fontWeight", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeights.map((weight) => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editor-line-height">
                      Line Height: {editor.lineHeight}
                    </Label>
                    <Slider
                      value={[editor.lineHeight]}
                      onValueChange={([value]) =>
                        updateSetting("editor", "lineHeight", value)
                      }
                      min={1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editor-letter-spacing">
                      Letter Spacing: {editor.letterSpacing}px
                    </Label>
                    <Slider
                      value={[editor.letterSpacing]}
                      onValueChange={([value]) =>
                        updateSetting("editor", "letterSpacing", value)
                      }
                      min={-2}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editor-tab-size">
                      Tab Size: {editor.tabSize}
                    </Label>
                    <Slider
                      value={[editor.tabSize]}
                      onValueChange={([value]) =>
                        updateSetting("editor", "tabSize", value)
                      }
                      min={1}
                      max={8}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editor-word-wrap">Word Wrap</Label>
                    <Select
                      value={editor.wordWrap}
                      onValueChange={(value) =>
                        updateSetting("editor", "wordWrap", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Off</SelectItem>
                        <SelectItem value="on">On</SelectItem>
                        <SelectItem value="wordWrapColumn">
                          Word Wrap Column
                        </SelectItem>
                        <SelectItem value="bounded">Bounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editor.wordWrap === "wordWrapColumn" && (
                    <div className="space-y-2">
                      <Label htmlFor="editor-word-wrap-column">
                        Word Wrap Column: {editor.wordWrapColumn}
                      </Label>
                      <Slider
                        value={[editor.wordWrapColumn]}
                        onValueChange={([value]) =>
                          updateSetting("editor", "wordWrapColumn", value)
                        }
                        min={40}
                        max={200}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terminal Font Settings */}
        <TabsContent value="terminal" className="space-y-6">
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                Terminal Font Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="terminal-font-family">Font Family</Label>
                    <Select
                      value={terminal.fontFamily}
                      onValueChange={(value) =>
                        updateSetting("terminal", "fontFamily", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commonFonts.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font.split(",")[0]}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    {terminal.fontFamily === "custom" && (
                      <Input
                        placeholder="Enter custom font family"
                        className="mt-2"
                        onChange={(e) =>
                          updateSetting(
                            "terminal",
                            "fontFamily",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terminal-font-size">
                      Font Size: {terminal.fontSize}px
                    </Label>
                    <Slider
                      value={[terminal.fontSize]}
                      onValueChange={([value]) =>
                        updateSetting("terminal", "fontSize", value)
                      }
                      min={8}
                      max={32}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terminal-font-weight">Font Weight</Label>
                    <Select
                      value={terminal.fontWeight}
                      onValueChange={(value) =>
                        updateSetting("terminal", "fontWeight", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeights.map((weight) => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="terminal-line-height">
                      Line Height: {terminal.lineHeight}
                    </Label>
                    <Slider
                      value={[terminal.lineHeight]}
                      onValueChange={([value]) =>
                        updateSetting("terminal", "lineHeight", value)
                      }
                      min={1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terminal-letter-spacing">
                      Letter Spacing: {terminal.letterSpacing}px
                    </Label>
                    <Slider
                      value={[terminal.letterSpacing]}
                      onValueChange={([value]) =>
                        updateSetting("terminal", "letterSpacing", value)
                      }
                      min={-2}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terminal-cursor-style">Cursor Style</Label>
                    <Select
                      value={terminal.cursorStyle}
                      onValueChange={(value) =>
                        updateSetting("terminal", "cursorStyle", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="block">Block</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="underline">Underline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terminal-cursor-width">
                      Cursor Width: {terminal.cursorWidth}px
                    </Label>
                    <Slider
                      value={[terminal.cursorWidth]}
                      onValueChange={([value]) =>
                        updateSetting("terminal", "cursorWidth", value)
                      }
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="terminal-cursor-blink"
                      checked={terminal.cursorBlinking}
                      onCheckedChange={(checked) =>
                        updateSetting("terminal", "cursorBlinking", checked)
                      }
                    />
                    <Label htmlFor="terminal-cursor-blink">
                      Cursor Blinking
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Font Settings */}
        <TabsContent value="ui" className="space-y-6">
          <Card className="bg-card/50 border border-border/40 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                UI Font Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ui-font-family">
                      Default UI Font Family
                    </Label>
                    <Select
                      value={ui.fontFamily}
                      onValueChange={(value) =>
                        updateSetting("ui", "fontFamily", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uiFonts.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font.split(",")[0]}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    {ui.fontFamily === "custom" && (
                      <Input
                        placeholder="Enter custom font family"
                        className="mt-2"
                        onChange={(e) =>
                          updateSetting("ui", "fontFamily", e.target.value)
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ui-font-size">
                      Default UI Font Size: {ui.fontSize}px
                    </Label>
                    <Slider
                      value={[ui.fontSize]}
                      onValueChange={([value]) =>
                        updateSetting("ui", "fontSize", value)
                      }
                      min={10}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ui-font-weight">
                      Default UI Font Weight
                    </Label>
                    <Select
                      value={ui.fontWeight}
                      onValueChange={(value) =>
                        updateSetting("ui", "fontWeight", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeights.map((weight) => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status-bar-font-size">
                      Status Bar Font Size: {ui.statusBar.fontSize}px
                    </Label>
                    <Slider
                      value={[ui.statusBar.fontSize]}
                      onValueChange={([value]) =>
                        updateSetting("ui", "statusBar", {
                          ...ui.statusBar,
                          fontSize: value,
                        })
                      }
                      min={10}
                      max={16}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="side-bar-font-size">
                      Sidebar Font Size: {ui.sideBar.fontSize}px
                    </Label>
                    <Slider
                      value={[ui.sideBar.fontSize]}
                      onValueChange={([value]) =>
                        updateSetting("ui", "sideBar", {
                          ...ui.sideBar,
                          fontSize: value,
                        })
                      }
                      min={10}
                      max={16}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breadcrumbs-font-size">
                      Breadcrumbs Font Size: {ui.breadcrumbs.fontSize}px
                    </Label>
                    <Slider
                      value={[ui.breadcrumbs.fontSize]}
                      onValueChange={([value]) =>
                        updateSetting("ui", "breadcrumbs", {
                          ...ui.breadcrumbs,
                          fontSize: value,
                        })
                      }
                      min={10}
                      max={16}
                      step={1}
                      className="w-full"
                    />
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
