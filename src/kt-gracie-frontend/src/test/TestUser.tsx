import { FormEvent, useState } from "react";
import { Gender, AgeBucket } from "../ENUMS/enums";
import {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateProgression,
    updateGracie,
} from "../services/userServices";
import type { User } from "../types/user";

export default function TestUser() {
    const [user, setUser] = useState<User | null>(getUser);
    const [log, setLog] = useState<string[]>([]);

    function addLog(msg: string) {
        setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    }

    function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            const created = createUser({
                firstName: fd.get("firstName") as string,
                ageBucket: fd.get("ageBucket") as AgeBucket,
                gender: fd.get("gender") as Gender,
            });
            setUser(created);
            addLog(`Created user ${created.anonymousId}`);
        } catch (err) {
            addLog(`Error: ${(err as Error).message}`);
        }
    }

    function handleRefresh() {
        const u = getUser();
        setUser(u);
        addLog(u ? "Refreshed from localStorage" : "No user in localStorage");
    }

    function handleUpdateName() {
        const name = prompt("New firstName:");
        if (!name) return;
        try {
            const updated = updateUser({ firstName: name });
            setUser(updated);
            addLog(`Updated firstName to "${updated.firstName}"`);
        } catch (err) {
            addLog(`Error: ${(err as Error).message}`);
        }
    }

    function handleUpdateCountry() {
        const country = prompt("Country (local-only):");
        if (!country) return;
        try {
            const updated = updateUser({ country });
            setUser(updated);
            addLog(`Updated country to "${country}"`);
        } catch (err) {
            addLog(`Error: ${(err as Error).message}`);
        }
    }

    function handleAddSubject() {
        try {
            const subjects = ["uncac", "policy-guide", "youthled", "forum-theatre", "uni-modules"];
            const current = user?.progression.subjectsStarted ?? [];
            const next = subjects.find((s) => !current.includes(s));
            if (!next) {
                addLog("All subjects already started");
                return;
            }
            const updated = updateProgression({ subjectsStarted: [...current, next] });
            setUser(updated);
            addLog(`Added subject "${next}" to subjectsStarted`);
        } catch (err) {
            addLog(`Error: ${(err as Error).message}`);
        }
    }

    function handleUpdateMood() {
        const moods = ["encouraging", "neutral", "concerned"] as const;
        const current = user?.gracie.mood ?? "encouraging";
        const next = moods[(moods.indexOf(current) + 1) % moods.length];
        try {
            const updated = updateGracie({ mood: next });
            setUser(updated);
            addLog(`Updated gracie mood to "${next}"`);
        } catch (err) {
            addLog(`Error: ${(err as Error).message}`);
        }
    }

    function handleDelete() {
        deleteUser();
        setUser(null);
        addLog("User deleted");
    }

    return (
        <div style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
            <h1>User CRUD Test Page</h1>

            {!user && (
                <form onSubmit={handleCreate} style={{ marginBottom: "1.5rem" }}>
                    <h2>Create User</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "300px" }}>
                        <input name="firstName" placeholder="First name" required />
                        <select name="ageBucket" required>
                            {Object.values(AgeBucket).map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                        <select name="gender" required>
                            {Object.values(Gender).map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                        <button type="submit">Create</button>
                    </div>
                </form>
            )}

            {user && (
                <div style={{ marginBottom: "1.5rem" }}>
                    <h2>Actions</h2>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button onClick={handleRefresh}>Refresh from localStorage</button>
                        <button onClick={handleUpdateName}>Update Name</button>
                        <button onClick={handleUpdateCountry}>Update Country</button>
                        <button onClick={handleAddSubject}>Add Subject</button>
                        <button onClick={handleUpdateMood}>Cycle Gracie Mood</button>
                        <button onClick={handleDelete} style={{ color: "red" }}>Delete User</button>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
                <h2>Current User State</h2>
                <pre
                    data-testid="user-state"
                    style={{
                        background: "#f4f4f4",
                        padding: "1rem",
                        borderRadius: "4px",
                        overflow: "auto",
                        maxHeight: "400px",
                    }}
                >
                    {user ? JSON.stringify(user, null, 2) : "No user"}
                </pre>
            </div>

            <div>
                <h2>Log</h2>
                <pre
                    data-testid="log"
                    style={{
                        background: "#1e1e1e",
                        color: "#0f0",
                        padding: "1rem",
                        borderRadius: "4px",
                        overflow: "auto",
                        maxHeight: "200px",
                    }}
                >
                    {log.length ? log.join("\n") : "No activity yet"}
                </pre>
            </div>
        </div>
    );
}
