import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/context/auth-context";
import RegisterPage from "../page";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

describe("registration to initial onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/auth/me")) return new Response("{}", { status: 401 });
      return new Response(JSON.stringify({ user: {
        id: "user-1", name: "New Member", email: "new@example.com", role: "member",
        gymName: null, roles: ["member"], onboardingComplete: false,
      } }), { status: 201, headers: { "Content-Type": "application/json" } });
    }));
  });

  it("creates the core account, sends no role field, and opens context selection", async () => {
    render(<AuthProvider><RegisterPage /></AuthProvider>);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New Member" } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "newmember" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "SecurePass123" } });
    fireEvent.click(await screen.findByRole("button", { name: "Create account" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding"));
    const registrationCall = vi.mocked(fetch).mock.calls.find(([input]) => String(input).endsWith("/api/auth/register"));
    expect(registrationCall).toBeTruthy();
    const init = registrationCall?.[1] as RequestInit;
    expect(init.credentials).toBe("include");
    expect(JSON.parse(String(init.body))).toEqual({
      name: "New Member", username: "newmember", email: "new@example.com", password: "SecurePass123",
    });
  });
});
