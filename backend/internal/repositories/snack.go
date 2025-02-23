package repositories

import (
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"gorm.io/gorm"
)

type SnackRepository interface {
	BaseRepository[models.Snack]
}

type snackRepositoryImpl struct {
	BaseRepository[models.Snack]
	DB *gorm.DB
}

func NewSnackRepository(db *gorm.DB) SnackRepository {
	return &snackRepositoryImpl{
		BaseRepository: NewBaseRepository[models.Snack](db),
		DB:             db,
	}
}
