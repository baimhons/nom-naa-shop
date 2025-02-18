package request

import "github.com/google/uuid"

type CreateAddressRequest struct {
	ID                uuid.UUID `json:"id,omitempty"` // For updating an existing address
	Street            string    `json:"street" validate:"required"`
	ProvinceID        int       `json:"province_id" validate:"required"`
	ProvinceNameTH    string    `json:"province_name_th"`
	ProvinceNameEN    string    `json:"province_name_en"`
	DistrictID        int       `json:"district_id" validate:"required"`
	DistrictNameTH    string    `json:"district_name_th"`
	DistrictNameEN    string    `json:"district_name_en"`
	SubDistrictID     int       `json:"sub_district_id" validate:"required"`
	SubDistrictNameTH string    `json:"sub_district_name_th"`
	SubDistrictNameEN string    `json:"sub_district_name_en"`
	PostalCode        int       `json:"postal_code" validate:"required"`
	AddressDetail     string    `json:"address_detail"`
	UserID            uuid.UUID `json:"user_id" validate:"required"` // Assuming you have UserID
}

type UpdateAddressRequest struct {
	ID                uuid.UUID `json:"id,omitempty"` // For updating an existing address
	Street            string    `json:"street" validate:"required"`
	ProvinceID        int       `json:"province_id" validate:"required"`
	ProvinceNameTH    string    `json:"province_name_th"`
	ProvinceNameEN    string    `json:"province_name_en"`
	DistrictID        int       `json:"district_id" validate:"required"`
	DistrictNameTH    string    `json:"district_name_th"`
	DistrictNameEN    string    `json:"district_name_en"`
	SubDistrictID     int       `json:"sub_district_id" validate:"required"`
	SubDistrictNameTH string    `json:"sub_district_name_th"`
	SubDistrictNameEN string    `json:"sub_district_name_en"`
	PostalCode        int       `json:"postal_code" validate:"required"`
	AddressDetail     string    `json:"address_detail"`
	UserID            uuid.UUID `json:"user_id" validate:"required"` // Assuming you have UserID
}
