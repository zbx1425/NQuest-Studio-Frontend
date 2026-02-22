"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Dropdown,
  Option,
  Text,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import {
  DeleteRegular,
  AddRegular,
  SaveRegular,
} from "@fluentui/react-icons";
import { useGetAclQuery, useUpdateAclMutation } from "@/lib/store/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { UserSearchCombobox } from "../UserSearchCombobox";
import type { Quest, AclEntry } from "@/lib/types";

interface AclTabProps {
  quest: Quest;
}

interface LocalAclEntry {
  discordUserId: string;
  discordUsername: string | null;
  role: "OWNER" | "EDITOR";
}

export function AclTab({ quest }: AclTabProps) {
  const { user, isAdmin } = useAuth();
  const toast = useAppToast();
  const { data: serverAcl } = useGetAclQuery(quest.id);
  const [updateAcl, { isLoading: isSaving }] = useUpdateAclMutation();

  const [acl, setAcl] = useState<LocalAclEntry[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (serverAcl) {
      setAcl(serverAcl.map((e) => ({ ...e })));
      setDirty(false);
    }
  }, [serverAcl]);

  const ownerCount = acl.filter((e) => e.role === "OWNER").length;

  const handleRoleChange = (index: number, role: "OWNER" | "EDITOR") => {
    const entry = acl[index];
    if (
      !isAdmin &&
      entry.discordUserId === user?.discordUserId &&
      role === "EDITOR"
    ) {
      toast.warning("Cannot downgrade yourself", "Non-admin users cannot demote themselves from OWNER.");
      return;
    }
    const updated = [...acl];
    updated[index] = { ...entry, role };
    setAcl(updated);
    setDirty(true);
  };

  const handleRemove = (index: number) => {
    const entry = acl[index];
    if (!isAdmin && entry.discordUserId === user?.discordUserId) {
      toast.warning("Cannot remove yourself", "Non-admin users cannot remove themselves from the ACL.");
      return;
    }
    setAcl(acl.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleAdd = (newUser: { discordUserId: string; username: string }) => {
    if (acl.find((e) => e.discordUserId === newUser.discordUserId)) {
      toast.warning("User already in ACL");
      return;
    }
    setAcl([
      ...acl,
      {
        discordUserId: newUser.discordUserId,
        discordUsername: newUser.username,
        role: "EDITOR",
      },
    ]);
    setDirty(true);
  };

  const handleSave = async () => {
    const localOwnerCount = acl.filter((e) => e.role === "OWNER").length;
    if (localOwnerCount === 0) {
      toast.error("Validation error", "ACL must have at least one OWNER.");
      return;
    }
    try {
      await updateAcl({
        questId: quest.id,
        acl: acl.map((e) => ({
          discordUserId: e.discordUserId,
          discordUsername: e.discordUsername,
          role: e.role,
        })),
      }).unwrap();
      toast.success("ACL updated");
      setDirty(false);
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Access Control List</h2>
        <div className="flex-1" />
        {dirty && (
          <Button
            appearance="primary"
            icon={<SaveRegular />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save ACL"}
          </Button>
        )}
      </div>
      
      <p className="text-sm text-gray-500 -mt-4">
        By adding members to the ACL, you can collaborate on quests with your team.
      </p>

      {/* Member table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left p-3 font-semibold">User</th>
              <th className="text-left p-3 font-semibold w-20">Discord ID</th>
              <th className="text-left p-3 font-semibold w-40">Role</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {acl.map((entry, index) => {
              const isSelf = entry.discordUserId === user?.discordUserId;
              const isLastOwner = entry.role === "OWNER" && ownerCount <= 1;
              return (
                <tr key={entry.discordUserId} className="border-b border-gray-100 last:border-b-0">
                  <td className="p-3">
                    {entry.discordUsername ?? (
                      <Text className="text-gray-400 italic">Unknown</Text>
                    )}
                    {isSelf && (
                      <Text size={200} className="text-gray-400 ml-1">
                        (you)
                      </Text>
                    )}
                  </td>
                  <td className="p-3">
                    <Text size={200} className="font-mono">
                      {entry.discordUserId}
                    </Text>
                  </td>
                  <td className="p-3">
                    <Dropdown
                      value={entry.role}
                      selectedOptions={[entry.role]}
                      onOptionSelect={(_, d) =>
                        handleRoleChange(
                          index,
                          d.optionValue as "OWNER" | "EDITOR"
                        )
                      }
                      disabled={isLastOwner && !isAdmin}
                    >
                      <Option value="OWNER">Owner</Option>
                      <Option value="EDITOR">Editor</Option>
                    </Dropdown>
                  </td>
                  <td className="p-3">
                    <Button
                      appearance="subtle"
                      icon={<DeleteRegular />}
                      onClick={() => handleRemove(index)}
                      disabled={
                        (isLastOwner && entry.role === "OWNER") ||
                        (!isAdmin && isSelf)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add member */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <UserSearchCombobox
            label="Add Member"
            onSelect={handleAdd}
            excludeIds={acl.map((e) => e.discordUserId)}
          />
        </div>
      </div>

      {ownerCount === 0 && (
        <MessageBar intent="error">
          <MessageBarBody>
            ACL must have at least one OWNER. Add an owner before saving.
          </MessageBarBody>
        </MessageBar>
      )}
    </div>
  );
}
