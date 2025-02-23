package initial

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/baimhons/nom-naa-shop.git/internal/configs"
	"github.com/baimhons/nom-naa-shop.git/internal/handlers"
	"github.com/baimhons/nom-naa-shop.git/internal/middlewares"
	middlewareConfigs "github.com/baimhons/nom-naa-shop.git/internal/middlewares/configs"
	addressModel "github.com/baimhons/nom-naa-shop.git/internal/models/address_models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/baimhons/nom-naa-shop.git/internal/routers"
	"github.com/baimhons/nom-naa-shop.git/internal/services"
	"github.com/baimhons/nom-naa-shop.git/internal/utils"
	"github.com/baimhons/nom-naa-shop.git/internal/validations"
	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func Init() {
	configs.LoadEnv()
}

type App struct {
	App    *fiber.App
	DB     *gorm.DB
	Redis  *redis.Client
	routes func()
}

func InitializeApp() *App {
	Init()

	app := fiber.New()
	db := configs.ConnectDB()
	redis := configs.ConnectRedis()

	redisClient := utils.NewRedisClient(redis)

	userRepository := repositories.NewUserRepository(db)
	addressRepository := repositories.NewAddressRepository(db)
	provinceRepo := repositories.NewRegionRepository[addressModel.Province](db)
	districtRepo := repositories.NewRegionRepository[addressModel.Districts](db)
	subDistrictRepo := repositories.NewRegionRepository[addressModel.SubDistricts](db)

	userService := services.NewUserService(userRepository, redisClient)
	addressService := services.NewAddressService(addressRepository, provinceRepo, districtRepo, subDistrictRepo)

	userHandler := handlers.NewUserHandler(userService)
	addressHandler := handlers.NewAddressHandler(addressService)

	userValidate := validations.NewUserValidate()

	authMiddleware := middlewares.NewAuthMiddleware(redis)

	apiRoutes := app.Group("/api/v1")

	userRoutes := routers.NewUserRountes(apiRoutes, userHandler, userValidate, authMiddleware)
	addressRoutes := routers.NewAddressRouter(apiRoutes, addressHandler, authMiddleware)

	return &App{
		App:   app,
		DB:    db,
		Redis: redis,
		routes: func() {
			userRoutes.SetupRoutes()
			addressRoutes.SetupRoutes()
		},
	}
}

func (r *App) SetUpRoutes() {
	r.routes()
}

func (r *App) Run() {
	go func() {
		if err := r.App.Listen(fmt.Sprintf(":%s", "8080")); err != nil {
			log.Fatalf("error starting server: %v\n", err)
		}
	}()

	gracefulShutdown := make(chan os.Signal, 1)
	signal.Notify(gracefulShutdown, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	<-gracefulShutdown
	r.close()
}

func (r *App) close() {
	sqlDB, err := r.DB.DB()
	if err != nil {
		log.Fatalf("error getting database: %v\n", err)
	}

	if err := sqlDB.Close(); err != nil {
		log.Fatalf("error closing database: %v\n", err)
	}

	if err := r.Redis.Close(); err != nil {
		log.Fatalf("error closing redis: %v\n", err)
	}
}

func (r *App) SetUpMiddlewares() {
	r.App.Use(middlewareConfigs.CORS(),
		middlewareConfigs.Limiter(),
		middlewareConfigs.Healthz(),
	)
}
