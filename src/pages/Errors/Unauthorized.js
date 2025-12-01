import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <LockClosedIcon className="mx-auto h-24 w-24 text-red-500" />
        <h1 className="mt-6 text-4xl font-bold text-gray-900">403</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-700">
          Access Denied
        </h2>
        <p className="mt-2 text-gray-600">
          You don't have permission to access this page.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

