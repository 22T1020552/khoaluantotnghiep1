"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { authService } from "@/services/authService";
import { getStoredAuthSession } from "@/services/api";

const ROLE_BY_PREFIX: Array<{ prefix: string; role: string }> = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/doctor", role: "DOCTOR" },
  { prefix: "/cashier", role: "CASHIER" },
  { prefix: "/receptionist", role: "RECEPTIONIST" },
  { prefix: "/dashboard", role: "PATIENT" },
  { prefix: "/appointments", role: "PATIENT" },
  { prefix: "/booking", role: "PATIENT" },
  { prefix: "/patient-history", role: "PATIENT" },
  { prefix: "/invoices", role: "PATIENT" },
];

const resolveExpectedRole = (pathname: string) => {
  const matched = ROLE_BY_PREFIX.find(({ prefix }) => pathname.startsWith(prefix));
  return matched?.role ?? null;
};

export function RoleSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const expectedRole = resolveExpectedRole(pathname);
  const kickedOutRef = useRef(false);

  useEffect(() => {
    if (!expectedRole) {
      kickedOutRef.current = false;
      return;
    }

    let disposed = false;

    const kickOut = (message: string) => {
      if (kickedOutRef.current || disposed) {
        return;
      }

      kickedOutRef.current = true;

      // Avoid runtime race where toast is mounted/unmounted during immediate redirects.
      try {
        toast.error(message);
      } catch {
        // Ignore toast rendering failures and still enforce redirect.
      }

      void authService.logout();

      if (!disposed) {
        router.replace("/signin");
      }
    };

    const validateRole = async () => {
      const beforeRefresh = getStoredAuthSession();
      if (!beforeRefresh) {
        kickOut("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      if (beforeRefresh.role !== expectedRole) {
        kickOut("Bạn không còn quyền truy cập vào giao diện này.");
        return;
      }

      try {
        const refreshed = await authService.refreshSession();
        if (!refreshed || disposed) {
          if (!disposed) {
            kickOut("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }
          return;
        }

        if (refreshed.role !== expectedRole) {
          kickOut("Bạn không còn quyền truy cập vào giao diện này.");
        }
      } catch {
        kickOut("Không thể xác thực quyền truy cập. Vui lòng đăng nhập lại.");
      }
    };

    void validateRole();

    const onStorage = (event: StorageEvent) => {
      if (event.key === "clinic-auth-session" && event.newValue === null) {
        void kickOut("Bạn không còn quyền truy cập vào giao diện này.");
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      disposed = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [expectedRole, router]);

  return null;
}
