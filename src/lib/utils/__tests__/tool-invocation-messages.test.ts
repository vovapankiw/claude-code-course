import { test, expect, describe } from "vitest";
import { extractFilename, getToolMessage } from "../tool-invocation-messages";

describe("extractFilename", () => {
  describe("basic functionality", () => {
    test("extracts filename from Unix path", () => {
      expect(extractFilename("src/components/Card.jsx")).toBe("Card.jsx");
    });

    test("extracts filename from Windows path", () => {
      expect(extractFilename("C:\\Users\\file\\Card.jsx")).toBe("Card.jsx");
    });

    test("extracts filename from mixed separators", () => {
      expect(extractFilename("C:\\Users/file\\Card.jsx")).toBe("Card.jsx");
    });

    test("handles path with no directory", () => {
      expect(extractFilename("Card.jsx")).toBe("Card.jsx");
    });

    test("handles empty string", () => {
      expect(extractFilename("")).toBe("");
    });

    test("handles null", () => {
      expect(extractFilename(null as any)).toBe("");
    });

    test("handles undefined", () => {
      expect(extractFilename(undefined as any)).toBe("");
    });
  });

  describe("edge cases", () => {
    test("handles path ending with separator", () => {
      expect(extractFilename("src/components/")).toBe("");
    });

    test("handles multiple separators", () => {
      expect(extractFilename("src//components//Card.jsx")).toBe("Card.jsx");
    });

    test("handles spaces in filename", () => {
      expect(extractFilename("src/My File.jsx")).toBe("My File.jsx");
    });

    test("handles Unicode characters", () => {
      expect(extractFilename("src/文件.jsx")).toBe("文件.jsx");
    });

    test("handles paths with no extension", () => {
      expect(extractFilename("src/README")).toBe("README");
    });

    test("handles paths with multiple dots", () => {
      expect(extractFilename("src/file.test.tsx")).toBe("file.test.tsx");
    });

    test("handles root path Unix", () => {
      expect(extractFilename("/")).toBe("");
    });

    test("handles root path Windows", () => {
      expect(extractFilename("C:\\")).toBe("");
    });

    test("handles non-string input", () => {
      expect(extractFilename(123 as any)).toBe("");
      expect(extractFilename({} as any)).toBe("");
      expect(extractFilename([] as any)).toBe("");
    });
  });
});

describe("getToolMessage", () => {
  describe("str_replace_editor", () => {
    test("generates message for create command", () => {
      const args = { command: "create", path: "src/components/Button.jsx" };
      expect(getToolMessage("str_replace_editor", args)).toBe(
        "Creating Button.jsx"
      );
    });

    test("generates message for str_replace command", () => {
      const args = { command: "str_replace", path: "src/App.jsx" };
      expect(getToolMessage("str_replace_editor", args)).toBe("Editing App.jsx");
    });

    test("generates message for insert command", () => {
      const args = { command: "insert", path: "src/index.tsx" };
      expect(getToolMessage("str_replace_editor", args)).toBe(
        "Editing index.tsx"
      );
    });

    test("generates message for view command", () => {
      const args = { command: "view", path: "src/config.ts" };
      expect(getToolMessage("str_replace_editor", args)).toBe(
        "Viewing config.ts"
      );
    });

    test("handles unknown command", () => {
      const args = { command: "unknown", path: "src/file.js" };
      expect(getToolMessage("str_replace_editor", args)).toBe(
        "Working on file.js"
      );
    });

    test("extracts filename from full path", () => {
      const args = {
        command: "create",
        path: "C:\\Users\\project\\src\\components\\Card.jsx",
      };
      expect(getToolMessage("str_replace_editor", args)).toBe(
        "Creating Card.jsx"
      );
    });

    test("handles missing path", () => {
      const args = { command: "create" };
      expect(getToolMessage("str_replace_editor", args)).toBe("Creating file");
    });

    test("handles empty path", () => {
      const args = { command: "create", path: "" };
      expect(getToolMessage("str_replace_editor", args)).toBe("Creating file");
    });

    test("handles missing command", () => {
      const args = { path: "src/file.js" };
      expect(getToolMessage("str_replace_editor", args)).toBe(
        "Working on file.js"
      );
    });
  });

  describe("file_manager", () => {
    test("generates message for rename command", () => {
      const args = {
        command: "rename",
        old_path: "src/old.js",
        new_path: "src/new.js",
      };
      expect(getToolMessage("file_manager", args)).toBe(
        "Renaming old.js → new.js"
      );
    });

    test("generates message for delete command", () => {
      const args = { command: "delete", path: "src/temp.jsx" };
      expect(getToolMessage("file_manager", args)).toBe("Deleting temp.jsx");
    });

    test("handles unknown command", () => {
      const args = { command: "unknown" };
      expect(getToolMessage("file_manager", args)).toBe("Managing files");
    });

    test("extracts filenames from full paths in rename", () => {
      const args = {
        command: "rename",
        old_path: "C:\\Users\\project\\src\\components\\OldCard.jsx",
        new_path: "C:\\Users\\project\\src\\components\\NewCard.jsx",
      };
      expect(getToolMessage("file_manager", args)).toBe(
        "Renaming OldCard.jsx → NewCard.jsx"
      );
    });

    test("handles missing old_path in rename", () => {
      const args = { command: "rename", new_path: "src/new.js" };
      expect(getToolMessage("file_manager", args)).toBe(
        "Renaming file → new.js"
      );
    });

    test("handles missing new_path in rename", () => {
      const args = { command: "rename", old_path: "src/old.js" };
      expect(getToolMessage("file_manager", args)).toBe(
        "Renaming old.js → file"
      );
    });

    test("handles missing both paths in rename", () => {
      const args = { command: "rename" };
      expect(getToolMessage("file_manager", args)).toBe(
        "Renaming file → file"
      );
    });

    test("handles missing path in delete", () => {
      const args = { command: "delete" };
      expect(getToolMessage("file_manager", args)).toBe("Deleting file");
    });

    test("handles empty path in delete", () => {
      const args = { command: "delete", path: "" };
      expect(getToolMessage("file_manager", args)).toBe("Deleting file");
    });

    test("handles missing command", () => {
      const args = { path: "src/file.js" };
      expect(getToolMessage("file_manager", args)).toBe("Managing files");
    });
  });

  describe("unknown tools", () => {
    test("handles unknown tool name gracefully", () => {
      const args = { command: "something" };
      expect(getToolMessage("unknown_tool", args)).toBe("Using unknown_tool");
    });

    test("handles missing tool name", () => {
      const args = { command: "something" };
      expect(getToolMessage("", args)).toBe("Running tool");
    });

    test("handles null tool name", () => {
      const args = { command: "something" };
      expect(getToolMessage(null as any, args)).toBe("Running tool");
    });

    test("handles undefined tool name", () => {
      const args = { command: "something" };
      expect(getToolMessage(undefined as any, args)).toBe("Running tool");
    });
  });

  describe("edge cases", () => {
    test("handles missing args", () => {
      expect(getToolMessage("str_replace_editor", null as any)).toBe(
        "Using str_replace_editor"
      );
      expect(getToolMessage("str_replace_editor", undefined as any)).toBe(
        "Using str_replace_editor"
      );
    });

    test("handles empty args object", () => {
      expect(getToolMessage("str_replace_editor", {})).toBe("Working on file");
    });

    test("handles malformed args", () => {
      expect(getToolMessage("str_replace_editor", "not an object" as any)).toBe(
        "Working on file"
      );
    });

    test("handles args with unexpected properties", () => {
      const args = { unexpected: "value", path: "src/file.js" };
      expect(getToolMessage("str_replace_editor", args)).toBe(
        "Working on file.js"
      );
    });
  });
});
