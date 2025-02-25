package repositories

import (
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ItemRepository interface {
	BaseRepository[models.Item]
	UpdateItemByCondition(condition string, args ...interface{}) (err error)
	GetItemByCondition(condition string, args ...interface{}) (item *models.Item, err error)
	GetItemByID(id uuid.UUID) (item *models.Item, err error)
}

type ItemRepositoryImpl struct {
	BaseRepository[models.Item]
	DB *gorm.DB
}

func NewItemRepository(db *gorm.DB) *ItemRepositoryImpl {
	return &ItemRepositoryImpl{
		BaseRepository: NewBaseRepository[models.Item](db),
		DB:             db,
	}
}

func (r *ItemRepositoryImpl) UpdateItemByCondition(condition string, args ...interface{}) (err error) {
	return r.DB.Where(condition, args...).Updates(map[string]any{"quantity": args[1]}).Error
}

func (r *ItemRepositoryImpl) GetItemByCondition(condition string, args ...interface{}) (item *models.Item, err error) {
	return item, r.DB.Where(condition, args...).Preload("Snack").First(&item).Error
}

func (r *ItemRepositoryImpl) GetItemByID(id uuid.UUID) (item *models.Item, err error) {
	return item, r.DB.Where("id = ?", id).First(&item).Error
}
