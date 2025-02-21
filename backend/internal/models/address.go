package models

import (
	"github.com/google/uuid"
)

type Address struct {
	BaseModel
	Street            string    `gorm:"street"`
	ProvinceID        int       `gorm:"province_id"`
	ProvinceNameTH    string    `gorm:"province_name_th"`
	ProvinceNameEN    string    `gorm:"province_name_en"`
	DistrictID        int       `gorm:"district_id"`
	DistrictNameTH    string    `gorm:"district_name_th"`
	DistrictNameEN    string    `gorm:"district_name_en"`
	SubDistrictID     int       `gorm:"sub_district_id"`
	SubDistrictNameTH string    `gorm:"sub_district_name_th"`
	SubDistrictNameEN string    `gorm:"sub_district_name_en"`
	PostalCode        int       `gorm:"postal_code"`
	AddressDetail     string    `gorm:"address_detail"`
	UserID            uuid.UUID `gorm:"user_id"`
	Orders            []Order   `gorm:"foreignKey:AddressID"`
}
