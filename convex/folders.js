import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// 폴더 목록 가져오기
export const get = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return [];

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return folders;
  },
});

// 폴더 생성하기
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("Unauthorized");

    const folderId = await ctx.db.insert("folders", {
      name: args.name,
      userId: user._id,
      createdAt: Date.now(),
    });

    return folderId;
  },
});