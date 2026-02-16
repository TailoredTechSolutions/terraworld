import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ProductImageUploaderProps {
  productId: string;
  farmerId: string;
}

const ProductImageUploader = ({ productId, farmerId }: ProductImageUploaderProps) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["product-images", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const img = images.find((i) => i.id === imageId);
      if (img) {
        // Extract path from URL
        const urlParts = img.image_url.split("/product-images/");
        if (urlParts[1]) {
          await supabase.storage.from("product-images").remove([urlParts[1]]);
        }
      }
      const { error } = await supabase.from("product_images").delete().eq("id", imageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
      toast({ title: "Image removed" });
    },
    onError: (err) => {
      toast({ title: "Failed to remove image", description: err.message, variant: "destructive" });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newOrder = images.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `${farmerId}/${productId}/${Date.now()}-${i}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (uploadErr) {
        toast({ title: `Upload failed: ${file.name}`, description: uploadErr.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);

      const { error: insertErr } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: urlData.publicUrl,
        display_order: newOrder + i,
      });

      if (insertErr) {
        toast({ title: "Failed to save image record", description: insertErr.message, variant: "destructive" });
      }
    }

    queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
    setUploading(false);
    toast({ title: `${files.length} image(s) uploaded` });
    // Reset input
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Product Photos ({images.length})</p>
        <Button variant="outline" size="sm" asChild disabled={uploading}>
          <label className="cursor-pointer">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Add Photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          </label>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-6 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square">
              <img src={img.image_url} alt="Product" className="w-full h-full object-cover" />
              <button
                onClick={() => deleteMutation.mutate(img.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={deleteMutation.isPending}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
