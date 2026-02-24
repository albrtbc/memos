import { LatLng } from "leaflet";
import { uniqBy } from "lodash-es";
import { CodeIcon, FileIcon, Link2Icon, LinkIcon, ListTodoIcon, LoaderIcon, type LucideIcon, MapPinIcon, Maximize2Icon, TableIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { useReverseGeocoding } from "@/components/map";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MemoRelation } from "@/types/proto/api/v1/memo_service_pb";
import { useTranslate } from "@/utils/i18n";
import { LinkMemoDialog, LocationDialog } from "../components";
import { editorCommands } from "../Editor/commands";
import { useFileUpload, useLinkMemo, useLocation } from "../hooks";
import { useEditorContext } from "../state";
import type { InsertMenuProps } from "../types";
import type { LocalFile } from "../types/attachment";

function makeTable(cols: number): string {
  const headers = Array.from({ length: cols }, (_, i) => `Header ${i + 1}`);
  const sep = Array.from({ length: cols }, () => "------");
  const cells = Array.from({ length: cols }, () => "      ");
  return `| ${headers.join(" | ")} |\n| ${sep.join(" | ")} |\n| ${cells.join(" | ")} |`;
}

const InsertMenu = (props: InsertMenuProps) => {
  const t = useTranslate();
  const { state, actions, dispatch } = useEditorContext();
  const { editorRef, location: initialLocation, onLocationChange, onToggleFocusMode, isUploading: isUploadingProp } = props;

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);

  const { fileInputRef, selectingFlag, handleFileInputChange, handleUploadClick } = useFileUpload((newFiles: LocalFile[]) => {
    newFiles.forEach((file) => dispatch(actions.addLocalFile(file)));
  });

  const linkMemo = useLinkMemo({
    isOpen: linkDialogOpen,
    currentMemoName: props.memoName,
    existingRelations: state.metadata.relations,
    onAddRelation: (relation: MemoRelation) => {
      dispatch(actions.setMetadata({ relations: uniqBy([...state.metadata.relations, relation], (r) => r.relatedMemo?.name) }));
      setLinkDialogOpen(false);
    },
  });

  const location = useLocation(props.location);

  const [debouncedPosition, setDebouncedPosition] = useState<LatLng | undefined>(undefined);

  useDebounce(
    () => {
      setDebouncedPosition(location.state.position);
    },
    1000,
    [location.state.position],
  );

  const { data: displayName } = useReverseGeocoding(debouncedPosition?.lat, debouncedPosition?.lng);

  useEffect(() => {
    if (displayName) {
      location.setPlaceholder(displayName);
    }
  }, [displayName]);

  const isUploading = selectingFlag || isUploadingProp;

  const handleOpenLinkDialog = useCallback(() => {
    setLinkDialogOpen(true);
  }, []);

  const handleLocationClick = useCallback(() => {
    setLocationDialogOpen(true);
    if (!initialLocation && !location.locationInitialized) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location.handlePositionChange(
              new LatLng(position.coords.latitude, position.coords.longitude, position.coords.altitude ?? undefined),
            );
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
        );
      }
    }
  }, [initialLocation, location]);

  const handleLocationConfirm = useCallback(() => {
    const newLocation = location.getLocation();
    if (newLocation) {
      onLocationChange(newLocation);
      setLocationDialogOpen(false);
    }
  }, [location, onLocationChange]);

  const handleLocationCancel = useCallback(() => {
    location.reset();
    setLocationDialogOpen(false);
  }, [location]);

  const handlePositionChange = useCallback(
    (position: LatLng) => {
      location.handlePositionChange(position);
    },
    [location],
  );

  const handleToggleFocusMode = useCallback(() => {
    onToggleFocusMode?.();
  }, [onToggleFocusMode]);

  const insertCommand = useCallback(
    (name: string) => {
      const cmd = editorCommands.find((c) => c.name === name);
      if (!cmd || !editorRef.current) return;
      const cursorPos = editorRef.current.getCursorPosition();
      editorRef.current.insertText(cmd.run());
      if (cmd.cursorOffset) {
        editorRef.current.setCursorPosition(cursorPos + cmd.cursorOffset);
      }
    },
    [editorRef],
  );

  const handleInsertTable = useCallback(
    (cols: number) => {
      if (!editorRef.current) return;
      const cursorPos = editorRef.current.getCursorPosition();
      editorRef.current.insertText(makeTable(cols));
      editorRef.current.setCursorPosition(cursorPos + 1);
      setTablePopoverOpen(false);
    },
    [editorRef],
  );

  const toolbarButtons = useMemo(
    () =>
      [
        {
          key: "upload",
          label: t("common.upload"),
          icon: isUploading ? LoaderIcon : FileIcon,
          iconClassName: isUploading ? "animate-spin" : undefined,
          onClick: handleUploadClick,
          disabled: isUploading,
        },
        {
          key: "link-memo",
          label: t("tooltip.link-memo"),
          icon: LinkIcon,
          onClick: handleOpenLinkDialog,
        },
        {
          key: "location",
          label: t("tooltip.select-location"),
          icon: MapPinIcon,
          onClick: handleLocationClick,
        },
        {
          key: "todo",
          label: "Todo",
          icon: ListTodoIcon,
          onClick: () => insertCommand("todo"),
        },
        {
          key: "code",
          label: "Code",
          icon: CodeIcon,
          onClick: () => insertCommand("code"),
        },
        {
          key: "insert-link",
          label: "Link",
          icon: Link2Icon,
          onClick: () => insertCommand("link"),
        },
        {
          key: "focus-mode",
          label: t("editor.focus-mode"),
          icon: Maximize2Icon,
          onClick: handleToggleFocusMode,
        },
      ] satisfies Array<{
        key: string;
        label: string;
        icon: LucideIcon;
        iconClassName?: string;
        onClick: () => void;
        disabled?: boolean;
      }>,
    [handleLocationClick, handleOpenLinkDialog, handleUploadClick, handleToggleFocusMode, insertCommand, isUploading, t],
  );

  return (
    <>
      <div className="flex flex-row items-center gap-1">
        {toolbarButtons.map((item) => (
          <Tooltip key={item.key}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={item.onClick} disabled={item.disabled}>
                <item.icon className={`size-4 ${item.iconClassName ?? ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{item.label}</TooltipContent>
          </Tooltip>
        ))}

        {/* Table button with column picker popover */}
        <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <TableIcon className="size-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Table</TooltipContent>
          </Tooltip>
          <PopoverContent align="start" className="flex flex-row items-center gap-1 p-2">
            <span className="text-xs text-muted-foreground mr-1">Columns:</span>
            {[2, 3, 4, 5].map((n) => (
              <Button key={n} variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleInsertTable(n)}>
                {n}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Hidden file input */}
      <input className="hidden" ref={fileInputRef} disabled={isUploading} onChange={handleFileInputChange} type="file" multiple={true} accept="*" />

      <LinkMemoDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        searchText={linkMemo.searchText}
        onSearchChange={linkMemo.setSearchText}
        filteredMemos={linkMemo.filteredMemos}
        isFetching={linkMemo.isFetching}
        onSelectMemo={linkMemo.addMemoRelation}
      />

      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        state={location.state}
        locationInitialized={location.locationInitialized}
        onPositionChange={handlePositionChange}
        onUpdateCoordinate={location.updateCoordinate}
        onPlaceholderChange={location.setPlaceholder}
        onZoomChange={location.handleZoomChange}
        onCancel={handleLocationCancel}
        onConfirm={handleLocationConfirm}
      />
    </>
  );
};

export default InsertMenu;
