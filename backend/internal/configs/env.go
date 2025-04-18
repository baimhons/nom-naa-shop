package configs

import (
	"log"

	"github.com/caarlos0/env/v11"
)

type Environment struct {
	PORT          string `env:"PORT" envDefault:"8080"`
	DB_HOST       string `env:"DB_HOST" envDefault:"localhost"`
	DB_USER       string `env:"DB_USER" envDefault:"postgres"`
	DB_PASSWORD   string `env:"DB_PASSWORD" envDefault:"root"`
	DB_NAME       string `env:"DB_NAME" envDefault:"postgres"`
	DB_PORT       string `env:"DB_PORT" envDefault:"5432"`
	JWT_SECRET    string `env:"JWT_SECRET" envDefault:"nom_naa_secret"`
	REDIS_HOST    string `env:"REDIS_HOST" envDefault:"localhost"`
	REDIS_PORT    string `env:"REDIS_PORT" envDefault:"6379"`
	MAX_FILE_SIZE int64  `env:"MAX_FILE_SIZE" envDefault:"5"`
	// SCHEMA         string `env:"SCHEMA" envDefault:"nom_naa_shop"`
	ADMIN_PASSWORD string `env:"ADMIN_PASSWORD" envDefault:"OHSIfeiov2312"`
	ADMIN_USERNAME string `env:"ADMIN_USERNAME" envDefault:"admin"`
	ADMIN_ROLE     string `env:"ADMIN_ROLE" envDefault:"admin"`
	ADMIN_EMAIL    string `env:"ADMIN_EMAIL" envDefault:"admin@gmail.com"`
}

var ENV Environment

func LoadEnv() {
	if err := env.Parse(&ENV); err != nil {
		log.Fatalf("error parsing environment variables: %v\n", err)
	}
}
