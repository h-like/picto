import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// 폴더 목록 가져오기
export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

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

// 폴더 삭제하기 (내부 프로젝트는 보존)
export const deleteFolder = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("Unauthorized");

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found or access denied");
    }

    // 1. 이 폴더에 속한 프로젝트들을 찾아서 '꺼내기' (folderId를 null로 변경)
    const projectsInFolder = await ctx.db
      .query("projects")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .collect();

    for (const project of projectsInFolder) {
      await ctx.db.patch(project._id, {
        folderId: undefined, // 관계 끊기
      });
    }

    // 2. 폴더 삭제
    await ctx.db.delete(args.folderId);

    return { success: true };
  },
});
