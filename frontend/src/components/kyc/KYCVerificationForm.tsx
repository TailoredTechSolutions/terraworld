import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const individualSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state_province: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const companySchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  registration_number: z.string().min(1, "Registration number is required"),
  tax_id: z.string().min(1, "Tax ID is required"),
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state_province: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type IndividualFormData = z.infer<typeof individualSchema>;
type CompanyFormData = z.infer<typeof companySchema>;

interface KYCVerificationFormProps {
  userId: string;
  existingProfile?: any;
  onSubmitSuccess: () => void;
}

const KYCVerificationForm = ({ userId, existingProfile, onSubmitSuccess }: KYCVerificationFormProps) => {
  const [accountType, setAccountType] = useState<'individual' | 'company'>(
    existingProfile?.account_type || 'individual'
  );
  const [submitting, setSubmitting] = useState(false);

  const individualForm = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
    defaultValues: {
      first_name: existingProfile?.first_name || "",
      middle_name: existingProfile?.middle_name || "",
      last_name: existingProfile?.last_name || "",
      date_of_birth: existingProfile?.date_of_birth || "",
      nationality: existingProfile?.nationality || "",
      address_line1: existingProfile?.address_line1 || "",
      address_line2: existingProfile?.address_line2 || "",
      city: existingProfile?.city || "",
      state_province: existingProfile?.state_province || "",
      postal_code: existingProfile?.postal_code || "",
      country: existingProfile?.country || "",
    },
  });

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: existingProfile?.company_name || "",
      registration_number: existingProfile?.registration_number || "",
      tax_id: existingProfile?.tax_id || "",
      address_line1: existingProfile?.address_line1 || "",
      address_line2: existingProfile?.address_line2 || "",
      city: existingProfile?.city || "",
      state_province: existingProfile?.state_province || "",
      postal_code: existingProfile?.postal_code || "",
      country: existingProfile?.country || "",
    },
  });

  const onSubmitIndividual = async (data: IndividualFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        user_id: userId,
        account_type: 'individual' as const,
        ...data,
        status: 'pending' as const,
        submitted_at: new Date().toISOString(),
      };

      if (existingProfile?.id) {
        const { error } = await supabase
          .from('kyc_profiles')
          .update(payload)
          .eq('id', existingProfile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kyc_profiles')
          .insert(payload);
        if (error) throw error;
      }

      toast({
        title: "KYC Submitted",
        description: "Your verification request has been submitted for review",
      });
      onSubmitSuccess();
    } catch (error: any) {
      console.error("KYC submission error:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit KYC information",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitCompany = async (data: CompanyFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        user_id: userId,
        account_type: 'company' as const,
        ...data,
        status: 'pending' as const,
        submitted_at: new Date().toISOString(),
      };

      if (existingProfile?.id) {
        const { error } = await supabase
          .from('kyc_profiles')
          .update(payload)
          .eq('id', existingProfile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kyc_profiles')
          .insert(payload);
        if (error) throw error;
      }

      toast({
        title: "KYB Submitted",
        description: "Your business verification request has been submitted for review",
      });
      onSubmitSuccess();
    } catch (error: any) {
      console.error("KYB submission error:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit KYB information",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isEditable = !existingProfile || existingProfile.status === 'not_started' || existingProfile.status === 'rejected';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>
          Complete your KYC/KYB verification to unlock all platform features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={accountType} onValueChange={(v) => setAccountType(v as 'individual' | 'company')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="individual" disabled={!isEditable}>
              <User className="mr-2 h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="company" disabled={!isEditable}>
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <Form {...individualForm}>
              <form onSubmit={individualForm.handleSubmit(onSubmitIndividual)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={individualForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={individualForm.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Filipino" disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={individualForm.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={individualForm.control}
                  name="address_line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={individualForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="state_province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Philippines" disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditable && (
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Verification"
                    )}
                  </Button>
                )}
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="company">
            <Form {...companyForm}>
              <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={companyForm.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={companyForm.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / TIN</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={companyForm.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={companyForm.control}
                  name="address_line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={companyForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="state_province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Philippines" disabled={!isEditable} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditable && (
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Verification"
                    )}
                  </Button>
                )}
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KYCVerificationForm;
