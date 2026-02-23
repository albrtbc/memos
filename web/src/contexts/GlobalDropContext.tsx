import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

interface GlobalDropContextValue {
  pendingFiles: File[];
  isDraggingOverPage: boolean;
  addPendingFiles: (files: File[]) => void;
  clearPendingFiles: () => void;
}

const GlobalDropContext = createContext<GlobalDropContextValue | null>(null);

export function GlobalDropProvider({ children }: { children: ReactNode }) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDraggingOverPage, setIsDraggingOverPage] = useState(false);
  const dragDepthRef = useRef(0);

  const addPendingFiles = useCallback((files: File[]) => {
    setPendingFiles((prev) => [...prev, ...files]);
  }, []);

  const clearPendingFiles = useCallback(() => {
    setPendingFiles([]);
  }, []);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      dragDepthRef.current += 1;
      if (dragDepthRef.current === 1) {
        setIsDraggingOverPage(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      dragDepthRef.current -= 1;
      if (dragDepthRef.current === 0) {
        setIsDraggingOverPage(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsDraggingOverPage(false);

      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length > 0) {
        setPendingFiles((prev) => [...prev, ...files]);
      }
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <GlobalDropContext.Provider value={{ pendingFiles, isDraggingOverPage, addPendingFiles, clearPendingFiles }}>
      {children}
    </GlobalDropContext.Provider>
  );
}

export function useGlobalDropContext() {
  const context = useContext(GlobalDropContext);
  if (!context) {
    throw new Error("useGlobalDropContext must be used within GlobalDropProvider");
  }
  return context;
}
