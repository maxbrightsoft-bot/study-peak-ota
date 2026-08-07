// @ts-nocheck
import { useState } from "react";

const useTooltip = () => {
  const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);

  const handleCloseTooltip = () => {
    setIsOpenTooltip(false);
  };

  const handleOpenTooltip = () => {
    setIsOpenTooltip(true);
  };
  return {
    isOpenTooltip,
    handleCloseTooltip,
    handleOpenTooltip,
  };
};

export default useTooltip;
