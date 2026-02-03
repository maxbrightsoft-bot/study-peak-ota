import { useCallback, useState } from "react";

const useDrawer = () => {
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialog = useCallback(() => {
    setOpenDialog(true);
  }, []);

  return {
    isOpenDialog,
    handleCloseDialog,
    handleOpenDialog,
  };
};

export default useDrawer;
