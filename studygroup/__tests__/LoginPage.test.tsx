// AI-GENERATED: Cursor — functional tests for login page validation and auth flow
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const signInWithPassword = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword,
    },
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows required login fields and action text", () => {
    render(<LoginPage />);

    expect(screen.getByText("StudyGroup")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("hokie@vt.edu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("blocks non-vt email and does not call Supabase auth", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("hokie@vt.edu"), "user@gmail.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      screen.getByText("Must use a @vt.edu email address.")
    ).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("shows Supabase error message when login fails", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("hokie@vt.edu"), "test@vt.edu");
    await user.type(screen.getByPlaceholderText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "test@vt.edu",
        password: "wrong-password",
      });
    });

    expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("redirects to lobbies after successful login", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValueOnce({ error: null });
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("hokie@vt.edu"), "hokie@vt.edu");
    await user.type(screen.getByPlaceholderText("Password"), "secure-password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "hokie@vt.edu",
        password: "secure-password",
      });
      expect(mockPush).toHaveBeenCalledWith("/lobbies");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
