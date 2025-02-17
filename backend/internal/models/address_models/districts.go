package models

type Districts struct {
	ID           int    `json:"id"`
	ProvinceCode int    `json:"province_code"`
	DistrictCode int    `json:"district_code"`
	NameEN       string `json:"district_name_en"`
	NameTH       string `json:"district_name_th"`
	PostalCode   int    `json:"postal_code"`
}
