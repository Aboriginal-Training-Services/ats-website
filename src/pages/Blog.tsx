import React from "react";
import { Link } from "react-router-dom";

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
          <p className="text-lg text-gray-600 mt-2">
            Insights, updates, and stories from Aboriginal Training Services.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* We'll list posts here in a later step */}
        <div className="text-gray-600">
          No posts yet — we’ll wire this up next.
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Blog;
