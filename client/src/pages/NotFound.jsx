import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] max-w-2xl flex-col justify-center py-20">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">This page does not exist.</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        The link may be old, or the page may have moved. The projects and writing sections are the best
        place to pick things back up.
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        <Link to="/" className="btn-primary btn-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back home
        </Link>
        <Link to="/projects" className="btn-secondary btn-xs">
          Browse projects
        </Link>
      </div>
    </div>
  );
}
