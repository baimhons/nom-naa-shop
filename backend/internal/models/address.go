package models

type Address struct {
	BaseModel
	ProvinceID        int     `json:"province_id"`
	ProvinceNameTH    string  `json:"province_name_th"`
	ProvinceNameEN    string  `json:"province_name_en"`
	DistrictID        int     `json:"district_id"`
	DistrictNameTH    string  `json:"district_name_th"`
	DistrictNameEN    string  `json:"district_name_en"`
	SubDistrictID     int     `json:"sub_district_id"`
	SubDistrictNameTH string  `json:"sub_district_name_th"`
	SubDistrictNameEN string  `json:"sub_district_name_en"`
	PostalCode        int     `json:"postal_code"`
	AddressDetail     string  `json:"address_detail"`
	UserID            int     `json:"user_id"`
	Orders            []Order `gorm:"foreignKey:AddressID"`
}
