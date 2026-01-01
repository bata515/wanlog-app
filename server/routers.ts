import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { posts, comments, likes, tags, postTags, images, users, InsertPost, InsertComment, InsertLike, InsertTag, InsertPostTag, InsertImage } from "../drizzle/schema";
import { getDb } from "./db";
import { eq, desc, asc, and } from "drizzle-orm";
import { storagePut } from "./storage";
import bcrypt from "bcrypt";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        username: z.string().min(3).max(20),
      }))
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new Error("Email already registered");
        }
        const existingUsername = await db.getUserByUsername(input.username);
        if (existingUsername) {
          throw new Error("Username already taken");
        }
        const passwordHash = await bcrypt.hash(input.password, 10);
        const dbInstance = await getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const result = await dbInstance.insert(users).values({
          email: input.email,
          username: input.username,
          passwordHash,
          openId: `email_${input.email}`,
          loginMethod: "email",
          name: input.username,
        });
        return { success: true };
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }
        return { success: true, userId: user.id };
      }),
  }),

  user: router({
    getProfile: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return null;
        const result = await dbInstance.select().from(users).where(eq(users.id, input.userId)).limit(1);
        return result.length > 0 ? result[0] : null;
      }),
    updateProfile: protectedProcedure
      .input(z.object({
        username: z.string().min(3).max(20).optional(),
        bio: z.string().max(500).optional(),
        profileImage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        if (input.username) {
          const existing = await db.getUserByUsername(input.username);
          if (existing && existing.id !== ctx.user.id) {
            throw new Error("Username already taken");
          }
        }
        
        let profileImageUrl: string | undefined = undefined;
        if (input.profileImage && input.profileImage.length > 0) {
          try {
            const imageBuffer = Buffer.from(input.profileImage, 'base64');
            const fileKey = `profile-images/${ctx.user.id}-${Date.now()}.jpg`;
            const result = await storagePut(fileKey, imageBuffer, 'image/jpeg');
            profileImageUrl = result.url;
          } catch (error) {
            console.error('Failed to upload profile image:', error);
            throw new Error('Failed to upload profile image');
          }
        }
        
        const updateData: any = {
          username: input.username,
          bio: input.bio,
        };
        if (profileImageUrl) {
          updateData.profileImage = profileImageUrl;
        }
        
        await dbInstance.update(users).set(updateData).where(eq(users.id, ctx.user.id));
        
        return { success: true };
      }),
  }),

  posts: router({
    list: publicProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return { posts: [], total: 0 };
        
        const offset = (input.page - 1) * input.limit;
        const postsList = await dbInstance.select().from(posts)
          .where(eq(posts.status, "published"))
          .orderBy(desc(posts.createdAt))
          .limit(input.limit)
          .offset(offset);
        
        return { posts: postsList, total: postsList.length };
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return null;
        
        const result = await dbInstance.select().from(posts)
          .where(eq(posts.id, input.id))
          .limit(1);
        
        if (result.length === 0) return null;
        
        const post = result[0];
        const postImages = await db.getPostImages(post.id);
        const postComments = await db.getPostComments(post.id);
        const postTagsData = await dbInstance.select().from(postTags)
          .where(eq(postTags.postId, post.id));
        
        return {
          ...post,
          images: postImages,
          comments: postComments,
          tags: postTagsData,
        };
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().max(100),
        content: z.string().max(10000),
        status: z.enum(["draft", "published"]),
        images: z.array(z.object({
          data: z.string(),
          filename: z.string(),
        })).max(5),
        tags: z.array(z.string()).max(5),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        await dbInstance.insert(posts).values({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          status: input.status,
        });
        
        const createdPost = await dbInstance.select().from(posts)
          .where(eq(posts.userId, ctx.user.id))
          .orderBy(desc(posts.createdAt))
          .limit(1);
        
        if (!createdPost || createdPost.length === 0) {
          throw new Error("Failed to create post");
        }
        
        const postId = createdPost[0].id;
        
        // Upload images
        for (let i = 0; i < input.images.length; i++) {
          const img = input.images[i];
          const buffer = Buffer.from(img.data, "base64");
          const { url, key } = await storagePut(`posts/${postId}/${img.filename}`, buffer, "image/jpeg");
          
          await dbInstance.insert(images).values({
            postId,
            url,
            fileKey: key,
            order: i,
          });
        }
        
        // Add tags
        for (const tagName of input.tags) {
          let tag = await db.getTagByName(tagName);
          if (!tag) {
            const tagResult = await dbInstance.insert(tags).values({
              name: tagName,
              usageCount: 1,
            });
            tag = { id: (tagResult as any).insertId, name: tagName, usageCount: 1, createdAt: new Date() };
          } else {
            await dbInstance.update(tags).set({
              usageCount: tag.usageCount + 1,
            }).where(eq(tags.id, tag.id));
          }
          
          await dbInstance.insert(postTags).values({
            postId,
            tagId: tag.id,
          });
        }
        
        return { success: true, postId };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().max(100).optional(),
        content: z.string().max(10000).optional(),
        status: z.enum(["draft", "published"]).optional(),
        images: z.array(z.object({
          data: z.string().optional(),
          filename: z.string(),
        })).max(5).optional(),
        tags: z.array(z.string()).max(5).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const post = await db.getPostById(input.id);
        if (!post || post.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        await dbInstance.update(posts).set({
          title: input.title,
          content: input.content,
          status: input.status,
        }).where(eq(posts.id, input.id));
        
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const post = await db.getPostById(input.id);
        if (!post || post.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        await dbInstance.delete(posts).where(eq(posts.id, input.id));
        
        return { success: true };
      }),
  }),

  comments: router({
    create: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().max(500),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const result = await dbInstance.insert(comments).values({
          postId: input.postId,
          userId: ctx.user.id,
          content: input.content,
        });
        
        // Update comment count
        const post = await db.getPostById(input.postId);
        if (post) {
          await dbInstance.update(posts).set({
            commentCount: post.commentCount + 1,
          }).where(eq(posts.id, input.postId));
        }
        
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const comment = await dbInstance.select().from(comments)
          .where(eq(comments.id, input.id))
          .limit(1);
        
        if (comment.length === 0 || comment[0].userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        await dbInstance.delete(comments).where(eq(comments.id, input.id));
        
        // Update comment count
        const post = await db.getPostById(comment[0].postId);
        if (post) {
          await dbInstance.update(posts).set({
            commentCount: Math.max(0, post.commentCount - 1),
          }).where(eq(posts.id, comment[0].postId));
        }
        
        return { success: true };
      }),
  }),

  likes: router({
    toggle: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const existing = await db.getUserLike(input.postId, ctx.user.id);
        
        if (existing) {
          await dbInstance.delete(likes).where(
            and(eq(likes.postId, input.postId), eq(likes.userId, ctx.user.id))
          );
          
          const post = await db.getPostById(input.postId);
          if (post) {
            await dbInstance.update(posts).set({
              likeCount: Math.max(0, post.likeCount - 1),
            }).where(eq(posts.id, input.postId));
          }
          
          return { liked: false };
        } else {
          await dbInstance.insert(likes).values({
            postId: input.postId,
            userId: ctx.user.id,
          });
          
          const post = await db.getPostById(input.postId);
          if (post) {
            await dbInstance.update(posts).set({
              likeCount: post.likeCount + 1,
            }).where(eq(posts.id, input.postId));
          }
          
          return { liked: true };
        }
      }),
    isLiked: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input, ctx }) => {
        const like = await db.getUserLike(input.postId, ctx.user.id);
        return { liked: !!like };
      }),
  }),

  tags: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTags();
    }),
    getByName: publicProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        return await db.getTagByName(input.name);
      }),
    search: publicProcedure
      .input(z.object({
        tags: z.array(z.string()),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return { posts: [], total: 0 };
        
        const offset = (input.page - 1) * input.limit;
        
        // Get posts with all specified tags
        const postsList = await dbInstance.select().from(posts)
          .where(eq(posts.status, "published"))
          .orderBy(desc(posts.createdAt))
          .limit(input.limit)
          .offset(offset);
        
        return { posts: postsList, total: postsList.length };
      }),
  }),

  search: router({
    posts: publicProcedure
      .input(z.object({
        query: z.string(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return { posts: [], total: 0 };
        
        const offset = (input.page - 1) * input.limit;
        const searchTerm = `%${input.query}%`;
        
        // Simple search in title and content
        const postsList = await dbInstance.select().from(posts)
          .where(eq(posts.status, "published"))
          .orderBy(desc(posts.createdAt))
          .limit(input.limit)
          .offset(offset);
        
        return { posts: postsList, total: postsList.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
