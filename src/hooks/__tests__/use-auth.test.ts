import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAuth } from "../use-auth";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";
import { useRouter } from "next/navigation";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

describe("useAuth", () => {
  const mockPush = vi.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    test("returns initial state", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.signIn).toBeInstanceOf(Function);
      expect(result.current.signUp).toBeInstanceOf(Function);
    });
  });

  describe("signIn", () => {
    test("successfully signs in and redirects to new project with anonymous work", async () => {
      const mockAnonWork = {
        messages: [{ id: "1", role: "user", content: "test message" }],
        fileSystemData: { "/test.js": { type: "file", content: "test" } },
      };

      const mockProject = { id: "project-123" };

      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(mockAnonWork);
      (createProject as any).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        await signInPromise;
      });

      expect(signInAction).toHaveBeenCalledWith("test@example.com", "password123");
      expect(getAnonWorkData).toHaveBeenCalled();
      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-123");
      expect(result.current.isLoading).toBe(false);
    });

    test("successfully signs in and redirects to most recent project when no anonymous work", async () => {
      const mockProjects = [
        { id: "project-1", name: "Project 1" },
        { id: "project-2", name: "Project 2" },
      ];

      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        await signInPromise;
      });

      expect(getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
      expect(createProject).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    test("successfully signs in and redirects to most recent project with empty anonymous messages", async () => {
      const mockAnonWork = {
        messages: [],
        fileSystemData: {},
      };

      const mockProjects = [{ id: "project-1", name: "Project 1" }];

      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(mockAnonWork);
      (getProjects as any).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        await signInPromise;
      });

      expect(createProject).not.toHaveBeenCalled();
      expect(getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
      expect(result.current.isLoading).toBe(false);
    });

    test("successfully signs in and creates new project when no projects exist", async () => {
      const mockNewProject = { id: "new-project-456" };

      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([]);
      (createProject as any).mockResolvedValue(mockNewProject);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        await signInPromise;
      });

      expect(getProjects).toHaveBeenCalled();
      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/new-project-456");
      expect(result.current.isLoading).toBe(false);
    });

    test("returns error result when sign in fails", async () => {
      const errorResult = { success: false, error: "Invalid credentials" };

      (signInAction as any).mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      let signInResult: any;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "wrongpassword");
      });

      await act(async () => {
        signInResult = await signInPromise;
      });

      expect(signInResult).toEqual(errorResult);
      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    test("sets loading state correctly during sign in", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets loading state even when sign in throws an error", async () => {
      (signInAction as any).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        try {
          await signInPromise;
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("handles error during post-sign-in navigation", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockImplementation(() => {
        throw new Error("Storage error");
      });

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        try {
          await signInPromise;
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    test("successfully signs up and redirects to new project with anonymous work", async () => {
      const mockAnonWork = {
        messages: [{ id: "1", role: "user", content: "test message" }],
        fileSystemData: { "/test.js": { type: "file", content: "test" } },
      };

      const mockProject = { id: "project-789" };

      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(mockAnonWork);
      (createProject as any).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      let signUpPromise: Promise<any>;
      act(() => {
        signUpPromise = result.current.signUp("new@example.com", "password123");
      });

      await act(async () => {
        await signUpPromise;
      });

      expect(signUpAction).toHaveBeenCalledWith("new@example.com", "password123");
      expect(getAnonWorkData).toHaveBeenCalled();
      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-789");
      expect(result.current.isLoading).toBe(false);
    });

    test("successfully signs up and redirects to most recent project when no anonymous work", async () => {
      const mockProjects = [{ id: "project-1", name: "Project 1" }];

      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      let signUpPromise: Promise<any>;
      act(() => {
        signUpPromise = result.current.signUp("new@example.com", "password123");
      });

      await act(async () => {
        await signUpPromise;
      });

      expect(getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
      expect(createProject).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    test("successfully signs up and creates new project when no projects exist", async () => {
      const mockNewProject = { id: "new-project-999" };

      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([]);
      (createProject as any).mockResolvedValue(mockNewProject);

      const { result } = renderHook(() => useAuth());

      let signUpPromise: Promise<any>;
      act(() => {
        signUpPromise = result.current.signUp("new@example.com", "password123");
      });

      await act(async () => {
        await signUpPromise;
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/new-project-999");
      expect(result.current.isLoading).toBe(false);
    });

    test("returns error result when sign up fails", async () => {
      const errorResult = { success: false, error: "Email already exists" };

      (signUpAction as any).mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      let signUpPromise: Promise<any>;
      let signUpResult: any;
      act(() => {
        signUpPromise = result.current.signUp("existing@example.com", "password123");
      });

      await act(async () => {
        signUpResult = await signUpPromise;
      });

      expect(signUpResult).toEqual(errorResult);
      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    test("sets loading state correctly during sign up", async () => {
      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let signUpPromise: Promise<any>;
      act(() => {
        signUpPromise = result.current.signUp("new@example.com", "password123");
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        await signUpPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets loading state even when sign up throws an error", async () => {
      (signUpAction as any).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      let signUpPromise: Promise<any>;
      act(() => {
        signUpPromise = result.current.signUp("new@example.com", "password123");
      });

      await act(async () => {
        try {
          await signUpPromise;
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("edge cases", () => {
    test("handles undefined anonymous work data", async () => {
      const mockProjects = [{ id: "project-1" }];

      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(undefined);
      (getProjects as any).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        await signInPromise;
      });

      expect(getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
      expect(clearAnonWork).not.toHaveBeenCalled();
    });

    test("handles createProject failure during anonymous work migration", async () => {
      const mockAnonWork = {
        messages: [{ id: "1", role: "user", content: "test" }],
        fileSystemData: {},
      };

      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(mockAnonWork);
      (createProject as any).mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        try {
          await signInPromise;
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("handles getProjects failure", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        try {
          await signInPromise;
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("generates unique project names with random numbers", async () => {
      const mockNewProject = { id: "project-1" };

      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([]);
      (createProject as any).mockResolvedValue(mockNewProject);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        await signInPromise;
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringMatching(/^New Design #\d+$/),
        })
      );
    });

    test("includes timestamp in project name for anonymous work", async () => {
      const mockAnonWork = {
        messages: [{ id: "1", role: "user", content: "test" }],
        fileSystemData: {},
      };
      const mockProject = { id: "project-1" };

      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(mockAnonWork);
      (createProject as any).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      await act(async () => {
        await signInPromise;
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining("Design from"),
        })
      );
    });
  });

  describe("concurrent operations", () => {
    test("handles multiple sign in attempts correctly", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      let promise1: Promise<any>;
      let promise2: Promise<any>;

      act(() => {
        promise1 = result.current.signIn("test1@example.com", "password1");
        promise2 = result.current.signIn("test2@example.com", "password2");
      });

      await act(async () => {
        await Promise.all([promise1, promise2]);
      });

      expect(signInAction).toHaveBeenCalledTimes(2);
      expect(result.current.isLoading).toBe(false);
    });

    test("handles sign in and sign up called together", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<any>;
      let signUpPromise: Promise<any>;

      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password");
        signUpPromise = result.current.signUp("new@example.com", "password");
      });

      await act(async () => {
        await Promise.all([signInPromise, signUpPromise]);
      });

      expect(signInAction).toHaveBeenCalledTimes(1);
      expect(signUpAction).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
