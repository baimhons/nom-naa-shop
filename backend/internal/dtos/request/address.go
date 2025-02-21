package request

import (
	"github.com/google/uuid"
)

type CreateAddressRequest struct {
	Street        string `json:"street" validate:"required"`
	ProvinceID    int    `json:"province_id" validate:"required"`
	DistrictID    int    `json:"district_id" validate:"required"`
	SubDistrictID int    `json:"sub_district_id" validate:"required"`
	PostalCode    int    `json:"postal_code" validate:"required"`
	AddressDetail string `json:"address_detail"`
	UserID        string `json:"user_id" validate:"required"` // Assuming you have UserID
}

type UpdateAddressRequest struct {
	ID            uuid.UUID `json:"id,omitempty"` // For updating an existing address
	Street        string    `json:"street" validate:"required"`
	ProvinceID    int       `json:"province_id" validate:"required"`
	DistrictID    int       `json:"district_id" validate:"required"`
	SubDistrictID int       `json:"sub_district_id" validate:"required"`
	PostalCode    int       `json:"postal_code" validate:"required"`
	AddressDetail string    `json:"address_detail"`
	UserID        uuid.UUID `json:"user_id" validate:"required"` // Assuming you have UserID
}
