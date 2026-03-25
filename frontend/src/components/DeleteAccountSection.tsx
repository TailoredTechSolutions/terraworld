import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface DeleteAccountSectionProps {
  userRole: string;
  className?: string;
}

const DeleteAccountSection = ({ userRole, className = "" }: DeleteAccountSectionProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      toast({
        title: "Confirmation Required",
        description: 'Please type "DELETE" to confirm account deletion.',
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Unable to identify user. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Call the delete_user_account RPC
      const { error } = await supabase.rpc("delete_user_account", {
        p_user_id: user.id,
        p_role: userRole,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted. We're sorry to see you go.",
      });

      // Sign out and redirect to home
      await signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDialogOpen(false);
      setConfirmText("");
    }
  };

  return (
    <Card className={`border-destructive/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible and destructive actions. Please proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
          <div>
            <h4 className="font-semibold text-destructive">Delete Account</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Your Account?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left space-y-3">
                  <p>
                    This action is <strong>permanent and cannot be undone</strong>. 
                    Deleting your account will:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Remove all your personal information</li>
                    <li>Cancel any pending orders</li>
                    {userRole === "farmer" && (
                      <li>Mark all your product listings as deleted</li>
                    )}
                    <li>Delete your authentication credentials</li>
                    <li>Remove your transaction history from your view</li>
                  </ul>
                  <div className="pt-4">
                    <Label htmlFor="confirm-delete" className="text-foreground">
                      Type <span className="font-mono font-bold">DELETE</span> to confirm:
                    </Label>
                    <Input
                      id="confirm-delete"
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                      placeholder="Type DELETE"
                      className="mt-2 font-mono"
                      disabled={isDeleting}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== "DELETE" || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Forever
                    </>
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeleteAccountSection;
