package configs

import (
	"fmt"
	"log"

	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/scripts"
	"golang.org/x/crypto/bcrypt"
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

	autoMigrate(db)

	scripts.SeedData(db)

	initalAdmin(db)

	log.Println("connect to database successfully")

	return db
}

func autoMigrate(db *gorm.DB) {
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
		&models.Province{},
		&models.District{},
		&models.SubDistrict{},
	); err != nil {
		log.Fatalf("auto migrate failure : %v\n", err)
	}
	// initalAdmin(db)
}

func initalAdmin(db *gorm.DB) {
	var adminCount int64
	db.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(ENV.ADMIN_PASSWORD), bcrypt.DefaultCost)

	if err != nil {
		log.Fatalf("err to hash admin password : %v\n", err)
	}
	if adminCount == 0 {
		if err != nil {
			log.Fatalf("failed to hash admin password: %v\n", err)
		}

		admin := models.User{
			Username: ENV.ADMIN_USERNAME,
			Password: string(hashedPassword),
			Role:     ENV.ADMIN_ROLE,
			Email:    ENV.ADMIN_EMAIL,
		}

		db.Create(&admin)
	}
}
