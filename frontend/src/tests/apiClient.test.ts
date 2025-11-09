import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import AxiosMockAdapter from "axios-mock-adapter";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { axiosInstance } from "../services/apiClient";
import axios from "axios";

// Mock extractErrorMessage
vi.mock("../utils/errorHandler", () => ({
  extractErrorMessage: vi.fn(() => "mock error"),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

// Mock navigateToLogin
vi.mock("../services/navigation", () => ({
  navigateToLogin: vi.fn(),
}));
import { navigateToLogin } from "../services/navigation";

describe("axiosInstance", () => {
  let mock: AxiosMockAdapter;

  beforeEach(() => {
    mock = new AxiosMockAdapter(axiosInstance);

    // Mock Cookies.get
    vi.spyOn(Cookies, "get").mockImplementation(
    ((key?: string) => {
    if (typeof key === "undefined") {
        // get() with no arguments
        return {
        "jwt-auth": "access_token",
        "refresh-auth": "refresh_token",
        "csrftoken": "csrf_token",
        };
    }

    // get(name) with a key
    switch (key) {
        case "jwt-auth":
        return "access_token";
        case "refresh-auth":
        return "refresh_token";
        case "csrftoken":
        return "csrf_token";
        default:
        return undefined;
    }
    }) as any // ✅ cast to any to satisfy TS
    );

    vi.spyOn(Cookies, "set").mockImplementation(() => undefined);
    vi.spyOn(Cookies, "remove").mockImplementation(() => undefined);

      // Mock refresh endpoint
  vi.spyOn(axios, "post").mockImplementation((url) => {
    if (url.includes("/token/refresh/")) {
      return Promise.resolve({ data: { access: "new_access_token" } });
    }
    return Promise.reject({ response: { status: 401 } });
  });
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it("should return response data on success", async () => {
    mock.onGet("/test").reply(200, { success: true });
    const res = await axiosInstance.get("/test");
    expect(res.data).toEqual({ success: true });
  });

  it("should refresh token and retry request on 401", async () => {
    mock.onGet("/protected").replyOnce(401);
    mock.onPost("/dj-rest-auth/token/refresh/").reply(200, { access: "new_access_token" });
    mock.onGet("/protected").reply(200, { data: "ok" });

    const res = await axiosInstance.get("/protected");

    expect(res.data).toEqual({ data: "ok" });
    expect(Cookies.set).toHaveBeenCalledWith("jwt-auth", "new_access_token");
  });

    it("should remove tokens and navigate to login on refresh failure", async () => {
    mock.onGet("/protected").replyOnce(401);

    // Override axios.post to simulate refresh failure for this test
    vi.spyOn(axios, "post").mockImplementationOnce(() => {
        return Promise.reject({ response: { status: 401 } });
    });

    await expect(axiosInstance.get("/protected")).rejects.toThrow();

    expect(Cookies.remove).toHaveBeenCalledWith("jwt-auth");
    expect(Cookies.remove).toHaveBeenCalledWith("refresh-auth");
    expect(navigateToLogin).toHaveBeenCalled();
    });


  it("should show toast for non-refresh errors", async () => {
    mock.onGet("/other").reply(400);

    await expect(axiosInstance.get("/other")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith("mock error");
  });

  it("should set CSRF and Authorization headers", async () => {
    mock.onGet("/headers-test").reply((config) => {
      expect(config.headers!["Authorization"]).toBe("Bearer access_token");
      expect(config.headers!["X-CSRFToken"]).toBe("csrf_token");
      return [200, { ok: true }];
    });

    const res = await axiosInstance.get("/headers-test");
    expect(res.data).toEqual({ ok: true });
  });
});
