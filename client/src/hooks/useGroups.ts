import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type { Grupo } from "../../../shared/types";

export const useGroups = () => {
  const [allGroups, setAllGroups] = useState<Grupo[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const fetchAllGroups = useCallback(async (force = false) => {
    // Prevent multiple automatic fetches
    if (hasAttemptedFetch && !force) {
      return;
    }

    setGroupsLoading(true);
    setHasAttemptedFetch(true);

    try {
      const response = await apiClient.getGroups();
      if (response.success && response.data) {
        setAllGroups(response.data.groups);
      } else {
        setAllGroups([]);
      }
    } catch (error) {
      console.error("useGroups - Error cargando grupos:", error);
      setAllGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, [hasAttemptedFetch]);

  useEffect(() => {
    fetchAllGroups();
  }, [fetchAllGroups]);

  const refetch = () => fetchAllGroups(true);

  return {
    allGroups,
    groupsLoading,
    refetch,
  };
};
