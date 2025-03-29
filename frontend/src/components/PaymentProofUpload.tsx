import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, Check, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PaymentProofUploadProps {
  orderId: string;
  onSuccess?: () => void;
}

const PaymentProofUpload = ({
  orderId,
  onSuccess,
}: PaymentProofUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a payment proof image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You must be logged in to upload payment proof");
      }

      const formData = new FormData();
      formData.append("order_id", orderId);
      formData.append("files", file);

      const response = await fetch(
        "http://206.189.153.4:8080/api/v1/payment/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Remove Content-Type header to let the browser set it with boundary
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload payment proof");
      }

      const data = await response.json();

      // Verify the payment proof is uploaded
      const proofResponse = await fetch(
        `http://206.189.153.4:8080/api/v1/payment/proof/${data.payment.ID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "image/*",
          },
        }
      );

      if (!proofResponse.ok) {
        throw new Error("Failed to verify payment proof upload");
      }

      toast({
        title: "Success",
        description: "Payment proof uploaded successfully",
        variant: "default",
      });

      // Reset form and close dialog
      setFile(null);
      setPreview(null);
      setIsOpen(false);

      // Trigger callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload payment proof",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Upload className="h-4 w-4" /> Upload Payment Proof
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
          <DialogDescription>
            Upload an image of your payment transaction as proof of payment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="payment-proof" className="text-sm font-medium">
              Payment Receipt Image
            </label>
            <input
              id="payment-proof"
              type="file"
              ref={fileInputRef}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {preview && (
            <div className="relative">
              <div className="relative border rounded-md overflow-hidden">
                <img
                  src={preview}
                  alt="Payment proof preview"
                  className="w-full max-h-60 object-contain"
                />
                <button
                  onClick={clearSelectedFile}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected file: {file?.name} (
                {Math.round(file?.size ? file.size / 1024 : 0)} KB)
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || !file}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentProofUpload;
