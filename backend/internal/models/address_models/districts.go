package models

type Districts struct {
	ID           int    `json:"id"`
	Code         int    `json:"district_code"`
	ProvinceCode int    `json:"province_code"`
	NameEN       string `json:"district_name_en"`
	NameTH       string `json:"district_name_th"`
}
