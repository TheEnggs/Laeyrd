# VS Code Scopes & Settings Guide

This document provides a comprehensive reference for all the customizable scopes and settings available in Laeyrd. It is directly based on the extension's source configuration.

## IDE Layout Overview

To effectively customize your environment, it's crucial to know the correct terminology for each part of the interface.

![VS Code Interface Diagram](/home/rajeev/.gemini/antigravity/brain/300bf064-b957-4953-b9db-a6c4a7f264a4/vscode_interface_descriptive_1763710147339.png)

- **Activity Bar**: The narrow strip on the far left containing icons for Explorer, Search, Git, etc.
- **Side Bar**: The panel that appears next to the activity bar (e.g., the File Explorer tree).
- **Editor Group**: The main container for your open files.
- **Gutter**: The area to the left of the code containing line numbers and folding icons.
- **Status Bar**: The bottom strip showing branch name, cursor position, language, etc.
- **Title Bar**: The top window bar.
- **Panel**: The bottom area containing Terminal, Output, Debug Console.
- **Minimap**: The code overview on the right side of the editor.

---

## Color Scopes

These settings control the colors of the UI elements.

### Base
Core colors that affect the general appearance.

| Scope | Display Name | Description |
| :--- | :--- | :--- |
| `foreground` | Foreground | Default UI text color |
| `disabledForeground` | Disabled Text | Dimmed UI text color |
| `descriptionForeground` | Description Text | Supplementary text color |
| `errorForeground` | Error Text | Error messages text color |
| `icon.foreground` | Icon Color | Default icon color |
| `focusBorder` | Focus Border | Boundaries on focused elements |
| `contrastBorder` | Contrast Border | High contrast element border |
| `contrastActiveBorder` | Active Contrast Border | Active item high contrast |
| `widget.border` | Widget Border | Border around widgets |
| `widget.shadow` | Widget Shadow | Widget drop shadow |
| `selection.background` | Global Selection | Workbench selection background |
| `scrollbar.shadow` | Scrollbar Shadow | Shadow behind scrollbar |
| `scrollbarSlider.background` | Scrollbar Thumb | Thumb background |
| `scrollbarSlider.hoverBackground` | Scrollbar Hover | Thumb hover background |
| `scrollbarSlider.activeBackground` | Scrollbar Active | Thumb active background |
| `sash.hoverBorder` | Sash Hover Border | Resizer hover border |

### Editor
Colors specific to the code editing area.

| Scope | Display Name | Description |
| :--- | :--- | :--- |
| `editor.background` | Editor Background | Editor background color |
| `editor.foreground` | Editor Text | Default editor text color |
| `editorGroup.border` | Group Border Color | Editor group tab border color |
| `editorGroupHeader.tabsBackground` | Group Tabs Background Color | Editor group tabs background color |
| `editorGroupHeader.noTabsBackground` | Group Header Color | Editor group no tabs background color |
| `editorGroup.dropBackground` | Group Drop Color | Editor group drop background color |
| `editorLineNumber.foreground` | Line Numbers | Color of line numbers |
| `editorLineNumber.activeForeground` | Active Line Number | Current line number color |
| `editorCursor.foreground` | Cursor Color | Editor cursor color |
| `editor.selectionBackground` | Selection Background | Text selection background |
| `editor.selectionHighlightBackground` | Selection Highlight | Inactive selection highlight |
| `editor.findMatchBackground` | Find Match | Current search match highlight |
| `editor.findMatchHighlightBackground` | Find Highlights | Other search matches highlight |
| `editor.findRangeHighlightBackground` | Find Range | Search limit background |
| `editorBracketMatch.background` | Bracket Background | Bracket match background |
| `editorBracketMatch.border` | Bracket Border | Bracket match border |
| `editorIndentGuide.background` | Indent Guide | Inactive indent guides |
| `editorIndentGuide.activeBackground` | Active Indent Guide | Active indent guide color |
| `editor.ruler.foreground` | Ruler Line | Column ruler color |
| `editorOverviewRuler.border` | Overview Border | Overview ruler border |
| `editorOverviewRuler.findMatchForeground` | Overview Find Highlight | Find match in overview |
| `editorWidget.background` | Widget Background | Inline widget background |
| `editorWidget.border` | Widget Border | Inline widget border |
| `editorSuggestWidget.background` | Suggest Widget BG | Completion popup background |
| `editorSuggestWidget.foreground` | Suggest Widget Text | Completion popup text |
| `editorSuggestWidget.selectedBackground` | Suggest Highlight | Selected completion background |
| `editorHoverWidget.background` | Hover Tooltip BG | Hover tooltip background |
| `editorHoverWidget.border` | Hover Tooltip Border | Tooltip border color |
| `editorGutter.background` | Gutter Background | Gutter background color |
| `editorGutter.addedBackground` | Gutter Added | Added line marker background |
| `editorGutter.deletedBackground` | Gutter Deleted | Deleted line marker background |
| `editorGutter.modifiedBackground` | Gutter Modified | Modified line marker background |
| `diffEditor.insertedTextBackground` | Inserted Text BG | Inserted diff background |
| `diffEditor.removedTextBackground` | Removed Text BG | Removed diff background |
| `diffEditor.border` | Diff Editor Border | Border around diff editor |

### Workbench
Colors for the shell of the IDE (Sidebar, Activity Bar, Panels, etc.).

| Scope | Display Name | Description |
| :--- | :--- | :--- |
| `tab.activeBackground` | Active Tab BG | Background of active tab |
| `tab.activeForeground` | Active Tab Text | Text of active tab |
| `tab.inactiveBackground` | Inactive Tab BG | Background of inactive tabs |
| `tab.inactiveForeground` | Inactive Tab Text | Text of inactive tabs |
| `tab.border` | Tab Border | Border between tabs |
| `tab.hoverBackground` | Tab Hover BG | Background on tab hover |
| `tab.hoverForeground` | Tab Hover Text | Text on tab hover |
| `tab.activeModifiedBorder` | Active Modified Border | Modification indicator on active tab |
| `tab.inactiveModifiedBorder` | Inactive Modified Border | Modification indicator on inactive tab |
| `sideBar.background` | Sidebar Background | Background of sidebar |
| `sideBar.foreground` | Sidebar Text | Text of sidebar items |
| `sideBar.border` | Sidebar Border | Border around sidebar |
| `sideBarSectionHeader.background` | Sidebar Header BG | Section header background |
| `sideBarSectionHeader.foreground` | Sidebar Header Text | Section header text |
| `sideBarTitle.foreground` | Sidebar Title | Sidebar title text color |
| `activityBar.background` | Activity Bar BG | Background of activity bar |
| `activityBar.foreground` | Activity Text | Text in activity bar |
| `activityBar.border` | Activity Bar Border | Border of activity bar |
| `activityBarBadge.background` | Badge Background | Badge background color |
| `activityBarBadge.foreground` | Badge Text | Badge text color |
| `panel.background` | Panel Background | Background of panel |
| `panel.border` | Panel Border | Panel border color |
| `panelTitle.activeForeground` | Active Panel Title | Title text of active panel |
| `panelTitle.inactiveForeground` | Inactive Panel Title | Title text of inactive panel |
| `statusBar.background` | Status Bar BG | Background of status bar |
| `statusBar.foreground` | Status Bar Text | Text color in status bar |
| `statusBar.border` | Status Bar Border | Top border of status bar |
| `statusBar.debuggingBackground` | Debugging BG | Status bar during debugging |
| `statusBar.debuggingForeground` | Debugging Text | Text during debugging |
| `statusBar.debuggingBorder` | Debugging Border | Border during debugging |
| `titleBar.activeBackground` | Title Bar BG | Active window title bar background |
| `titleBar.activeForeground` | Title Bar Text | Active window title bar text |
| `titleBar.inactiveBackground` | Title Bar Inactive BG | Inactive window title bar background |
| `titleBar.inactiveForeground` | Title Bar Inactive Text | Inactive window title bar text |
| `titleBar.border` | Title Bar Border | Border of title bar |

### Terminal
Colors for the integrated terminal.

| Scope | Display Name | Description |
| :--- | :--- | :--- |
| `terminal.background` | Terminal Background | Terminal background color |
| `terminal.foreground` | Terminal Text | Terminal text color |
| `terminalCursor.foreground` | Terminal Cursor | Color of terminal cursor |
| `terminal.ansiBlack` | ANSI Black | ANSI black color |
| `terminal.ansiRed` | ANSI Red | ANSI red color |
| `terminal.ansiGreen` | ANSI Green | ANSI green color |
| `terminal.ansiYellow` | ANSI Yellow | ANSI yellow color |
| `terminal.ansiBlue` | ANSI Blue | ANSI blue color |
| `terminal.ansiMagenta` | ANSI Magenta | ANSI magenta color |
| `terminal.ansiCyan` | ANSI Cyan | ANSI cyan color |
| `terminal.ansiWhite` | ANSI White | ANSI white color |
| `terminal.ansiBrightBlack` | Bright ANSI Black | Bright ANSI black |
| `terminal.ansiBrightRed` | Bright ANSI Red | Bright ANSI red |
| `terminal.ansiBrightGreen` | Bright ANSI Green | Bright ANSI green |
| `terminal.ansiBrightYellow` | Bright ANSI Yellow | Bright ANSI yellow |
| `terminal.ansiBrightBlue` | Bright ANSI Blue | Bright ANSI blue |
| `terminal.ansiBrightMagenta` | Bright ANSI Magenta | Bright ANSI magenta |
| `terminal.ansiBrightCyan` | Bright ANSI Cyan | Bright ANSI cyan |
| `terminal.ansiBrightWhite` | Bright ANSI White | Bright ANSI white |

### UI & Layout
Controls and input elements.

| Scope | Display Name | Description |
| :--- | :--- | :--- |
| `button.background` | Button Background | Background of buttons |
| `button.foreground` | Button Text | Text on buttons |
| `button.hoverBackground` | Button Hover BG | Button background on hover |
| `dropdown.background` | Dropdown Background | Dropdowns background |
| `dropdown.border` | Dropdown Border | Border around dropdowns |
| `dropdown.foreground` | Dropdown Text | Dropdown text color |
| `input.background` | Input Background | Background of input fields |
| `input.border` | Input Border | Border of input fields |
| `input.foreground` | Input Text | Text in input fields |
| `input.placeholderForeground` | Placeholder Text | Placeholder input text color |
| `inputOption.activeBorder` | Option Active Border | Active option border |
| `inputValidation.errorBackground` | Error BG | Input error background |
| `inputValidation.errorBorder` | Error Border | Input error border |
| `badge.background` | Badge Background | Badge background color |
| `badge.foreground` | Badge Text | Text on badges |

---

## Token Colors

These settings control the syntax highlighting of your code.

| Token | Display Name | Description |
| :--- | :--- | :--- |
| `comment` | Comments | Color for code comments |
| `literal` | Literals | Color for string literals |
| `keyword` | Keywords | Color for keywords and control flow statements |
| `variable` | Variables | Color for variable names |
| `constant` | Constants | Color for constant variables |
| `parameter` | Parameters | Color for function parameters |
| `function` | Functions | Color for function and method names |
| `class` | Classes | Color for class names |
| `interface` | Interfaces | Color for interface names |
| `enum` | Enums | Color for enumerations |
| `type` | Types | Color for type annotations and type names |
| `number` | Numbers | Color for numeric literals |
| `macro` | Macros | Color for macros |
| `operator` | Operators | Color for operators |
| `punctuation` | Punctuation | Color for punctuation and delimiters |
| `property` | Properties | Color for object or class properties |
| `annotation` | Annotations | Color for decorators and annotations |
| `builtin` | Builtins | Color for built-in functions or objects |
| `namespace` | Namespace | Color for module or namespace names |
| `tag` | Tags | Color for HTML/XML tags |
| `attribute` | Attributes | Color for HTML/XML attributes |
| `escapesequence` | EscapeSequences | Color for escape characters within strings |
| `invalid` | Invalid | Color for invalid or erroneous code |

---

## Font & Layout Settings

Customize the typography and layout of the editor.

### Editor Font
| Setting | Display Name | Description | Default |
| :--- | :--- | :--- | :--- |
| `editor.fontFamily` | Font Family | Controls the font family used in the editor. | "default" |
| `editor.fontSize` | Font Size | Controls the font size in pixels. | 14 |
| `editor.fontLigatures` | Font Ligatures | Enable/disable font ligatures. | false |
| `editor.fontWeight` | Font Weight | Controls the font weight. | "normal" |
| `editor.fontVariations` | Font Variations | Controls whether font-variation-settings are enabled. | true |

### Editor Layout
| Setting | Display Name | Description | Default |
| :--- | :--- | :--- | :--- |
| `editor.lineHeight` | Line Height | Controls the line height. Use 0 for automatic. | 0 |
| `editor.letterSpacing` | Letter Spacing | Controls letter spacing in pixels. | 0 |
| `editor.lineNumbers` | Line Numbers | Controls the display of line numbers. | "on" |
| `editor.wordWrap` | Word Wrap | Controls how lines should wrap. | "off" |
| `editor.rulers` | Rulers | Render vertical rulers after a certain number of characters. | "" |
| `editor.glyphMargin` | Glyph Margin | Controls whether the glyph margin is shown. | true |
| `editor.stickyTabStops` | Sticky Tab Stops | Emulate selection behavior of tab characters when using spaces. | false |
| `editor.padding.top` | Editor Padding Top | Controls the top padding of the editor in pixels. | 0 |
| `editor.padding.bottom` | Editor Padding Bottom | Controls the bottom padding of the editor in pixels. | 0 |
| `editor.scrollBeyondLastLine` | Scroll Beyond Last Line | Controls whether the editor will scroll beyond the last line. | true |
| `editor.scrollBeyondLastColumn` | Scroll Beyond Last Column | Controls the number of extra characters beyond the last column. | 5 |
| `editor.wordWrapColumn` | Word Wrap Column | Controls the column at which to wrap lines. | 80 |

### Cursor
| Setting | Display Name | Description | Default |
| :--- | :--- | :--- | :--- |
| `editor.cursorStyle` | Cursor Style | Controls the style of the cursor. | "line" |
| `editor.cursorBlinking` | Cursor Blinking | Controls the cursor animation style. | "blink" |
| `editor.cursorSmoothCaretAnimation` | Smooth Caret Animation | Enables smooth cursor animation. | false |
| `editor.cursorWidth` | Cursor Width | Controls the width of the cursor when style is line. | 0 |
| `editor.multiCursorModifier` | Multi-Cursor Modifier | The modifier key for adding multiple cursors with the mouse. | "alt" |

### Highlighting & Guides
| Setting | Display Name | Description | Default |
| :--- | :--- | :--- | :--- |
| `editor.renderLineHighlight` | Render Line Highlight | Controls how the editor should highlight the current line. | "line" |
| `editor.renderLineHighlightOnlyWhenFocus` | Render Line Highlight Only When Focused | Controls visibility of line highlight based on focus. | false |
| `editor.guides` | Editor Guides | Controls the rendering of indentation and bracket guides. | "on" |
| `editor.selectionHighlight` | Selection Highlight | Controls whether the editor should highlight matches similar to the selection. | true |
| `editor.occurrencesHighlight` | Occurrences Highlight | Controls whether the editor should highlight semantic symbol occurrences. | true |
| `editor.semanticHighlighting.enabled` | Semantic Highlighting | Controls whether semantic highlighting is enabled. | "configuredByTheme" |
| `editor.highlightActiveIndentGuide` | Highlight Active Indent Guide | Controls whether to highlight the active indent guide. | true |
| `editor.guides.bracketPairs` | Bracket Pair Guides | Controls whether bracket pair guides are enabled. | true |
| `editor.guides.indentation` | Indentation Guides | Controls whether indentation guides are enabled. | true |
| `editor.guides.highlightActiveIndentation` | Highlight Active Indentation | Controls whether the active indentation guide is highlighted. | true |
| `editor.renderIndentGuides` | Render Indent Guides | Controls whether the editor should render indent guides (legacy). | true |

### Minimap
| Setting | Display Name | Description | Default |
| :--- | :--- | :--- | :--- |
| `editor.minimap.enabled` | Minimap Enabled | Controls whether the minimap is shown. | true |
| `editor.minimap.side` | Minimap Side | Controls the side where to render the minimap. | "right" |
| `editor.minimap.size` | Minimap Size | Controls the size of the minimap. | "proportional" |
| `editor.minimap.showSlider` | Minimap Slider | Controls whether the minimap slider is shown. | "mouseover" |
| `editor.minimap.renderCharacters` | Render Characters in Minimap | Render the actual characters on the minimap. | true |
| `editor.minimap.scale` | Minimap Scale | Controls the scaling of the minimap. | 1 |
| `editor.overviewRulerLanes` | Overview Ruler Lanes | Number of lanes for overview ruler. | 3 |
| `editor.overviewRulerBorder` | Overview Ruler Border | Controls whether a border is drawn around the overview ruler. | true |

### Scrollbar
| Setting | Display Name | Description | Default |
| :--- | :--- | :--- | :--- |
| `editor.scrollbar.vertical` | Vertical Scrollbar | Controls the visibility of the vertical scrollbar. | "auto" |
| `editor.scrollbar.horizontal` | Horizontal Scrollbar | Controls the visibility of the horizontal scrollbar. | "auto" |
| `editor.scrollbar.verticalScrollbarSize` | Vertical Scrollbar Size | Controls the width of the vertical scrollbar in pixels. | 14 |
| `editor.scrollbar.horizontalScrollbarSize` | Horizontal Scrollbar Size | Controls the height of the horizontal scrollbar in pixels. | 14 |
| `editor.scrollbar.scrollByPage` | Scroll By Page | Controls whether clicking in the scrollbar scrolls by page. | false |
| `editor.smoothScrolling` | Smooth Scrolling | Controls whether the editor animates scrolling. | false |

### Workbench UI
| Setting | Display Name | Description | Default |
| :--- | :--- | :--- | :--- |
| `workbench.activityBar.visible` | Show Activity Bar | Toggle activity bar visibility | true |
| `workbench.activityBar.iconSize` | Activity Bar Icon Size | Size of activity bar icons | 16 |
| `workbench.statusBar.visible` | Show Status Bar | Toggle status bar visibility | true |
| `workbench.statusBar.fontSize` | Status Bar Font Size | Font size of status bar | 12 |
| `workbench.sideBar.location` | Sidebar Location | Position of sidebar panel | "left" |
| `workbench.sideBar.visible` | Show Sidebar | Toggle sidebar visibility | true |
| `workbench.editor.showTabs` | Show Editor Tabs | Toggle editor tabs visibility | true |
| `workbench.editor.tabSizing` | Editor Tab Sizing | Sizing mode for editor tabs | "fit" |
| `workbench.panel.visible` | Show Panel | Toggle panel visibility | true |
| `workbench.panel.defaultLocation` | Panel Location | Default panel position | "bottom" |
| `window.zoomLevel` | Window Zoom Level | Adjust global window zoom level. | 0 |
| `window.titleBarStyle` | Title Bar Style | Customize native or custom title bar style. | "native" |
| `breadcrumbs.enabled` | Breadcrumbs | Show file path breadcrumbs above editor. | true |
| `explorer.compactFolders` | Compact Folders | Compact multi-folder names in Explorer. | true |
| `workbench.editor.highlightModifiedTabs` | Highlight Modified Tabs | Highlight tabs with unsaved changes. | true |
| `workbench.editor.labelFormat` | Tab Label Format | Control how editor tabs' labels are shown. | "default" |
| `workbench.editor.wrapTabs` | Wrap Tabs | Wrap editor tabs to multiple rows when space is limited. | false |
| `workbench.editor.openPositioning` | Open Tab Positioning | Control where new tabs open. | "right" |
