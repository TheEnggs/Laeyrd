"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformColorsToColorTabs = transformColorsToColorTabs;
const colorCategoryMap = {
    // BASE TAB - Core Colors (first category in base tab)
    focusBorder: {
        category: "Core Colors",
        displayName: "Focus Border",
        description: "Overall border color for focused elements",
    },
    foreground: {
        category: "Core Colors",
        displayName: "Foreground",
        description: "Overall foreground color",
    },
    disabledForeground: {
        category: "Core Colors",
        displayName: "Disabled Foreground",
        description: "Overall foreground for disabled elements",
    },
    errorForeground: {
        category: "Core Colors",
        displayName: "Error Foreground",
        description: "Overall foreground color for error messages",
    },
    descriptionForeground: {
        category: "Core Colors",
        displayName: "Description Foreground",
        description: "Foreground color for description text",
    },
    "icon.foreground": {
        category: "Core Colors",
        displayName: "Icon Foreground",
        description: "Default color for icons in the workbench",
    },
    // BASE TAB - Widgets (second category in base tab)
    "widget.border": {
        category: "Widgets",
        displayName: "Widget Border",
        description: "Border color of widgets such as Find/Replace",
    },
    "widget.shadow": {
        category: "Widgets",
        displayName: "Widget Shadow",
        description: "Shadow color of widgets such as Find/Replace",
    },
    "selection.background": {
        category: "Widgets",
        displayName: "Selection Background",
        description: "Background color of text selections in the workbench",
    },
    "sash.hoverBorder": {
        category: "Widgets",
        displayName: "Sash Hover Border",
        description: "Hover border color for draggable sashes",
    },
    "badge.background": {
        category: "Widgets",
        displayName: "Badge Background",
        description: "Badge background color",
    },
    "badge.foreground": {
        category: "Widgets",
        displayName: "Badge Foreground",
        description: "Badge foreground color",
    },
    "breadcrumb.background": {
        category: "Widgets",
        displayName: "Breadcrumb Background",
        description: "Background color of breadcrumb items",
    },
    "breadcrumb.foreground": {
        category: "Widgets",
        displayName: "Breadcrumb Foreground",
        description: "Foreground color of breadcrumb items",
    },
    "breadcrumb.activeSelectionForeground": {
        category: "Widgets",
        displayName: "Breadcrumb Active Selection Foreground",
        description: "Foreground color of the selected breadcrumb item",
    },
    "breadcrumbPicker.background": {
        category: "Widgets",
        displayName: "Breadcrumb Picker Background",
        description: "Background color of the breadcrumb picker",
    },
    "tree.indentGuidesStroke": {
        category: "Widgets",
        displayName: "Tree Indent Guides Stroke",
        description: "Color of the tree indent guides",
    },
    "walkThrough.embeddedEditorBackground": {
        category: "Widgets",
        displayName: "Walkthrough Embedded Editor Background",
        description: "Background color of embedded editors in walkthrough",
    },
    // BASE TAB - Contrast Colors (third category in base tab)
    contrastActiveBorder: {
        category: "Contrast Colors",
        displayName: "Contrast Active Border",
        description: "An extra border around active elements for greater contrast",
    },
    contrastBorder: {
        category: "Contrast Colors",
        displayName: "Contrast Border",
        description: "An extra border around elements for greater contrast",
    },
    // EDITOR TAB - Editor Core (first category in editor tab)
    "editor.background": {
        category: "Editor Core",
        displayName: "Editor Background",
        description: "Editor background color",
    },
    "editor.foreground": {
        category: "Editor Core",
        displayName: "Editor Foreground",
        description: "Editor default foreground color",
    },
    "editor.lineHighlightBackground": {
        category: "Editor Core",
        displayName: "Line Highlight Background",
        description: "Background color of the current line highlight",
    },
    "editor.lineHighlightBorder": {
        category: "Editor Core",
        displayName: "Line Highlight Border",
        description: "Background color of the border around the current line highlight",
    },
    "editor.selectionBackground": {
        category: "Editor Core",
        displayName: "Selection Background",
        description: "Color of the editor selection",
    },
    "editor.selectionHighlightBackground": {
        category: "Editor Core",
        displayName: "Selection Highlight Background",
        description: "Color of the selection in an inactive editor",
    },
    "editor.wordHighlightBackground": {
        category: "Editor Core",
        displayName: "Word Highlight Background",
        description: "Background color of a symbol during read-access",
    },
    "editor.wordHighlightStrongBackground": {
        category: "Editor Core",
        displayName: "Word Highlight Strong Background",
        description: "Background color of a symbol during write-access",
    },
    "editorCursor.foreground": {
        category: "Editor Core",
        displayName: "Cursor Foreground",
        description: "Color of the editor cursor",
    },
    "editorLineNumber.foreground": {
        category: "Editor Core",
        displayName: "Line Number Foreground",
        description: "Color of editor line numbers",
    },
    "editorLineNumber.activeForeground": {
        category: "Editor Core",
        displayName: "Active Line Number Foreground",
        description: "Color of the active editor line number",
    },
    "editorWhitespace.foreground": {
        category: "Editor Core",
        displayName: "Whitespace Foreground",
        description: "Color of whitespace characters in the editor",
    },
    "editorIndentGuide.background": {
        category: "Editor Core",
        displayName: "Indent Guide Background",
        description: "Color of the editor indentation guides",
    },
    "editorIndentGuide.activeBackground": {
        category: "Editor Core",
        displayName: "Active Indent Guide Background",
        description: "Color of the active editor indentation guide",
    },
    "editorBracketMatch.background": {
        category: "Editor Core",
        displayName: "Bracket Match Background",
        description: "Background color of matching brackets",
    },
    "editorBracketMatch.border": {
        category: "Editor Core",
        displayName: "Bracket Match Border",
        description: "Border color of matching brackets",
    },
    "editorCodeLens.foreground": {
        category: "Editor Core",
        displayName: "Code Lens Foreground",
        description: "Foreground color of code lens",
    },
    "editor.snippetFinalTabstopHighlightBorder": {
        category: "Editor Core",
        displayName: "Snippet Final Tabstop Highlight Border",
        description: "Border color of the final tabstop in a snippet",
    },
    "editor.snippetTabstopHighlightBackground": {
        category: "Editor Core",
        displayName: "Snippet Tabstop Highlight Background",
        description: "Background color of a tabstop in a snippet",
    },
    "editor.rangeHighlightBackground": {
        category: "Editor Core",
        displayName: "Range Highlight Background",
        description: "Background color of the range highlighted by the cursor",
    },
    "editor.inactiveSelectionBackground": {
        category: "Editor Core",
        displayName: "Inactive Selection Background",
        description: "Background color of the selection in an inactive editor",
    },
    // EDITOR TAB - Editor Borders (second category in editor tab)
    "editor.findMatchBackground": {
        category: "Editor Borders",
        displayName: "Find Match Background",
        description: "Color of the current search match",
    },
    "editor.findMatchHighlightBackground": {
        category: "Editor Borders",
        displayName: "Find Match Highlight Background",
        description: "Color of the other search matches",
    },
    "editor.findRangeHighlightBackground": {
        category: "Editor Borders",
        displayName: "Find Range Highlight Background",
        description: "Color the range limiting the search",
    },
    "editor.hoverHighlightBackground": {
        category: "Editor Borders",
        displayName: "Hover Highlight Background",
        description: "Highlight below the word for which a hover is shown",
    },
    "editorHoverWidget.background": {
        category: "Editor Borders",
        displayName: "Hover Widget Background",
        description: "Background color of the editor hover",
    },
    "editorHoverWidget.border": {
        category: "Editor Borders",
        displayName: "Hover Widget Border",
        description: "Border color of the editor hover",
    },
    // EDITOR TAB - Editor Widgets (third category in editor tab)
    "editorWidget.background": {
        category: "Editor Widgets",
        displayName: "Editor Widget Background",
        description: "Background color of editor widgets",
    },
    "editorWidget.border": {
        category: "Editor Widgets",
        displayName: "Editor Widget Border",
        description: "Border color of editor widgets",
    },
    "editorWidget.resizeBorder": {
        category: "Editor Widgets",
        displayName: "Editor Widget Resize Border",
        description: "Border color of editor widget resize handle",
    },
    // WORKBENCH TAB - Activity Bar (first category in workbench tab)
    "activityBar.background": {
        category: "Activity Bar",
        displayName: "Activity Bar Background",
        description: "Activity bar background color",
    },
    "activityBar.foreground": {
        category: "Activity Bar",
        displayName: "Activity Bar Foreground",
        description: "Activity bar item foreground color when active",
    },
    "activityBar.inactiveForeground": {
        category: "Activity Bar",
        displayName: "Activity Bar Inactive Foreground",
        description: "Activity bar item foreground color when inactive",
    },
    "activityBar.border": {
        category: "Activity Bar",
        displayName: "Activity Bar Border",
        description: "Activity bar border color with the side bar",
    },
    "activityBar.activeBorder": {
        category: "Activity Bar",
        displayName: "Activity Bar Active Border",
        description: "Activity bar border color for the active item",
    },
    "activityBarBadge.background": {
        category: "Activity Bar",
        displayName: "Activity Bar Badge Background",
        description: "Activity notification badge background color",
    },
    "activityBarBadge.foreground": {
        category: "Activity Bar",
        displayName: "Activity Bar Badge Foreground",
        description: "Activity notification badge foreground color",
    },
    // WORKBENCH TAB - Side Bar (second category in workbench tab)
    "sideBar.background": {
        category: "Side Bar",
        displayName: "Side Bar Background",
        description: "Side bar background color",
    },
    "sideBar.foreground": {
        category: "Side Bar",
        displayName: "Side Bar Foreground",
        description: "Side bar foreground color",
    },
    "sideBar.border": {
        category: "Side Bar",
        displayName: "Side Bar Border",
        description: "Side bar border color on the side separating the editor",
    },
    "sideBarTitle.foreground": {
        category: "Side Bar",
        displayName: "Side Bar Title Foreground",
        description: "Side bar title foreground color",
    },
    "sideBarSectionHeader.background": {
        category: "Side Bar",
        displayName: "Side Bar Section Header Background",
        description: "Side bar section header background color",
    },
    "sideBarSectionHeader.foreground": {
        category: "Side Bar",
        displayName: "Side Bar Section Header Foreground",
        description: "Side bar section header foreground color",
    },
    // WORKBENCH TAB - Status Bar (third category in workbench tab)
    "statusBar.background": {
        category: "Status Bar",
        displayName: "Status Bar Background",
        description: "Standard status bar background color",
    },
    "statusBar.foreground": {
        category: "Status Bar",
        displayName: "Status Bar Foreground",
        description: "Status bar foreground color",
    },
    "statusBar.border": {
        category: "Status Bar",
        displayName: "Status Bar Border",
        description: "Status bar border color",
    },
    "statusBar.debuggingBackground": {
        category: "Status Bar",
        displayName: "Status Bar Debugging Background",
        description: "Status bar background color when a program is being debugged",
    },
    "statusBar.debuggingForeground": {
        category: "Status Bar",
        displayName: "Status Bar Debugging Foreground",
        description: "Status bar foreground color when a program is being debugged",
    },
    "statusBar.debuggingBorder": {
        category: "Status Bar",
        displayName: "Status Bar Debugging Border",
        description: "Status bar border color when a program is being debugged",
    },
    // WORKBENCH TAB - Title Bar (fourth category in workbench tab)
    "titleBar.activeBackground": {
        category: "Title Bar",
        displayName: "Title Bar Active Background",
        description: "Title bar background when the window is active",
    },
    "titleBar.activeForeground": {
        category: "Title Bar",
        displayName: "Title Bar Active Foreground",
        description: "Title bar foreground when the window is active",
    },
    "titleBar.inactiveBackground": {
        category: "Title Bar",
        displayName: "Title Bar Inactive Background",
        description: "Title bar background when the window is inactive",
    },
    "titleBar.inactiveForeground": {
        category: "Title Bar",
        displayName: "Title Bar Inactive Foreground",
        description: "Title bar foreground when the window is inactive",
    },
    "titleBar.border": {
        category: "Title Bar",
        displayName: "Title Bar Border",
        description: "Title bar border color",
    },
    // WINDOW TAB - Window Border (first category in window tab)
    "window.activeBorder": {
        category: "Window Border",
        displayName: "Active Window Border",
        description: "Border color for the active (focused) window",
    },
    "window.inactiveBorder": {
        category: "Window Border",
        displayName: "Inactive Window Border",
        description: "Border color for the inactive (unfocused) windows",
    },
    // TOKENS TAB - Comments (first category in tokens tab)
    "editorComment.foreground": {
        category: "Comments",
        displayName: "Comment",
        description: "Color for comments in code",
    },
    "editorComment.rangeForeground": {
        category: "Comments",
        displayName: "Comment Range",
        description: "Color for comment ranges in code",
    },
    "editorComment.unusedForeground": {
        category: "Comments",
        displayName: "Unused Comment",
        description: "Color for unused comments in code",
    },
    // TOKENS TAB - Strings (second category in tokens tab)
    "editorString.foreground": {
        category: "Strings",
        displayName: "String",
        description: "Color for string literals",
    },
    "editorString.escapeForeground": {
        category: "Strings",
        displayName: "String Escape",
        description: "Color for escape sequences in strings",
    },
    "editorString.quotedForeground": {
        category: "Strings",
        displayName: "Quoted String",
        description: "Color for quoted strings",
    },
    // TOKENS TAB - Keywords (third category in tokens tab)
    "editorKeyword.foreground": {
        category: "Keywords",
        displayName: "Keyword",
        description: "Color for language keywords",
    },
    "editorKeyword.controlForeground": {
        category: "Keywords",
        displayName: "Control Keyword",
        description: "Color for control flow keywords",
    },
    "editorKeyword.operatorForeground": {
        category: "Keywords",
        displayName: "Operator",
        description: "Color for operators",
    },
    // TOKENS TAB - Types (fourth category in tokens tab)
    "editorType.foreground": {
        category: "Types",
        displayName: "Type",
        description: "Color for type annotations",
    },
    "editorType.parameterForeground": {
        category: "Types",
        displayName: "Type Parameter",
        description: "Color for type parameters",
    },
    "editorType.primitiveForeground": {
        category: "Types",
        displayName: "Primitive Type",
        description: "Color for primitive types",
    },
    // TOKENS TAB - Functions (fifth category in tokens tab)
    "editorFunction.foreground": {
        category: "Functions",
        displayName: "Function",
        description: "Color for function names",
    },
    "editorFunction.declarationForeground": {
        category: "Functions",
        displayName: "Function Declaration",
        description: "Color for function declarations",
    },
    "editorFunction.variableForeground": {
        category: "Functions",
        displayName: "Function Variable",
        description: "Color for function variables",
    },
    // TOKENS TAB - Variables (sixth category in tokens tab)
    "editorVariable.foreground": {
        category: "Variables",
        displayName: "Variable",
        description: "Color for variables",
    },
    "editorVariable.readonlyForeground": {
        category: "Variables",
        displayName: "Readonly Variable",
        description: "Color for readonly variables",
    },
    "editorVariable.parameterForeground": {
        category: "Variables",
        displayName: "Parameter",
        description: "Color for function parameters",
    },
    // TOKENS TAB - Constants (seventh category in tokens tab)
    "editorConstant.foreground": {
        category: "Constants",
        displayName: "Constant",
        description: "Color for constants",
    },
    "editorConstant.numericForeground": {
        category: "Constants",
        displayName: "Numeric Constant",
        description: "Color for numeric constants",
    },
    "editorConstant.characterForeground": {
        category: "Constants",
        displayName: "Character Constant",
        description: "Color for character constants",
    },
    // TOKENS TAB - Classes (eighth category in tokens tab)
    "editorClass.foreground": {
        category: "Classes",
        displayName: "Class",
        description: "Color for class names",
    },
    "editorClass.declarationForeground": {
        category: "Classes",
        displayName: "Class Declaration",
        description: "Color for class declarations",
    },
    "editorClass.interfaceForeground": {
        category: "Classes",
        displayName: "Interface",
        description: "Color for interfaces",
    },
    // TOKENS TAB - Properties (ninth category in tokens tab)
    "editorProperty.foreground": {
        category: "Properties",
        displayName: "Property",
        description: "Color for object properties",
    },
    "editorProperty.readonlyForeground": {
        category: "Properties",
        displayName: "Readonly Property",
        description: "Color for readonly properties",
    },
    // TOKENS TAB - Enums (tenth category in tokens tab)
    "editorEnum.foreground": {
        category: "Enums",
        displayName: "Enum",
        description: "Color for enums",
    },
    "editorEnumMember.foreground": {
        category: "Enums",
        displayName: "Enum Member",
        description: "Color for enum members",
    },
    // TOKENS TAB - Decorators (eleventh category in tokens tab)
    "editorDecorator.foreground": {
        category: "Decorators",
        displayName: "Decorator",
        description: "Color for decorators",
    },
    // TOKENS TAB - Tags (twelfth category in tokens tab)
    "editorTag.foreground": {
        category: "Tags",
        displayName: "Tag",
        description: "Color for HTML/XML tags",
    },
    "editorTag.attributeForeground": {
        category: "Tags",
        displayName: "Tag Attribute",
        description: "Color for tag attributes",
    },
    // TOKENS TAB - Punctuation (thirteenth category in tokens tab)
    "editorPunctuation.definitionForeground": {
        category: "Punctuation",
        displayName: "Definition Punctuation",
        description: "Color for definition punctuation",
    },
    "editorPunctuation.sectionForeground": {
        category: "Punctuation",
        displayName: "Section Punctuation",
        description: "Color for section punctuation",
    },
    "editorPunctuation.terminatorForeground": {
        category: "Punctuation",
        displayName: "Terminator Punctuation",
        description: "Color for terminator punctuation",
    },
    // TOKENS TAB - Meta (fourteenth category in tokens tab)
    "editorMeta.foreground": {
        category: "Meta",
        displayName: "Meta",
        description: "Color for meta elements",
    },
    "editorMeta.preprocessorForeground": {
        category: "Meta",
        displayName: "Preprocessor",
        description: "Color for preprocessor directives",
    },
    // TOKENS TAB - Support (fifteenth category in tokens tab)
    "editorSupport.foreground": {
        category: "Support",
        displayName: "Support",
        description: "Color for support elements",
    },
    "editorSupport.classForeground": {
        category: "Support",
        displayName: "Support Class",
        description: "Color for support classes",
    },
    "editorSupport.functionForeground": {
        category: "Support",
        displayName: "Support Function",
        description: "Color for support functions",
    },
    // TOKENS TAB - Entities (sixteenth category in tokens tab)
    "editorEntity.foreground": {
        category: "Entities",
        displayName: "Entity",
        description: "Color for entities",
    },
    "editorEntity.nameForeground": {
        category: "Entities",
        displayName: "Entity Name",
        description: "Color for entity names",
    },
    "editorEntity.nameFunctionForeground": {
        category: "Entities",
        displayName: "Entity Name Function",
        description: "Color for entity name functions",
    },
    "editorEntity.nameTypeForeground": {
        category: "Entities",
        displayName: "Entity Name Type",
        description: "Color for entity name types",
    },
    // TEXT TAB - Text Elements (first category in text tab)
    "textBlockQuote.background": {
        category: "Text Elements",
        displayName: "Block Quote Background",
        description: "Background color for block quotes in text",
    },
    "textBlockQuote.border": {
        category: "Text Elements",
        displayName: "Block Quote Border",
        description: "Border color for block quotes in text",
    },
    "textCodeBlock.background": {
        category: "Text Elements",
        displayName: "Code Block Background",
        description: "Background color for code blocks in text",
    },
    "textLink.activeForeground": {
        category: "Text Elements",
        displayName: "Active Link Foreground",
        description: "Foreground color for links when clicked and on hover",
    },
    "textLink.foreground": {
        category: "Text Elements",
        displayName: "Link Foreground",
        description: "Foreground color for links in text",
    },
    "textPreformat.foreground": {
        category: "Text Elements",
        displayName: "Preformat Foreground",
        description: "Foreground color for preformatted text segments",
    },
    "textPreformat.background": {
        category: "Text Elements",
        displayName: "Preformat Background",
        description: "Background color for preformatted text segments",
    },
    "textSeparator.foreground": {
        category: "Text Elements",
        displayName: "Text Separator",
        description: "Color for text separators",
    },
    // ACTIONS TAB - Action Colors (first category in actions tab)
    "toolbar.hoverBackground": {
        category: "Action Colors",
        displayName: "Toolbar Hover Background",
        description: "Toolbar background when hovering over actions",
    },
    "toolbar.hoverOutline": {
        category: "Action Colors",
        displayName: "Toolbar Hover Outline",
        description: "Toolbar outline when hovering over actions",
    },
    "toolbar.activeBackground": {
        category: "Action Colors",
        displayName: "Toolbar Active Background",
        description: "Toolbar background when holding the mouse over actions",
    },
    "editorActionList.background": {
        category: "Action Colors",
        displayName: "Action List Background",
        description: "Action List background color",
    },
    "editorActionList.foreground": {
        category: "Action Colors",
        displayName: "Action List Foreground",
        description: "Action List foreground color",
    },
    "editorActionList.focusForeground": {
        category: "Action Colors",
        displayName: "Action List Focus Foreground",
        description: "Action List foreground color for the focused item",
    },
    "editorActionList.focusBackground": {
        category: "Action Colors",
        displayName: "Action List Focus Background",
        description: "Action List background color for the focused item",
    },
    // BUTTONS TAB - Button Controls (first category in buttons tab)
    "button.background": {
        category: "Button Controls",
        displayName: "Button Background",
        description: "Button background color",
    },
    "button.foreground": {
        category: "Button Controls",
        displayName: "Button Foreground",
        description: "Button foreground color",
    },
    "button.border": {
        category: "Button Controls",
        displayName: "Button Border",
        description: "Button border color",
    },
    "button.separator": {
        category: "Button Controls",
        displayName: "Button Separator",
        description: "Button separator color",
    },
    "button.hoverBackground": {
        category: "Button Controls",
        displayName: "Button Hover Background",
        description: "Button background color when hovering",
    },
    "button.secondaryForeground": {
        category: "Button Controls",
        displayName: "Secondary Button Foreground",
        description: "Secondary button foreground color",
    },
    "button.secondaryBackground": {
        category: "Button Controls",
        displayName: "Secondary Button Background",
        description: "Secondary button background color",
    },
    "button.secondaryHoverBackground": {
        category: "Button Controls",
        displayName: "Secondary Button Hover Background",
        description: "Secondary button background color when hovering",
    },
    // BUTTONS TAB - Checkbox & Radio (second category in buttons tab)
    "checkbox.background": {
        category: "Checkbox & Radio",
        displayName: "Checkbox Background",
        description: "Background color of checkbox widget",
    },
    "checkbox.foreground": {
        category: "Checkbox & Radio",
        displayName: "Checkbox Foreground",
        description: "Foreground color of checkbox widget",
    },
    "checkbox.disabled.background": {
        category: "Checkbox & Radio",
        displayName: "Disabled Checkbox Background",
        description: "Background of a disabled checkbox",
    },
    "checkbox.disabled.foreground": {
        category: "Checkbox & Radio",
        displayName: "Disabled Checkbox Foreground",
        description: "Foreground of a disabled checkbox",
    },
    "checkbox.border": {
        category: "Checkbox & Radio",
        displayName: "Checkbox Border",
        description: "Border color of checkbox widget",
    },
    "checkbox.selectBackground": {
        category: "Checkbox & Radio",
        displayName: "Selected Checkbox Background",
        description: "Background color of checkbox when selected",
    },
    "checkbox.selectBorder": {
        category: "Checkbox & Radio",
        displayName: "Selected Checkbox Border",
        description: "Border color of checkbox when selected",
    },
    "radio.activeForeground": {
        category: "Checkbox & Radio",
        displayName: "Active Radio Foreground",
        description: "Foreground color of active radio option",
    },
    "radio.activeBackground": {
        category: "Checkbox & Radio",
        displayName: "Active Radio Background",
        description: "Background color of active radio option",
    },
    "radio.border": {
        category: "Checkbox & Radio",
        displayName: "Radio Border",
        description: "Border color of radio widget",
    },
    // TERMINAL TAB - Terminal Colors (first category in terminal tab) - Only basic colors from theme-colors.ts
    "terminal.background": {
        category: "Terminal Colors",
        displayName: "Terminal Background",
        description: "Terminal background color",
    },
    "terminal.foreground": {
        category: "Terminal Colors",
        displayName: "Terminal Foreground",
        description: "Terminal foreground color",
    },
    "terminal.ansiBlack": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Black",
        description: "Terminal ANSI black color",
    },
    "terminal.ansiRed": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Red",
        description: "Terminal ANSI red color",
    },
    "terminal.ansiGreen": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Green",
        description: "Terminal ANSI green color",
    },
    "terminal.ansiYellow": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Yellow",
        description: "Terminal ANSI yellow color",
    },
    "terminal.ansiBlue": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Blue",
        description: "Terminal ANSI blue color",
    },
    "terminal.ansiMagenta": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Magenta",
        description: "Terminal ANSI magenta color",
    },
    "terminal.ansiCyan": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Cyan",
        description: "Terminal ANSI cyan color",
    },
    "terminal.ansiWhite": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI White",
        description: "Terminal ANSI white color",
    },
    // Additional colors that might not be in theme-colors.ts but are in color-category-map.ts
    "terminal.ansiBrightBlack": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Bright Black",
        description: "Terminal ANSI bright black color",
    },
    "terminal.ansiBrightRed": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Bright Red",
        description: "Terminal ANSI bright red color",
    },
    "terminal.ansiBrightGreen": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Bright Green",
        description: "Terminal ANSI bright green color",
    },
    "terminal.ansiBrightYellow": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Bright Yellow",
        description: "Terminal ANSI bright yellow color",
    },
    "terminal.ansiBrightBlue": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Bright Blue",
        description: "Terminal ANSI bright blue color",
    },
    "terminal.ansiBrightMagenta": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Bright Magenta",
        description: "Terminal ANSI bright magenta color",
    },
    "terminal.ansiBrightCyan": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Bright Cyan",
        description: "Terminal ANSI bright cyan color",
    },
    "terminal.ansiBrightWhite": {
        category: "Terminal Colors",
        displayName: "Terminal ANSI Bright White",
        description: "Terminal ANSI bright white color",
    },
    "terminal.selectionBackground": {
        category: "Terminal Colors",
        displayName: "Terminal Selection Background",
        description: "Terminal selection background color",
    },
    "terminalCursor.background": {
        category: "Terminal Colors",
        displayName: "Terminal Cursor Background",
        description: "Terminal cursor background color",
    },
    "terminalCursor.foreground": {
        category: "Terminal Colors",
        displayName: "Terminal Cursor Foreground",
        description: "Terminal cursor foreground color",
    },
    // Additional colors for dropdowns
    "dropdown.background": {
        category: "Widgets",
        displayName: "Dropdown Background",
        description: "Dropdown background color",
    },
    "dropdown.border": {
        category: "Widgets",
        displayName: "Dropdown Border",
        description: "Dropdown border color",
    },
    "dropdown.foreground": {
        category: "Widgets",
        displayName: "Dropdown Foreground",
        description: "Dropdown foreground color",
    },
    // Additional colors for debug
    "debugExceptionWidget.background": {
        category: "Widgets",
        displayName: "Debug Exception Widget Background",
        description: "Background color of the debug exception widget",
    },
    "debugExceptionWidget.border": {
        category: "Widgets",
        displayName: "Debug Exception Widget Border",
        description: "Border color of the debug exception widget",
    },
    "debugToolBar.background": {
        category: "Widgets",
        displayName: "Debug Toolbar Background",
        description: "Background color of the debug toolbar",
    },
    // Additional colors for diff editor
    "diffEditor.insertedTextBackground": {
        category: "Editor Widgets",
        displayName: "Inserted Text Background",
        description: "Background color for inserted text in the diff editor",
    },
    "diffEditor.removedTextBackground": {
        category: "Editor Widgets",
        displayName: "Removed Text Background",
        description: "Background color for removed text in the diff editor",
    },
};
exports.default = colorCategoryMap;
// Utility function to transform flat colors into hierarchical ColorTab structure
function transformColorsToColorTabs(groupedColors) {
    // Validate input
    if (!groupedColors || typeof groupedColors !== "object") {
        console.warn("Invalid groupedColors provided to transformColorsToColorTabs:", groupedColors);
        return [];
    }
    // Flatten the grouped colors into a single Record<string, string>
    const colors = {};
    Object.entries(groupedColors).forEach(([category, categoryColors]) => {
        if (!categoryColors || typeof categoryColors !== "object") {
            console.warn("Invalid categoryColors for category:", category, categoryColors);
            return;
        }
        Object.entries(categoryColors).forEach(([key, value]) => {
            if (typeof key === "string" && typeof value === "string") {
                colors[`${category}.${key}`] = value;
            }
        });
    });
    // Define the tab structure mapping
    const tabStructure = {
        base: {
            name: "Base Colors",
            icon: "Palette",
            categoryMapping: {
                "Core Colors": "Core Colors",
                Widgets: "Widgets",
                "Contrast Colors": "Contrast Colors",
                "Unmapped Colors": "Unmapped Colors",
            },
        },
        editor: {
            name: "Editor",
            icon: "FileText",
            categoryMapping: {
                "Editor Core": "Editor Core",
                "Editor Borders": "Editor Borders",
                "Editor Widgets": "Editor Widgets",
            },
        },
        workbench: {
            name: "Workbench",
            icon: "Layout",
            categoryMapping: {
                "Activity Bar": "Activity Bar",
                "Side Bar": "Side Bar",
                "Status Bar": "Status Bar",
                "Title Bar": "Title Bar",
            },
        },
        window: {
            name: "Window",
            icon: "Monitor",
            categoryMapping: {
                "Window Border": "Window Border",
            },
        },
        tokens: {
            name: "Token Colors",
            icon: "Type",
            categoryMapping: {
                Comments: "Comments",
                Strings: "Strings",
                Keywords: "Keywords",
                Types: "Types",
                Functions: "Functions",
                Variables: "Variables",
                Constants: "Constants",
                Classes: "Classes",
                Properties: "Properties",
                Enums: "Enums",
                Decorators: "Decorators",
                Tags: "Tags",
                Punctuation: "Punctuation",
                Meta: "Meta",
                Support: "Support",
                Entities: "Entities",
            },
        },
        text: {
            name: "Text",
            icon: "Type",
            categoryMapping: {
                "Text Elements": "Text Elements",
            },
        },
        actions: {
            name: "Actions",
            icon: "Zap",
            categoryMapping: {
                "Action Colors": "Action Colors",
            },
        },
        buttons: {
            name: "Buttons",
            icon: "MousePointer",
            categoryMapping: {
                "Button Controls": "Button Controls",
                "Checkbox & Radio": "Checkbox & Radio",
            },
        },
        terminal: {
            name: "Terminal",
            icon: "Terminal",
            categoryMapping: {
                "Terminal Colors": "Terminal Colors",
            },
        },
    };
    // Group colors by their tab and category
    const tabGroups = {};
    Object.entries(colors).forEach(([colorKey, colorValue]) => {
        try {
            // Validate inputs
            if (!colorKey ||
                typeof colorKey !== "string" ||
                !colorValue ||
                typeof colorValue !== "string") {
                console.warn("Invalid color entry:", { colorKey, colorValue });
                return;
            }
            const colorInfo = colorCategoryMap[colorKey];
            if (!colorInfo || typeof colorInfo !== "object") {
                // For unmapped colors, create a fallback entry
                console.debug("Color not found in map, using fallback:", colorKey);
                const fallbackColorInfo = {
                    category: "Unmapped Colors",
                    displayName: colorKey
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase()),
                    description: `Color setting: ${colorKey}`,
                };
                // Find which tab this color belongs to (default to base)
                let targetTab = "base";
                // Initialize tab and category if they don't exist
                if (!tabGroups[targetTab])
                    tabGroups[targetTab] = {};
                if (!tabGroups[targetTab][fallbackColorInfo.category]) {
                    tabGroups[targetTab][fallbackColorInfo.category] = [];
                }
                // Add the color to the appropriate category
                tabGroups[targetTab][fallbackColorInfo.category].push({
                    id: colorKey,
                    name: fallbackColorInfo.displayName,
                    description: fallbackColorInfo.description,
                    defaultValue: colorValue,
                    category: fallbackColorInfo.category,
                });
                return;
            }
            // Validate colorInfo structure
            if (!colorInfo.category ||
                !colorInfo.displayName ||
                !colorInfo.description) {
                console.warn("Invalid colorInfo structure:", colorInfo);
                return;
            }
            // Find which tab this color belongs to
            let targetTab = "base"; // default
            for (const [tabId, tabConfig] of Object.entries(tabStructure)) {
                if (tabConfig.categoryMapping[colorInfo.category]) {
                    targetTab = tabId;
                    break;
                }
            }
            // Initialize tab and category if they don't exist
            if (!tabGroups[targetTab])
                tabGroups[targetTab] = {};
            if (!tabGroups[targetTab][colorInfo.category]) {
                tabGroups[targetTab][colorInfo.category] = [];
            }
            // Add the color to the appropriate category
            tabGroups[targetTab][colorInfo.category].push({
                id: colorKey,
                name: colorInfo.displayName,
                description: colorInfo.description,
                defaultValue: colorValue,
                category: colorInfo.category,
            });
        }
        catch (error) {
            console.error("Error processing color:", colorKey, "error:", error);
        }
    });
    // Convert to ColorTab structure
    const colorTabs = Object.entries(tabStructure)
        .map(([tabId, tabConfig]) => {
        const categories = Object.entries(tabConfig.categoryMapping)
            .map(([categoryName, categoryKey]) => {
            const colors = tabGroups[tabId]?.[categoryName] || [];
            return {
                name: categoryName,
                colors: colors.sort((a, b) => a.name.localeCompare(b.name)),
            };
        })
            .filter((category) => category.colors.length > 0); // Only include categories with colors
        return {
            id: tabId,
            name: tabConfig.name,
            icon: tabConfig.icon,
            categories,
        };
    })
        .filter((tab) => tab.categories.length > 0); // Only include tabs with categories
    return colorTabs;
}
