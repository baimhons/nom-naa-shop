package models

type Province struct {
	ID             int    `json:"id"`
	ProvinceCode   int    `json:"province_code"`
	ProvinceNameEN string `json:"province_name_en"`
	ProvinceNameTH string `json:"province_name_th"`
}
