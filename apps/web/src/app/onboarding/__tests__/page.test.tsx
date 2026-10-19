import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingPage from "../page";
import MemberOnboardingPage from "../member/page";
import TrainerOnboardingPage from "../trainer/page";
import GymOnboardingPage from "../gym/page";

const { push, fetchApiMock } = vi.hoisted(() => ({ push: vi.fn(), fetchApiMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));
vi.mock("@/context/auth-context", () => ({ useAuth: () => ({ user: { id: "u1" }, isLoading: false }) }));
vi.mock("@/lib/api", () => ({ fetchApi: fetchApiMock }));
vi.mock("@/components/layout/app-shell", () => ({ AppShell: ({ children }: { children: ReactNode }) => <>{children}</> }));

describe("account onboarding choices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApiMock.mockImplementation(async (path: string) => {
      if (path === "/api/onboarding/status") return { context: null, completed: false };
      return [];
    });
  });

  it.each([
    ["I train alone", "member", "/onboarding/member"],
    ["I train with a trainer", "member_with_trainer", "/onboarding/member"],
    ["I run a gym", "gym_owner", "/onboarding/gym"],
  ])("persists %s context and routes to its setup", async (label, context, destination) => {
    render(<OnboardingPage />);
    await screen.findByRole("heading", { name: "How do you train?" });
    const cardHeading = screen.getByRole("heading", { name: label });
    const card = cardHeading.parentElement?.parentElement;
    const chooseButton = card?.querySelector("button");
    expect(chooseButton).toBeTruthy();
    fireEvent.click(chooseButton!);

    await waitFor(() => expect(fetchApiMock).toHaveBeenCalledWith("/api/onboarding/context", expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ context }),
    })));
    expect(push).toHaveBeenCalledWith(destination);
  });

  it("keeps personal-trainer setup distinct from choosing a trainer for one's own training", async () => {
    render(<OnboardingPage />);
    await screen.findByText("Do you train other people?");
    expect(screen.getByRole("heading", { name: "I train with a trainer" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Set up a personal trainer profile" }));
    await waitFor(() => expect(fetchApiMock).toHaveBeenCalledWith("/api/onboarding/context", expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ context: "trainer" }),
    })));
    expect(push).toHaveBeenCalledWith("/onboarding/trainer");
  });

  it("restores saved member answers after refresh and routes after persistence", async () => {
    fetchApiMock.mockImplementation(async (path: string) => path === "/api/onboarding/status"
      ? { context: "member_with_trainer", experience_level: "Beginner", primary_goal: "Mobility", preferred_split: "Two full-body days" }
      : {});
    render(<MemberOnboardingPage />);
    expect(await screen.findByDisplayValue("Beginner")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mobility")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(fetchApiMock).toHaveBeenCalledWith("/api/onboarding/member", expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ experience_level: "Beginner", primary_goal: "Mobility", preferred_split: "Two full-body days", complete: true }),
    })));
    expect(push).toHaveBeenCalledWith("/onboarding/handoff");
  });

  it("submits trainer setup and navigates to the trainer workspace", async () => {
    fetchApiMock.mockImplementation(async (path: string) => path === "/api/onboarding/status"
      ? { context: "trainer", trainer_bio: "Coach bio", trainer_business_name: "Lift Lab" }
      : {});
    render(<TrainerOnboardingPage />);
    expect(await screen.findByDisplayValue("Coach bio")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create trainer profile" }));
    await waitFor(() => expect(fetchApiMock).toHaveBeenCalledWith("/api/onboarding/trainer", expect.objectContaining({ method: "PUT" })));
    expect(push).toHaveBeenCalledWith("/trainer");
  });

  it("keeps gym inputs after a failed request and allows a successful retry", async () => {
    fetchApiMock.mockImplementation(async (path: string) => path === "/api/onboarding/status"
      ? { context: "gym_owner", gym_name: "Local Gym", gym_address: "22 Pine Road" }
      : {});
    render(<GymOnboardingPage />);
    expect(await screen.findByDisplayValue("Local Gym")).toBeInTheDocument();
    fetchApiMock.mockRejectedValueOnce(new Error("Temporary failure"));
    fireEvent.click(screen.getByRole("button", { name: "Create gym" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Temporary failure");
    expect(screen.getByDisplayValue("22 Pine Road")).toBeInTheDocument();
    fetchApiMock.mockResolvedValueOnce({ id: "gym-1", next: "/owner" });
    fireEvent.click(screen.getByRole("button", { name: "Create gym" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/owner"));
  });
});
