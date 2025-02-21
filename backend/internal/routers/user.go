package routers

import (
	"github.com/baimhons/nom-naa-shop.git/internal/handlers"
	"github.com/baimhons/nom-naa-shop.git/internal/middlewares"
	"github.com/baimhons/nom-naa-shop.git/internal/validations"
	"github.com/gofiber/fiber/v2"
)

type UserRountes struct {
	app            fiber.Router
	userHandler    *handlers.UserHandler
	validate       *validations.UserValidateImpl
	authMiddleware *middlewares.AuthMiddleware
}

func NewUserRountes(app fiber.Router, userHandler *handlers.UserHandler, validate *validations.UserValidateImpl, authMiddleware *middlewares.AuthMiddleware) *UserRountes {
	return &UserRountes{app: app, userHandler: userHandler, validate: validate, authMiddleware: authMiddleware}
}

func (r *UserRountes) SetupRoutes() {
	users := r.app.Group("/users")
	users.Post("/register", r.validate.ValidateRegisterUser, r.userHandler.RegisterUser)
	users.Post("/login", r.validate.ValidateLoginUser, r.userHandler.LoginUser)
	users.Post("/logout", r.authMiddleware.AuthToken, r.userHandler.LogoutUser)
	users.Get("/profile", r.authMiddleware.AuthToken, r.userHandler.GetUserProfile)
	users.Get("/all", r.userHandler.GetAllUsers)
	users.Put("/profile", r.validate.ValidateUpdateUser, r.userHandler.UpdateUser)
}
