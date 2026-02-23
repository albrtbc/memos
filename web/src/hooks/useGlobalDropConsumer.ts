import { type Dispatch, useEffect } from "react";
import { useGlobalDropContext } from "@/contexts/GlobalDropContext";
import type { EditorRefActions } from "@/components/MemoEditor/Editor";
import type { EditorAction } from "@/components/MemoEditor/state/types";
import type { LocalFile } from "@/components/MemoEditor/types/attachment";
import { useBlobUrls } from "@/components/MemoEditor/hooks";

/**
 * Consumes pending files from the global drop context and dispatches them
 * into the MemoEditor as local file attachments.
 */
export function useGlobalDropConsumer(
  enabled: boolean,
  editorRef: React.RefObject<EditorRefActions | null>,
  dispatch: Dispatch<EditorAction>,
  addLocalFile: (file: LocalFile) => EditorAction,
) {
  const { pendingFiles, clearPendingFiles } = useGlobalDropContext();
  const { createBlobUrl } = useBlobUrls();

  useEffect(() => {
    if (!enabled || pendingFiles.length === 0) return;

    // Read files directly from the state snapshot, then clear the queue
    const filesToProcess = [...pendingFiles];
    clearPendingFiles();

    const localFiles: LocalFile[] = filesToProcess.map((file) => ({
      file,
      previewUrl: createBlobUrl(file),
    }));

    for (const localFile of localFiles) {
      dispatch(addLocalFile(localFile));
    }

    // Focus the editor after a short delay to ensure it's mounted
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  }, [enabled, pendingFiles, clearPendingFiles, createBlobUrl, dispatch, addLocalFile, editorRef]);
}
