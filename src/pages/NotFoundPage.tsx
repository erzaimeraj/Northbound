import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-6xl font-bold text-forest">404</p>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Page not found</h1>
      <p className="mt-2 text-sm text-stone-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back Home
      </Link>
    </div>
  );
}
