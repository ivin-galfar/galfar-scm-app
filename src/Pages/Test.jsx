import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/editorjs";
import List from "@editorjs/editorjs";
import { useEffect, useRef } from "react";
const Test = () => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        tools: {
          header: {
            class: Header,
            inlineToolbar: ["link"],
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
        },
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-grow p-6">
      <div id="editorjs" className="w-full border p-4 rounded bg-white"></div>
    </div>
  );
};

export default Test;
