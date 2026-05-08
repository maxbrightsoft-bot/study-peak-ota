import { createActivyityBulkApi } from "@/services/api/activityService";
import { ActivityAction, ActivityResource, AppScreen } from "@/utils/enums";
import { CreateActivityRequest } from "@/utils/types/activity";
import DeviceInfo from 'react-native-device-info'
import { useEffect, useCallback } from "react";
import useServerTime from "./useServerTime";

class TrackingManager {
  private queue: CreateActivityRequest[] = [];
  private timer: any = null;
  private isProcessing = false;

  async add(event: CreateActivityRequest) {
    this.queue.push(event);
    if (this.queue.length >= 10 && !this.isProcessing) {
      await this.flush();
    } else if (!this.timer && !this.isProcessing) {
      this.timer = setTimeout(() => this.flush(), 5000);
    }
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.queue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      await createActivyityBulkApi(eventsToSend);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 409 && status !== 400) {
        console.error("Bulk track failed:", err);
        this.queue = [...eventsToSend, ...this.queue];
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

const trackingManager = new TrackingManager();

type Props = {
  screen?: AppScreen;
}

let cachedDeviceInfo: any = null;

const getDeviceInfo = async () => {
  if (cachedDeviceInfo) return cachedDeviceInfo;
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const platform = DeviceInfo.getSystemName();
    const osVersion = DeviceInfo.getSystemVersion();
    const appVersion = DeviceInfo.getVersion();
    const deviceModel = DeviceInfo.getModel();

    let timezone = 'UTC';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      const offset = -new Date().getTimezoneOffset();
      const sign = offset >= 0 ? '+' : '-';
      const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
      const m = String(Math.abs(offset) % 60).padStart(2, '0');
      timezone = `UTC${sign}${h}:${m}`;
    }

    cachedDeviceInfo = { deviceId, platform, osVersion, appVersion, deviceModel, timezone };
  } catch (e) {
    console.error("getDeviceInfo error:", e);
    return {
      deviceId: 'unknown',
      platform: 'unknown',
      osVersion: 'unknown',
      appVersion: 'unknown',
      deviceModel: 'unknown',
      timezone: 'UTC',
    };
  }
  return cachedDeviceInfo;
};

export const useActivityTracking = (props?: Props) => {
  const screen = props?.screen;
  const { getServerNow } = useServerTime();

  const track = useCallback(async ({
    action,
    metaData = {},
    resourceType,
    resourceId,
    triggeredAt
  }: {
    action: ActivityAction;
    metaData?: any;
    resourceType?: ActivityResource;
    resourceId?: string;
    triggeredAt?: string;
  }) => {
    const deviceInfo = await getDeviceInfo();
    const serverTime = new Date(getServerNow()).toISOString();
    const event: CreateActivityRequest = {
      action,
      metaData: JSON.stringify(metaData),
      screen,
      resourceType,
      resourceId,
      triggeredAt: triggeredAt ?? new Date(serverTime).toISOString(),
      ...deviceInfo,
    };

    console.log("track event", event)
    await trackingManager.add(event);
  }, [screen]);

  const trackError = useCallback((error: any, context?: any) => {
    track({
      action: ActivityAction.Error,
      resourceType: context?.resourceType,
      resourceId: context?.resourceId,
      triggeredAt: context?.triggeredAt,
      metaData: {
        message: error?.message || String(error),
        stack: error?.stack,
        ...context?.metaData
      }
    });
  }, [track]);

  const trackInfo = useCallback((message: string, context?: any) => {
    track({
      action: ActivityAction.Info,
      metaData: {
        message,
        context
      }
    });
  }, [track]);

  useEffect(() => {
    return () => {
      trackingManager.flush();
    };
  }, []);

  return { track, trackError, trackInfo, flush: () => trackingManager.flush() };
};