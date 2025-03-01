package routers

import (
	"github.com/baimhons/nom-naa-shop.git/internal/handlers"
	"github.com/baimhons/nom-naa-shop.git/internal/middlewares"
	"github.com/baimhons/nom-naa-shop.git/internal/validations"
	"github.com/gofiber/fiber/v2"
)

type OrderRouter struct {
	app            fiber.Router
	orderHandler   *handlers.OrderHandler
	authMiddleware *middlewares.AuthMiddleware
}

func NewOrderRouter(app fiber.Router, orderHandler *handlers.OrderHandler, authMiddleware *middlewares.AuthMiddleware) *OrderRouter {
	return &OrderRouter{app: app, orderHandler: orderHandler, authMiddleware: authMiddleware}
}

func (r *OrderRouter) SetupRoutes() {
	order := r.app.Group("/order")
	order.Post("/confirm", r.authMiddleware.AuthToken, validations.NewOrderValidation().ValidateConfirmOrder, r.orderHandler.ConfirmOrder)
}
