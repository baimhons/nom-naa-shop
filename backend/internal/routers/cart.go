package routers

import (
	"github.com/baimhons/nom-naa-shop.git/internal/handlers"
	"github.com/baimhons/nom-naa-shop.git/internal/middlewares"
	"github.com/baimhons/nom-naa-shop.git/internal/middlewares/configs"
	"github.com/baimhons/nom-naa-shop.git/internal/validations"
	"github.com/gofiber/fiber/v2"
)

type CartRouter struct {
	app            fiber.Router
	cartHandler    *handlers.CartHandler
	authMiddleware *middlewares.AuthMiddleware
}

func NewCartRouter(app fiber.Router, cartHandler *handlers.CartHandler, authMiddleware *middlewares.AuthMiddleware) *CartRouter {
	return &CartRouter{
		app:            app,
		cartHandler:    cartHandler,
		authMiddleware: authMiddleware,
	}
}

func (r *CartRouter) SetupRoutes() {
	cart := r.app.Group("/cart")
	cart.Post("/", r.authMiddleware.AuthToken, configs.Limiter(), validations.NewCartValidate().ValidateAddItemToCart, r.cartHandler.AddItemToCart)
	cart.Get("/", r.authMiddleware.AuthToken, configs.Limiter(), r.cartHandler.GetCartByID)
	cart.Put("/", r.authMiddleware.AuthToken, configs.Limiter(), validations.NewCartValidate().ValidateUpdateItemFromCart, r.cartHandler.UpdateItemFromCart)
	cart.Delete("/:item_id", r.authMiddleware.AuthToken, configs.Limiter(), r.cartHandler.DeleteItemFromCart)
}
