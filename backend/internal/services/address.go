package services

import (
	"time"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/google/uuid"
)

type AddressService interface {
	CreateAddress(req request.CreateAddressRequest) (models.Address, error)
	UpdateAddress(req request.UpdateAddressRequest) (models.Address, error)
	DeleteAddress(addressID uuid.UUID) error
	GetAddressByID(addressID uuid.UUID) (models.Address, error)
}

type addressService struct {
	addressRepository repositories.AddressRepository
}

func NewAddressService(addressRepository repositories.AddressRepository) AddressService {
	return &addressService{
		addressRepository: addressRepository,
	}
}

func (as *addressService) CreateAddress(req request.CreateAddressRequest) (models.Address, error) {
	address := models.Address{
		ProvinceID:    req.ProvinceID,
		DistrictID:    req.DistrictID,
		SubDistrictID: req.SubDistrictID,
		PostalCode:    req.PostalCode,
		UserID:        req.ID,
	}

	if err := as.addressRepository.Create(&address); err != nil {
		return models.Address{}, err
	}

	return address, nil
}

func (as *addressService) UpdateAddress(req request.UpdateAddressRequest) (models.Address, error) {
	address := models.Address{
		BaseModel: models.BaseModel{
			ID:       req.ID,
			UpdateAt: time.Now(),
		},
		ProvinceID:    req.ProvinceID,
		DistrictID:    req.DistrictID,
		SubDistrictID: req.SubDistrictID,
		PostalCode:    req.PostalCode,
		AddressDetail: req.AddressDetail,
	}

	if err := as.addressRepository.Update(&address); err != nil {
		return models.Address{}, err
	}

	return address, nil
}

func (as *addressService) DeleteAddress(addressID uuid.UUID) error {
	address := models.Address{
		BaseModel: models.BaseModel{
			ID: addressID,
		},
	}
	return as.addressRepository.Delete(&address)
}

func (as *addressService) GetAddressByID(addressID uuid.UUID) (models.Address, error) {
	var address models.Address
	if err := as.addressRepository.GetByID(&address, addressID.String()); err != nil {
		return models.Address{}, err
	}
	return address, nil
}
