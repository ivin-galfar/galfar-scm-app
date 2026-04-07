"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { CiViewTable } from "react-icons/ci";
import { TbTableColumn } from "react-icons/tb";
import { TbTableRow } from "react-icons/tb";
import { TbTrash } from "react-icons/tb";
import UploadAttachments from "../../../../Components/UploadAttachments";

// import content from "@/components/tiptap-templates/simple/data/content.json";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  newfn,
}) => {
  const { editor } = useContext(EditorContext);

  return (
    <div
      key={newfn ? "edit" : "view"}
      className={`flex w-full ${newfn ? "" : "hidden"}`}
    >
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton
          action="undo"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <UndoRedoButton
          action="redo"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu
          levels={[1, 2, 3, 4]}
          portal={isMobile}
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <BlockquoteButton
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <CodeBlockButton
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
      </ToolbarGroup>

      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton
          type="bold"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <MarkButton
          type="italic"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <MarkButton
          type="strike"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <MarkButton
          type="code"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <MarkButton
          type="underline"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        {!isMobile ? (
          <ColorHighlightPopover
            className={
              newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
            }
          />
        ) : (
          <ColorHighlightPopoverButton
            onClick={onHighlighterClick}
            className={
              newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
            }
          />
        )}
        {!isMobile ? (
          <LinkPopover
            className={`flex justify-center items-center ${newfn ? "cursor-pointer" : "pointer-events-none opacity-50"} p-2`}
          />
        ) : (
          <LinkButton
            onClick={onLinkClick}
            className={`flex justify-center items-center ${newfn ? "cursor-pointer" : "pointer-events-none opacity-50"} p-2`}
          />
        )}
      </ToolbarGroup>
      <ToolbarGroup>
        <span
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({
                rows: 3,
                cols: 3,
                withHeaderRow: true,
              })
              .run()
          }
          className={`flex justify-center items-center ${newfn ? "cursor-pointer" : "pointer-events-none opacity-50"} p-2`}
        >
          <CiViewTable />
        </span>
        <span
          className={`flex justify-center items-center ${newfn ? "cursor-pointer" : "pointer-events-none opacity-50"} p-2`}
          onClick={() => editor?.chain().focus().addRowAfter().run()}
        >
          <span className="mr-1">+</span>
          <TbTableRow />
        </span>
        <span
          className={`flex justify-center items-center ${newfn ? "cursor-pointer" : "pointer-events-none opacity-50"} p-2`}
          onClick={() => editor?.chain().focus().deleteRow().run()}
        >
          <span className="mr-1">-</span>
          <TbTableRow />
        </span>
        <span
          className={`flex justify-center items-center ${newfn ? "cursor-pointer" : "pointer-events-none opacity-50"} p-2`}
          onClick={() => editor?.chain().focus().addColumnAfter().run()}
        >
          <span className="mr-1">+</span>
          <TbTableColumn />
        </span>
        <span
          className={`flex justify-center items-center ${newfn ? "cursor-pointer" : "pointer-events-none opacity-50"} p-2`}
          onClick={() => editor?.chain().focus().deleteColumn().run()}
        >
          <span className="mr-1">-</span>
          <TbTableColumn />
        </span>
        <span
          className={`flex justify-center items-center ${newfn ? "cursor-pointer" : "pointer-events-none opacity-50"} p-2`}
          onClick={() => editor?.chain().focus().deleteTable().run()}
        >
          <CiViewTable />
          <span>
            <TbTrash size={15} />
          </span>
        </span>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton
          type="superscript"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <MarkButton
          type="subscript"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton
          align="left"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <TextAlignButton
          align="center"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <TextAlignButton
          align="right"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
        <TextAlignButton
          align="justify"
          className={
            newfn ? "cursor-pointer" : "pointer-events-none opacity-50"
          }
        />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <UploadAttachments
          styles={newfn ? "cursor-pointer" : "pointer-events-none opacity-50"}
        />
      </ToolbarGroup>
      <Spacer />
      {isMobile && <ToolbarSeparator />}
      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </div>
  );
};

const MobileToolbarContent = ({ type, onBack }) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor({ content, newfn, is_admin }) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState("main");
  const toolbarRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },

    onUpdate: ({ editor }) => {
      // if (is_admin) return;
      localStorage.setItem("editorContent", JSON.stringify(editor.getJSON()));
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: content || {},
  });

  useEffect(() => {
    if (editor || newfn) {
      editor.setEditable(is_admin && newfn);
    }
  }, [editor, is_admin, newfn]);

  useEffect(() => {
    if (content == "") {
      editor?.commands.setContent("");
    }

    if (editor && content) {
      const parsedContent =
        typeof content === "string" ? JSON.parse(content) : content;
      editor.commands.setContent(parsedContent);
    }
  }, [content, editor]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {is_admin && newfn && (
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
                newfn={newfn}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>
        )}

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  );
}
