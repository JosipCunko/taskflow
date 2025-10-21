"use client";

import { FileText, Keyboard, Sigma } from "lucide-react";

export default function NotesWelcome() {
  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500/10 rounded-full mb-4">
            <FileText size={40} className="text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-text-low mb-2">
            Welcome to Advanced Notes
          </h2>
          <p className="text-text-gray">
            Create your first note to unlock powerful features!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-background-650 p-6 rounded-lg border border-divider">
            <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <FileText size={24} className="text-primary-400" />
            </div>
            <h3 className="font-semibold text-text-low mb-2">Auto-Growing</h3>
            <p className="text-sm text-text-gray">
              Textareas automatically adjust to your content
            </p>
          </div>

          <div className="bg-background-650 p-6 rounded-lg border border-divider">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <Keyboard size={24} className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-text-low mb-2">
              VSCode Shortcuts
            </h3>
            <p className="text-sm text-text-gray">
              Duplicate, move, and delete lines with ease
            </p>
          </div>

          <div className="bg-background-650 p-6 rounded-lg border border-divider">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <Sigma size={24} className="text-green-400" />
            </div>
            <h3 className="font-semibold text-text-low mb-2">Math Symbols</h3>
            <p className="text-sm text-text-gray">
              Insert mathematical symbols with one click
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary-500/5 border border-primary-500/20 rounded-lg">
          <p className="text-sm text-text-gray">
            💡 <span className="font-semibold text-primary-400">Pro Tip:</span>{" "}
            Click the &quot;Shortcuts&quot; button in the top-right to view all
            available keyboard shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}
