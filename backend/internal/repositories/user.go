package repositories

import (
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	SaveAddress(user *models.User) error
}

type userRepository struct {
	DB *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{DB: db}
}

func (r *userRepository) SaveAddress(user *models.User) error {
	return r.DB.Create(user).Error
}

func (r *userRepository) GetAllAddress(user *models.User) error {
	return r.DB.Find(user).Error
}
