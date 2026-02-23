import { UploadIcon } from "lucide-react";
import { useGlobalDropContext } from "@/contexts/GlobalDropContext";
import { useTranslate } from "@/utils/i18n";

const GlobalDropOverlay = () => {
  const { isDraggingOverPage } = useGlobalDropContext();
  const t = useTranslate();

  if (!isDraggingOverPage) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary bg-card px-12 py-10 shadow-lg">
        <UploadIcon className="h-10 w-10 text-primary" />
        <p className="text-lg font-medium text-foreground">{t("editor.drop-files-to-create-memo")}</p>
        <p className="text-sm text-muted-foreground">{t("editor.drop-files-subtitle")}</p>
      </div>
    </div>
  );
};

export default GlobalDropOverlay;
