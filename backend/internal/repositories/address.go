package repositories

import (
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"gorm.io/gorm"
)

type AddressRepository interface {
	BaseRepository[models.Address]
}

type addressRepository struct {
	BaseRepository[models.Address]
	DB *gorm.DB
}

func NewAddressRepository(db *gorm.DB) AddressRepository {
	return &addressRepository{
		BaseRepository: NewBaseRepository[models.Address](db),
		DB:             db,
	}
}
