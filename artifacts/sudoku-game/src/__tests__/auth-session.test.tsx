// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { AuthProvider, useAuth } from "../hooks/use-auth";

vi.mock("../lib/api-base-url", () => ({
  apiUrl: (path: string) => `https://api.example.test${path}`,
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

function AuthStatus() {
  const { isSignedIn } = useAuth();
  return createElement("span", null, isSignedIn ? "Signed in" : "Guest");
}

describe("auth session", () => {
  it("sends cross-origin session cookies and syncs the signed-in profile", async () => {
    const user = {
      id: "google_123",
      email: "player@example.test",
      firstName: "Brain",
      lastName: "Player",
    };
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, _init?: RequestInit) => {
        if (input.toString().endsWith("/api/auth/user")) {
          return new Response(JSON.stringify(user), { status: 200 });
        }
        return new Response(JSON.stringify({ id: 42 }), { status: 200 });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(
        AuthProvider,
        null,
        createElement(AuthStatus),
      ),
    );

    await waitFor(() => expect(screen.getByText("Signed in")).toBeTruthy());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe("include");
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      replitUserId: user.id,
    });
  });
});
