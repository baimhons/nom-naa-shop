package models

type Districts struct {
	ID             int    `json:"id"`
	ProvinceCode   int    `json:"province_code"`
	DistrictCode   int    `json:"district_code"`
	DistrictNameEN string `json:"district_name_en"`
	DistrictNameTH string `json:"district_name_th"`
	PostalCode     int    `json:"postal_code"`
}
