import { modules as staticModules } from "@/features/city/constants";
import type { Module } from "@/features/city/types";
import { leveled, pickLevel, type MaybeLeveled } from "@/features/settings/readingLevel";

/**
 * The corpus carries one wording per module. Until it carries three, borrow
 * the hand-written Simple / Advanced variants from the static module with
 * the same name (features/city/constants.ts) and keep the corpus text as the
 * Standard wording, so the reading-level setting still changes what learners
 * see in the drawer and the quiz screens. A module the constants don't know
 * is passed through untouched and shows the corpus text at every level.
 */
export function withLeveledCopy(module: Module): Module {
    const twin = staticModules.find(
        (m) => m.name.trim().toLowerCase() === module.name.trim().toLowerCase(),
    );
    if (!twin) return module;

    return {
        ...module,
        description: overlay(module.description, twin.description),
        objectives: overlay(module.objectives, twin.objectives),
        expectations: overlay(module.expectations, twin.expectations),
    };
}

/** Corpus text becomes Standard; Simple and Advanced come from the twin. */
function overlay<T>(corpus: MaybeLeveled<T>, twin: MaybeLeveled<T>): MaybeLeveled<T> {
    const standard = pickLevel(corpus, "standard");
    return leveled(
        pickLevel(twin, "simple"),
        standard,
        pickLevel(twin, "advanced"),
    );
}
