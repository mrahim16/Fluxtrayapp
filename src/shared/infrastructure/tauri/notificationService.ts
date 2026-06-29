export async function showNotification(
  title: string,
  body: string,
  icon?: string
): Promise<void> {
  try {
    const { isPermissionGranted, requestPermission, sendNotification } = await import(
      "@tauri-apps/plugin-notification"
    );

    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
      sendNotification({
        title,
        body,
        icon,
      });
    }
  } catch (error) {
    // Silently fail if Tauri notification plugin is not available
    console.debug("Notification service unavailable:", error);
  }
}
