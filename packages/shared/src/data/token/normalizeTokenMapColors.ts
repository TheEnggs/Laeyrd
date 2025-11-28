import { TokenCategory } from "../../types/theme";

export function normalizeTokenMapKey(key: string): TokenCategory | null {
  const lower = key.toLowerCase();

  if (lower.includes("comment")) return "comment";
  if (
    lower.includes("string") ||
    lower.includes("char") ||
    lower.includes("literal")
  )
    return "literal";
  if (
    lower.includes("keyword") ||
    lower.includes("modifier") ||
    lower.includes("control")
  )
    return "keyword";
  if (lower.includes("variable.parameter")) return "parameter";
  if (lower.includes("variable.constant")) return "constant";
  if (lower.includes("variable") && !lower.includes("property"))
    return "variable";
  if (lower.includes("property")) return "property";
  if (lower.includes("function") || lower.includes("method")) return "function";
  if (lower.includes("class")) return "class";
  if (lower.includes("interface")) return "interface";
  if (lower.includes("enum")) return "enum";
  if (lower.includes("type")) return "type";
  if (lower.includes("number") || lower.includes("numeric")) return "number";
  if (lower.includes("macro")) return "macro";
  if (lower.includes("operator")) return "operator";
  if (lower.includes("punctuation") || lower.includes("delimiter"))
    return "punctuation";
  if (lower.includes("annotation") || lower.includes("decorator"))
    return "annotation";
  if (
    lower.includes("builtin") ||
    lower.includes("defaultlibrary") ||
    lower.includes("global")
  )
    return "builtin";
  if (lower.includes("namespace") || lower.includes("module"))
    return "namespace";
  if (lower.includes("tag")) return "tag";
  if (lower.includes("attribute")) return "attribute";
  if (lower.includes("escape")) return "escapesequence";
  if (lower.includes("invalid") || lower.includes("error")) return "invalid";

  return null;
}