import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationType } from "../interfaces/types";

export const getMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    return NotificationRepository.findByUserId(context.userId);
  });

export const getUnreadCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    return NotificationRepository.countUnread(context.userId);
  });

export const markAsRead = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await NotificationRepository.markRead(data.id, context.userId);
    return { success: true };
  });

export const markAllRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await NotificationRepository.markAllRead(context.userId);
    return { success: true };
  });

export const sendNotification = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        userId: z.string().uuid().nullable().optional(),
        title: z.string().min(1),
        message: z.string().min(1),
        type: z.enum(["info", "success", "warning", "error"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const notif = await NotificationRepository.insert({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type as NotificationType,
    });
    return notif;
  });

export const deleteNotification = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await NotificationRepository.deleteById(data.id, context.userId);
    return { success: true };
  });
