export interface ThemeColor {
  id: string;
  name: string;
  description: string;
  defaultValue: string;
  category: string;
}

export interface ColorCategory {
  name: string;
  colors: ThemeColor[];
}

export interface ColorTab {
  id:
    | "base"
    | "editor"
    | "workbench"
    | "text"
    | "actions"
    | "buttons"
    | "terminal"
    | "ui"
    | "uiLayout"
    | "window"
    | "tokens";
  name: string;
  icon: string;
  categories: ColorCategory[];
}

export const themeColors: ColorTab[] = [
  {
    id: "base",
    name: "Base Colors",
    icon: "Palette",
    categories: [
      {
        name: "Core Colors",
        colors: [
          {
            id: "focusBorder",
            name: "Focus Border",
            description: "Overall border color for focused elements",
            defaultValue: "#007acc",
            category: "Core Colors",
          },
          {
            id: "foreground",
            name: "Foreground",
            description: "Overall foreground color",
            defaultValue: "#cccccc",
            category: "Core Colors",
          },
          {
            id: "disabledForeground",
            name: "Disabled Foreground",
            description: "Overall foreground for disabled elements",
            defaultValue: "#6a6a6a",
            category: "Core Colors",
          },
          {
            id: "errorForeground",
            name: "Error Foreground",
            description: "Overall foreground color for error messages",
            defaultValue: "#f48771",
            category: "Core Colors",
          },
          {
            id: "descriptionForeground",
            name: "Description Foreground",
            description: "Foreground color for description text",
            defaultValue: "#cccccc",
            category: "Core Colors",
          },
          {
            id: "icon.foreground",
            name: "Icon Foreground",
            description: "Default color for icons in the workbench",
            defaultValue: "#c5c5c5",
            category: "Core Colors",
          },
        ],
      },
      {
        name: "Widgets",
        colors: [
          {
            id: "widget.border",
            name: "Widget Border",
            description: "Border color of widgets such as Find/Replace",
            defaultValue: "#454545",
            category: "Widgets",
          },
          {
            id: "widget.shadow",
            name: "Widget Shadow",
            description: "Shadow color of widgets such as Find/Replace",
            defaultValue: "#000000",
            category: "Widgets",
          },
          {
            id: "selection.background",
            name: "Selection Background",
            description: "Background color of text selections in the workbench",
            defaultValue: "#264f78",
            category: "Widgets",
          },
          {
            id: "sash.hoverBorder",
            name: "Sash Hover Border",
            description: "Hover border color for draggable sashes",
            defaultValue: "#007acc",
            category: "Widgets",
          },
        ],
      },
      {
        name: "Contrast Colors",
        colors: [
          {
            id: "contrastActiveBorder",
            name: "Contrast Active Border",
            description:
              "An extra border around active elements for greater contrast",
            defaultValue: "#f38518",
            category: "Contrast Colors",
          },
          {
            id: "contrastBorder",
            name: "Contrast Border",
            description: "An extra border around elements for greater contrast",
            defaultValue: "#6fc3df",
            category: "Contrast Colors",
          },
        ],
      },
    ],
  },
  {
    id: "editor",
    name: "Editor",
    icon: "FileText",
    categories: [
      {
        name: "Editor Core",
        colors: [
          {
            id: "editor.background",
            name: "Editor Background",
            description: "Editor background color",
            defaultValue: "#1e1e1e",
            category: "Editor Core",
          },
          {
            id: "editor.foreground",
            name: "Editor Foreground",
            description: "Editor default foreground color",
            defaultValue: "#d4d4d4",
            category: "Editor Core",
          },
          {
            id: "editor.lineHighlightBackground",
            name: "Line Highlight Background",
            description: "Background color of the current line highlight",
            defaultValue: "#2a2d2e",
            category: "Editor Core",
          },
          {
            id: "editor.lineHighlightBorder",
            name: "Line Highlight Border",
            description:
              "Background color of the border around the current line highlight",
            defaultValue: "#282828",
            category: "Editor Core",
          },
          {
            id: "editor.selectionBackground",
            name: "Selection Background",
            description: "Color of the editor selection",
            defaultValue: "#264f78",
            category: "Editor Core",
          },
          {
            id: "editor.selectionHighlightBackground",
            name: "Selection Highlight Background",
            description: "Color of the selection in an inactive editor",
            defaultValue: "#3a3d41",
            category: "Editor Core",
          },
          {
            id: "editor.wordHighlightBackground",
            name: "Word Highlight Background",
            description: "Background color of a symbol during read-access",
            defaultValue: "#575757",
            category: "Editor Core",
          },
          {
            id: "editor.wordHighlightStrongBackground",
            name: "Word Highlight Strong Background",
            description: "Background color of a symbol during write-access",
            defaultValue: "#004972",
            category: "Editor Core",
          },
        ],
      },
      {
        name: "Editor Borders",
        colors: [
          {
            id: "editor.findMatchBackground",
            name: "Find Match Background",
            description: "Color of the current search match",
            defaultValue: "#515c6a",
            category: "Editor Borders",
          },
          {
            id: "editor.findMatchHighlightBackground",
            name: "Find Match Highlight Background",
            description: "Color of the other search matches",
            defaultValue: "#3a3d41",
            category: "Editor Borders",
          },
          {
            id: "editor.findRangeHighlightBackground",
            name: "Find Range Highlight Background",
            description: "Color the range limiting the search",
            defaultValue: "#3a3d41",
            category: "Editor Borders",
          },
          {
            id: "editor.hoverHighlightBackground",
            name: "Hover Highlight Background",
            description: "Highlight below the word for which a hover is shown",
            defaultValue: "#2a2d2e",
            category: "Editor Borders",
          },
          {
            id: "editorHoverWidget.background",
            name: "Hover Widget Background",
            description: "Background color of the editor hover",
            defaultValue: "#2d2d30",
            category: "Editor Borders",
          },
          {
            id: "editorHoverWidget.border",
            name: "Hover Widget Border",
            description: "Border color of the editor hover",
            defaultValue: "#454545",
            category: "Editor Borders",
          },
        ],
      },
      {
        name: "Editor Widgets",
        colors: [
          {
            id: "editorWidget.background",
            name: "Editor Widget Background",
            description: "Background color of editor widgets",
            defaultValue: "#252526",
            category: "Editor Widgets",
          },
          {
            id: "editorWidget.border",
            name: "Editor Widget Border",
            description: "Border color of editor widgets",
            defaultValue: "#454545",
            category: "Editor Widgets",
          },
          {
            id: "editorWidget.resizeBorder",
            name: "Editor Widget Resize Border",
            description: "Border color of editor widget resize handle",
            defaultValue: "#454545",
            category: "Editor Widgets",
          },
        ],
      },
    ],
  },
  {
    id: "workbench",
    name: "Workbench",
    icon: "Layout",
    categories: [
      {
        name: "Activity Bar",
        colors: [
          {
            id: "activityBar.background",
            name: "Activity Bar Background",
            description: "Activity bar background color",
            defaultValue: "#333333",
            category: "Activity Bar",
          },
          {
            id: "activityBar.foreground",
            name: "Activity Bar Foreground",
            description: "Activity bar item foreground color when active",
            defaultValue: "#ffffff",
            category: "Activity Bar",
          },
          {
            id: "activityBar.inactiveForeground",
            name: "Activity Bar Inactive Foreground",
            description: "Activity bar item foreground color when inactive",
            defaultValue: "#ffffff",
            category: "Activity Bar",
          },
          {
            id: "activityBar.border",
            name: "Activity Bar Border",
            description: "Activity bar border color with the side bar",
            defaultValue: "#474747",
            category: "Activity Bar",
          },
          {
            id: "activityBar.activeBorder",
            name: "Activity Bar Active Border",
            description: "Activity bar border color for the active item",
            defaultValue: "#ffffff",
            category: "Activity Bar",
          },
          {
            id: "activityBarBadge.background",
            name: "Activity Bar Badge Background",
            description: "Activity notification badge background color",
            defaultValue: "#007acc",
            category: "Activity Bar",
          },
          {
            id: "activityBarBadge.foreground",
            name: "Activity Bar Badge Foreground",
            description: "Activity notification badge foreground color",
            defaultValue: "#ffffff",
            category: "Activity Bar",
          },
        ],
      },
      {
        name: "Side Bar",
        colors: [
          {
            id: "sideBar.background",
            name: "Side Bar Background",
            description: "Side bar background color",
            defaultValue: "#252526",
            category: "Side Bar",
          },
          {
            id: "sideBar.foreground",
            name: "Side Bar Foreground",
            description: "Side bar foreground color",
            defaultValue: "#cccccc",
            category: "Side Bar",
          },
          {
            id: "sideBar.border",
            name: "Side Bar Border",
            description:
              "Side bar border color on the side separating the editor",
            defaultValue: "#474747",
            category: "Side Bar",
          },
          {
            id: "sideBarTitle.foreground",
            name: "Side Bar Title Foreground",
            description: "Side bar title foreground color",
            defaultValue: "#cccccc",
            category: "Side Bar",
          },
          {
            id: "sideBarSectionHeader.background",
            name: "Side Bar Section Header Background",
            description: "Side bar section header background color",
            defaultValue: "#2d2d30",
            category: "Side Bar",
          },
          {
            id: "sideBarSectionHeader.foreground",
            name: "Side Bar Section Header Foreground",
            description: "Side bar section header foreground color",
            defaultValue: "#cccccc",
            category: "Side Bar",
          },
        ],
      },
      {
        name: "Status Bar",
        colors: [
          {
            id: "statusBar.background",
            name: "Status Bar Background",
            description: "Standard status bar background color",
            defaultValue: "#007acc",
            category: "Status Bar",
          },
          {
            id: "statusBar.foreground",
            name: "Status Bar Foreground",
            description: "Status bar foreground color",
            defaultValue: "#ffffff",
            category: "Status Bar",
          },
          {
            id: "statusBar.border",
            name: "Status Bar Border",
            description: "Status bar border color",
            defaultValue: "#007acc",
            category: "Status Bar",
          },
          {
            id: "statusBar.debuggingBackground",
            name: "Status Bar Debugging Background",
            description:
              "Status bar background color when a program is being debugged",
            defaultValue: "#cc6633",
            category: "Status Bar",
          },
          {
            id: "statusBar.debuggingForeground",
            name: "Status Bar Debugging Foreground",
            description:
              "Status bar foreground color when a program is being debugged",
            defaultValue: "#ffffff",
            category: "Status Bar",
          },
          {
            id: "statusBar.debuggingBorder",
            name: "Status Bar Debugging Border",
            description:
              "Status bar border color when a program is being debugged",
            defaultValue: "#cc6633",
            category: "Status Bar",
          },
        ],
      },
      {
        name: "Title Bar",
        colors: [
          {
            id: "titleBar.activeBackground",
            name: "Title Bar Active Background",
            description: "Title bar background when the window is active",
            defaultValue: "#3c3c3c",
            category: "Title Bar",
          },
          {
            id: "titleBar.activeForeground",
            name: "Title Bar Active Foreground",
            description: "Title bar foreground when the window is active",
            defaultValue: "#cccccc",
            category: "Title Bar",
          },
          {
            id: "titleBar.inactiveBackground",
            name: "Title Bar Inactive Background",
            description: "Title bar background when the window is inactive",
            defaultValue: "#3c3c3c",
            category: "Title Bar",
          },
          {
            id: "titleBar.inactiveForeground",
            name: "Title Bar Inactive Foreground",
            description: "Title bar foreground when the window is inactive",
            defaultValue: "#cccccc",
            category: "Title Bar",
          },
          {
            id: "titleBar.border",
            name: "Title Bar Border",
            description: "Title bar border color",
            defaultValue: "#474747",
            category: "Title Bar",
          },
        ],
      },
    ],
  },
  {
    id: "window",
    name: "Window",
    icon: "Monitor",
    categories: [
      {
        name: "Window Border",
        colors: [
          {
            id: "window.activeBorder",
            name: "Active Window Border",
            description: "Border color for the active (focused) window",
            defaultValue: "#007acc",
            category: "Window Border",
          },
          {
            id: "window.inactiveBorder",
            name: "Inactive Window Border",
            description: "Border color for the inactive (unfocused) windows",
            defaultValue: "#3c3c3c",
            category: "Window Border",
          },
        ],
      },
    ],
  },
  {
    id: "tokens",
    name: "Token Colors",
    icon: "Type",
    categories: [
      {
        name: "Comments",
        colors: [
          {
            id: "editorComment.foreground",
            name: "Comment",
            description: "Color for comments in code",
            defaultValue: "#6a9955",
            category: "Comments",
          },
          {
            id: "editorComment.rangeForeground",
            name: "Comment Range",
            description: "Color for comment ranges in code",
            defaultValue: "#6a9955",
            category: "Comments",
          },
          {
            id: "editorComment.unusedForeground",
            name: "Unused Comment",
            description: "Color for unused comments in code",
            defaultValue: "#6a9955",
            category: "Comments",
          },
        ],
      },
      {
        name: "Strings",
        colors: [
          {
            id: "editorString.foreground",
            name: "String",
            description: "Color for string literals",
            defaultValue: "#ce9178",
            category: "Strings",
          },
          {
            id: "editorString.escapeForeground",
            name: "String Escape",
            description: "Color for escape sequences in strings",
            defaultValue: "#d7ba7d",
            category: "Strings",
          },
          {
            id: "editorString.quotedForeground",
            name: "Quoted String",
            description: "Color for quoted strings",
            defaultValue: "#ce9178",
            category: "Strings",
          },
        ],
      },
      {
        name: "Keywords",
        colors: [
          {
            id: "editorKeyword.foreground",
            name: "Keyword",
            description: "Color for language keywords",
            defaultValue: "#569cd6",
            category: "Keywords",
          },
          {
            id: "editorKeyword.controlForeground",
            name: "Control Keyword",
            description: "Color for control flow keywords",
            defaultValue: "#c586c0",
            category: "Keywords",
          },
          {
            id: "editorKeyword.operatorForeground",
            name: "Operator",
            description: "Color for operators",
            defaultValue: "#d4d4d4",
            category: "Keywords",
          },
        ],
      },
      {
        name: "Types",
        colors: [
          {
            id: "editorType.foreground",
            name: "Type",
            description: "Color for type annotations",
            defaultValue: "#4ec9b0",
            category: "Types",
          },
          {
            id: "editorType.parameterForeground",
            name: "Type Parameter",
            description: "Color for type parameters",
            defaultValue: "#4ec9b0",
            category: "Types",
          },
          {
            id: "editorType.primitiveForeground",
            name: "Primitive Type",
            description: "Color for primitive types",
            defaultValue: "#4ec9b0",
            category: "Types",
          },
        ],
      },
      {
        name: "Functions",
        colors: [
          {
            id: "editorFunction.foreground",
            name: "Function",
            description: "Color for function names",
            defaultValue: "#dcdcaa",
            category: "Functions",
          },
          {
            id: "editorFunction.declarationForeground",
            name: "Function Declaration",
            description: "Color for function declarations",
            defaultValue: "#dcdcaa",
            category: "Functions",
          },
          {
            id: "editorFunction.variableForeground",
            name: "Function Variable",
            description: "Color for function variables",
            defaultValue: "#dcdcaa",
            category: "Functions",
          },
        ],
      },
      {
        name: "Variables",
        colors: [
          {
            id: "editorVariable.foreground",
            name: "Variable",
            description: "Color for variables",
            defaultValue: "#9cdcfe",
            category: "Variables",
          },
          {
            id: "editorVariable.readonlyForeground",
            name: "Readonly Variable",
            description: "Color for readonly variables",
            defaultValue: "#9cdcfe",
            category: "Variables",
          },
          {
            id: "editorVariable.parameterForeground",
            name: "Parameter",
            description: "Color for function parameters",
            defaultValue: "#9cdcfe",
            category: "Variables",
          },
        ],
      },
      {
        name: "Constants",
        colors: [
          {
            id: "editorConstant.foreground",
            name: "Constant",
            description: "Color for constants",
            defaultValue: "#4fc1ff",
            category: "Constants",
          },
          {
            id: "editorConstant.numericForeground",
            name: "Numeric Constant",
            description: "Color for numeric constants",
            defaultValue: "#b5cea8",
            category: "Constants",
          },
          {
            id: "editorConstant.characterForeground",
            name: "Character Constant",
            description: "Color for character constants",
            defaultValue: "#b5cea8",
            category: "Constants",
          },
        ],
      },
      {
        name: "Classes",
        colors: [
          {
            id: "editorClass.foreground",
            name: "Class",
            description: "Color for class names",
            defaultValue: "#4ec9b0",
            category: "Classes",
          },
          {
            id: "editorClass.declarationForeground",
            name: "Class Declaration",
            description: "Color for class declarations",
            defaultValue: "#4ec9b0",
            category: "Classes",
          },
          {
            id: "editorClass.interfaceForeground",
            name: "Interface",
            description: "Color for interfaces",
            defaultValue: "#4ec9b0",
            category: "Classes",
          },
        ],
      },
      {
        name: "Properties",
        colors: [
          {
            id: "editorProperty.foreground",
            name: "Property",
            description: "Color for object properties",
            defaultValue: "#9cdcfe",
            category: "Properties",
          },
          {
            id: "editorProperty.readonlyForeground",
            name: "Readonly Property",
            description: "Color for readonly properties",
            defaultValue: "#9cdcfe",
            category: "Properties",
          },
        ],
      },
      {
        name: "Enums",
        colors: [
          {
            id: "editorEnum.foreground",
            name: "Enum",
            description: "Color for enums",
            defaultValue: "#4ec9b0",
            category: "Enums",
          },
          {
            id: "editorEnumMember.foreground",
            name: "Enum Member",
            description: "Color for enum members",
            defaultValue: "#4fc1ff",
            category: "Enums",
          },
        ],
      },
      {
        name: "Decorators",
        colors: [
          {
            id: "editorDecorator.foreground",
            name: "Decorator",
            description: "Color for decorators",
            defaultValue: "#dcdcaa",
            category: "Decorators",
          },
        ],
      },
      {
        name: "Tags",
        colors: [
          {
            id: "editorTag.foreground",
            name: "Tag",
            description: "Color for HTML/XML tags",
            defaultValue: "#569cd6",
            category: "Tags",
          },
          {
            id: "editorTag.attributeForeground",
            name: "Tag Attribute",
            description: "Color for tag attributes",
            defaultValue: "#9cdcfe",
            category: "Tags",
          },
        ],
      },
      {
        name: "Punctuation",
        colors: [
          {
            id: "editorPunctuation.definitionForeground",
            name: "Definition Punctuation",
            description: "Color for definition punctuation",
            defaultValue: "#d4d4d4",
            category: "Punctuation",
          },
          {
            id: "editorPunctuation.sectionForeground",
            name: "Section Punctuation",
            description: "Color for section punctuation",
            defaultValue: "#d4d4d4",
            category: "Punctuation",
          },
          {
            id: "editorPunctuation.terminatorForeground",
            name: "Terminator Punctuation",
            description: "Color for terminator punctuation",
            defaultValue: "#d4d4d4",
            category: "Punctuation",
          },
        ],
      },
      {
        name: "Meta",
        colors: [
          {
            id: "editorMeta.foreground",
            name: "Meta",
            description: "Color for meta elements",
            defaultValue: "#d4d4d4",
            category: "Meta",
          },
          {
            id: "editorMeta.preprocessorForeground",
            name: "Preprocessor",
            description: "Color for preprocessor directives",
            defaultValue: "#c586c0",
            category: "Meta",
          },
        ],
      },
      {
        name: "Support",
        colors: [
          {
            id: "editorSupport.foreground",
            name: "Support",
            description: "Color for support elements",
            defaultValue: "#4fc1ff",
            category: "Support",
          },
          {
            id: "editorSupport.classForeground",
            name: "Support Class",
            description: "Color for support classes",
            defaultValue: "#4fc1ff",
            category: "Support",
          },
          {
            id: "editorSupport.functionForeground",
            name: "Support Function",
            description: "Color for support functions",
            defaultValue: "#dcdcaa",
            category: "Support",
          },
        ],
      },
      {
        name: "Entities",
        colors: [
          {
            id: "editorEntity.foreground",
            name: "Entity",
            description: "Color for entities",
            defaultValue: "#569cd6",
            category: "Entities",
          },
          {
            id: "editorEntity.nameForeground",
            name: "Entity Name",
            description: "Color for entity names",
            defaultValue: "#569cd6",
            category: "Entities",
          },
          {
            id: "editorEntity.nameFunctionForeground",
            name: "Entity Name Function",
            description: "Color for entity name functions",
            defaultValue: "#dcdcaa",
            category: "Entities",
          },
          {
            id: "editorEntity.nameTypeForeground",
            name: "Entity Name Type",
            description: "Color for entity name types",
            defaultValue: "#4ec9b0",
            category: "Entities",
          },
        ],
      },
    ],
  },
  {
    id: "text",
    name: "Text",
    icon: "Type",
    categories: [
      {
        name: "Text Elements",
        colors: [
          {
            id: "textBlockQuote.background",
            name: "Block Quote Background",
            description: "Background color for block quotes in text",
            defaultValue: "#7f7f7f",
            category: "Text Elements",
          },
          {
            id: "textBlockQuote.border",
            name: "Block Quote Border",
            description: "Border color for block quotes in text",
            defaultValue: "#007acc",
            category: "Text Elements",
          },
          {
            id: "textCodeBlock.background",
            name: "Code Block Background",
            description: "Background color for code blocks in text",
            defaultValue: "#0a0a0a",
            category: "Text Elements",
          },
          {
            id: "textLink.activeForeground",
            name: "Active Link Foreground",
            description: "Foreground color for links when clicked and on hover",
            defaultValue: "#4ec9b0",
            category: "Text Elements",
          },
          {
            id: "textLink.foreground",
            name: "Link Foreground",
            description: "Foreground color for links in text",
            defaultValue: "#0066cc",
            category: "Text Elements",
          },
          {
            id: "textPreformat.foreground",
            name: "Preformat Foreground",
            description: "Foreground color for preformatted text segments",
            defaultValue: "#d7ba7d",
            category: "Text Elements",
          },
          {
            id: "textPreformat.background",
            name: "Preformat Background",
            description: "Background color for preformatted text segments",
            defaultValue: "#1e1e1e",
            category: "Text Elements",
          },
          {
            id: "textSeparator.foreground",
            name: "Text Separator",
            description: "Color for text separators",
            defaultValue: "#6fc3df",
            category: "Text Elements",
          },
        ],
      },
    ],
  },
  {
    id: "actions",
    name: "Actions",
    icon: "Zap",
    categories: [
      {
        name: "Action Colors",
        colors: [
          {
            id: "toolbar.hoverBackground",
            name: "Toolbar Hover Background",
            description: "Toolbar background when hovering over actions",
            defaultValue: "#2a2d2e",
            category: "Action Colors",
          },
          {
            id: "toolbar.hoverOutline",
            name: "Toolbar Hover Outline",
            description: "Toolbar outline when hovering over actions",
            defaultValue: "#ffffff",
            category: "Action Colors",
          },
          {
            id: "toolbar.activeBackground",
            name: "Toolbar Active Background",
            description:
              "Toolbar background when holding the mouse over actions",
            defaultValue: "#3c3c3c",
            category: "Action Colors",
          },
          {
            id: "editorActionList.background",
            name: "Action List Background",
            description: "Action List background color",
            defaultValue: "#2d2d30",
            category: "Action Colors",
          },
          {
            id: "editorActionList.foreground",
            name: "Action List Foreground",
            description: "Action List foreground color",
            defaultValue: "#cccccc",
            category: "Action Colors",
          },
          {
            id: "editorActionList.focusForeground",
            name: "Action List Focus Foreground",
            description: "Action List foreground color for the focused item",
            defaultValue: "#ffffff",
            category: "Action Colors",
          },
          {
            id: "editorActionList.focusBackground",
            name: "Action List Focus Background",
            description: "Action List background color for the focused item",
            defaultValue: "#094771",
            category: "Action Colors",
          },
        ],
      },
    ],
  },
  {
    id: "buttons",
    name: "Buttons",
    icon: "MousePointer",
    categories: [
      {
        name: "Button Controls",
        colors: [
          {
            id: "button.background",
            name: "Button Background",
            description: "Button background color",
            defaultValue: "#0e639c",
            category: "Button Controls",
          },
          {
            id: "button.foreground",
            name: "Button Foreground",
            description: "Button foreground color",
            defaultValue: "#ffffff",
            category: "Button Controls",
          },
          {
            id: "button.border",
            name: "Button Border",
            description: "Button border color",
            defaultValue: "#007acc",
            category: "Button Controls",
          },
          {
            id: "button.separator",
            name: "Button Separator",
            description: "Button separator color",
            defaultValue: "#ffffff",
            category: "Button Controls",
          },
          {
            id: "button.hoverBackground",
            name: "Button Hover Background",
            description: "Button background color when hovering",
            defaultValue: "#1177bb",
            category: "Button Controls",
          },
          {
            id: "button.secondaryForeground",
            name: "Secondary Button Foreground",
            description: "Secondary button foreground color",
            defaultValue: "#cccccc",
            category: "Button Controls",
          },
          {
            id: "button.secondaryBackground",
            name: "Secondary Button Background",
            description: "Secondary button background color",
            defaultValue: "#3a3d41",
            category: "Button Controls",
          },
          {
            id: "button.secondaryHoverBackground",
            name: "Secondary Button Hover Background",
            description: "Secondary button background color when hovering",
            defaultValue: "#45494e",
            category: "Button Controls",
          },
        ],
      },
      {
        name: "Checkbox & Radio",
        colors: [
          {
            id: "checkbox.background",
            name: "Checkbox Background",
            description: "Background color of checkbox widget",
            defaultValue: "#3c3c3c",
            category: "Checkbox & Radio",
          },
          {
            id: "checkbox.foreground",
            name: "Checkbox Foreground",
            description: "Foreground color of checkbox widget",
            defaultValue: "#ffffff",
            category: "Checkbox & Radio",
          },
          {
            id: "checkbox.disabled.background",
            name: "Disabled Checkbox Background",
            description: "Background of a disabled checkbox",
            defaultValue: "#2d2d30",
            category: "Checkbox & Radio",
          },
          {
            id: "checkbox.disabled.foreground",
            name: "Disabled Checkbox Foreground",
            description: "Foreground of a disabled checkbox",
            defaultValue: "#6a6a6a",
            category: "Checkbox & Radio",
          },
          {
            id: "checkbox.border",
            name: "Checkbox Border",
            description: "Border color of checkbox widget",
            defaultValue: "#3c3c3c",
            category: "Checkbox & Radio",
          },
          {
            id: "checkbox.selectBackground",
            name: "Selected Checkbox Background",
            description: "Background color of checkbox when selected",
            defaultValue: "#007acc",
            category: "Checkbox & Radio",
          },
          {
            id: "checkbox.selectBorder",
            name: "Selected Checkbox Border",
            description: "Border color of checkbox when selected",
            defaultValue: "#007acc",
            category: "Checkbox & Radio",
          },
          {
            id: "radio.activeForeground",
            name: "Active Radio Foreground",
            description: "Foreground color of active radio option",
            defaultValue: "#ffffff",
            category: "Checkbox & Radio",
          },
          {
            id: "radio.activeBackground",
            name: "Active Radio Background",
            description: "Background color of active radio option",
            defaultValue: "#007acc",
            category: "Checkbox & Radio",
          },
          {
            id: "radio.border",
            name: "Radio Border",
            description: "Border color of radio widget",
            defaultValue: "#3c3c3c",
            category: "Checkbox & Radio",
          },
        ],
      },
    ],
  },
  {
    id: "terminal",
    name: "Terminal",
    icon: "Terminal",
    categories: [
      {
        name: "Terminal Colors",
        colors: [
          {
            id: "terminal.background",
            name: "Terminal Background",
            description: "Terminal background color",
            defaultValue: "#1e1e1e",
            category: "Terminal Colors",
          },
          {
            id: "terminal.foreground",
            name: "Terminal Foreground",
            description: "Terminal foreground color",
            defaultValue: "#cccccc",
            category: "Terminal Colors",
          },
          {
            id: "terminal.ansiBlack",
            name: "Terminal ANSI Black",
            description: "Terminal ANSI black color",
            defaultValue: "#000000",
            category: "Terminal Colors",
          },
          {
            id: "terminal.ansiRed",
            name: "Terminal ANSI Red",
            description: "Terminal ANSI red color",
            defaultValue: "#cd3131",
            category: "Terminal Colors",
          },
          {
            id: "terminal.ansiGreen",
            name: "Terminal ANSI Green",
            description: "Terminal ANSI green color",
            defaultValue: "#0dbc79",
            category: "Terminal Colors",
          },
          {
            id: "terminal.ansiYellow",
            name: "Terminal ANSI Yellow",
            description: "Terminal ANSI yellow color",
            defaultValue: "#e5e510",
            category: "Terminal Colors",
          },
          {
            id: "terminal.ansiBlue",
            name: "Terminal ANSI Blue",
            description: "Terminal ANSI blue color",
            defaultValue: "#2472c8",
            category: "Terminal Colors",
          },
          {
            id: "terminal.ansiMagenta",
            name: "Terminal ANSI Magenta",
            description: "Terminal ANSI magenta color",
            defaultValue: "#bc3fbc",
            category: "Terminal Colors",
          },
          {
            id: "terminal.ansiCyan",
            name: "Terminal ANSI Cyan",
            description: "Terminal ANSI cyan color",
            defaultValue: "#11a8cd",
            category: "Terminal Colors",
          },
          {
            id: "terminal.ansiWhite",
            name: "Terminal ANSI White",
            description: "Terminal ANSI white color",
            defaultValue: "#e5e5e5",
            category: "Terminal Colors",
          },
        ],
      },
    ],
  },
];
