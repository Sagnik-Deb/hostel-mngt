import { prisma } from "./prisma";
import { sendNotificationEmail } from "./email";

import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    // Save in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });

    // Send email notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user?.email) {
      await sendNotificationEmail(user.email, title, message);
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function createBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  const promises = userIds.map((userId) =>
    createNotification({ userId, type, title, message, link })
  );
  return Promise.allSettled(promises);
}

export async function notifyHostelAdmins(
  hostelId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  const admins = await prisma.user.findMany({
    where: {
      hostelId,
      role: { in: ["ADMIN", "PRIMARY_ADMIN"] },
      status: "ACTIVE",
      adminState: "APPROVED",
    },
    select: { id: true },
  });

  return createBulkNotifications(
    admins.map((a: { id: string }) => a.id),
    type,
    title,
    message,
    link
  );
}
