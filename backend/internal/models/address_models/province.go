package models

type Province struct {
	ID     int    `json:"id"`
	Code   int    `json:"province_code"`
	NameEN string `json:"province_name_en"`
	NameTH string `json:"province_name_th"`
}
