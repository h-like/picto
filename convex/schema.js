import {defineSchema, defineTable} from "convex/server"
import {v} from "convex/values"

export default defineSchema({

    users: defineTable({
        name: v.string(),
        email: v.string(),
        tokenIdentifier: v.string(),
        imageUrl: v.optional(v.string()),

        plan: v.union(v.literal("free"), v.literal("pro")),

        // 요금제 한도 사용량 추적
        projectsUsed: v.number(),
        exportsThisMonth: v.number(),

        createdAt: v.number(),
        lastActiveAt: v.number(),
        
    })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name"}) // 유저 검색
    .searchIndex("search_email", { searchField: "email"}), // 유저 검색

    projects: defineTable({
        // 기본 프로젝트 정보
        title: v.string(),
        userId: v.id("users"),

        // 캔버스 차원과 상태
        canvasState: v.any(),  //Fabric.js 상태 직렬화
        width: v.number(),      // 캔버스 너비 in pixels
        height: v.number(),     // 캔버스 높이

        // 이미지 파이프라인 - 이미지 처리 상태 추적
        originalImageUrl: v.optional(v.string()),  // 업로드된 원본 이미지 URL
        currentImageUrl: v.optional(v.string()),    // 현재 프로젝트 이미지 URL
        thumbnailUrl: v.optional(v.string()),    // 썸네일 이미지 URL

        // 변화 상태
        activeTransformations: v.optional(v.string()), // 현재 imagekit  URL params

        // ai 기능 - 적용되었는지 추적
        backgroundRemoved: v.optional(v.boolean()),

        // 정리
        folderId: v.optional(v.id("folders")),

        // 타임스탬프
        createdAt: v.number(),
        updatedAt: v.number(), // 마지막 수정 시간
    })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"])
    .index("by_folder", ["folderId"]),  //  폴더별 프로젝트

    folders: defineTable({
        name: v.string(), // 폴더 이름
        userId: v.id("users"),  // 소유자
        createdAt: v.number(),
    })
    .index("by_user", ["userId"]), // 유저별 폴더


})

/*
플랜 정책 :
 - Free : 3 프로젝트, 월 20회 내보내기. 기본 기능만
 - Pro : 무제한 프로젝트/내보내기, 고급 AI 기능 접근
*/