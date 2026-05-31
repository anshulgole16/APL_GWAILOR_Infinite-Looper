import React from 'react';

export default function MarkdownRenderer({ text }) {
  if (!text) return null;
  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-200">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        
        // Headings
        if (line.startsWith("## ")) {
          return <h2 key={i} className="font-display font-black text-amber-400 text-base mt-4 mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1 uppercase tracking-wider">{line.slice(3)}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="font-display font-bold text-green-400 mt-3 mb-1">{line.slice(4)}</h3>;
        }
        
        // List Items
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const html = line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong class='text-amber-300 font-semibold'>$1</strong>");
          return (
            <div key={i} className="flex gap-2 items-start pl-2">
              <span className="text-amber-500 mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span dangerouslySetInnerHTML={{ __html: html }} className="text-gray-300" />
            </div>
          );
        }
        
        // Numbered List
        if (/^\d+\.\s/.test(line)) {
          const m = line.match(/^(\d+)\.\s(.+)/);
          if (m) {
            const html = m[2].replace(/\*\*(.*?)\*\*/g, "<strong class='text-amber-300 font-semibold'>$1</strong>");
            return (
              <div key={i} className="flex gap-2.5 pl-2">
                <span className="text-green-400 font-display font-bold min-w-[1.2rem]">{m[1]}.</span>
                <span dangerouslySetInnerHTML={{ __html: html }} className="text-gray-300" />
              </div>
            );
          }
        }

        // Normal text
        const html = line
          .replace(/\*\*(.*?)\*\*/g, "<strong class='text-amber-300 font-semibold'>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em class='text-green-400 italic'>$1</em>");
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} className="text-gray-300 font-normal" />;
      })}
    </div>
  );
}
