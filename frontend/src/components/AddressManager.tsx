import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MapPin, Plus, X, Pencil, Trash2 } from "lucide-react";

interface Province {
  id: number;
  province_code: number;
  province_name_en: string;
  province_name_th: string;
}

interface District {
  id: number;
  district_code: number;
  province_code: number;
  district_name_en: string;
  district_name_th: string;
}

interface SubDistrict {
  id: number;
  sub_district_code: number;
  province_code: number;
  district_code: number;
  sub_district_name_en: string;
  sub_district_name_th: string;
  postal_code: number;
}

interface Address {
  ID?: string;
  CreateAt?: string;
  UpdateAt?: string;
  DeleteAt?: string;
  ProvinceCode?: number;
  DistrictCode?: number;
  SubDistrictCode?: number;
  ProvinceNameTH?: string;
  DistrictNameTH?: string;
  SubDistrictNameTH?: string;
  PostalCode?: number;
  AddressDetail: string;
  UserID?: string;
  // Support for old format
  province_code?: number;
  district_code?: number;
  sub_district_code?: number;
  province_name?: string;
  district_name?: string;
  sub_district_name?: string;
  postal_code?: number;
  address_detail?: string;
}

interface AddressFormData {
  province_code: string;
  district_code: string;
  sub_district_code: string;
  address_detail: string;
}

const AddressManager = () => {
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    addressId: string | null;
  }>({ open: false, addressId: null });

  const form = useForm<AddressFormData>({
    defaultValues: {
      province_code: "",
      district_code: "",
      sub_district_code: "",
      address_detail: "",
    },
  });

  // Reset form when switching between add/edit modes
  useEffect(() => {
    if (!addingAddress && !editingAddress) {
      form.reset({
        province_code: "",
        district_code: "",
        sub_district_code: "",
        address_detail: "",
      });
      setSelectedProvince(null);
      setSelectedDistrict(null);
    }
  }, [addingAddress, editingAddress, form]);

  useEffect(() => {
    fetchUserAddresses();
    fetchProvinces();
  }, []);

  const fetchUserAddresses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const response = await fetch("http://206.189.153.4:8080/api/v1/address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          return;
        }
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      console.log("Address data:", data);
      setUserAddresses(data.data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch(
        "http://206.189.153.4:8080/api/v1/address/provinces"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch provinces");
      }
      const data = await response.json();
      setProvinces(data.data || []);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast({
        title: "Error",
        description: "Failed to load provinces",
        variant: "destructive",
      });
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    try {
      const response = await fetch(
        `http://206.189.153.4:8080/api/v1/address/province/${provinceCode}/districts`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }
      const data = await response.json();
      setDistricts(data.data || []);
      setSubDistricts([]);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast({
        title: "Error",
        description: "Failed to load districts",
        variant: "destructive",
      });
    }
  };

  const fetchSubDistricts = async (districtCode: string) => {
    try {
      const response = await fetch(
        `http://206.189.153.4:8080/api/v1/address/district/${districtCode}/sub_districts`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sub-districts");
      }
      const data = await response.json();
      setSubDistricts(data.data || []);
    } catch (error) {
      console.error("Error fetching sub-districts:", error);
      toast({
        title: "Error",
        description: "Failed to load sub-districts",
        variant: "destructive",
      });
    }
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedDistrict(null);
    form.setValue("district_code", "");
    form.setValue("sub_district_code", "");
    fetchDistricts(value);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    form.setValue("sub_district_code", "");
    fetchSubDistricts(value);
  };

  const onSubmit = async (data: AddressFormData) => {
    if (!editingAddress && userAddresses.length >= 2) {
      toast({
        title: "Error",
        description: "Maximum of 2 addresses allowed",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const payload = {
        province_code: parseInt(data.province_code),
        district_code: parseInt(data.district_code),
        sub_district_code: parseInt(data.sub_district_code),
        address_detail: data.address_detail,
      };

      let url = "http://206.189.153.4:8080/api/v1/address";
      let method = "POST";

      // If editing, include the ID and use PUT method
      if (editingAddress) {
        url = `http://206.189.153.4:8080/api/v1/address/${editingAddress}`;
        method = "PUT";
        // Add id to payload for update
        Object.assign(payload, { id: editingAddress });
      }

      console.log(
        `${method === "POST" ? "Submitting" : "Updating"} address payload:`,
        payload
      );

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${editingAddress ? "update" : "add"} address`
        );
      }

      toast({
        title: "Success",
        description: `Address ${
          editingAddress ? "updated" : "added"
        } successfully`,
      });

      // Refresh user addresses
      fetchUserAddresses();
      setAddingAddress(false);
      setEditingAddress(null);
      form.reset();
    } catch (error) {
      console.error(
        `Error ${editingAddress ? "updating" : "adding"} address:`,
        error
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${editingAddress ? "update" : "add"} address`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    // Get the ID from either format
    const addressId = address.ID || "";

    // Get the codes from either format
    const provinceCode = String(
      address.ProvinceCode || address.province_code || ""
    );
    const districtCode = String(
      address.DistrictCode || address.district_code || ""
    );
    const subDistrictCode = String(
      address.SubDistrictCode || address.sub_district_code || ""
    );
    const addressDetail = address.AddressDetail || address.address_detail || "";

    setEditingAddress(addressId);

    // First fetch the required data for the dropdowns
    fetchDistricts(provinceCode)
      .then(() => fetchSubDistricts(districtCode))
      .then(() => {
        // Then set the form values
        form.setValue("province_code", provinceCode);
        form.setValue("district_code", districtCode);
        form.setValue("sub_district_code", subDistrictCode);
        form.setValue("address_detail", addressDetail);

        // Update selected values for conditional rendering
        setSelectedProvince(provinceCode);
        setSelectedDistrict(districtCode);
      })
      .catch((error) => {
        console.error("Error setting up edit form:", error);
        toast({
          title: "Error",
          description: "Failed to prepare the edit form. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleDeleteConfirmation = (addressId: string) => {
    setDeleteDialog({
      open: true,
      addressId,
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.addressId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const response = await fetch(
        `http://206.189.153.4:8080/api/v1/address/${deleteDialog.addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });

      // Close dialog and refresh addresses
      setDeleteDialog({ open: false, addressId: null });
      fetchUserAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayAddress = (address: Address) => {
    // First check the new format from API
    if (
      address.ProvinceNameTH &&
      address.DistrictNameTH &&
      address.SubDistrictNameTH
    ) {
      return {
        province: address.ProvinceNameTH,
        district: address.DistrictNameTH,
        subDistrict: address.SubDistrictNameTH,
        postalCode: address.PostalCode,
        addressDetail: address.AddressDetail || address.address_detail,
      };
    }

    // Fall back to the old format and lookups
    const province = provinces.find(
      (p) => p.province_code === (address.ProvinceCode || address.province_code)
    );
    const district = districts.find(
      (d) => d.district_code === (address.DistrictCode || address.district_code)
    );
    const subDistrict = subDistricts.find(
      (s) =>
        s.sub_district_code ===
        (address.SubDistrictCode || address.sub_district_code)
    );

    return {
      province:
        province?.province_name_th || address.province_name || "Unknown",
      district:
        district?.district_name_th || address.district_name || "Unknown",
      subDistrict:
        subDistrict?.sub_district_name_th ||
        address.sub_district_name ||
        "Unknown",
      postalCode:
        subDistrict?.postal_code ||
        address.PostalCode ||
        address.postal_code ||
        "N/A",
      addressDetail: address.AddressDetail || address.address_detail || "",
    };
  };

  const renderAddressForm = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {editingAddress ? (
              <>
                <Pencil className="h-4 w-4" />
                Edit Address
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add New Address
              </>
            )}
          </CardTitle>
          <CardDescription>
            {editingAddress
              ? "Update your address information"
              : "You can add up to 2 addresses"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="province_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleProvinceChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem
                              key={province.id}
                              value={String(province.province_code)}
                            >
                              {province.province_name_th} (
                              {province.province_name_en})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleDistrictChange(value);
                        }}
                        value={field.value}
                        disabled={!selectedProvince}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem
                              key={district.id}
                              value={String(district.district_code)}
                            >
                              {district.district_name_th} (
                              {district.district_name_en})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sub_district_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub District</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedDistrict}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sub-district" />
                        </SelectTrigger>
                        <SelectContent>
                          {subDistricts.map((subDistrict) => (
                            <SelectItem
                              key={subDistrict.id}
                              value={String(subDistrict.sub_district_code)}
                            >
                              {subDistrict.sub_district_name_th} (
                              {subDistrict.sub_district_name_en}) -{" "}
                              {subDistrict.postal_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_detail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Details</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House number, street, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddingAddress(false);
                    setEditingAddress(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editingAddress
                    ? "Update Address"
                    : "Save Address"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Your Addresses
        </h3>
        {!addingAddress && !editingAddress && userAddresses.length < 2 && (
          <Button onClick={() => setAddingAddress(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Address
          </Button>
        )}
      </div>

      {(addingAddress || editingAddress) && renderAddressForm()}

      {userAddresses.length === 0 && !addingAddress && !editingAddress ? (
        <Card className="bg-muted/50">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No addresses found. Add your first address.
            </p>
            <Button onClick={() => setAddingAddress(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {userAddresses.map((address, index) => {
            const displayAddress = getDisplayAddress(address);
            const addressId = address.ID || "";

            return (
              <Card key={addressId || index} className="overflow-hidden">
                <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
                  <div>
                    <CardTitle className="text-md font-medium">
                      Address {index + 1}
                    </CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(address)}
                      disabled={addingAddress || !!editingAddress}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteConfirmation(addressId)}
                      disabled={addingAddress || !!editingAddress}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-1">
                    <p>
                      <strong>Address:</strong> {displayAddress.addressDetail}
                    </p>
                    <p>
                      <strong>Sub-district:</strong>{" "}
                      {displayAddress.subDistrict}
                    </p>
                    <p>
                      <strong>District:</strong> {displayAddress.district}
                    </p>
                    <p>
                      <strong>Province:</strong> {displayAddress.province}
                    </p>
                    <p>
                      <strong>Postal Code:</strong> {displayAddress.postalCode}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open, addressId: null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, addressId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressManager;
