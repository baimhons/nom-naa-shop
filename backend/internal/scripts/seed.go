package scripts

import (
	"encoding/json"
	"io"
	"log"
	"os"
)

type jsonProvince struct {
	ID     int    `json:"id"`
	NameTH string `json:"name_th"`
	NameEN string `json:"name_en"`
}

type jsonDistrict struct {
	ID         int    `json:"id"`
	ProvinceID int    `json:"province_id"`
	NameTH     string `json:"name_th"`
	NameEN     string `json:"name_en"`
}

type jsonSubDistrict struct {
	ID         int    `json:"id"`
	DistrictID int    `json:"district_id"`
	NameTH     string `json:"name_th"`
	NameEN     string `json:"name_en"`
	PostalCode int    `json:"postal_code"`
}

func SeedData() {
	provinceFile, err := os.Open("data/provinces.json")
	if err != nil {
		log.Fatalf("failed to open province file: %v", err)
	}
	defer provinceFile.Close()

	districtFile, err := os.Open("data/districts.json")
	if err != nil {
		log.Fatalf("failed to open district file: %v", err)
	}
	defer districtFile.Close()

	subDistrictFile, err := os.Open("data/subdistricts.json")
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
}
