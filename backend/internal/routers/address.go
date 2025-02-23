package routers

import (
	"github.com/baimhons/nom-naa-shop.git/internal/handlers"
	"github.com/baimhons/nom-naa-shop.git/internal/middlewares"
	"github.com/baimhons/nom-naa-shop.git/internal/validations"
	"github.com/gofiber/fiber/v2"
)

type AddressRouter struct {
	app            fiber.Router
	addressHandler *handlers.AddressHandler
	authMiddleware *middlewares.AuthMiddleware
}

func NewAddressRouter(app fiber.Router, addressHandler *handlers.AddressHandler, authMiddleware *middlewares.AuthMiddleware) *AddressRouter {
	return &AddressRouter{app: app, addressHandler: addressHandler, authMiddleware: authMiddleware}
}

func (r *AddressRouter) SetupRoutes() {
	address := r.app.Group("/address")
	address.Post("/", r.authMiddleware.AuthToken, validations.NewAddressValidate().ValidateCreateAddressRequest, r.addressHandler.CreateAddress)
	address.Put("/:id", r.authMiddleware.AuthToken, validations.NewAddressValidate().ValidateUpdateAddressRequest, r.addressHandler.UpdateAddress)
	address.Delete("/:id", r.authMiddleware.AuthToken, r.addressHandler.DeleteAddress)
	address.Get("/", r.authMiddleware.AuthToken, r.addressHandler.GetAllAddress)
	address.Get("/:id", r.authMiddleware.AuthToken, r.addressHandler.GetAddressByID)
	address.Get("/province/:province_code", r.addressHandler.GetProvince)
	address.Get("/district/:district_code", r.addressHandler.GetDistrict)
	address.Get("/sub_district/:sub_district_code", r.addressHandler.GetSubDistrict)
	address.Get("/provinces", r.addressHandler.GetAllProvinces)
	address.Get("/province/:province_code/districts", r.addressHandler.GetAllDistrictsByProvinceCode)
	address.Get("/district/:district_code/sub_districts", r.addressHandler.GetAllSubDistrictsByDistrictCode)
}
