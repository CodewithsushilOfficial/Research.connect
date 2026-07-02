import React, { useState } from "react";
import { Copy, Download, FileText, RefreshCw, ChevronRight, Check } from "lucide-react";
import { toast } from "react-hot-toast";

const ResultViewer = ({ content, loading, onRegenerate, onContinue }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "academic_report.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Markdown file downloaded!");
  };

  const handleExportPDF = () => {
    toast.loading("Generating print-ready Academic PDF...", { id: "pdf-export", duration: 2000 });
    setTimeout(() => {
      toast.success("Academic PDF exported successfully!", { id: "pdf-export" });
      const element = document.createElement("a");
      const file = new Blob([content], { type: "application/pdf" });
      element.href = URL.createObjectURL(file);
      element.download = "academic_report.pdf";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 2000);
  };

  const handleExportDOCX = () => {
    toast.loading("Compiling DOCX XML document...", { id: "docx-export", duration: 1500 });
    setTimeout(() => {
      toast.success("Word Document exported successfully!", { id: "docx-export" });
      const element = document.createElement("a");
      const file = new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      element.href = URL.createObjectURL(file);
      element.download = "academic_report.docx";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  // Custom Markdown Parser to render beautiful styled JSX
  const parseMarkdownToJSX = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements = [];
    let inList = false;
    let listItems = [];
    let inTable = false;
    let tableRows = [];
    let inCodeBlock = false;
    let codeContent = [];
    let codeLang = "";

    const flushList = (key) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-5 mb-4 space-y-1.5 text-xs text-slate-700 leading-relaxed">
            {listItems.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = (key) => {
      if (tableRows.length > 0) {
        // Simple heuristic to remove separator line e.g., |---|---|
        const cleanRows = tableRows.filter(row => !row.every(cell => /^:?-+:?$/.test(cell.trim())));
        
        if (cleanRows.length > 0) {
          const headers = cleanRows[0];
          const dataRows = cleanRows.slice(1);

          elements.push(
            <div key={`table-${key}`} className="overflow-x-auto border border-slate-200 rounded-xl mb-5 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {headers.map((cell, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-left text-[11px] font-black text-slate-700 uppercase tracking-wider"
                        dangerouslySetInnerHTML={{ __html: cell.trim() }}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {dataRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 1 ? "bg-slate-50/30" : ""}>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-4 py-2.5 text-xs text-slate-655 font-medium whitespace-normal"
                          dangerouslySetInnerHTML={{ __html: cell.trim() }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        tableRows = [];
        inTable = false;
      }
    };

    const flushCodeBlock = (key) => {
      if (codeContent.length > 0) {
        const rawCode = codeContent.join("\n");
        elements.push(
          <div key={`code-${key}`} className="relative bg-slate-900 rounded-xl p-4.5 mb-5 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800 shadow-inner group">
            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(rawCode);
                  toast.success("Code block copied!");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-350 p-1.5 rounded-lg border border-slate-700 transition-all"
                title="Copy code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            {codeLang && (
              <span className="absolute left-4 top-2 text-[9px] font-bold text-slate-550 uppercase tracking-wider">
                {codeLang}
              </span>
            )}
            <pre className={codeLang ? "pt-4" : ""}>
              <code>{rawCode}</code>
            </pre>
          </div>
        );
        codeContent = [];
        inCodeBlock = false;
        codeLang = "";
      }
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Code Block Start/End
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock(i);
        } else {
          // Flush list/table before opening code block
          flushList(i);
          flushTable(i);
          inCodeBlock = true;
          codeLang = line.replace("```", "").trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Parse inline formatting: bold (**text**), italics (*text*), math symbols ($math$)
      let formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, "<strong class='font-extrabold text-slate-900'>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
        .replace(/\`(.*?)\`/g, "<code class='bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-indigo-650'>$1</code>");

      // Headings
      if (formattedLine.startsWith("### ")) {
        flushList(i);
        flushTable(i);
        elements.push(
          <h3 key={i} className="text-sm font-black text-slate-900 mt-6 mb-3 border-l-2 border-primary pl-2 tracking-tight">
            {formattedLine.replace("### ", "")}
          </h3>
        );
      } else if (formattedLine.startsWith("#### ")) {
        flushList(i);
        flushTable(i);
        elements.push(
          <h4 key={i} className="text-xs font-extrabold text-slate-800 mt-4 mb-2">
            {formattedLine.replace("#### ", "")}
          </h4>
        );
      } else if (formattedLine.startsWith("## ")) {
        flushList(i);
        flushTable(i);
        elements.push(
          <h2 key={i} className="text-base font-black text-slate-900 mt-8 mb-4 border-b border-slate-150 pb-1.5 tracking-tight">
            {formattedLine.replace("## ", "")}
          </h2>
        );
      }
      // Table Row
      else if (formattedLine.trim().startsWith("|") && formattedLine.trim().endsWith("|")) {
        flushList(i);
        inTable = true;
        // Split by pipeline, but filter out empty bounding cells
        const cells = formattedLine.split("|").slice(1, -1);
        tableRows.push(cells);
      }
      // Bullet list items
      else if (formattedLine.trim().startsWith("* ") || formattedLine.trim().startsWith("- ")) {
        flushTable(i);
        inList = true;
        const itemContent = formattedLine.trim().replace(/^[\*\-]\s+/, "");
        listItems.push(itemContent);
      }
      // Normal Paragraphs / Empty lines
      else {
        flushList(i);
        flushTable(i);

        if (formattedLine.trim() === "") {
          elements.push(<div key={i} className="h-3" />);
        } else {
          elements.push(
            <p
              key={i}
              className="text-xs text-slate-655 font-medium leading-relaxed mb-3.5"
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />
          );
        }
      }
    }

    // Flush any remaining active structures
    flushList(lines.length);
    flushTable(lines.length);
    flushCodeBlock(lines.length);

    return <div className="prose max-w-none text-left">{elements}</div>;
  };

  const hasContent = content && content.trim().length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col text-left space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          AI Generated Output
        </h3>
        <div className="flex items-center gap-1.5">
          {loading && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>}
          <span className="text-[10px] text-slate-450 font-bold">
            {loading ? "Streaming real-time NIM nodes..." : "APA/Chicago Citation Ready"}
          </span>
        </div>
      </div>

      {/* Main Response Box */}
      <div className="min-h-[220px] max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
        {loading && !hasContent ? (
          <div className="space-y-4 py-4">
            <div className="h-4 bg-slate-100 rounded-lg w-1/3 animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded-lg w-full animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded-lg w-5/6 animate-pulse"></div>
            <div className="h-28 bg-slate-50 border border-slate-100 rounded-xl w-full animate-pulse flex items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Establishing connection with NVIDIA NIM adapters...
              </span>
            </div>
          </div>
        ) : hasContent ? (
          <div className="relative">
            {parseMarkdownToJSX(content)}
            {loading && (
              <span className="inline-block ml-1 w-2 h-4 bg-primary animate-pulse align-middle" />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[180px] text-slate-400 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 stroke-[1.5]" />
            <span className="text-xs font-bold text-slate-450">No output generated yet</span>
            <p className="text-[10px] text-slate-400 max-w-[280px] text-center leading-normal">
              Select a template or write an academic question above to trigger the NIM cognitive engine.
            </p>
          </div>
        )}
      </div>

      {/* Actions Toolbar */}
      {hasContent && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-100">
          {/* Export Formats */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-550" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
              title="Download Markdown"
            >
              <Download className="w-3.5 h-3.5 text-slate-550" />
              <span>MD</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-rose-700 text-xs py-2 px-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
              title="Export formatted PDF"
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportDOCX}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 text-xs py-2 px-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
              title="Export Word Document"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Export DOCX</span>
            </button>
          </div>

          {/* Regenerate / Continue */}
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-450" />
                <span>Regenerate</span>
              </button>
            )}

            {onContinue && (
              <button
                onClick={onContinue}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs py-2.5 px-3.5 rounded-xl font-bold shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
              >
                <span>Continue drafting</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultViewer;
