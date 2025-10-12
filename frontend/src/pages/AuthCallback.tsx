import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check authentication status (session cookie should be set by backend)
        const response = await fetch('http://localhost:5000/api/auth/user', {
          credentials: 'include',
        });

        if (response.ok) {
          // User is authenticated, redirect to create invoice page
          navigate('/create-invoice');
        } else {
          // Authentication failed, redirect to home
          console.error('Authentication failed');
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/');
      }
    };

    // Small delay to ensure session cookie is set
    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Authenticating...</p>
      </div>
    </div>
  );
}
