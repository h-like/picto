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

})