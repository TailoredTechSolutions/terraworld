import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Shield, Lock, Eye, Trash2, Users, Globe, FileText } from "lucide-react";
import { LOGO_FULL as terraLogo } from "@/lib/siteImages";

interface PrivacyPolicyData {
  version: string;
  effective_date: string;
  policy_text: string;
}

const PrivacyPolicyPage = () => {
  const [policy, setPolicy] = useState<PrivacyPolicyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data, error } = await supabase.rpc("get_current_privacy_policy");
        if (data && data.length > 0) {
          setPolicy(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch privacy policy:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback policy content if database doesn't have it
  const effectiveDate = policy?.effective_date || "March 25, 2026";
  const version = policy?.version || "1.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={terraLogo} alt="Terra Farming" className="h-8" />
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Version {version} • Effective Date: {effectiveDate}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Terra Farming ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you use our mobile application and website (collectively, the "Platform").
            </p>
            <p>
              By using Terra Farming, you agree to the collection and use of information in 
              accordance with this policy. Our Platform is rated 12+ on the Apple App Store 
              and Google Play Store.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h4>Personal Information</h4>
            <ul>
              <li><strong>Account Data:</strong> Name, email address, phone number</li>
              <li><strong>Profile Information:</strong> Avatar photo, delivery addresses</li>
              <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
              <li><strong>Usage Data:</strong> App interactions, features used, browsing history within the app</li>
              <li><strong>Location Data:</strong> With your permission, for delivery and farm location services</li>
              <li><strong>Payment Information:</strong> Processed securely through third-party payment processors; we do not store full card details</li>
            </ul>
            
            <h4>Sign In with Apple</h4>
            <p>
              When you use "Sign In with Apple", we receive only the information you choose to share:
            </p>
            <ul>
              <li>Your name (or the name you provide)</li>
              <li>Your email address (or Apple's private relay email)</li>
            </ul>
            <p>
              We do not receive your Apple ID, password, or any payment information through Apple Sign In.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and maintain our marketplace services</li>
              <li>Process orders and transactions between farmers and buyers</li>
              <li>Coordinate deliveries and logistics</li>
              <li>Send you order confirmations, updates, and support messages</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Maintain audit logs for compliance and security purposes</li>
              <li>Improve our services and develop new features</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>We work with the following third-party services:</p>
            <ul>
              <li><strong>Supabase:</strong> Authentication and database hosting</li>
              <li><strong>Apple:</strong> Sign In with Apple authentication</li>
              <li><strong>Payment Processors:</strong> Secure payment processing (we do not store card details)</li>
              <li><strong>Delivery Partners:</strong> Logistics and delivery coordination</li>
            </ul>
            <p>
              We do not sell your personal information to third parties. Data shared with 
              service providers is limited to what is necessary for them to perform their services.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-primary" />
              Your Rights & Account Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Delete your account and associated data</li>
              <li><strong>Location Control:</strong> Enable or disable location permissions at any time</li>
            </ul>
            
            <h4>Account Deletion</h4>
            <p>
              You can delete your account at any time from within the app:
            </p>
            <ol>
              <li>Go to your Profile or Dashboard</li>
              <li>Navigate to Settings or Account</li>
              <li>Find the "Danger Zone" section</li>
              <li>Click "Delete Account" and follow the confirmation steps</li>
            </ol>
            <p>
              When you delete your account:
            </p>
            <ul>
              <li>Your profile information is anonymized</li>
              <li>Active listings (for farmers) are marked as deleted</li>
              <li>Pending orders are cancelled</li>
              <li>Your authentication credentials are permanently removed</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Measures
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>We implement robust security measures to protect your data:</p>
            <ul>
              <li><strong>Encryption:</strong> All data is encrypted in transit using TLS</li>
              <li><strong>Password Security:</strong> Passwords are hashed and never stored in plain text</li>
              <li><strong>Multi-Factor Authentication:</strong> Required for Admin and Affiliate accounts</li>
              <li><strong>Row Level Security:</strong> Database-level access controls</li>
              <li><strong>Audit Logs:</strong> Immutable logging of administrative actions</li>
              <li><strong>Regular Security Reviews:</strong> Ongoing security assessments and updates</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Terra Farming is rated 12+ and is not intended for children under 12 years of age. 
              We do not knowingly collect personal information from children under 12. If you 
              are a parent or guardian and believe your child has provided us with personal 
              information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@terrafarming.app</li>
              <li><strong>Support:</strong> In-app help center</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the 
              "Effective Date" at the top. You are advised to review this Privacy Policy 
              periodically for any changes.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {effectiveDate}
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Terra Farming. All rights reserved.</p>
          <p className="mt-2">
            App Store Rating: 12+ | From Dirt to Dessert 🌱
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
