import { useMemo } from "react";
import type { Quest, QuestListItem } from "../types";
import { useAuth } from "./useAuth";

export interface QuestPermissions {
  canEdit: boolean;
  canChangeStatus: boolean;
  canPromote: boolean;
  canDelete: boolean;
  canManageAcl: boolean;
  isAdmin: boolean;
}

export function usePermissions(
  quest?: Quest | QuestListItem | null
): QuestPermissions {
  const { user, isAdmin } = useAuth();

  return useMemo(() => {
    if (!user || !quest) {
      return {
        canEdit: false,
        canChangeStatus: false,
        canPromote: false,
        canDelete: false,
        canManageAcl: false,
        isAdmin,
      };
    }

    const aclEntry = quest.acl.find(
      (a) => a.discordUserId === user.discordUserId
    );
    const isOwner = aclEntry?.role === "OWNER";
    const isEditor = aclEntry?.role === "EDITOR";

    const hasPendingDraft =
      "hasPendingDraft" in quest ? quest.hasPendingDraft : false;

    return {
      canEdit: isAdmin || isOwner || isEditor,
      canChangeStatus: isAdmin || isOwner,
      canPromote: isAdmin && quest.status === "PUBLIC" && hasPendingDraft,
      canDelete: isAdmin || isOwner,
      canManageAcl: isAdmin || isOwner,
      isAdmin,
    };
  }, [user, quest, isAdmin]);
}
