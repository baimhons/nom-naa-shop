package scripts

import (
	"encoding/json"
	"io"
	"log"
	"os"

	models "github.com/baimhons/nom-naa-shop.git/internal/models/address_models"
	"gorm.io/gorm"
)

type jsonProvince struct {
	ID     int    `json:"id"`
	Code   int    `json:"province_code"`
	NameTH string `json:"name_th"`
	NameEN string `json:"name_en"`
}

type jsonDistrict struct {
	ID           int    `json:"id"`
	Code         int    `json:"district_code"`
	ProvinceCode int    `json:"province_code"`
	NameTH       string `json:"name_th"`
	NameEN       string `json:"name_en"`
}

type jsonSubDistrict struct {
	ID           int    `json:"id"`
	Code         int    `json:"sub_district_code"`
	ProvinceCode int    `json:"province_code"`
	DistrictCode int    `json:"district_code"`
	NameTH       string `json:"name_th"`
	NameEN       string `json:"name_en"`
	PostalCode   int    `json:"postal_code"`
}

func SeedData(db *gorm.DB) {
	var provinceCount int64
	if err := db.Model(&models.Province{}).Count(&provinceCount).Error; err != nil {
		log.Fatalf("failed to count province: %v", err)
	}

	var districtCount int64
	if err := db.Model(&models.Districts{}).Count(&districtCount).Error; err != nil {
		log.Fatalf("failed to count district: %v", err)
	}

	var subDistrictCount int64
	if err := db.Model(&models.SubDistricts{}).Count(&subDistrictCount).Error; err != nil {
		log.Fatalf("failed to count subdistrict: %v", err)
	}

	if provinceCount > 1 && districtCount > 1 && subDistrictCount > 1 {
		log.Println("No need to seed data, province count is greater than 1.")
		return
	}

	provinceFile, err := os.Open("../internal/data/address/provinces.json")
	if err != nil {
		log.Fatalf("failed to open province file: %v", err)
	}
	defer provinceFile.Close()

	districtFile, err := os.Open("../internal/data/address/districts.json")
	if err != nil {
		log.Fatalf("failed to open district file: %v", err)
	}
	defer districtFile.Close()

	subDistrictFile, err := os.Open("../internal/data/address/sub_districts.json")
	if err != nil {
		log.Fatalf("failed to open subdistrict file: %v", err)
	}
	defer subDistrictFile.Close()

	byteProvince, err := io.ReadAll(provinceFile)
	if err != nil {
		log.Fatalf("failed to read province file: %v", err)
	}

	byteDistrict, err := io.ReadAll(districtFile)
	if err != nil {
		log.Fatalf("failed to read district file: %v", err)
	}

	byteSubDistrict, err := io.ReadAll(subDistrictFile)
	if err != nil {
		log.Fatalf("failed to read subdistrict file: %v", err)
	}

	var provinces []jsonProvince
	if err := json.Unmarshal(byteProvince, &provinces); err != nil {
		log.Fatalf("failed to unmarshal province data: %v", err)
	}

	var districts []jsonDistrict
	if err := json.Unmarshal(byteDistrict, &districts); err != nil {
		log.Fatalf("failed to unmarshal district data: %v", err)
	}

	var subDistricts []jsonSubDistrict
	if err := json.Unmarshal(byteSubDistrict, &subDistricts); err != nil {
		log.Fatalf("failed to unmarshal subdistrict data: %v", err)
	}

	if err := db.AutoMigrate(
		&models.Province{},
		&models.Districts{},
		&models.SubDistricts{},
	); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	for _, province := range provinces {
		db.Create(&models.Province{ID: province.ID,
			Code:   province.Code,
			NameTH: province.NameTH,
			NameEN: province.NameEN})
	}

	for _, district := range districts {
		db.Create(&models.Districts{ID: district.ID,
			Code:         district.Code,
			ProvinceCode: district.ProvinceCode,
			NameTH:       district.NameTH,
			NameEN:       district.NameEN})
	}

	for _, subDistrict := range subDistricts {
		db.Create(&models.SubDistricts{ID: subDistrict.ID,
			Code:         subDistrict.Code,
			ProvinceCode: subDistrict.ProvinceCode,
			DistrictCode: subDistrict.DistrictCode,
			NameTH:       subDistrict.NameTH,
			NameEN:       subDistrict.NameEN,
			PostalCode:   subDistrict.PostalCode})
	}

}
