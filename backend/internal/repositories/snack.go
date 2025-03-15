package repositories

import (
	"fmt"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SnackRepository interface {
	BaseRepository[models.Snack]
	GetSnackByID(id uuid.UUID) (snack *models.Snack, err error)
	GetSnackByIDWithReview(id uuid.UUID) (snack *models.Snack, err error)
	GetAllTypes() ([]string, error)
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

func (r *snackRepositoryImpl) GetAll(snacks *[]models.Snack, querys *request.PaginationQuery) error {
	query := r.DB

	if querys != nil {

		if querys.Type != nil && *querys.Type != "" {
			query = query.Where("type = ?", *querys.Type)
		}

		if querys.Search != nil && *querys.Search != "" {
			searchTerm := "%" + *querys.Search + "%"
			query = query.Where("name LIKE ?", searchTerm)
		}

		if querys.Sort != nil && *querys.Sort != "" {
			if querys.Order != nil && *querys.Order == "desc" {
				query = query.Order(fmt.Sprintf("%s DESC", *querys.Sort))
			} else {
				query = query.Order(fmt.Sprintf("%s ASC", *querys.Sort))
			}
		}

		if querys.Page != nil && querys.PageSize != nil {
			offset := *querys.Page * *querys.PageSize
			query = query.Offset(offset).Limit(*querys.PageSize)
		}
	}

	return query.Find(snacks).Error
}

func (r *snackRepositoryImpl) GetSnackByID(id uuid.UUID) (snack *models.Snack, err error) {
	return snack, r.DB.Where("id = ?", id).First(&snack).Error
}

func (r *snackRepositoryImpl) GetSnackByIDWithReview(id uuid.UUID) (snack *models.Snack, err error) {
	return snack, r.DB.Where("id = ?", id).Preload("Reviews").First(&snack).Error
}

func (r *snackRepositoryImpl) GetAllTypes() ([]string, error) {
	var types []string
	err := r.DB.Model(&models.Snack{}).Distinct().Pluck("type", &types).Error
	return types, err
}
