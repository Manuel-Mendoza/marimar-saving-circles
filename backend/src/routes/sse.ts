import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { drawSessions } from "../db/tables/draw-sessions.js";
import { userGroups } from "../db/tables/user-groups.js";
import { db } from "../config/database.js";
import { authenticate } from "../middleware/auth.js";

const sseRoute = new Hono();

// SSE endpoint for draw progress
sseRoute.get("/groups/:groupId/sse", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as any;
    const groupId = parseInt(c.req.param("groupId"));

    // Check if user is in the group
    const userInGroup = await db
      .select()
      .from(userGroups)
      .where(
        and(
          eq(userGroups.userId, userPayload.id),
          eq(userGroups.groupId, groupId),
        ),
      )
      .limit(1);

    if (userInGroup.length === 0) {
      return c.json(
        {
          success: false,
          message: "No tienes acceso a este grupo",
        },
        403,
      );
    }

    // Set SSE headers
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Headers", "Cache-Control");

    // Get active draw session
    const [session] = await db
      .select()
      .from(drawSessions)
      .where(
        and(
          eq(drawSessions.groupId, groupId),
          eq(drawSessions.status, "IN_PROGRESS"),
        ),
      )
      .limit(1);

    if (!session) {
      // Send completion event if no active session
      const data = `data: ${JSON.stringify({
        type: "DRAW_COMPLETED",
        message: "No hay sorteo en progreso",
      })}\n\n`;
      c.body(data);
      return;
    }

    // Send initial event
    const initialData = `data: ${JSON.stringify({
      type: "DRAW_STARTED",
      sessionId: session.id,
      totalSteps: session.totalSteps,
      currentStep: session.currentStep,
      message: "Sorteo iniciado",
    })}\n\n`;
    c.body(initialData);

    // Simulate animation steps
    const finalPositions = session.finalPositions as any[];
    let currentStep = 0;

    const interval = setInterval(async () => {
      currentStep++;
      
      if (currentStep <= session.totalSteps) {
        // Send progress update
        const progressData = `data: ${JSON.stringify({
          type: "DRAW_PROGRESS",
          sessionId: session.id,
          currentStep: currentStep,
          totalSteps: session.totalSteps,
          currentWinner: finalPositions[currentStep - 1],
          message: `Revelando posición ${currentStep}...`,
        })}\n\n`;
        c.body(progressData);

        // Update session progress
        await db
          .update(drawSessions)
          .set({ currentStep: currentStep })
          .where(eq(drawSessions.id, session.id));
      } else {
        // Send completion event
        const completionData = `data: ${JSON.stringify({
          type: "DRAW_COMPLETED",
          sessionId: session.id,
          finalPositions: finalPositions,
          message: "Sorteo completado exitosamente",
        })}\n\n`;
        c.body(completionData);

        // Update session status
        await db
          .update(drawSessions)
          .set({ 
            status: "COMPLETED",
            endTime: new Date(),
            currentStep: session.totalSteps,
          })
          .where(eq(drawSessions.id, session.id));

        clearInterval(interval);
      }
    }, 1000); // 1 second intervals

    // Handle client disconnect
    c.res.headers.set("Connection", "keep-alive");

    return c.res;
  } catch (error) {
    console.error("Error en SSE:", error);
    return c.json(
      {
        success: false,
        message: "Error en la transmisión en tiempo real",
      },
      500,
    );
  }
});

// Get draw session status
sseRoute.get("/groups/:groupId/draw-status", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as any;
    const groupId = parseInt(c.req.param("groupId"));

    // Check if user is in the group
    const userInGroup = await db
      .select()
      .from(userGroups)
      .where(
        and(
          eq(userGroups.userId, userPayload.id),
          eq(userGroups.groupId, groupId),
        ),
      )
      .limit(1);

    if (userInGroup.length === 0) {
      return c.json(
        {
          success: false,
          message: "No tienes acceso a este grupo",
        },
        403,
      );
    }

    // Get active draw session
    const [session] = await db
      .select()
      .from(drawSessions)
      .where(eq(drawSessions.groupId, groupId))
      .orderBy(drawSessions.startTime, "desc")
      .limit(1);

    if (!session) {
      return c.json({
        success: true,
        data: {
          status: "NO_SESSION",
          message: "No hay sesión de sorteo activa",
        },
      });
    }

    return c.json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        currentStep: session.currentStep,
        totalSteps: session.totalSteps,
        finalPositions: session.finalPositions,
      },
    });
  } catch (error) {
    console.error("Error obteniendo estado del sorteo:", error);
    return c.json(
      {
        success: false,
        message: "Error obteniendo estado del sorteo",
      },
      500,
    );
  }
});

export default sseRoute;