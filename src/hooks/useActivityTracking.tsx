import { createActivyityApi } from "@/services/api/activityService";
import { ActivityAction } from "@/utils/enums";

export const useActivityTracking = () => {
  const track = async ({
    action,
    metaData = {},
  }: {
    action: ActivityAction;
    metaData?: any;
  }) => {
    try {
      console.log({ action, metaData });
      
      await createActivyityApi({
        action,
        metaData: JSON.stringify(metaData)
      });
    } catch (err) {
      console.error("Track failed:", err);
    }
  };

  return { track };
};