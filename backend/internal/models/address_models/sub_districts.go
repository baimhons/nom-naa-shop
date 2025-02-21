package models

type SubDistricts struct {
	ID              int    `json:"id"`
	ProvinceCode    int    `json:"province_code"`
	DistrictCode    int    `json:"district_code"`
	SubDistrictCode int    `json:"sub_district_code"`
	NameEN          string `json:"sub_district_name_en"`
	NameTH          string `json:"sub_district_name_th"`
	PostalCode      int    `json:"postal_code"`
}
