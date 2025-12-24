import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export const useGroups = () => {
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const fetchAllGroups = async () => {
    setGroupsLoading(true);
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
  };

  useEffect(() => {
    fetchAllGroups();
  }, []);

  return {
    allGroups,
    groupsLoading,
    refetch: fetchAllGroups,
  };
};
