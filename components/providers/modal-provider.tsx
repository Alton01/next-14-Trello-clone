"use client";

import { CardModal } from "@/components/modals/card-modal";
import { useEffect, useState } from "react";
import { ProModal } from "@/components/modals/card-modal/pro-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  //TO PROTECT FROM HYDRATION ERRORS.

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CardModal />
      <ProModal />
    </>
  );
};
