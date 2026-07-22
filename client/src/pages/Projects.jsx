import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FolderGit2, ExternalLink, Code2, Star } from 'lucide-react';

export const Projects = () => {
  return (
    <div className="space-y-5">
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-base font-bold text-slate-900">Projects Showcase</h1>
        <p className="text-xs text-slate-500">Explore hackathon submissions from talented builders around the globe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-900">SmartDoc Synthesizer</h2>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded">AI Challenge '26</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            An automated document ingestion and query agent powered by vector embeddings and multi-model consensus.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 (18 votes)
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">
                <Code2 className="w-3.5 h-3.5" /> Code
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="w-3.5 h-3.5" /> Demo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
