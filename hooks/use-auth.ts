import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface UseAuthReturn {
  userId: string | null;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  tenantId: string | null;
  isLoadingTenant: boolean;
  user: any; // Consider using a more specific type if available from Clerk
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { isLoaded, userId, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser(); // user object might contain publicMetadata directly
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState<boolean>(false);

  // Detect dev mode (all routes public) by checking a global flag set in _app or layout if needed
  // For now, we check if window exists and location.pathname is public (client-side only)
  useEffect(() => {
    // If not signed in and in dev mode (all routes public), set test tenant id
    if (!isSignedIn && typeof window !== 'undefined') {
      // This matches the wildcard in middleware.ts
      setTenantId('9999');
      if (isLoadingTenant) setIsLoadingTenant(false);
      return;
    }

    // Attempt to get tenantId directly from user object first
    if (isSignedIn && user?.publicMetadata?.tenantId) {
      const clerkTenantId = user.publicMetadata.tenantId as string;
      if (clerkTenantId !== tenantId) { // Avoid unnecessary state updates
         setTenantId(clerkTenantId);
      }
      // If we got it from user object, no need to fetch or set loading
      if (isLoadingTenant) setIsLoadingTenant(false);
      return; // Exit early
    }

    // If user is signed in but tenantId wasn't in user.publicMetadata (or user is loading),
    // fetch from the API endpoint.
    if (isSignedIn && !tenantId) { // Only fetch if signed in and tenantId is not yet set
      const fetchTenantId = async () => {
        setIsLoadingTenant(true);
        try {
          // Use GET request - auth is handled by middleware/Clerk
          const response = await fetch("/api/get-tenant-id"); 

          if (response.ok) {
            const data = await response.json();
            if (data.tenantId) {
              setTenantId(data.tenantId);
            } else {
              // This case should ideally be handled by the API returning 404
              console.error("API returned OK but no tenantId found.");
              setTenantId(null); // Ensure state is cleared if not found
            }
          } else {
            console.error(`Failed to fetch tenant ID: ${response.status} ${response.statusText}`);
            setTenantId(null); // Clear tenantId on error
          }
        } catch (error) {
          console.error("Error fetching tenant ID:", error);
          setTenantId(null); // Clear tenantId on error
        } finally {
          setIsLoadingTenant(false);
        }
      };

      fetchTenantId();
    } else if (!isSignedIn) {
      // If user signs out, clear the tenantId
      setTenantId(null);
      if (isLoadingTenant) setIsLoadingTenant(false);
    }
    // Add user object as dependency to re-check publicMetadata
  }, [isSignedIn, userId, user, tenantId, isLoadingTenant]); 

  return {
    userId: userId ?? null,
    // Combine Clerk's loading state with tenant loading state
    isLoaded: isLoaded && !isLoadingTenant, 
    isSignedIn,
    tenantId,
    isLoadingTenant,
    user,
    signOut,
  };
}

export default useAuth;