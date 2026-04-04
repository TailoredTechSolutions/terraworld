import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (userData: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';

/**
 * Google Sign-In Button Component
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
export const GoogleSignInButton = ({ onSuccess, onError, disabled }: GoogleSignInButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({
        title: 'Sign In Failed',
        description: 'No credential received from Google',
        variant: 'destructive',
      });
      onError?.('No credential received');
      return;
    }

    setIsLoading(true);

    try {
      // Verify the token with our backend
      const response = await fetch(`${BACKEND_URL}/api/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to verify Google token');
      }

      const data = await response.json();

      if (data.success && data.user) {
        toast({
          title: 'Welcome!',
          description: `Signed in as ${data.user.email}`,
        });
        onSuccess(data.user);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
      toast({
        title: 'Sign In Failed',
        description: message,
        variant: 'destructive',
      });
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: 'Sign In Failed',
      description: 'Google sign in was unsuccessful. Please try again.',
      variant: 'destructive',
    });
    onError?.('Google sign in failed');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3 rounded-lg border bg-white dark:bg-gray-800">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Signing in with Google...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleSignInButton;
