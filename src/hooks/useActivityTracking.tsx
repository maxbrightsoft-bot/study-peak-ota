import { createActivyityApi } from "@/services/api/activityService";
import { ActivityAction } from "@/utils/enums";
import DeviceInfo from 'react-native-device-info'

export const useActivityTracking = () => {
  const track = async ({
    action,
    metaData = {},
  }: {
    action: ActivityAction;
    metaData?: any;
  }) => {
    try {
      await createActivyityApi({
        action,
        metaData: JSON.stringify(metaData),
        deviceInfo: {
          deviceId: await DeviceInfo?.getUniqueId(),
          platform: DeviceInfo?.getSystemName(),
          osVersion: DeviceInfo?.getSystemVersion(),
          appVersion: DeviceInfo?.getVersion(),
          model: DeviceInfo?.getModel(),
          ipAddress: await DeviceInfo?.getIpAddress(),
        }
      });
    } catch (err) {
      console.error("Track failed:", err);
    }
  };

  return { track };
};