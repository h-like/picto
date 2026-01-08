import { useAuth } from "@clerk/nextjs";

export function usePlanAccess() {
    const { has } = useAuth();

    const isPro = has?.({ plan: "pro" }) || false;
    const isFree = !isPro

    const planAccess = {
        // 무료 플랜 기능
        resize: true,
        crop: true,
        adjust: true,
        text: true,

        // pro 기능
        background: isPro,
        ai_extender: isPro,
        ai_edit: isPro,
    }

    // 특정 toolId에 대해 현재 요금제가 접근 권한을 가지고 있는지 확인한다
    const hasAccess = (toolId) => {
        return planAccess[toolId] === true;
    };

    // 현재 요금제에서 사용할 수 없는(제한된) 도구들의 ID 목록을 반환한다
    const getRestrictedTools = () => {
        return Object.entries(planAccess)
            .filter(([_, hasAccess]) => !hasAccess)
            .map(([toolId]) => toolId);
    };

    const canCreateProject = (currentProjectCount) => {
        if (isPro) return true;
        return currentProjectCount < 3;
    };

    const canExport = (currentExportThisMonth) => {
        if (isPro) return true;
        return currentExportThisMonth < 20;
    };

    return {
        userPlan: isPro ? "pro" : "free_user",
        isPro,
        isFree,
        hasAccess,
        planAccess,
        getRestrictedTools,
        canCreateProject,
        canExport,
    };
}