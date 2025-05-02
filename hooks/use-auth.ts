import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface UseAuthReturn {
  userId: string | null;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  tenantId: string | null;
  isLoadingTenant: boolean;
  user: any;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { isLoaded, userId, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState<boolean>(false);

  // Fetch tenant ID when user is authenticated
  useEffect(() => {
    const fetchTenantId = async () => {
      if (isSignedIn && user?.username) {
        setIsLoadingTenant(true);
        try {
          const response = await fetch("/api/get-tenant-id", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: user.username }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setTenantId(data.tenant_id);
          } else {
            console.error("Failed to fetch tenant ID");
          }
        } catch (error) {
          console.error("Error fetching tenant ID:", error);
        } finally {
          setIsLoadingTenant(false);
        }
      }
    };

    fetchTenantId();
  }, [isSignedIn, user?.username]);

  return {
    userId: userId ?? null,
    isLoaded,
    isSignedIn,
    tenantId,
    isLoadingTenant,
    user,
    signOut,
  };
}

export default useAuth;