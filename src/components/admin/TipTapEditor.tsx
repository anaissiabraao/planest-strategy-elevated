import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Image as ImageIcon, Link as LinkIcon, Undo2, Redo2, Minus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "rounded-lg my-4 max-w-full h-auto" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-accent underline" } }),
      Placeholder.configure({ placeholder: "Comece a escrever seu post…" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[400px] focus:outline-none px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  async function uploadAndInsert(file: File) {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Apenas imagens", variant: "destructive" }); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem maior que 5MB", variant: "destructive" }); return;
    }
    const ext = file.name.split(".").pop();
    const path = `posts/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("blog-media").upload(path, file, { cacheControl: "3600" });
    if (error) { toast({ title: "Falha no upload", description: error.message, variant: "destructive" }); return; }
    const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
    editor!.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run();
  }

  function setLink() {
    const url = window.prompt("URL do link:");
    if (url === null) return;
    if (url === "") { editor!.chain().focus().unsetLink().run(); return; }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  }

  const tools = [
    { ic: Bold, run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { ic: Italic, run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { ic: Strikethrough, run: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike") },
    { ic: Heading1, run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
    { ic: Heading2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { ic: Heading3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    { ic: List, run: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { ic: ListOrdered, run: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { ic: Quote, run: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { ic: Code, run: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock") },
    { ic: Minus, run: () => editor.chain().focus().setHorizontalRule().run(), active: false },
  ];

  return (
    <div
      className="border rounded-lg bg-background"
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) uploadAndInsert(f);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5 sticky top-0 bg-background z-10 rounded-t-lg">
        {tools.map((t, i) => (
          <Button key={i} type="button" size="icon" variant={t.active ? "secondary" : "ghost"} className="h-8 w-8" onClick={t.run}>
            <t.ic className="h-4 w-4" />
          </Button>
        ))}
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => fileRef.current?.click()}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0]; if (f) uploadAndInsert(f); e.target.value = "";
        }} />
        <div className="ml-auto flex gap-1">
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}