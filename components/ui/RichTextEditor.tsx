import React, { useRef, useEffect, useCallback } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    dir?: 'ltr' | 'rtl';
}

/**
 * A simple, React 19 compatible rich text editor using contenteditable.
 * Replaces react-quill which is incompatible with React 19 due to findDOMNode usage.
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Enter content...',
    className = '',
    dir = 'ltr',
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInternalChange = useRef(false);

    // Sync external value changes to the editor
    useEffect(() => {
        if (editorRef.current && !isInternalChange.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
        isInternalChange.current = false;
    }, [value]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            isInternalChange.current = true;
            const html = editorRef.current.innerHTML;
            // Normalize empty content
            const isEmpty = html === '<br>' || html === '<div><br></div>' || html.trim() === '';
            onChange(isEmpty ? '' : html);
        }
    }, [onChange]);

    const execCommand = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    }, [handleInput]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Handle Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    }, [execCommand]);

    // Toolbar button component
    const ToolbarButton: React.FC<{
        onClick: () => void;
        title: string;
        children: React.ReactNode;
        active?: boolean;
    }> = ({ onClick, title, children, active }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${active ? 'bg-gray-200 dark:bg-gray-600' : ''
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className={`rich-text-editor border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                {/* Text Formatting */}
                <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                    </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
                    </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('underline')} title="Underline">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
                    </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
                    </svg>
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Headers */}
                <select
                    onChange={(e) => execCommand('formatBlock', e.target.value)}
                    className="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"
                    defaultValue=""
                >
                    <option value="" disabled>Heading</option>
                    <option value="p">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                </select>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Lists */}
                <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                    </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                    </svg>
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                {/* Link */}
                <ToolbarButton
                    onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) execCommand('createLink', url);
                    }}
                    title="Insert Link"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                    </svg>
                </ToolbarButton>

                {/* Clear Formatting */}
                <ToolbarButton onClick={() => execCommand('removeFormat')} title="Clear Formatting">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z" />
                    </svg>
                </ToolbarButton>
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                dir={dir}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="min-h-[200px] p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none prose prose-sm max-w-none dark:prose-invert"
                style={{
                    textAlign: dir === 'rtl' ? 'right' : 'left',
                }}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            {/* Placeholder styles and prose styling */}
            <style>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .rich-text-editor [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.5em 0; }
        .rich-text-editor [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        .rich-text-editor [contenteditable] h3 { font-size: 1.17em; font-weight: bold; margin: 0.5em 0; }
        .rich-text-editor [contenteditable] p { margin: 0.5em 0; }
        .rich-text-editor [contenteditable] ul, .rich-text-editor [contenteditable] ol { margin: 0.5em 0; padding-left: 1.5em; }
        .rich-text-editor [contenteditable] li { margin: 0.25em 0; }
        .rich-text-editor [contenteditable] a { color: #3b82f6; text-decoration: underline; }
      `}</style>
        </div>
    );
};

export default RichTextEditor;
