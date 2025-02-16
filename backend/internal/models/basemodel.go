package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID       uuid.UUID `gorm:"primary_key"`
	CreateAt time.Time `gorm:"not null"`
	UpdateAt time.Time `gorm:"not null"`
	DeleteAt time.Time
}

func (b *BaseModel) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	b.CreateAt = time.Now()
	b.UpdateAt = time.Now()
	return
}
