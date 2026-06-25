import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyUploadToRestaurantProfile,
  fetchRestaurantMe,
  getRestaurantDisplayName,
  patchRestaurantMe,
} from "@/modules/restaurant/services/restaurant-profile.service";
import type {
  ConfirmUploadResponse,
  RestaurantMePatch,
  RestaurantMeResponse,
} from "@/modules/restaurant/types/restaurant-profile";

import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";

export const RESTAURANT_ME_QUERY_KEY = queryKeys.restaurantMe;

export function useRestaurantProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.restaurantMe,
    staleTime: STALE.catalog,
    queryFn: fetchRestaurantMe,
  });

  const mutation = useMutation({
    mutationFn: (body: RestaurantMePatch) => patchRestaurantMe(body),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.restaurantMe, data);
    },
  });

  const applyUpload = (upload: ConfirmUploadResponse) => {
    queryClient.setQueryData<RestaurantMeResponse>(queryKeys.restaurantMe, (current) =>
      current ? applyUploadToRestaurantProfile(current, upload) : current,
    );
    void queryClient.invalidateQueries({ queryKey: queryKeys.restaurantMe });
  };

  const refreshProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.restaurantMe });
    return query.refetch();
  };

  return {
    data: query.data,
    restaurantName: getRestaurantDisplayName(query.data),
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving: mutation.isPending,
    refetch: refreshProfile,
    applyUpload,
    save: mutation.mutateAsync,
  };
}
