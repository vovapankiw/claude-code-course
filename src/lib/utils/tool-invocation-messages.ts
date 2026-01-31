/**
 * Extracts filename from a full path, handling both Windows and Unix paths
 * @param path - Full file path (e.g., "src/components/Card.jsx" or "C:\\src\\Card.jsx")
 * @returns Filename only (e.g., "Card.jsx")
 */
export function extractFilename(path: string): string {
  if (!path || typeof path !== "string") {
    return "";
  }

  // Handle both Unix (/) and Windows (\) separators
  const parts = path.split(/[/\\]/);
  const filename = parts[parts.length - 1];

  return filename || "";
}

/**
 * Generates a user-friendly message for a tool invocation
 * @param toolName - The tool being invoked (e.g., "str_replace_editor", "file_manager")
 * @param args - Tool arguments containing command, paths, etc.
 * @returns Human-readable message (e.g., "Creating Card.jsx", "Renaming old.js → new.js")
 */
export function getToolMessage(toolName: string, args: any): string {
  if (!toolName) {
    return "Running tool";
  }

  if (!args) {
    return `Using ${toolName}`;
  }

  switch (toolName) {
    case "str_replace_editor": {
      const command = args.command;
      const filename = extractFilename(args.path || "");
      const displayName = filename || "file";

      switch (command) {
        case "create":
          return `Creating ${displayName}`;
        case "str_replace":
        case "insert":
          return `Editing ${displayName}`;
        case "view":
          return `Viewing ${displayName}`;
        default:
          return `Working on ${displayName}`;
      }
    }

    case "file_manager": {
      const command = args.command;

      if (command === "rename") {
        const oldName = extractFilename(args.old_path || "");
        const newName = extractFilename(args.new_path || "");
        const oldDisplay = oldName || "file";
        const newDisplay = newName || "file";
        return `Renaming ${oldDisplay} → ${newDisplay}`;
      }

      if (command === "delete") {
        const filename = extractFilename(args.path || "");
        const displayName = filename || "file";
        return `Deleting ${displayName}`;
      }

      return "Managing files";
    }

    default:
      return `Using ${toolName}`;
  }
}
