import { render, screen } from "@testing-library/react";
import { test, expect, describe } from "vitest";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

describe("ToolInvocationBadge", () => {
  describe("rendering", () => {
    test("renders completed state with green dot", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      // Check for green dot
      const greenDot = container.querySelector(".bg-emerald-500");
      expect(greenDot).toBeInTheDocument();

      // Check for message
      expect(screen.getByText("Creating Card.jsx")).toBeInTheDocument();
    });

    test("renders pending state with spinner", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "pending",
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      // Check for spinner (Loader2 icon with animate-spin class)
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();

      // Check for message
      expect(screen.getByText("Creating Card.jsx")).toBeInTheDocument();
    });

    test("applies base styling classes", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("inline-flex");
      expect(badge.className).toContain("bg-neutral-50");
      expect(badge.className).toContain("rounded-lg");
      expect(badge.className).toContain("text-xs");
      expect(badge.className).toContain("font-mono");
      expect(badge.className).toContain("border");
    });

    test("applies custom className when provided", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={toolInvocation}
          className="custom-class"
        />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("custom-class");
    });
  });

  describe("str_replace_editor tool", () => {
    test("shows 'Creating' message for create command", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Button.jsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating Button.jsx")).toBeInTheDocument();
    });

    test("shows 'Editing' message for str_replace command", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "str_replace", path: "App.jsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Editing App.jsx")).toBeInTheDocument();
    });

    test("shows 'Editing' message for insert command", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "insert", path: "index.tsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Editing index.tsx")).toBeInTheDocument();
    });

    test("shows 'Viewing' message for view command", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "view", path: "config.ts" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Viewing config.ts")).toBeInTheDocument();
    });

    test("extracts filename from full path", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: {
          command: "create",
          path: "src/components/Card.jsx",
        },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating Card.jsx")).toBeInTheDocument();
    });

    test("handles unknown command", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "unknown", path: "file.js" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Working on file.js")).toBeInTheDocument();
    });
  });

  describe("file_manager tool", () => {
    test("shows 'Renaming' message with arrow", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: {
          command: "rename",
          old_path: "old.js",
          new_path: "new.js",
        },
        toolName: "file_manager",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Renaming old.js → new.js")).toBeInTheDocument();
    });

    test("shows 'Deleting' message", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "delete", path: "temp.jsx" },
        toolName: "file_manager",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Deleting temp.jsx")).toBeInTheDocument();
    });

    test("extracts filenames from paths", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: {
          command: "rename",
          old_path: "src/components/OldCard.jsx",
          new_path: "src/components/NewCard.jsx",
        },
        toolName: "file_manager",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(
        screen.getByText("Renaming OldCard.jsx → NewCard.jsx")
      ).toBeInTheDocument();
    });

    test("handles unknown command", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "unknown" },
        toolName: "file_manager",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Managing files")).toBeInTheDocument();
    });
  });

  describe("unknown tools", () => {
    test("renders unknown tool name as fallback", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "something" },
        toolName: "unknown_tool",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Using unknown_tool")).toBeInTheDocument();
    });

    test("handles missing tool name", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "something" },
        toolName: "",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Running tool")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    test("handles missing args", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: null,
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(
        screen.getByText("Using str_replace_editor")
      ).toBeInTheDocument();
    });

    test("handles missing command", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { path: "file.js" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Working on file.js")).toBeInTheDocument();
    });

    test("handles missing path", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating file")).toBeInTheDocument();
    });

    test("handles partial data in rename", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "rename", old_path: "old.js" },
        toolName: "file_manager",
        state: "result",
        result: { success: true },
      };

      render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
      expect(screen.getByText("Renaming old.js → file")).toBeInTheDocument();
    });
  });

  describe("visual states", () => {
    test("pending state shows Loader2 spinner", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "pending",
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      expect(spinner?.className).toContain("text-blue-600");
    });

    test("completed state shows emerald dot", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      const dot = container.querySelector(".bg-emerald-500");
      expect(dot).toBeInTheDocument();
    });

    test("maintains font-mono and text-xs", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("font-mono");
      expect(badge.className).toContain("text-xs");
    });

    test("maintains neutral background and border", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "result",
        result: { success: true },
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-neutral-50");
      expect(badge.className).toContain("border-neutral-200");
    });

    test("renders pending when state is not result", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "other",
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    test("renders pending when result is missing", () => {
      const toolInvocation = {
        toolCallId: "1",
        args: { command: "create", path: "Card.jsx" },
        toolName: "str_replace_editor",
        state: "result",
      };

      const { container } = render(
        <ToolInvocationBadge toolInvocation={toolInvocation} />
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });
});
