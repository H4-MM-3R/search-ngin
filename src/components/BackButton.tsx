"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

const BackButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      className="flex gap-2 items-center text-sm pb-2 text-white bg-black"
      variant="secondary"
    >
      <ChevronLeft className="h-4 w-4 text-white" />
      Back
    </Button>
  );
};

export default BackButton;
