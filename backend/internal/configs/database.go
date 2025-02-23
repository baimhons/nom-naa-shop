package configs

import (
	"fmt"
	"log"

	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai",
		ENV.DB_HOST, ENV.DB_USER, ENV.DB_PASSWORD, ENV.DB_NAME, ENV.DB_PORT,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("connect to database failure : %v\n", err)
	}

	// scripts.SeedData(db)

	autoMigrate(db)

	log.Println("connect to database successfully")

	return db
}

func autoMigrate(db *gorm.DB) {
	initalAdmin(db)
	if err := db.AutoMigrate(
		&models.BaseModel{},
		&models.User{},
		&models.Snack{},
		&models.Order{},
		&models.Payment{},
		&models.Review{},
		&models.Cart{},
		&models.Item{},
		&models.Address{},
	); err != nil {
		log.Fatalf("auto migrate failure : %v\n", err)
	}
}

func initalAdmin(db *gorm.DB) {
	// Check if any user with the role "admin" exists
	var adminCount int64
	db.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount)

	if adminCount == 0 {
		admin := models.User{
			Username:    "admin",
			Password:    "4dm1n",
			Role:        "admin",
			Email:       "admin@gmail.com",
			PhoneNumber: "081234567890",
		}

		db.Create(&admin)
	}
}
