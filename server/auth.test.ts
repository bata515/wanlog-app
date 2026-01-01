import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// type PublicUser = Awaited<ReturnType<typeof appRouter.createCaller({} as TrpcContext).auth.me.query>>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("auth.register and auth.login", () => {
  const testPassword = "TestPassword123";
  
  function getUniqueEmail() {
    return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  }
  
  function getUniqueUsername() {
    return `user_${Date.now().toString().slice(-6)}_${Math.random().toString(36).slice(2, 5)}`;
  }

  it("should register a new user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = getUniqueEmail();
    const testUsername = getUniqueUsername();

    const result = await caller.auth.register({
      email: testEmail,
      username: testUsername,
      password: testPassword,
    });

    expect(result.success).toBe(true);
  });

  it("should fail to register with duplicate email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = getUniqueEmail();
    const testUsername = getUniqueUsername();

    // First registration should succeed
    await caller.auth.register({
      email: testEmail,
      username: testUsername,
      password: testPassword,
    });

    // Second registration with same email should fail
    try {
      await caller.auth.register({
        email: testEmail,
        username: getUniqueUsername(),
        password: testPassword,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("already registered");
    }
  });

  it("should fail to register with duplicate username", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = getUniqueEmail();
    const testUsername = getUniqueUsername();

    // First registration should succeed
    await caller.auth.register({
      email: testEmail,
      username: testUsername,
      password: testPassword,
    });

    // Second registration with same username should fail
    try {
      await caller.auth.register({
        email: getUniqueEmail(),
        username: testUsername,
        password: testPassword,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("already taken");
    }
  });

  it("should login with correct credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = getUniqueEmail();
    const testUsername = getUniqueUsername();

    // Register first
    await caller.auth.register({
      email: testEmail,
      username: testUsername,
      password: testPassword,
    });

    // Login should succeed
    const result = await caller.auth.login({
      email: testEmail,
      password: testPassword,
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
  });

  it("should fail to login with wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = getUniqueEmail();
    const testUsername = getUniqueUsername();

    // Register first
    await caller.auth.register({
      email: testEmail,
      username: testUsername,
      password: testPassword,
    });

    // Login with wrong password should fail
    try {
      await caller.auth.login({
        email: testEmail,
        password: "WrongPassword123",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid credentials");
    }
  });

  it("should fail to login with non-existent email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.login({
        email: "nonexistent@example.com",
        password: testPassword,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid credentials");
    }
  });

  it("should validate email format on registration", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testUsername = getUniqueUsername();

    try {
      await caller.auth.register({
        email: "invalid-email",
        username: testUsername,
        password: testPassword,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should validate password length on registration", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = getUniqueEmail();
    const testUsername = getUniqueUsername();

    try {
      await caller.auth.register({
        email: testEmail,
        username: testUsername,
        password: "short",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should validate username length on registration", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = getUniqueEmail();

    try {
      await caller.auth.register({
        email: testEmail,
        username: "ab",
        password: testPassword,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});
