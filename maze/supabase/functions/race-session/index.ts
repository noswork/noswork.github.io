import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
}

const ALLOWED_MODES = new Set(["race", "dark"]);
const ALLOWED_TARGETS_BY_SIZE: Record<string, Set<number>> = {
    teensy: new Set([5, 10, 20]),
    mini: new Set([5, 10, 15]),
    medium: new Set([3, 5, 10])
};
// Dark mode always has target = 1 (single maze)
const ALLOWED_DARK_TARGETS_BY_SIZE: Record<string, Set<number>> = {
    teensy: new Set([1]),
    mini: new Set([1]),
    medium: new Set([1]),
    mighty: new Set([1]),
    mega: new Set([1])
};
// Combine all allowed sizes from both modes
const ALLOWED_SIZES = new Set([
    ...Object.keys(ALLOWED_TARGETS_BY_SIZE),
    ...Object.keys(ALLOWED_DARK_TARGETS_BY_SIZE)
]);
const MAX_SESSION_SECONDS = 60 * 60; // 60 minutes

type StartPayload = {
    mode: string;
    size: string;
    target: number;
};

type CompletePayload = {
    session_id: string;
    total_steps?: number;
    client_elapsed_seconds?: number;
};

type RequestBody =
    | { action: "start"; payload: StartPayload }
    | { action: "complete"; payload: CompletePayload };

const nowIso = () => new Date().toISOString();

const sanitizeSteps = (value: unknown, mazeTarget: number): number | null => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
    }

    const rounded = Math.round(value);
    if (rounded <= 0) {
        return null;
    }

    const minReasonable = Math.max(mazeTarget, 5);
    const maxReasonable = Math.min(minReasonable * 5000, 200000);
    return Math.min(Math.max(rounded, minReasonable), maxReasonable);
};

const toJsonResponse = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
        }
    });

const createAuthedClient = (req: Request) =>
    createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        },
        global: {
            headers: {
                Authorization: req.headers.get("Authorization") ?? ""
            }
        }
    });

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return toJsonResponse(405, {
            success: false,
            error: {
                code: "METHOD_NOT_ALLOWED",
                message: "Only POST is supported."
            }
        });
    }

    let body: RequestBody;
    try {
        body = await req.json();
    } catch (_error) {
        return toJsonResponse(400, {
            success: false,
            error: {
                code: "INVALID_JSON",
                message: "Request body must be valid JSON."
            }
        });
    }

    if (!body || typeof body !== "object" || !("action" in body)) {
        return toJsonResponse(400, {
            success: false,
            error: {
                code: "INVALID_REQUEST",
                message: "Missing action in request body."
            }
        });
    }

    const supabase = createAuthedClient(req);
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return toJsonResponse(401, {
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Valid Supabase session is required."
            }
        });
    }

    const userId = user.id;

    if (body.action === "start") {
        const payload = body.payload as StartPayload | undefined;
        if (!payload) {
            return toJsonResponse(400, {
                success: false,
                error: {
                    code: "INVALID_REQUEST",
                    message: "Missing payload."
                }
            });
        }

        const { mode, size, target } = payload;
        
        // Validate mode
        if (!ALLOWED_MODES.has(mode)) {
            return toJsonResponse(400, {
                success: false,
                error: {
                    code: "INVALID_SESSION_CONFIG",
                    message: "Unsupported mode."
                }
            });
        }
        
        // Validate size and target based on mode
        if (mode === "dark") {
            // Dark mode: check if size exists in dark mode sizes
            const allowedTargets = ALLOWED_DARK_TARGETS_BY_SIZE[size];
            if (!allowedTargets) {
                return toJsonResponse(400, {
                    success: false,
                    error: {
                        code: "INVALID_SESSION_CONFIG",
                        message: "Unsupported size for dark mode."
                    }
                });
            }
            if (!allowedTargets.has(target)) {
                return toJsonResponse(400, {
                    success: false,
                    error: {
                        code: "INVALID_SESSION_CONFIG",
                        message: "Unsupported target for this mode and size."
                    }
                });
            }
        } else {
            // Race mode: check if size exists in race mode sizes
            const allowedTargets = ALLOWED_TARGETS_BY_SIZE[size];
            if (!allowedTargets) {
                return toJsonResponse(400, {
                    success: false,
                    error: {
                        code: "INVALID_SESSION_CONFIG",
                        message: "Unsupported size for race mode."
                    }
                });
            }
            if (!allowedTargets.has(target)) {
                return toJsonResponse(400, {
                    success: false,
                    error: {
                        code: "INVALID_SESSION_CONFIG",
                        message: "Unsupported target for this mode and size."
                    }
                });
            }
        }

        const sessionId = crypto.randomUUID();
        const startedAt = nowIso();

        await adminClient
            .from("race_sessions")
            .update({
                status: "abandoned",
                updated_at: startedAt
            })
            .eq("user_id", userId)
            .eq("status", "active");

        const { error: insertError } = await adminClient.from("race_sessions").insert({
            id: sessionId,
            user_id: userId,
            mode,
            size,
            target,
            started_at: startedAt,
            status: "active",
            created_at: startedAt,
            updated_at: startedAt
        });

        if (insertError) {
            console.error("[race-session] Failed to create session", insertError);
            return toJsonResponse(500, {
                success: false,
                error: {
                    code: "SESSION_CREATE_FAILED",
                    message: "Unable to start race session."
                }
            });
        }

        return toJsonResponse(200, {
            success: true,
            session: {
                id: sessionId,
                mode,
                size,
                target,
                started_at: startedAt,
                expires_at: new Date(Date.now() + MAX_SESSION_SECONDS * 1000).toISOString()
            }
        });
    }

    if (body.action === "complete") {
        const payload = body.payload as CompletePayload | undefined;
        if (!payload) {
            return toJsonResponse(400, {
                success: false,
                error: {
                    code: "INVALID_REQUEST",
                    message: "Missing payload."
                }
            });
        }

        const { session_id: sessionId, total_steps: stepsRaw, client_elapsed_seconds: clientSecondsRaw } = payload;

        if (!sessionId || typeof sessionId !== "string") {
            return toJsonResponse(400, {
                success: false,
                error: {
                    code: "INVALID_SESSION_ID",
                    message: "Session ID must be a string."
                }
            });
        }

        const {
            data: session,
            error: sessionError
        } = await adminClient
            .from("race_sessions")
            .select("*")
            .eq("id", sessionId)
            .maybeSingle();

        if (sessionError) {
            console.error("[race-session] Failed to load session", sessionError);
            return toJsonResponse(500, {
                success: false,
                error: {
                    code: "SESSION_LOOKUP_FAILED",
                    message: "Unable to verify session."
                }
            });
        }

        if (!session || session.user_id !== userId) {
            return toJsonResponse(404, {
                success: false,
                error: {
                    code: "SESSION_NOT_FOUND",
                    message: "Session does not exist or is not owned by user."
                }
            });
        }

        if (session.status !== "active") {
            return toJsonResponse(409, {
                success: false,
                error: {
                    code: "SESSION_NOT_ACTIVE",
                    message: "Session has already been finalized."
                }
            });
        }

        const startedAtMs = new Date(session.started_at).getTime();
        if (!Number.isFinite(startedAtMs)) {
            return toJsonResponse(422, {
                success: false,
                error: {
                    code: "INVALID_SESSION_START",
                    message: "Session start time is invalid."
                }
            });
        }

        const now = Date.now();
        const elapsedMs = now - startedAtMs;
        if (elapsedMs <= 0) {
            return toJsonResponse(422, {
                success: false,
                error: {
                    code: "INVALID_ELAPSED_TIME",
                    message: "Elapsed time must be positive."
                }
            });
        }

        if (elapsedMs > MAX_SESSION_SECONDS * 1000) {
            const expiredAt = nowIso();
            await adminClient
                .from("race_sessions")
                .update({
                    status: "expired",
                    updated_at: expiredAt,
                    completed_at: expiredAt
                })
                .eq("id", sessionId);

            return toJsonResponse(400, {
                success: false,
                error: {
                    code: "SESSION_EXPIRED",
                    message: "Session exceeded the maximum allowed duration."
                }
            });
        }

        const serverSeconds = Math.max(1, Math.round(elapsedMs / 1000));
        const clientSeconds = typeof clientSecondsRaw === "number" && Number.isFinite(clientSecondsRaw)
            ? Math.max(0, Math.round(clientSecondsRaw))
            : null;
        const sanitizedSteps = sanitizeSteps(stepsRaw, session.target);

        const completionTimestamp = new Date(now).toISOString();

        const { error: updateError } = await adminClient
            .from("race_sessions")
            .update({
                status: "completed",
                completed_at: completionTimestamp,
                client_seconds: clientSeconds,
                client_steps: typeof stepsRaw === "number" && Number.isFinite(stepsRaw) ? Math.round(stepsRaw) : null,
                server_seconds: serverSeconds,
                server_steps: sanitizedSteps,
                updated_at: completionTimestamp
            })
            .eq("id", sessionId);

        if (updateError) {
            console.error("[race-session] Failed to finalize session", updateError);
            return toJsonResponse(500, {
                success: false,
                error: {
                    code: "SESSION_COMPLETE_FAILED",
                    message: "Unable to finalize session."
                }
            });
        }

        let username = (user.user_metadata as Record<string, unknown> | null)?.username;
        if (!username || typeof username !== "string") {
            const {
                data: profile,
                error: profileError
            } = await adminClient
                .from("profiles")
                .select("username")
                .eq("id", userId)
                .maybeSingle();

            if (!profileError && profile?.username) {
                username = profile.username;
            }
        }

        if (!username || typeof username !== "string") {
            username = user.email ?? "Player";
        }

        const leaderboardPayload = {
            user_id: userId,
            username,
            mode: session.mode,
            size: session.size,
            target: session.target,
            total_seconds: serverSeconds,
            total_steps: sanitizedSteps,
            completed_at: completionTimestamp
        };

        let personalBest = false;

        const {
            data: existing,
            error: fetchExistingError
        } = await adminClient
            .from("race_leaderboard")
            .select("id, total_seconds, total_steps")
            .eq("user_id", userId)
            .eq("mode", session.mode)
            .eq("size", session.size)
            .eq("target", session.target)
            .maybeSingle();

        if (fetchExistingError) {
            console.error("[race-session] Failed to load leaderboard entry", fetchExistingError);
            return toJsonResponse(500, {
                success: false,
                error: {
                    code: "LEADERBOARD_FETCH_FAILED",
                    message: "Unable to update leaderboard."
                }
            });
        }

        if (!existing) {
            const { error: insertLeaderboardError } = await adminClient
                .from("race_leaderboard")
                .insert(leaderboardPayload);

            if (insertLeaderboardError) {
                console.error("[race-session] Failed to insert leaderboard entry", insertLeaderboardError);
                return toJsonResponse(500, {
                    success: false,
                    error: {
                        code: "LEADERBOARD_INSERT_FAILED",
                        message: "Unable to save leaderboard entry."
                    }
                });
            }

            personalBest = true;
        } else {
            const isBetterTime = serverSeconds < existing.total_seconds;
            const isSameTimeBetterSteps = serverSeconds === existing.total_seconds
                && (sanitizedSteps ?? Number.MAX_SAFE_INTEGER) < (existing.total_steps ?? Number.MAX_SAFE_INTEGER);

            if (isBetterTime || isSameTimeBetterSteps) {
                const { error: updateLeaderboardError } = await adminClient
                    .from("race_leaderboard")
                    .update({
                        total_seconds: serverSeconds,
                        total_steps: sanitizedSteps,
                        completed_at: completionTimestamp
                    })
                    .eq("id", existing.id);

                if (updateLeaderboardError) {
                    console.error("[race-session] Failed to update leaderboard entry", updateLeaderboardError);
                    return toJsonResponse(500, {
                        success: false,
                        error: {
                            code: "LEADERBOARD_UPDATE_FAILED",
                            message: "Unable to update leaderboard entry."
                        }
                    });
                }

                personalBest = true;
            }
        }

        return toJsonResponse(200, {
            success: true,
            result: {
                total_seconds: serverSeconds,
                total_steps: sanitizedSteps,
                personal_best: personalBest
            }
        });
    }

    return toJsonResponse(400, {
        success: false,
        error: {
            code: "UNKNOWN_ACTION",
            message: "Unsupported action."
        }
    });
});


