"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Spinner,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Text,
  Switch,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import {
  AddRegular,
  EditRegular,
  DeleteRegular,
  SaveRegular,
  DismissRegular,
  ArrowUpRegular,
  ArrowDownRegular,
} from "@fluentui/react-icons";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/lib/store/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import type { QuestCategory, QuestTier } from "@/lib/types";

interface CategoryFormData {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  hidden: boolean;
  tiers: Record<string, QuestTier>;
}

const emptyForm: CategoryFormData = {
  id: "",
  name: "",
  description: "",
  icon: "minecraft:book",
  order: 0,
  hidden: false,
  tiers: {},
};

export default function CategoriesPage() {
  const { isAdmin } = useAuth();
  const toast = useAppToast();
  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tier editing state
  const [newTierId, setNewTierId] = useState("");
  const [newTierName, setNewTierName] = useState("");
  const [newTierIcon, setNewTierIcon] = useState("minecraft:gold_nugget");

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>Only staff members can manage categories.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const categoryEntries = categories
    ? Object.entries(categories).sort(([, a], [, b]) => a.order - b.order)
    : [];

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (id: string, cat: QuestCategory) => {
    setForm({
      id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      hidden: cat.hidden ?? false,
      tiers: { ...cat.tiers },
    });
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const normalizedTiers: Record<string, QuestTier> = {};
    Object.entries(form.tiers)
      .sort(([, a], [, b]) => a.order - b.order)
      .forEach(([id, tier], i) => {
        normalizedTiers[id] = { ...tier, order: i };
      });

    try {
      if (editingId) {
        await updateCategory({
          id: editingId,
          name: form.name,
          description: form.description,
          icon: form.icon,
          order: form.order,
          hidden: form.hidden,
          tiers: normalizedTiers,
        }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory({
          id: form.id,
          name: form.name,
          description: form.description,
          icon: form.icon,
          order: form.order,
          hidden: form.hidden,
          tiers: normalizedTiers,
        }).unwrap();
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCategory(deletingId).unwrap();
      toast.success("Category deleted");
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const addTier = () => {
    if (!newTierId) return;
    setForm({
      ...form,
      tiers: {
        ...form.tiers,
        [newTierId]: {
          name: newTierName || newTierId,
          icon: newTierIcon,
          order: Object.keys(form.tiers).length,
        },
      },
    });
    setNewTierId("");
    setNewTierName("");
    setNewTierIcon("minecraft:gold_nugget");
  };

  const removeTier = (tierId: string) => {
    const { [tierId]: _, ...rest } = form.tiers;
    setForm({ ...form, tiers: rest });
  };

  const moveTier = (tierId: string, direction: "up" | "down") => {
    const sorted = Object.entries(form.tiers).sort(
      ([, a], [, b]) => a.order - b.order
    );
    const idx = sorted.findIndex(([id]) => id === tierId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newTiers = { ...form.tiers };
    const [currentId] = sorted[idx];
    const [swapId] = sorted[swapIdx];
    const currentOrder = newTiers[currentId].order;
    newTiers[currentId] = { ...newTiers[currentId], order: newTiers[swapId].order };
    newTiers[swapId] = { ...newTiers[swapId], order: currentOrder };
    setForm({ ...form, tiers: newTiers });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button
          appearance="primary"
          icon={<AddRegular />}
          onClick={openCreate}
        >
          New Category
        </Button>
      </div>

      {isLoading ? (
        <Spinner label="Loading categories..." />
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/60">
                <th className="text-left p-3 font-semibold">ID</th>
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Icon</th>
                <th className="text-left p-3 font-semibold">Tiers</th>
                <th className="text-right p-3 font-semibold w-16">Order</th>
                <th className="text-center p-3 font-semibold w-16">Hidden</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {categoryEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No categories yet.
                  </td>
                </tr>
              )}
              {categoryEntries.map(([id, cat]) => (
                <tr key={id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{id}</td>
                  <td className="p-3 font-medium">{cat.name}</td>
                  <td className="p-3 text-xs text-gray-500">{cat.icon}</td>
                  <td className="p-3">
                    {Object.entries(cat.tiers)
                      .sort(([, a], [, b]) => a.order - b.order)
                      .map(([tid, tier]) => (
                        <span
                          key={tid}
                          className="inline-block bg-gray-100 rounded px-1.5 py-0.5 text-xs mr-1 mb-1"
                        >
                          {tier.name}
                        </span>
                      ))}
                  </td>
                  <td className="p-3 text-right">{cat.order}</td>
                  <td className="p-3 text-center text-xs text-gray-500">
                    {cat.hidden ? "Yes" : ""}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button
                        appearance="subtle"
                        icon={<EditRegular />}
                        onClick={() => openEdit(id, cat)}
                      />
                      <Button
                        appearance="subtle"
                        icon={<DeleteRegular />}
                        onClick={() => {
                          setDeletingId(id);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {editingId ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogContent>
              <div className="space-y-3 mt-2">
                {!editingId && (
                  <div className="flex flex-col gap-1">
                    <Label required>Category ID</Label>
                    <Input
                      value={form.id}
                      onChange={(_, d) => setForm({ ...form, id: d.value })}
                      placeholder="e.g., mtr-lines"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <Label required>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(_, d) => setForm({ ...form, name: d.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(_, d) =>
                      setForm({ ...form, description: d.value })
                    }
                    rows={2}
                    resize="vertical"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label>Icon</Label>
                    <Input
                      value={form.icon}
                      onChange={(_, d) =>
                        setForm({ ...form, icon: d.value })
                      }
                      placeholder="minecraft:book"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={String(form.order)}
                      onChange={(_, d) =>
                        setForm({
                          ...form,
                          order: d.value === "" ? 0 : parseInt(d.value, 10) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.hidden}
                    onChange={(_, d) =>
                      setForm({ ...form, hidden: d.checked })
                    }
                    label="Hidden"
                  />
                </div>

                {/* Tiers */}
                <div>
                  <Label className="font-semibold">Tiers</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(form.tiers)
                      .sort(([, a], [, b]) => a.order - b.order)
                      .map(([tierId, tier], idx, arr) => (
                        <div
                          key={tierId}
                          className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2"
                        >
                          <div className="flex flex-col">
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={<ArrowUpRegular />}
                              disabled={idx === 0}
                              onClick={() => moveTier(tierId, "up")}
                            />
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={<ArrowDownRegular />}
                              disabled={idx === arr.length - 1}
                              onClick={() => moveTier(tierId, "down")}
                            />
                          </div>
                          <Text size={200} className="font-mono w-24">
                            {tierId}
                          </Text>
                          <Input
                            value={tier.name}
                            onChange={(_, d) =>
                              setForm({
                                ...form,
                                tiers: {
                                  ...form.tiers,
                                  [tierId]: { ...tier, name: d.value },
                                },
                              })
                            }
                            className="flex-1"
                          />
                          <Input
                            value={tier.icon}
                            onChange={(_, d) =>
                              setForm({
                                ...form,
                                tiers: {
                                  ...form.tiers,
                                  [tierId]: { ...tier, icon: d.value },
                                },
                              })
                            }
                            className="w-48"
                            placeholder="Icon"
                          />
                          <Button
                            appearance="subtle"
                            icon={<DismissRegular />}
                            onClick={() => removeTier(tierId)}
                          />
                        </div>
                      ))}
                  </div>
                  <div className="flex items-end gap-3 mt-3">
                    <div className="flex flex-col gap-1">
                      <Label>Tier ID</Label>
                      <Input
                        value={newTierId}
                        onChange={(_, d) => setNewTierId(d.value)}
                        placeholder="e.g., easy"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label>Name</Label>
                      <Input
                        value={newTierName}
                        onChange={(_, d) => setNewTierName(d.value)}
                        placeholder="e.g., Easy"
                      />
                    </div>
                    <Button
                      icon={<AddRegular />}
                      onClick={addTier}
                      disabled={!newTierId}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDialogOpen(false)}
                appearance="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                appearance="primary"
                icon={<SaveRegular />}
              >
                Save
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(_, d) => setDeleteDialogOpen(d.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogContent>
              Are you sure you want to delete category{" "}
              <strong>{deletingId}</strong>? Quests using this category will have
              their category set to null.
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                appearance="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                appearance="primary"
                style={{
                  backgroundColor: "var(--colorPaletteRedBackground3)",
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
