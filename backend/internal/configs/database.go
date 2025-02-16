package configs

import (
	"log"

	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() {
	dsn := "host=localhost user=gorm password=gorm dbname=gorm port=9920 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("connect to database failure : %v\n", err)
	}

	autoMigrate(db)

	log.Println("connect to database successfully")

}

func autoMigrate(db *gorm.DB) {
	if err := db.AutoMigrate(
		&models.BaseModel{},
	); err != nil {
		log.Fatalf("auto migrate failure : %v\n", err)
	}
}
