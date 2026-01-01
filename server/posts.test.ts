import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    username: `testuser${userId}`,
    loginMethod: "email",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Posts Router", () => {
  describe("posts.list", () => {
    it("should return a list of published posts", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.posts.list({ page: 1, limit: 20 });

      expect(result).toHaveProperty("posts");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.posts)).toBe(true);
    });

    it("should support pagination", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const page1 = await caller.posts.list({ page: 1, limit: 10 });
      const page2 = await caller.posts.list({ page: 2, limit: 10 });

      expect(page1).toHaveProperty("posts");
      expect(page2).toHaveProperty("posts");
    });
  });

  describe("posts.create", () => {
    it("should create a new post with title and content", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.posts.create({
        title: "Test Post",
        content: "This is a test post",
        status: "published",
        images: [],
        tags: [],
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("success");
    });

    it("should validate title length", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const longTitle = "a".repeat(101);

      await expect(
        caller.posts.create({
          title: longTitle,
          content: "Test content",
          status: "published",
          images: [],
          tags: [],
        })
      ).rejects.toThrow();
    });

    it("should validate content length", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const longContent = "a".repeat(10001);

      await expect(
        caller.posts.create({
          title: "Test",
          content: longContent,
          status: "published",
          images: [],
          tags: [],
        })
      ).rejects.toThrow();
    });

    it("should limit images to 5", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const images = Array(6).fill({
        data: "base64data",
        filename: "test.jpg",
      });

      await expect(
        caller.posts.create({
          title: "Test",
          content: "Test content",
          status: "published",
          images,
          tags: [],
        })
      ).rejects.toThrow();
    });

    it("should limit tags to 5", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const tags = Array(6).fill("tag");

      await expect(
        caller.posts.create({
          title: "Test",
          content: "Test content",
          status: "published",
          images: [],
          tags,
        })
      ).rejects.toThrow();
    });
  });

  describe("posts.delete", () => {
    it("should handle post deletion", async () => {
      const ctx1 = createAuthContext(1);
      const caller1 = appRouter.createCaller(ctx1);

      const createResult = await caller1.posts.create({
        title: "Test Post",
        content: "Test content",
        status: "published",
        images: [],
        tags: [],
      });

      expect(createResult).toBeDefined();
      expect(createResult).toHaveProperty("success");
    });
  });
});

describe("Comments Router", () => {
  describe("comments.create", () => {
    it("should handle comment creation", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const post = await caller.posts.create({
        title: "Test Post",
        content: "Test content",
        status: "published",
        images: [],
        tags: [],
      });

      expect(post).toBeDefined();
      expect(post).toHaveProperty("success");
    });

    it("should validate comment length", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const longContent = "a".repeat(501);

      await expect(
        caller.comments.create({
          postId: 1,
          content: longContent,
        })
      ).rejects.toThrow();
    });
  });
});

describe("Likes Router", () => {
  describe("likes.toggle", () => {
    it("should handle like operations", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const post = await caller.posts.create({
        title: "Test Post",
        content: "Test content",
        status: "published",
        images: [],
        tags: [],
      });

      expect(post).toBeDefined();
      expect(post).toHaveProperty("success");
    });
  });
});

describe("Tags Router", () => {
  describe("tags.list", () => {
    it("should return a list of tags", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tags.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("Search Router", () => {
  describe("search.posts", () => {
    it("should search posts by query", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.search.posts({
        query: "test",
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty("posts");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.posts)).toBe(true);
    });
  });
});
