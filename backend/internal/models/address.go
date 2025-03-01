package models

import (
	addressModels "github.com/baimhons/nom-naa-shop.git/internal/models/address_models"
	"github.com/google/uuid"
)

type Address struct {
	BaseModel
	ProvinceCode      int       `gorm:"province_code"`
	ProvinceNameTH    string    `gorm:"province_name_th"`
	DistrictCode      int       `gorm:"district_code"`
	DistrictNameTH    string    `gorm:"district_name_th"`
	SubDistrictCode   int       `gorm:"sub_district_code"`
	SubDistrictNameTH string    `gorm:"sub_district_name_th"`
	PostalCode        int       `gorm:"postal_code"`
	AddressDetail     string    `gorm:"address_detail"`
	UserID            uuid.UUID `gorm:"user_id"`
}

// Province represents a province in the system
type Province struct {
	addressModels.Province
}

// District represents a district in the system
type District struct {
	addressModels.Districts
}

// SubDistrict represents a sub-district in the system
type SubDistrict struct {
	addressModels.SubDistricts
}
