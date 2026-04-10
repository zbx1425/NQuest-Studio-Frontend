"use client";

import { useState } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Badge,
  Tooltip,
} from "@fluentui/react-components";
import {
  DismissRegular,
  CopyRegular,
  CheckmarkRegular,
} from "@fluentui/react-icons";
import type { AuditLogEntry } from "@/lib/types";

interface AuditDetailModalProps {
  entry: AuditLogEntry | null;
  open: boolean;
  onClose: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip
      content={copied ? "Copied!" : "Copy JSON"}
      relationship="label"
    >
      <Button
        appearance="subtle"
        size="small"
        icon={copied ? <CheckmarkRegular /> : <CopyRegular />}
        onClick={handleCopy}
      />
    </Tooltip>
  );
}

function JsonBlock({
  label,
  data,
}: {
  label: string;
  data: Record<string, unknown> | null;
}) {
  if (!data) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-400 italic">
          No {label.toLowerCase()} available
        </div>
      </div>
    );
  }

  const json = JSON.stringify(data, null, 2);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <CopyButton text={json} />
      </div>
      <pre className="bg-gray-50 rounded-lg px-4 py-3 text-xs font-mono text-gray-700 overflow-auto max-h-80 border border-gray-100">
        {json}
      </pre>
    </div>
  );
}

export function AuditDetailModal({
  entry,
  open,
  onClose,
}: AuditDetailModalProps) {
  if (!entry) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DialogSurface className="w-[90vw]! max-w-3xl! max-h-[85vh]!">
        <DialogBody className="flex flex-col h-full min-h-0">
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                icon={<DismissRegular />}
                onClick={onClose}
              />
            }
          >
            Audit Entry #{entry.id}
          </DialogTitle>
          <DialogContent className="flex-1 overflow-y-auto space-y-5">
            {/* Key-value summary */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <span className="text-xs text-gray-500">Action</span>
                <div className="mt-0.5">
                  <Badge appearance="filled" color="brand" size="small">
                    {entry.action}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Time</span>
                <p className="text-sm mt-0.5">
                  <Tooltip
                    content={String(entry.createdAt)}
                    relationship="label"
                  >
                    <span>
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </Tooltip>
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Actor</span>
                <div className="text-sm mt-0.5 font-mono">
                  <Badge
                    appearance="outline"
                    color="informative"
                    size="small"
                    className="mr-1.5"
                  >
                    {entry.actorType}
                  </Badge>
                  <span>{entry.actorId}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Target</span>
                <div className="text-sm mt-0.5 font-mono">
                  <Badge
                    appearance="outline"
                    color="informative"
                    size="small"
                    className="mr-1.5"
                  >
                    {entry.targetType.toUpperCase()}
                  </Badge>
                  <span>{entry.targetId}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Metadata */}
            {entry.metadata && <JsonBlock label="Metadata" data={entry.metadata} />}

            {/* Snapshot */}
            {entry.snapshot && <JsonBlock label="Snapshot" data={entry.snapshot} />}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
