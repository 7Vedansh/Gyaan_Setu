import { AnimationSpec, StoredTopic } from "@/types/store";

const TITLE_TO_LOTTIE_FILE: Record<string, string> = {
    "introduction to magnetic effect of current": "introduction_current.json",
    "magnetic needle and bar magnet": "magnetic_needle.json",
    "magnetic field around a wire": "magnetic_field_wire.json",
    "hans christian oerstead's observation": "oerstead.json",
    "activity to demonstrate magnetic effect of current": "coil_activity.json",
    "electric circuit and current flow": "circuit_flow.json",
    "removal of cell and current flow": "removal_cell.json",
    "connecting cells in a circuit": "series_cells.json",
    "lead-acid cells and ni-cd cells": "battery_types.json",
    "electricity and magnetism": "electricity_magnetism.json",
};

function normalizeFileName(fileName: unknown): string | null {
    if (typeof fileName !== "string") return null;
    const normalized = fileName.trim().split("/").pop() ?? "";
    return normalized.length > 0 ? normalized : null;
}

export function parseAnimationSpec(
    raw: unknown,
    titleHint?: string | null
): AnimationSpec | null {
    let parsed: Record<string, unknown> | null = null;

    if (typeof raw === "string" && raw.trim().length > 0) {
        try {
            parsed = JSON.parse(raw) as Record<string, unknown>;
        } catch {
            parsed = null;
        }
    } else if (raw && typeof raw === "object") {
        parsed = raw as Record<string, unknown>;
    }

    let lottie_file = normalizeFileName(parsed?.lottie_file);
    const titleKey = (titleHint ?? "").toLowerCase().trim();
    const fallbackFile = TITLE_TO_LOTTIE_FILE[titleKey] ?? null;

    // Upgrade generic placeholder specs to a specific lesson animation when available.
    if (!lottie_file || lottie_file === "concept_explain.json") {
        lottie_file = fallbackFile ?? lottie_file;
    }

    if (!lottie_file) return null;

    return {
        ...(parsed as AnimationSpec | null),
        lottie_file,
        play_mode: (parsed?.play_mode as string) ?? "loop",
        trigger: (parsed?.trigger as string) ?? "on_enter",
    };
}

export function hydrateTopicsWithAnimationSpec(topics: StoredTopic[]): StoredTopic[] {
    return topics.map((topic) => ({
        ...topic,
        microlessons: topic.microlessons.map((lesson) => ({
            ...lesson,
            animationSpec: parseAnimationSpec(
                lesson.animation_spec,
                lesson.title,
            ),
        })),
    }));
}
