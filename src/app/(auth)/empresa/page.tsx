"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TenantSelectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/entrar");
  }, [router]);

  return null;
}
